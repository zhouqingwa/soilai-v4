import { randomUUID } from 'crypto';
import { ApiError } from './http.js';
import { type AuthenticatedUser } from './firebase-rest.js';
import { creditScanPointsForPayment } from './usage.js';

export const scanPointTiers = [
  { id: 'starter', name: 'Starter', price: '1.99', points: 2 },
  { id: 'lover', name: 'Plant Lover', price: '4.99', points: 8 },
  { id: 'parent', name: 'Plant Parent', price: '9.99', points: 20 },
] as const;

let paypalTokenCache: { token: string; expiresAt: number } | null = null;

const getTier = (tierId: unknown) => {
  const tier = scanPointTiers.find((item) => item.id === tierId);
  if (!tier) {
    throw new ApiError(400, 'invalid_request', 'Unknown Scan Point package.');
  }
  return tier;
};

const getPayPalBaseUrl = () =>
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const getPayPalAccessToken = async () => {
  if (paypalTokenCache && paypalTokenCache.expiresAt > Date.now() + 60_000) {
    return paypalTokenCache.token;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new ApiError(503, 'server_not_configured', 'PayPal server credentials are not configured yet.');
  }

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    console.error('PayPal token request failed:', data);
    throw new ApiError(503, 'paypal_unavailable', 'PayPal is not available right now.');
  }

  paypalTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000,
  };
  return paypalTokenCache.token;
};

const paypalFetch = async (path: string, init: RequestInit = {}) => {
  const token = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('PayPal request failed:', data);
    throw new ApiError(502, 'paypal_unavailable', 'PayPal could not process this request.');
  }
  return data;
};

export const createPayPalOrder = async (user: AuthenticatedUser, tierId: unknown) => {
  const tier = getTier(tierId);
  const order = await paypalFetch('/v2/checkout/orders', {
    method: 'POST',
    headers: {
      'PayPal-Request-Id': `soilai-${user.uid}-${tier.id}-${randomUUID()}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        custom_id: user.uid,
        description: `${tier.points} Soil AI Scan Points`,
        amount: {
          currency_code: 'USD',
          value: tier.price,
        },
      }],
    }),
  });

  if (!order.id) {
    throw new ApiError(502, 'paypal_unavailable', 'PayPal did not return an order id.');
  }

  return {
    orderId: order.id as string,
  };
};

const getCapture = (order: any) =>
  order?.purchase_units?.[0]?.payments?.captures?.find((capture: any) => capture?.status === 'COMPLETED');

export const capturePayPalOrder = async (user: AuthenticatedUser, orderId: unknown, tierId: unknown) => {
  if (typeof orderId !== 'string' || !orderId.trim()) {
    throw new ApiError(400, 'invalid_request', 'Missing PayPal order id.');
  }

  const tier = getTier(tierId);
  const order = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: {
      'PayPal-Request-Id': `soilai-capture-${orderId}`,
    },
  });

  const capture = getCapture(order);
  const purchaseUnit = order?.purchase_units?.[0];
  const amount = capture?.amount || purchaseUnit?.amount;
  const customId = purchaseUnit?.custom_id;

  if (order.status !== 'COMPLETED' || !capture) {
    throw new ApiError(402, 'payment_incomplete', 'Payment was not completed.');
  }

  if (customId && customId !== user.uid) {
    throw new ApiError(403, 'payment_owner_mismatch', 'This payment belongs to another account.');
  }

  if (amount?.currency_code !== 'USD' || amount?.value !== tier.price) {
    throw new ApiError(400, 'payment_amount_mismatch', 'Payment amount does not match the selected package.');
  }

  const creditResult = await creditScanPointsForPayment(user, {
    orderId,
    captureId: capture.id,
    tierId: tier.id,
    amount: tier.price,
    currency: 'USD',
    points: tier.points,
  });

  return {
    points: tier.points,
    alreadyCredited: creditResult.alreadyCredited,
  };
};
