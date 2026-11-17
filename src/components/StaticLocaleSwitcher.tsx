// src/components/StaticLocaleSwitcher.tsx
"use client";

/**
 * Language switch for statically rendered pages (the card library). It doesn't re-render the
 * page; it flips <html data-lang>, which CSS uses to show one language, and saves the choice
 * under the same key the reading pages use.
 */
import { useSyncExternalStore } from "react";
import LocaleSwitcher from "./LocaleSwitcher";
import { LOCALE_STORAGE_KEY, isLocale, type Locale } from "../lib/locale";

const EVENT = "tarot-locale-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

const getSnapshot = (): Locale => {
  const v = document.documentElement.dataset.lang ?? null;
  return isLocale(v) ? v : "zh";
};

export default function StaticLocaleSwitcher() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, () => "zh" as Locale);

  const setLocale = (next: Locale) => {
    try { localStorage.setItem(LOCALE_STORAGE_KEY, next); } catch { /* storage unavailable */ }
    document.documentElement.dataset.lang = next;
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
    window.dispatchEvent(new Event(EVENT));
  };

  return <LocaleSwitcher currentLocale={locale} onSetLocale={setLocale} />;
}
