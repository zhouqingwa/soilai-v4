import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';

// Shared ApiError mock class
const MockApiError = vi.hoisted(() => {
  return class MockApiError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, code: string, msg: string) {
      super(msg);
      this.name = 'ApiError';
      this.statusCode = statusCode;
      this.code = code;
    }
  };
});

// Mock dependencies before importing
vi.mock('../http.js', () => ({
  ApiError: MockApiError,
  assertString: vi.fn((value: unknown) => {
    if (typeof value !== 'string' || value.trim().length === 0) throw new MockApiError(400, 'invalid_request', 'Required');
    return value;
  }),
}));

vi.mock('../firebase-rest.js', () => ({
  getClientIp: vi.fn((ctx) => ctx?.ip || 'unknown'),
  getOptionalAuthenticatedUser: vi.fn(),
  requireAuthenticatedUser: vi.fn(),
}));

vi.mock('../memory-limit.js', () => ({
  enforceMemoryLimit: vi.fn(),
  msUntilUtcMidnight: vi.fn(() => 86400000),
}));

vi.mock('../usage.js', () => ({
  consumeProPoint: vi.fn(),
  getUnlockedProForScan: vi.fn(),
  recordMetricEvent: vi.fn(),
  reserveBasicScan: vi.fn(),
  saveUnlockedProForScan: vi.fn(),
}));

vi.mock('../gemini.js', () => ({
  analyzePlant: vi.fn(),
  analyzeFullProPlant: vi.fn(),
  generateIllustration: vi.fn(),
  generateCareGuide: vi.fn(),
}));

import {
  handleAnalyzePlant,
  handleGenerateIllustration,
  handleGenerateCareGuide,
  handleTrackEvent,
  handleCreatePayPalOrder,
  handleCapturePayPalOrder,
} from '../api-handlers.js';

import { assertString, ApiError } from '../http.js';
import { enforceMemoryLimit } from '../memory-limit.js';
import { requireAuthenticatedUser, getOptionalAuthenticatedUser } from '../firebase-rest.js';
import {
  consumeProPoint,
  getUnlockedProForScan,
  recordMetricEvent,
  reserveBasicScan,
} from '../usage.js';
import { analyzePlant, analyzeFullProPlant, generateIllustration } from '../gemini.js';

const mockContext = { headers: {}, ip: '192.168.1.1' };
const mockUser = { uid: 'user-123', email: 'test@example.com' };

beforeEach(() => {
  vi.clearAllMocks();

  // Default: assertString passes
  (assertString as Mock).mockImplementation((value: unknown) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new ApiError(400, 'invalid_request', 'Required');
    }
    return value;
  });

  (getUnlockedProForScan as Mock).mockResolvedValue(null);
  (reserveBasicScan as Mock).mockResolvedValue({
    billing: { channel: 'free-basic', usedFreeScan: true, dailyLimit: 1 },
    refund: vi.fn(),
  });
  (consumeProPoint as Mock).mockResolvedValue({
    billing: { usedScanPoint: true, scanPointsRemaining: 4 },
    refund: vi.fn(),
  });
  (analyzePlant as Mock).mockResolvedValue({
    basic: { species: 'Monstera Deliciosa', risk: 'Moderate' },
    proPreview: { teaserSummary: 'Upgrade to Pro' },
  });
  (analyzeFullProPlant as Mock).mockResolvedValue({
    basic: { species: 'Monstera', risk: 'High' },
    pro: { deepDive: 'Full analysis' },
  });
});

// ================================================================
// handleAnalyzePlant
// ================================================================

describe('handleAnalyzePlant', () => {
  const validBody = { base64Data: 'data', mimeType: 'image/jpeg' };

  it('rejects missing base64Data', async () => {
    (assertString as Mock).mockImplementation(() => {
      throw new ApiError(400, 'invalid_request', 'base64Data is required.');
    });

    await expect(handleAnalyzePlant({ mimeType: 'image/jpeg' }, mockContext))
      .rejects.toThrow('base64Data is required.');
  });

  it('rejects unsupported mime types', async () => {
    const body = { base64Data: 'data', mimeType: 'image/gif' };

    await expect(handleAnalyzePlant(body, mockContext))
      .rejects.toThrow('Unsupported image type.');
  });

  it('passes basic scan for valid body', async () => {
    const result = await handleAnalyzePlant(validBody, mockContext);
    expect(result.basic.species).toBe('Monstera Deliciosa');
    expect(result.billing.channel).toBe('free-basic');
    expect(reserveBasicScan).toHaveBeenCalledOnce();
  });

  it('requires authentication for full-pro scans', async () => {
    (requireAuthenticatedUser as Mock).mockRejectedValue(
      new ApiError(401, 'auth_required', 'Sign in required')
    );

    await expect(handleAnalyzePlant({ ...validBody, mode: 'full-pro' }, mockContext))
      .rejects.toThrow('Sign in required');
  });

  it('uses consumeProPoint for full-pro scans', async () => {
    (requireAuthenticatedUser as Mock).mockResolvedValue(mockUser);

    const result = await handleAnalyzePlant({ ...validBody, mode: 'full-pro' }, mockContext);
    expect(result.billing.usedScanPoint).toBe(true);
    expect(consumeProPoint).toHaveBeenCalledOnce();
    expect(analyzeFullProPlant).toHaveBeenCalledOnce();
  });

  it('hands back cached Pro for previously-unlocked resultId', async () => {
    (requireAuthenticatedUser as Mock).mockResolvedValue(mockUser);
    (getUnlockedProForScan as Mock).mockResolvedValue({ deepDive: 'Already unlocked' });

    const result = await handleAnalyzePlant({
      ...validBody, mode: 'pro', resultId: 'existing-scan-123',
    }, mockContext);
    expect(result.billing.alreadyUnlocked).toBe(true);
    expect(consumeProPoint).not.toHaveBeenCalled();
    expect(result.pro).toBeDefined();
  });

  it('uses getOptionalAuthenticatedUser for basic scans (guest)', async () => {
    (getOptionalAuthenticatedUser as Mock).mockResolvedValue(null);

    const result = await handleAnalyzePlant(validBody, mockContext);
    expect(result.basic.species).toBe('Monstera Deliciosa');
    expect(result.billing.actor).toBeUndefined();
  });
});

// ================================================================
// handleTrackEvent
// ================================================================

describe('handleTrackEvent', () => {
  it('rejects missing event name', async () => {
    (assertString as Mock).mockImplementation(() => {
      throw new ApiError(400, 'invalid_request', 'event is required.');
    });
    await expect(handleTrackEvent({}, mockContext)).rejects.toThrow();
  });

  it('records valid events', async () => {
    const result = await handleTrackEvent({ event: 'share_click' }, mockContext);
    expect(result.ok).toBe(true);
    expect(recordMetricEvent).toHaveBeenCalledWith('share_click', undefined);
  });
});

// ================================================================
// handleGenerateIllustration
// ================================================================

describe('handleGenerateIllustration', () => {
  it('requires authentication', async () => {
    (requireAuthenticatedUser as Mock).mockRejectedValue(
      new ApiError(401, 'auth_required', 'Sign in')
    );

    await expect(handleGenerateIllustration({ species: 'Monstera' }, mockContext))
      .rejects.toThrow('Sign in');
  });

  it('generates illustration for authenticated users', async () => {
    (requireAuthenticatedUser as Mock).mockResolvedValue(mockUser);
    (generateIllustration as Mock).mockResolvedValue({ imageData: 'img-data', imageType: 'image/png' });

    const result = await handleGenerateIllustration({ species: 'Monstera' }, mockContext);
    expect(result.imageData).toBe('img-data');
    expect(generateIllustration).toHaveBeenCalledWith({ species: 'Monstera' });
  });
});

// ================================================================
// handleGenerateCareGuide
// ================================================================

describe('handleGenerateCareGuide', () => {
  it('requires a plant name', async () => {
    (assertString as Mock).mockImplementation(() => {
      throw new ApiError(400, 'invalid_request', 'plantName is required.');
    });
    await expect(handleGenerateCareGuide({}, mockContext)).rejects.toThrow();
  });
});

// ================================================================
// PayPal handlers (basic auth checks)
// ================================================================

describe('PayPal handlers', () => {
  it('handleCreatePayPalOrder requires authentication', async () => {
    (requireAuthenticatedUser as Mock).mockRejectedValue(
      new ApiError(401, 'auth_required', 'Sign in')
    );

    await expect(handleCreatePayPalOrder({ tierId: 'basic' }, mockContext))
      .rejects.toThrow('Sign in');
  });

  it('handleCapturePayPalOrder requires authentication', async () => {
    (requireAuthenticatedUser as Mock).mockRejectedValue(
      new ApiError(401, 'auth_required', 'Sign in')
    );

    await expect(handleCapturePayPalOrder({ orderId: 'ord-123', tierId: 'basic' }, mockContext))
      .rejects.toThrow('Sign in');
  });
});
