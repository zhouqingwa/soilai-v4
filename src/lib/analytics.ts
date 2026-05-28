import { auth } from '../firebase';

export type MetricEvent =
  | 'scan_attempt'
  | 'scan_success'
  | 'paid_scan_attempt'
  | 'paid_scan_success'
  | 'free_scan'
  | 'share_click'
  | 'unlock_click'
  | 'pricing_click'
  | 'email_submission'
  | 'save_to_garden';

export const trackEvent = async (event: MetricEvent, metadata?: { species?: string; problem?: string }) => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = await auth.currentUser?.getIdToken().catch(() => null);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    await fetch('/api/track-event', {
      method: 'POST',
      headers,
      body: JSON.stringify({ event, metadata }),
      keepalive: true,
    });
  } catch (error) {
    console.warn('Analytics event dropped:', error);
  }
};
