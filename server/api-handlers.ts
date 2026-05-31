import { assertString, ApiError } from './http.js';
import {
  getClientIp,
  getOptionalAuthenticatedUser,
  requireAuthenticatedUser,
  type RequestContext,
} from './firebase-rest.js';
import { enforceMemoryLimit, msUntilUtcMidnight } from './memory-limit.js';
import { consumeProPoint, getUnlockedProForScan, recordMetricEvent, reserveBasicScan, saveUnlockedProForScan } from './usage.js';

const maxImagePayloadLength = 11 * 1024 * 1024;
const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const validateImagePayload = (body: any) => {
  const base64Data = assertString(body?.base64Data, 'base64Data', maxImagePayloadLength);
  const mimeType = assertString(body?.mimeType, 'mimeType', 100).toLowerCase();
  if (!allowedImageMimeTypes.has(mimeType)) {
    throw new ApiError(400, 'invalid_request', 'Unsupported image type.');
  }
  return { base64Data, mimeType };
};

const sanitizeShortText = (value: unknown, maxLength = 1000) => {
  if (typeof value !== 'string') return undefined;
  return value.slice(0, maxLength);
};

const sanitizeResultId = (value: unknown) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(value)) {
    throw new ApiError(400, 'invalid_request', 'Invalid result id.');
  }
  return value;
};

const attachBilling = (result: unknown, billing: Record<string, unknown>) => {
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    return {
      ...(result as Record<string, unknown>),
      billing,
    };
  }

  return { result, billing };
};

export const handleAnalyzePlant = async (body: any, context: RequestContext) => {
  const clientIp = getClientIp(context);
  enforceMemoryLimit(`api:analyze:${clientIp}`, 20, 15 * 60 * 1000, 'Too many scan requests. Please try again later.');

  const { base64Data, mimeType } = validateImagePayload(body);
  const userQuestion = sanitizeShortText(body?.userQuestion, 800);
  const basicSummary = sanitizeShortText(body?.basicSummary, 4000);
  const resultId = sanitizeResultId(body?.resultId);
  const wantsFullPro = body?.mode === 'full-pro';
  const wantsPro = body?.mode === 'pro' || body?.isPro === true;

  if (wantsFullPro) {
    const user = await requireAuthenticatedUser(context);
    const { analyzeFullProPlant } = await import('./gemini.js');
    const pointReservation = await consumeProPoint(user, { recordScan: true });
    try {
      const result = await analyzeFullProPlant({
        base64Data,
        mimeType,
        userQuestion,
      });
      return attachBilling(result, {
        ...pointReservation.billing,
        proUnlocked: true,
        fullProDiagnosis: true,
      });
    } catch (error) {
      await pointReservation.refund();
      throw error;
    }
  }

  if (wantsPro) {
    const user = await requireAuthenticatedUser(context);
    if (resultId) {
      const existingPro = await getUnlockedProForScan(user, resultId);
      if (existingPro) {
        return {
          pro: existingPro,
          billing: {
            alreadyUnlocked: true,
            proUnlocked: true,
            resultId,
          },
        };
      }
    }

    const pointReservation = await consumeProPoint(user);
    try {
      const { analyzePlant } = await import('./gemini.js');
      const result = await analyzePlant({
        base64Data,
        mimeType,
        userQuestion,
        basicSummary,
        isPro: true,
      });
      if (resultId && (result as any)?.pro) {
        await saveUnlockedProForScan(user, resultId, (result as any).pro);
      }
      return attachBilling(result, {
        ...pointReservation.billing,
        proUnlocked: true,
        resultId: resultId || null,
      });
    } catch (error) {
      await pointReservation.refund();
      throw error;
    }
  }

  const user = await getOptionalAuthenticatedUser(context);
  const basicReservation = await reserveBasicScan(user, clientIp);
  try {
    const { analyzePlant } = await import('./gemini.js');
    const result = await analyzePlant({
      base64Data,
      mimeType,
      userQuestion,
      isPro: false,
    });
    return attachBilling(result, basicReservation.billing);
  } catch (error) {
    await basicReservation.refund();
    throw error;
  }
};

export const handleGenerateIllustration = async (body: any, context: RequestContext) => {
  const user = await requireAuthenticatedUser(context);
  enforceMemoryLimit(`api:illustration:${user.uid}`, 15, 15 * 60 * 1000, 'Too many illustration requests. Please try again later.');

  const species = sanitizeShortText(body?.species, 200);
  const { generateIllustration } = await import('./gemini.js');
  return generateIllustration({ species });
};

export const handleGenerateCareGuide = async (body: any, context: RequestContext) => {
  const user = await requireAuthenticatedUser(context);
  enforceMemoryLimit(`api:care-guide:${user.uid}:${new Date().toISOString().split('T')[0]}`, 10, msUntilUtcMidnight(), 'Too many care guide requests today.');

  const plantName = assertString(body?.plantName, 'plantName', 200);
  const { generateCareGuide } = await import('./gemini.js');
  return generateCareGuide({ plantName });
};

export const handleTrackEvent = async (body: any, context: RequestContext) => {
  const clientIp = getClientIp(context);
  enforceMemoryLimit(`api:metric:${clientIp}`, 120, 15 * 60 * 1000, 'Too many analytics events.');

  const event = assertString(body?.event, 'event', 80);
  const metadata = typeof body?.metadata === 'object' && body.metadata
    ? {
      species: sanitizeShortText(body.metadata.species, 200),
      problem: sanitizeShortText(body.metadata.problem, 200),
    }
    : undefined;

  await recordMetricEvent(event, metadata);
  return { ok: true };
};

export const handleCreatePayPalOrder = async (body: any, context: RequestContext) => {
  const user = await requireAuthenticatedUser(context);
  enforceMemoryLimit(`api:paypal-create:${user.uid}`, 20, 15 * 60 * 1000, 'Too many checkout attempts. Please try again later.');
  const { createPayPalOrder } = await import('./paypal.js');
  return createPayPalOrder(user, body?.tierId);
};

export const handleCapturePayPalOrder = async (body: any, context: RequestContext) => {
  const user = await requireAuthenticatedUser(context);
  enforceMemoryLimit(`api:paypal-capture:${user.uid}`, 20, 15 * 60 * 1000, 'Too many checkout attempts. Please try again later.');
  const { capturePayPalOrder } = await import('./paypal.js');
  return capturePayPalOrder(user, body?.orderId, body?.tierId);
};
