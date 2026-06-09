import { FIREBASE_PROJECT_ID, FIRESTORE_DATABASE_ID, hasServiceAccountCredentials } from './firebase-rest.js';

type StatusLevel = 'ok' | 'warning' | 'error';

type StatusItem = {
  label: string;
  status: StatusLevel;
  configured: boolean;
  hint?: string;
};

const hasValue = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

const item = (label: string, configured: boolean, hint?: string): StatusItem => ({
  label,
  configured,
  status: configured ? 'ok' : 'error',
  ...(hint && !configured ? { hint } : {}),
});

const warningItem = (label: string, configured: boolean, hint: string): StatusItem => ({
  label,
  configured,
  status: configured ? 'ok' : 'warning',
  hint: configured ? undefined : hint,
});

const getFirebaseServiceAccountStatus = (): StatusItem => {
  try {
    const configured = hasServiceAccountCredentials();
    return item(
      'Firebase Admin credentials',
      configured,
      'Set FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_SERVICE_ACCOUNT_JSON in Vercel.'
    );
  } catch {
    return {
      label: 'Firebase Admin credentials',
      configured: false,
      status: 'error',
      hint: 'Firebase service account env exists but could not be parsed.',
    };
  }
};

export const getSystemStatus = () => {
  const geminiApiConfigured = hasValue(process.env.CUSTOM_GEMINI_API_KEY) || hasValue(process.env.GEMINI_API_KEY);
  const geminiBaseUrl = process.env.GEMINI_BASE_URL?.trim() || '';
  const paypalEnv = process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox';
  const appUrlConfigured = hasValue(process.env.APP_URL);
  const guestSaltConfigured = hasValue(process.env.GUEST_LIMIT_SALT) && process.env.GUEST_LIMIT_SALT !== 'MY_RANDOM_GUEST_LIMIT_SALT';

  const checks: StatusItem[] = [
    item('Gemini API key', geminiApiConfigured, 'Set CUSTOM_GEMINI_API_KEY for your API relay, or GEMINI_API_KEY for direct Gemini.'),
    {
      label: 'Gemini relay URL',
      configured: hasValue(geminiBaseUrl),
      status: !geminiBaseUrl || geminiBaseUrl.startsWith('https://') || process.env.NODE_ENV !== 'production' ? 'ok' : 'error',
      hint: geminiBaseUrl && !geminiBaseUrl.startsWith('https://') && process.env.NODE_ENV === 'production'
        ? 'GEMINI_BASE_URL must use https in production.'
        : undefined,
    },
    item('Firebase Web API key', hasValue(process.env.FIREBASE_WEB_API_KEY), 'Set FIREBASE_WEB_API_KEY so server auth checks do not rely on fallback config.'),
    item('Firebase project ID', hasValue(FIREBASE_PROJECT_ID), 'Set FIREBASE_PROJECT_ID.'),
    item('Firestore database ID', hasValue(FIRESTORE_DATABASE_ID), 'Set FIRESTORE_DATABASE_ID.'),
    getFirebaseServiceAccountStatus(),
    item('PayPal client ID', hasValue(process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID), 'Set PAYPAL_CLIENT_ID for server checkout.'),
    item('PayPal client secret', hasValue(process.env.PAYPAL_CLIENT_SECRET), 'Set PAYPAL_CLIENT_SECRET for server checkout.'),
    item('PayPal frontend client ID', hasValue(process.env.VITE_PAYPAL_CLIENT_ID), 'Set VITE_PAYPAL_CLIENT_ID for the browser PayPal button.'),
    warningItem('Guest limit salt', guestSaltConfigured, 'Set GUEST_LIMIT_SALT to a long random string before production traffic.'),
    warningItem('Production app URL', appUrlConfigured, 'Set APP_URL to https://www.soilai.app for canonical URLs and sitemaps.'),
  ];

  const hasErrors = checks.some((check) => check.status === 'error');
  const hasWarnings = checks.some((check) => check.status === 'warning');

  return {
    ok: !hasErrors,
    status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
    environment: process.env.NODE_ENV || 'development',
    paypalEnv,
    checks,
    generatedAt: new Date().toISOString(),
  };
};
