import * as crypto from 'node:crypto';
import { ApiError } from './http.js';

export type RequestContext = {
  headers?: Record<string, string | string[] | undefined>;
  ip?: string;
};

export type AuthenticatedUser = {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  customClaims?: Record<string, unknown>;
};

type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

type FirestoreValue =
  | { nullValue: null }
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { timestampValue: string }
  | { mapValue: { fields: Record<string, FirestoreValue> } }
  | { arrayValue: { values?: FirestoreValue[] } };

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

type Write = Record<string, unknown>;

const FIREBASE_WEB_API_KEY =
  process.env.FIREBASE_WEB_API_KEY ||
  process.env.VITE_FIREBASE_API_KEY ||
  process.env.FIREBASE_API_KEY ||
  'AIzaSyB9rXanAkXiXE18nBSrwSvKselrol_USLU';

export const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  'gen-lang-client-0617300238';

export const FIRESTORE_DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID ||
  'ai-studio-e1e85e80-c2dd-4518-ac91-9e0beee46aaf';

let accessTokenCache: { token: string; expiresAt: number } | null = null;

const getHeader = (headers: RequestContext['headers'], name: string) => {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lower) {
      return Array.isArray(value) ? value[0] : value;
    }
  }
  return undefined;
};

export const getClientIp = (context: RequestContext) => {
  const forwardedFor = getHeader(context.headers, 'x-forwarded-for');
  return (forwardedFor?.split(',')[0] || context.ip || 'unknown').trim();
};

export const getBearerToken = (context: RequestContext) => {
  const authorization = getHeader(context.headers, 'authorization');
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1];
};

const normalizePrivateKey = (key: string | undefined): string | undefined =>
  key?.replace(/\\n/g, '\n');

const parseServiceAccount = (): ServiceAccount | null => {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const rawBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  try {
    if (rawJson) {
      const parsed = JSON.parse(rawJson) as ServiceAccount;
      return {
        ...parsed,
        private_key: normalizePrivateKey(parsed.private_key),
      };
    }

    if (rawBase64) {
      const parsed = JSON.parse(Buffer.from(rawBase64, 'base64').toString('utf8')) as ServiceAccount;
      return {
        ...parsed,
        private_key: normalizePrivateKey(parsed.private_key),
      };
    }

    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      return {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY) || '',
        project_id: process.env.FIREBASE_PROJECT_ID,
      };
    }
  } catch (error) {
    console.error('Failed to parse Firebase service account env:', error);
    throw new ApiError(503, 'server_not_configured', 'Server credentials are not configured correctly.');
  }

  return null;
};

export const hasServiceAccountCredentials = () => Boolean(parseServiceAccount());

const requireServiceAccount = () => {
  const serviceAccount = parseServiceAccount();
  if (!serviceAccount?.client_email || !serviceAccount.private_key) {
    throw new ApiError(
      503,
      'server_not_configured',
      'Secure server actions are not configured yet. Please set Firebase service account environment variables.'
    );
  }
  return serviceAccount;
};

const base64Url = (input: string | Buffer) =>
  Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const createServiceAccountJwt = (serviceAccount: ServiceAccount) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: issuedAt,
    exp: issuedAt + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(serviceAccount.private_key);
  return `${unsigned}.${base64Url(signature)}`;
};

export const getGoogleAccessToken = async () => {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60_000) {
    return accessTokenCache.token;
  }

  const serviceAccount = requireServiceAccount();
  const assertion = createServiceAccountJwt(serviceAccount);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    console.error('Google access token exchange failed:', data);
    throw new ApiError(503, 'server_not_configured', 'Server credentials could not be verified.');
  }

  accessTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000,
  };
  return accessTokenCache.token;
};

export const verifyFirebaseIdToken = async (idToken: string): Promise<AuthenticatedUser> => {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(data.users) || data.users.length === 0) {
    throw new ApiError(401, 'auth_required', 'Please sign in again.');
  }

  const user = data.users[0];
  let customClaims: Record<string, unknown> | undefined;
  if (typeof user.customAttributes === 'string') {
    try {
      customClaims = JSON.parse(user.customAttributes);
    } catch {
      customClaims = undefined;
    }
  }

  return {
    uid: user.localId,
    email: user.email,
    emailVerified: user.emailVerified,
    customClaims,
  };
};

export const getOptionalAuthenticatedUser = async (context: RequestContext) => {
  const token = getBearerToken(context);
  if (!token) return null;
  return verifyFirebaseIdToken(token);
};

export const requireAuthenticatedUser = async (context: RequestContext) => {
  const token = getBearerToken(context);
  if (!token) {
    throw new ApiError(401, 'auth_required', 'Please sign in to continue.');
  }
  return verifyFirebaseIdToken(token);
};

export const firestoreDocumentName = (path: string) =>
  `projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/${path}`;

const firestoreDocumentsUrl = (suffix: string) =>
  `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents${suffix}`;

const firestoreFetch = async (suffix: string, init: RequestInit = {}) => {
  const token = await getGoogleAccessToken();
  const response = await fetch(firestoreDocumentsUrl(suffix), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Firestore REST request failed:', data);
    throw new ApiError(503, 'firestore_failed', 'Secure database action failed.');
  }
  return data;
};

export const beginFirestoreTransaction = async () => {
  const data = await firestoreFetch(':beginTransaction', {
    method: 'POST',
    body: JSON.stringify({ options: { readWrite: {} } }),
  });
  return data.transaction as string;
};

export const rollbackFirestoreTransaction = async (transaction: string) => {
  try {
    await firestoreFetch(':rollback', {
      method: 'POST',
      body: JSON.stringify({ transaction }),
    });
  } catch (error) {
    console.warn('Firestore rollback failed:', error);
  }
};

export const getDocumentsInTransaction = async (paths: string[], transaction: string) => {
  const data = await firestoreFetch(':batchGet', {
    method: 'POST',
    body: JSON.stringify({
      documents: paths.map(firestoreDocumentName),
      transaction,
    }),
  });

  const results = new Map<string, FirestoreDocument | null>();
  for (const item of data as Array<{ found?: FirestoreDocument; missing?: string }>) {
    if (item.found) {
      results.set(item.found.name, item.found);
    } else if (item.missing) {
      results.set(item.missing, null);
    }
  }
  return results;
};

export const commitFirestoreWrites = async (writes: Write[], transaction?: string) => {
  await firestoreFetch(':commit', {
    method: 'POST',
    body: JSON.stringify({
      writes,
      ...(transaction ? { transaction } : {}),
    }),
  });
};

export const encodeFirestoreValue = (value: unknown): FirestoreValue => {
  if (value === null || value === undefined) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(encodeFirestoreValue) } };
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, encodeFirestoreValue(nestedValue)])
        ),
      },
    };
  }
  return { stringValue: String(value) };
};

export const encodeFirestoreFields = (fields: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, encodeFirestoreValue(value)]));

export const decodeFirestoreValue = (value?: FirestoreValue): any => {
  if (!value) return undefined;
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeFirestoreValue);
  if ('mapValue' in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, nestedValue]) => [key, decodeFirestoreValue(nestedValue)])
    );
  }
  return undefined;
};

export const decodeFirestoreDocument = (document: FirestoreDocument | null | undefined) => {
  if (!document) return null;
  return {
    name: document.name,
    updateTime: document.updateTime,
    data: Object.fromEntries(
      Object.entries(document.fields || {}).map(([key, value]) => [key, decodeFirestoreValue(value)])
    ),
  };
};

export const buildUpdateWrite = (
  path: string,
  fields: Record<string, unknown>,
  precondition?: { updateTime?: string; exists?: boolean }
) => ({
  update: {
    name: firestoreDocumentName(path),
    fields: encodeFirestoreFields(fields),
  },
  updateMask: {
    fieldPaths: Object.keys(fields),
  },
  ...(precondition ? { currentDocument: precondition } : {}),
});

export const buildIncrementWrite = (path: string, increments: Record<string, number>) => ({
  transform: {
    document: firestoreDocumentName(path),
    fieldTransforms: Object.entries(increments).map(([fieldPath, amount]) => ({
      fieldPath,
      increment: encodeFirestoreValue(amount),
    })),
  },
});
