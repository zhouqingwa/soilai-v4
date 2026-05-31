import * as crypto from 'node:crypto';
import { ApiError } from './http.js';
import { enforceMemoryLimit, msUntilUtcMidnight, releaseMemoryLimit } from './memory-limit.js';
import {
  type AuthenticatedUser,
  beginFirestoreTransaction,
  buildIncrementWrite,
  buildUpdateWrite,
  commitFirestoreWrites,
  decodeFirestoreDocument,
  firestoreDocumentName,
  getDocumentsInTransaction,
  hasServiceAccountCredentials,
  rollbackFirestoreTransaction,
} from './firebase-rest.js';

const todayKey = () => new Date().toISOString().split('T')[0];

const toNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const isUnlimitedRole = (role: unknown) => role === 'admin';
const freeBasicDailyLimit = 1;

const getGuestLimitPath = (clientIp: string) => {
  const salt = process.env.GUEST_LIMIT_SALT || process.env.FIREBASE_PROJECT_ID || 'soilai';
  const digest = crypto
    .createHash('sha256')
    .update(`${salt}:${clientIp || 'unknown'}`)
    .digest('hex');
  return `guest_limits/${digest}`;
};

type ScanReservation = {
  billing: {
    channel: 'free-basic';
    usedFreeScan: true;
    actor: 'guest' | 'user';
    dailyLimit: number;
    dailyScansUsed: number;
    remainingFreeScans: number;
    lastScanDate: string;
  };
  refund: () => Promise<void>;
};

const buildFreeBasicBilling = (
  actor: 'guest' | 'user',
  dailyScansUsed: number,
  today: string
): ScanReservation['billing'] => ({
  channel: 'free-basic',
  usedFreeScan: true,
  actor,
  dailyLimit: freeBasicDailyLimit,
  dailyScansUsed,
  remainingFreeScans: Math.max(0, freeBasicDailyLimit - dailyScansUsed),
  lastScanDate: today,
});

const reserveGuestBasicScan = async (clientIp: string, today: string) => {
  const memoryKey = `guest:${clientIp}:${today}`;

  if (!hasServiceAccountCredentials()) {
    enforceMemoryLimit(
      memoryKey,
      freeBasicDailyLimit,
      msUntilUtcMidnight(),
      'You have reached your free scan limit for today. Please sign in to continue.'
    );
    return {
      billing: buildFreeBasicBilling('guest', freeBasicDailyLimit, today),
      refund: async () => releaseMemoryLimit(memoryKey),
    };
  }

  const transaction = await beginFirestoreTransaction();
  const guestPath = getGuestLimitPath(clientIp);
  try {
    const docs = await getDocumentsInTransaction([guestPath], transaction);
    const guestDoc = decodeFirestoreDocument(docs.get(firestoreDocumentName(guestPath)));
    const existing = guestDoc?.data || {};
    const currentCount = existing.lastScanDate === today ? toNumber(existing.count) : 0;

    if (currentCount >= freeBasicDailyLimit) {
      throw new ApiError(429, 'rate_limited', 'You have reached your free scan limit for today. Please sign in to continue.');
    }

    await commitFirestoreWrites([
      buildUpdateWrite(
        guestPath,
        {
          count: currentCount + 1,
          lastScanDate: today,
        },
        guestDoc?.updateTime ? { updateTime: guestDoc.updateTime } : { exists: false }
      ),
    ], transaction);

    return {
      billing: buildFreeBasicBilling('guest', currentCount + 1, today),
      refund: async () => {
        try {
          await commitFirestoreWrites([
            buildIncrementWrite(guestPath, { count: -1 }),
          ]);
        } catch (error) {
          console.error('Failed to refund guest Basic scan after model error:', error);
        }
      },
    };
  } catch (error) {
    await rollbackFirestoreTransaction(transaction);
    throw error;
  }
};

export const reserveBasicScan = async (user: AuthenticatedUser | null, clientIp: string): Promise<ScanReservation> => {
  const today = todayKey();

  if (!user) {
    return reserveGuestBasicScan(clientIp, today);
  }

  const memoryKey = `user:${user.uid}:${today}`;

  if (!hasServiceAccountCredentials()) {
    enforceMemoryLimit(
      memoryKey,
      freeBasicDailyLimit,
      msUntilUtcMidnight(),
      'You have reached your free Basic Diagnosis limit for today.'
    );
    return {
      billing: buildFreeBasicBilling('user', freeBasicDailyLimit, today),
      refund: async () => releaseMemoryLimit(memoryKey),
    };
  }

  const transaction = await beginFirestoreTransaction();
  const userPath = `users/${user.uid}`;
  try {
    const docs = await getDocumentsInTransaction([userPath], transaction);
    const userDoc = decodeFirestoreDocument(docs.get(firestoreDocumentName(userPath)));
    const existing = userDoc?.data || {};
    const role = existing.role || 'user';
    const currentDailyScans = existing.lastScanDate === today ? toNumber(existing.dailyScans) : 0;

    if (!isUnlimitedRole(role) && currentDailyScans >= freeBasicDailyLimit) {
      throw new ApiError(429, 'rate_limited', 'You have reached your free Basic Diagnosis limit for today.');
    }

    const nextFields = userDoc ? {
      dailyScans: currentDailyScans + 1,
      lastScanDate: today,
      plantsScanned: toNumber(existing.plantsScanned) + 1,
    } : {
      email: user.email || '',
      role: 'user',
      plantsScanned: 1,
      plantsSaved: 0,
      dailyScans: 1,
      lastScanDate: today,
      scanPoints: 0,
      createdAt: new Date(),
    };

    await commitFirestoreWrites([
      buildUpdateWrite(
        userPath,
        nextFields,
        userDoc?.updateTime ? { updateTime: userDoc.updateTime } : { exists: false }
      ),
    ], transaction);

    return {
      billing: buildFreeBasicBilling('user', currentDailyScans + 1, today),
      refund: async () => {
        try {
          await commitFirestoreWrites([
            buildIncrementWrite(userPath, {
              dailyScans: -1,
              plantsScanned: -1,
            }),
          ]);
        } catch (error) {
          console.error('Failed to refund user Basic scan after model error:', error);
        }
      },
    };
  } catch (error) {
    await rollbackFirestoreTransaction(transaction);
    throw error;
  }
};

export const getUnlockedProForScan = async (user: AuthenticatedUser, resultId: string) => {
  if (!hasServiceAccountCredentials()) {
    return null;
  }

  const transaction = await beginFirestoreTransaction();
  try {
    const scanPath = `scans/${resultId}`;
    const docs = await getDocumentsInTransaction([scanPath], transaction);
    const scanDoc = decodeFirestoreDocument(docs.get(firestoreDocumentName(scanPath)));

    if (!scanDoc) {
      await rollbackFirestoreTransaction(transaction);
      return null;
    }

    if (scanDoc.data.userId !== user.uid) {
      throw new ApiError(403, 'forbidden', 'You cannot unlock this scan.');
    }

    const existingPro = scanDoc.data.proUnlocked === true ? (scanDoc.data.pro || null) : null;
    await rollbackFirestoreTransaction(transaction);
    return existingPro;
  } catch (error) {
    await rollbackFirestoreTransaction(transaction);
    throw error;
  }
};

export const saveUnlockedProForScan = async (
  user: AuthenticatedUser,
  resultId: string,
  pro: unknown
) => {
  if (!hasServiceAccountCredentials()) {
    return;
  }

  const transaction = await beginFirestoreTransaction();
  try {
    const scanPath = `scans/${resultId}`;
    const docs = await getDocumentsInTransaction([scanPath], transaction);
    const scanDoc = decodeFirestoreDocument(docs.get(firestoreDocumentName(scanPath)));

    if (!scanDoc) {
      throw new ApiError(404, 'not_found', 'Saved scan was not found.');
    }

    if (scanDoc.data.userId !== user.uid) {
      throw new ApiError(403, 'forbidden', 'You cannot update this scan.');
    }

    await commitFirestoreWrites([
      buildUpdateWrite(
        scanPath,
        {
          pro,
          proUnlocked: true,
          proUnlockedAt: new Date(),
        },
        { updateTime: scanDoc.updateTime }
      ),
    ], transaction);
  } catch (error) {
    await rollbackFirestoreTransaction(transaction);
    throw error;
  }
};

export const consumeProPoint = async (user: AuthenticatedUser, options: { recordScan?: boolean } = {}) => {
  if (!hasServiceAccountCredentials()) {
    throw new ApiError(
      503,
      'server_not_configured',
      'Secure point deduction is not configured yet.'
    );
  }

  const transaction = await beginFirestoreTransaction();
  try {
    const userPath = `users/${user.uid}`;
    const docs = await getDocumentsInTransaction([userPath], transaction);
    const userDoc = decodeFirestoreDocument(docs.get(firestoreDocumentName(userPath)));
    const existing = userDoc?.data;
    const scanPoints = toNumber(existing?.scanPoints);

    if (!userDoc || scanPoints < 1) {
      throw new ApiError(402, 'points_required', 'You need at least 1 Scan Point to unlock Pro.');
    }

    const updateFields: Record<string, unknown> = { scanPoints: scanPoints - 1 };
    if (options.recordScan) {
      updateFields.plantsScanned = toNumber(existing?.plantsScanned) + 1;
    }

    await commitFirestoreWrites([
      buildUpdateWrite(userPath, updateFields, { updateTime: userDoc.updateTime }),
    ], transaction);

    const nextPlantsScanned = options.recordScan ? toNumber(existing?.plantsScanned) + 1 : undefined;

    return {
      billing: {
        channel: 'scan-point' as const,
        usedScanPoint: true,
        scanPointsRemaining: scanPoints - 1,
        recordedScan: options.recordScan === true,
        ...(typeof nextPlantsScanned === 'number' ? { plantsScanned: nextPlantsScanned } : {}),
      },
      refund: async () => {
        try {
          await commitFirestoreWrites([
            buildIncrementWrite(userPath, {
              scanPoints: 1,
              ...(options.recordScan ? { plantsScanned: -1 } : {}),
            }),
          ]);
        } catch (error) {
          console.error('Failed to refund Pro point after model error:', error);
        }
      },
    };
  } catch (error) {
    await rollbackFirestoreTransaction(transaction);
    throw error;
  }
};

export const creditScanPointsForPayment = async (
  user: AuthenticatedUser,
  payment: {
    orderId: string;
    captureId?: string;
    tierId: string;
    amount: string;
    currency: string;
    points: number;
  }
) => {
  if (!hasServiceAccountCredentials()) {
    throw new ApiError(
      503,
      'server_not_configured',
      'Secure payment crediting is not configured yet.'
    );
  }

  const transaction = await beginFirestoreTransaction();
  try {
    const userPath = `users/${user.uid}`;
    const paymentPath = `payments/${payment.orderId}`;
    const docs = await getDocumentsInTransaction([userPath, paymentPath], transaction);
    const userDoc = decodeFirestoreDocument(docs.get(firestoreDocumentName(userPath)));
    const paymentDoc = decodeFirestoreDocument(docs.get(firestoreDocumentName(paymentPath)));

    if (paymentDoc) {
      await rollbackFirestoreTransaction(transaction);
      return { alreadyCredited: true };
    }

    const existingUser = userDoc?.data || {};
    const currentPoints = toNumber(existingUser.scanPoints);
    const userFields = userDoc ? {
      scanPoints: currentPoints + payment.points,
    } : {
      email: user.email || '',
      role: 'user',
      plantsScanned: 0,
      plantsSaved: 0,
      dailyScans: 0,
      lastScanDate: todayKey(),
      scanPoints: payment.points,
      createdAt: new Date(),
    };

    await commitFirestoreWrites([
      buildUpdateWrite(
        userPath,
        userFields,
        userDoc?.updateTime ? { updateTime: userDoc.updateTime } : { exists: false }
      ),
      buildUpdateWrite(paymentPath, {
        orderId: payment.orderId,
        captureId: payment.captureId || null,
        userId: user.uid,
        tierId: payment.tierId,
        amount: payment.amount,
        currency: payment.currency,
        points: payment.points,
        status: 'credited',
        createdAt: new Date(),
      }, { exists: false }),
    ], transaction);

    return { alreadyCredited: false };
  } catch (error) {
    await rollbackFirestoreTransaction(transaction);
    throw error;
  }
};

const allowedMetricEvents = new Set([
  'scan_attempt',
  'scan_success',
  'paid_scan_attempt',
  'paid_scan_success',
  'free_scan',
  'share_click',
  'unlock_click',
  'pricing_click',
  'email_submission',
  'save_to_garden',
]);

const sanitizeMetricKey = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[^A-Za-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 80);
  return cleaned || null;
};

const metricIncrements = (event: string, metadata?: { species?: string; problem?: string }) => {
  const increments: Record<string, number> = {};
  if (event === 'scan_attempt' || event === 'paid_scan_attempt') increments.geminiCalls = 1;
  if (event === 'scan_success' || event === 'paid_scan_success') {
    increments.successfulScans = 1;
    increments.totalScans = 1;
    const species = sanitizeMetricKey(metadata?.species);
    const problem = sanitizeMetricKey(metadata?.problem);
    if (species) increments[`topPlants.${species}`] = 1;
    if (problem) increments[`topProblems.${problem}`] = 1;
  }
  if (event === 'free_scan') increments.freeScans = 1;
  if (event === 'share_click') increments.shareClicks = 1;
  if (event === 'unlock_click') increments.unlockClicks = 1;
  if (event === 'pricing_click') increments.pricingPackageClicks = 1;
  if (event === 'email_submission') increments.emailSubmissions = 1;
  if (event === 'save_to_garden') increments.saveToGarden = 1;
  return increments;
};

export const recordMetricEvent = async (
  event: string,
  metadata?: { species?: string; problem?: string }
) => {
  if (!allowedMetricEvents.has(event)) {
    throw new ApiError(400, 'invalid_request', 'Unknown metric event.');
  }

  if (!hasServiceAccountCredentials()) {
    return;
  }

  const increments = metricIncrements(event, metadata);
  if (!Object.keys(increments).length) return;

  await commitFirestoreWrites([
    buildIncrementWrite(`metrics/${todayKey()}`, increments),
    buildIncrementWrite('metrics/global', increments),
  ]);
};
