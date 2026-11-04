// src/lib/analytics.ts
// Thin wrapper around Umami (https://umami.is) custom events.
// Cookieless and anonymous; never pass personal data (no questions, emails or readings).

type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: EventData) => void };
  }
}

/** Records a custom event. No-op if Umami isn't configured or is blocked. */
export function track(event: string, data?: EventData) {
  try {
    if (typeof window !== "undefined") window.umami?.track(event, data);
  } catch {
    // analytics must never break the app
  }
}
