export type Locale = "en" | "zh";

export const LOCALE_STORAGE_KEY = "tarot_locale";

export const defaultLocale: Locale = "en";

export function isLocale(v: string | null): v is Locale {
  return v === "en" || v === "zh";
}
