export type Locale = "en" | "zh";

// v2: the old key was written as "en" for every first-time visitor, so it can't be trusted
export const LOCALE_STORAGE_KEY = "tarot_locale_v2";

export const defaultLocale: Locale = "en";

export function isLocale(v: string | null): v is Locale {
  return v === "en" || v === "zh";
}

/**
 * Locale for this visitor: their saved choice if any, otherwise the browser language
 * (any Chinese variant → zh). Only call on the client.
 */
export function getInitialLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // storage unavailable — fall through to the browser language
  }
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  return langs.some((l) => l?.toLowerCase().startsWith("zh")) ? "zh" : "en";
}
