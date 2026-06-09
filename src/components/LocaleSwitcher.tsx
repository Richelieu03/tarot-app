// src/components/LocaleSwitcher.tsx
"use client";

import type { Locale } from "../lib/locale";

interface LocaleSwitcherProps {
  currentLocale: Locale;
  onSetLocale: (newLocale: Locale) => Promise<void> | void;
}

export default function LocaleSwitcher({ currentLocale, onSetLocale }: LocaleSwitcherProps) {
  return (
    <div className="fixed right-4 top-4 z-[90] flex gap-2 rounded-full border border-white/15 bg-black/45 p-1 px-2 backdrop-blur-md items-center">
      <button 
        onClick={() => onSetLocale("en")} 
        className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${
          currentLocale === "en" ? "bg-violet-600/80 text-white" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        EN
      </button>
      <button 
        onClick={() => onSetLocale("zh")} 
        className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${
          currentLocale === "zh" ? "bg-violet-600/80 text-white" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        中文
      </button>
    </div>
  );
}