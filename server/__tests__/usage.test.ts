import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';

// Persistent fake Firestore store for transactional tests
const fakeStore = new Map<string, { data: Record<string, unknown>; updateTime: string }>();

// Mock firebase-rest before importing usage
const mockFirestoreRest = vi.hoisted(() => {
  const buildUpdateWrite = vi.fn((path, fields) => ({ update: { name: path, fields } }));
  const buildIncrementWrite = vi.fn((path, increments) => ({ transform: { document: path, increments } }));
  const firestoreDocumentName = vi.fn((path) => `projects/test/databases/test/documents/${path}`);

  return {
    hasServiceAccountCredentials: vi.fn(() => true),
    beginFirestoreTransaction: vi.fn(() => 'txn-default'),
    getDocumentsInTransaction: vi.fn(() => new Map()),
    commitFirestoreWrites: vi.fn(),
    rollbackFirestoreTransaction: vi.fn(),
    decodeFirestoreDocument: vi.fn(() => null),
    buildUpdateWrite,
    buildIncrementWrite,
    firestoreDocumentName,
  };
});

vi.mock('../firebase-rest.js', () => mockFirestoreRest);

import { reserveBasicScan, consumeProPoint, creditScanPointsForPayment, recordMetricEvent } from '../usage.js';
import type { AuthenticatedUser } from '../firebase-rest.js';

const mockUser: AuthenticatedUser = { uid: 'user-123', email: 'test@example.com' };
const mockClientIp = '192.168.1.1';

function mockUserDoc(data: Record<string, unknown>) {
  const name = `projects/test/databases/test/documents/users/${mockUser.uid}`;
  const map = new Map();
  map.set(name, { name, updateTime: '2024-01-01T00:00:00Z', data });
  (mockFirestoreRest.getDocumentsInTransaction as Mock).mockResolvedValue(map);
  (mockFirestoreRest.decodeFirestoreDocument as Mock).mockReturnValue({
    name,
    updateTime: '2024-01-01T00:00:00Z',
    data,
  });
}

function addToStore(path: string, data: Record<string, unknown>) {
  const fullPath = `projects/test/databases/test/documents/${path}`;
  fakeStore.set(fullPath, { data, updateTime: new Date().toISOString() });
}

function getFromStore(path: string) {
  const fullPath = `projects/test/databases/test/documents/${path}`;
  return fakeStore.get(fullPath) || null;
}

// Set up mocks to use the fake store
function setupStoreMocks() {
  (mockFirestoreRest.getDocumentsInTransaction as Mock).mockImplementation(
    async (paths: string[]) => {
      const map = new Map();
      for (const p of paths) {
        const entry = getFromStore(p);
        if (entry) {
          map.set(`projects/test/databases/test/documents/${p}`, {
            name: `projects/test/databases/test/documents/${p}`,
            updateTime: entry.updateTime,
            data: entry.data,
          });
        }
      }
      return map;
    }
  );

  (mockFirestoreRest.commitFirestoreWrites as Mock).mockImplementation(
    async (writes: any[]) => {
      for (const w of writes) {
        if (w.update) {
          const path = w.update.name.replace('projects/test/databases/test/documents/', '');
          const existing = fakeStore.get(w.update.name);
          fakeStore.set(w.update.name, {
            data: { ...(existing?.data || {}), ...w.update.fields },
            updateTime: new Date().toISOString(),
          });
        }
      }
    }
  );

  (mockFirestoreRest.decodeFirestoreDocument as Mock).mockImplementation(
    (doc: any) => {
      if (!doc) return null;
      return {
        name: doc.name,
        updateTime: doc.updateTime,
        data: { ...doc.data },
      };
    }
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  fakeStore.clear();

  // Reset mocks to defaults
  (mockFirestoreRest.hasServiceAccountCredentials as Mock).mockReturnValue(true);
  (mockFirestoreRest.beginFirestoreTransaction as Mock).mockResolvedValue('txn-' + Date.now());
  (mockFirestoreRest.rollbackFirestoreTransaction as Mock).mockResolvedValue(undefined);

  // By default, don't use the fake store (simpler for most tests)
  (mockFirestoreRest.getDocumentsInTransaction as Mock).mockResolvedValue(new Map());
  (mockFirestoreRest.commitFirestoreWrites as Mock).mockResolvedValue(undefined);
  (mockFirestoreRest.decodeFirestoreDocument as Mock).mockReturnValue(null);
});

// ================================================================
// reserveBasicScan
// ================================================================

describe('reserveBasicScan', () => {
  describe('guest flow (user = null)', () => {
    it('returns billing info for a new guest', async () => {
      const result = await reserveBasicScan(null, mockClientIp);
      expect(result.billing.channel).toBe('free-basic');
      expect(result.billing.usedFreeScan).toBe(true);
      expect(result.billing.actor).toBe('guest');
      expect(result.billing.dailyScansUsed).toBe(1);
    });

    it('has a daily limit of 1 for guests (in-memory)', async () => {
      (mockFirestoreRest.hasServiceAccountCredentials as Mock).mockReturnValue(false);
      await reserveBasicScan(null, mockClientIp);
      await expect(reserveBasicScan(null, mockClientIp)).rejects.toThrow('free scan limit');
    });

    it('provides a refund for guest scans (no service account)', async () => {
      (mockFirestoreRest.hasServiceAccountCredentials as Mock).mockReturnValue(false);
      const result = await reserveBasicScan(null, 'refund-test-ip');
      await result.refund();
      const second = await reserveBasicScan(null, 'refund-test-ip');
      expect(second.billing.dailyScansUsed).toBe(1);
    });
  });

  describe('user flow (authenticated)', () => {
    it('returns billing for a new user', async () => {
      mockUserDoc({ role: 'user', dailyScans: 0, lastScanDate: '2020-01-01', plantsScanned: 0 });

      const result = await reserveBasicScan(mockUser, mockClientIp);
      expect(result.billing.channel).toBe('free-basic');
      expect(result.billing.usedFreeScan).toBe(true);
      expect(result.billing.actor).toBe('user');
    });

    it('throws when user exceeds daily limit', async () => {
      const today = new Date().toISOString().split('T')[0];
      mockUserDoc({ role: 'user', dailyScans: 1, lastScanDate: today, plantsScanned: 1 });

      await expect(reserveBasicScan(mockUser, mockClientIp)).rejects.toThrow('free Basic Diagnosis limit');
    });

    it('admins have unlimited scans', async () => {
      const today = new Date().toISOString().split('T')[0];
      mockUserDoc({
        role: 'admin',
        dailyScans: 999,
        lastScanDate: today,
        plantsScanned: 999,
      });

      const result = await reserveBasicScan(mockUser, mockClientIp);
      expect(result.billing.dailyScansUsed).toBe(1000);
    });

    it('writes to Firestore via commitFirestoreWrites', async () => {
      mockUserDoc({ role: 'user', dailyScans: 0, lastScanDate: '2020-01-01', plantsScanned: 0 });

      await reserveBasicScan(mockUser, mockClientIp);
      expect(mockFirestoreRest.commitFirestoreWrites).toHaveBeenCalledOnce();
      expect(mockFirestoreRest.beginFirestoreTransaction).toHaveBeenCalledOnce();
    });

    it('can refund a user scan', async () => {
      mockUserDoc({ role: 'user', dailyScans: 0, lastScanDate: '2020-01-01', plantsScanned: 0 });

      const result = await reserveBasicScan(mockUser, mockClientIp);
      await result.refund();

      expect(mockFirestoreRest.commitFirestoreWrites).toHaveBeenCalledTimes(2);
    });
  });

  describe('without service account', () => {
    it('falls back to in-memory limits for guests', async () => {
      (mockFirestoreRest.hasServiceAccountCredentials as Mock).mockReturnValue(false);
      // Use unique IP so memory key doesn't collide with other tests
      const result = await reserveBasicScan(null, 'guest-ip-mem-test');
      expect(result.billing.actor).toBe('guest');
      expect(result.billing.channel).toBe('free-basic');
    });

    it('falls back to in-memory limits for users', async () => {
      (mockFirestoreRest.hasServiceAccountCredentials as Mock).mockReturnValue(false);
      // Use unique IP to avoid memory key collision
      const result = await reserveBasicScan({ uid: 'mem-user-test', email: 'mem@test.com' }, 'unique-ip');
      expect(result.billing.actor).toBe('user');
      expect(result.billing.channel).toBe('free-basic');
    });
  });
});

// ================================================================
// consumeProPoint
// ================================================================

describe('consumeProPoint', () => {
  it('throws 503 when no service account', async () => {
    (mockFirestoreRest.hasServiceAccountCredentials as Mock).mockReturnValue(false);

    try {
      await consumeProPoint(mockUser);
      expect.fail('Should have thrown');
    } catch (e: any) {
      expect(e.statusCode).toBe(503);
      expect(e.code).toBe('server_not_configured');
    }
  });

  it('deducts a scan point and returns billing', async () => {
    mockUserDoc({ scanPoints: 5, plantsScanned: 3 });

    const result = await consumeProPoint(mockUser, { recordScan: true });
    expect(result.billing.usedScanPoint).toBe(true);
    expect(result.billing.scanPointsRemaining).toBe(4);
    expect(result.billing.recordedScan).toBe(true);
  });

  it('throws 402 when points are insufficient', async () => {
    mockUserDoc({ scanPoints: 0, plantsScanned: 0 });

    try {
      await consumeProPoint(mockUser);
      expect.fail('Should have thrown');
    } catch (e: any) {
      expect(e.statusCode).toBe(402);
      expect(e.code).toBe('points_required');
    }
  });

  it('throws 402 when user doc does not exist', async () => {
    // decodeFirestoreDocument already returns null by default
    try {
      await consumeProPoint(mockUser);
      expect.fail('Should have thrown');
    } catch (e: any) {
      expect(e.statusCode).toBe(402);
    }
  });

  it('refund restores the point', async () => {
    mockUserDoc({ scanPoints: 5, plantsScanned: 3 });

    const result = await consumeProPoint(mockUser, { recordScan: true });
    await result.refund();

    expect(mockFirestoreRest.commitFirestoreWrites).toHaveBeenCalledTimes(2);
  });

  it('handles refund failure gracefully (does not throw)', async () => {
    mockUserDoc({ scanPoints: 5, plantsScanned: 3 });

    // First call (consume) succeeds, second call (refund) fails
    (mockFirestoreRest.commitFirestoreWrites as Mock)
      .mockResolvedValueOnce(undefined)  // consume commit
      .mockRejectedValueOnce(new Error('refund failed'));  // refund commit

    const result = await consumeProPoint(mockUser, { recordScan: true });
    await expect(result.refund()).resolves.toBeUndefined();
  });
});

// ================================================================
// creditScanPointsForPayment
// ================================================================

describe('creditScanPointsForPayment', () => {
  const payment = {
    orderId: 'order-123',
    captureId: 'capture-456',
    tierId: 'tier-basic',
    amount: '9.99',
    currency: 'USD',
    points: 10,
  };

  it('throws 503 when no service account', async () => {
    (mockFirestoreRest.hasServiceAccountCredentials as Mock).mockReturnValue(false);
    await expect(creditScanPointsForPayment(mockUser, payment)).rejects.toThrow('not configured');
  });

  it('credits points to existing user', async () => {
    setupStoreMocks();
    addToStore(`users/${mockUser.uid}`, { scanPoints: 5, role: 'user' });

    const result = await creditScanPointsForPayment(mockUser, payment);
    expect(result.alreadyCredited).toBe(false);
    expect(mockFirestoreRest.commitFirestoreWrites).toHaveBeenCalledOnce();
  });

  it('is idempotent: returns alreadyCredited for duplicate payments', async () => {
    // Return both user doc and payment doc (payment already exists)
    const userDocName = `projects/test/databases/test/documents/users/${mockUser.uid}`;
    const paymentDocName = 'projects/test/databases/test/documents/payments/order-123';
    const map = new Map();
    map.set(userDocName, { name: userDocName, updateTime: '2024-01-01T00:00:00Z', data: { scanPoints: 5 } });
    map.set(paymentDocName, { name: paymentDocName, updateTime: '2024-01-01T00:00:00Z', data: { status: 'credited' } });
    (mockFirestoreRest.getDocumentsInTransaction as Mock).mockResolvedValue(map);
    (mockFirestoreRest.decodeFirestoreDocument as Mock).mockReturnValueOnce({
      name: userDocName,
      updateTime: '2024-01-01T00:00:00Z',
      data: { scanPoints: 5 },
    }).mockReturnValueOnce({
      name: paymentDocName,
      updateTime: '2024-01-01T00:00:00Z',
      data: { status: 'credited' },
    });

    const result = await creditScanPointsForPayment(mockUser, payment);
    expect(result.alreadyCredited).toBe(true);
    expect(mockFirestoreRest.commitFirestoreWrites).not.toHaveBeenCalled();
  });

  it('rolls back transaction on failure', async () => {
    setupStoreMocks();
    addToStore(`users/${mockUser.uid}`, { scanPoints: 5, role: 'user' });
    (mockFirestoreRest.commitFirestoreWrites as Mock).mockRejectedValueOnce(new Error('commit failed'));

    await expect(creditScanPointsForPayment(mockUser, payment)).rejects.toThrow('commit failed');
    expect(mockFirestoreRest.rollbackFirestoreTransaction).toHaveBeenCalled();
  });
});

// ================================================================
// recordMetricEvent
// ================================================================

describe('recordMetricEvent', () => {
  it('does nothing when no service account', async () => {
    (mockFirestoreRest.hasServiceAccountCredentials as Mock).mockReturnValue(false);
    await recordMetricEvent('scan_success');
    expect(mockFirestoreRest.commitFirestoreWrites).not.toHaveBeenCalled();
  });

  it('throws for unknown events', async () => {
    await expect(recordMetricEvent('unknown_event')).rejects.toThrow('Unknown metric event');
  });

  it('records allowed events', async () => {
    await recordMetricEvent('scan_success', { species: 'Monstera', problem: 'Yellow leaves' });
    expect(mockFirestoreRest.commitFirestoreWrites).toHaveBeenCalledOnce();
  });
});
