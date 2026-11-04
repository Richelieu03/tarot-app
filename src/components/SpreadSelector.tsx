// src/components/SpreadSelector.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "../lib/locale";
import { t, type UiKey } from "../lib/ui-i18n";
import { track } from "../lib/analytics";

export type SpreadKind = "daily" | "single" | "three";

interface SpreadSelectorProps {
  currentSpread: SpreadKind;
  locale: Locale;
}

const OPTIONS: { kind: SpreadKind; href: string; icon: string; labelKey: UiKey }[] = [
  { kind: "daily", href: "/", icon: "☀️", labelKey: "modeDaily" },
  { kind: "single", href: "/single", icon: "🃏", labelKey: "modeQuestion" },
  { kind: "three", href: "/spread", icon: "🔮", labelKey: "modeSpread" },
];

export default function SpreadSelector({ currentSpread, locale }: SpreadSelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部自动收起
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = OPTIONS.find((o) => o.kind === currentSpread) ?? OPTIONS[0];

  // 当前激活状态的视觉样式皮肤配置
  const isThree = currentSpread === "three";
  const buttonClass = isThree
    ? "border-amber-400/25 bg-gradient-to-b from-amber-950/40 to-black/60 text-amber-200 hover:border-amber-400/40"
    : "border-violet-500/25 bg-gradient-to-b from-violet-950/40 to-black/60 text-violet-200 hover:border-violet-500/40";

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium backdrop-blur-md transition-all shadow-md tracking-wider ${buttonClass}`}
      >
        <span>{current.icon} {t(locale, current.labelKey)}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-[10px] opacity-60"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-44 rounded-xl border border-white/10 bg-black/85 p-1.5 backdrop-blur-xl shadow-2xl overflow-hidden z-[100]"
          >
            {OPTIONS.map((o) =>
              o.kind === currentSpread ? (
                <button
                  key={o.kind}
                  disabled
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs flex items-center justify-between cursor-default ${
                    o.kind === "three" ? "bg-amber-500/10 text-amber-200" : "bg-violet-500/10 text-violet-200"
                  }`}
                >
                  <div className="flex items-center gap-2"><span>{o.icon}</span>{t(locale, o.labelKey)}</div>
                  <span className="text-[10px]">●</span>
                </button>
              ) : (
                <button
                  key={o.kind}
                  onClick={() => { track("mode_switch", { to: o.kind }); setIsOpen(false); router.push(o.href); }}
                  className="w-full text-left rounded-lg px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <span>{o.icon}</span>
                  {t(locale, o.labelKey)}
                </button>
              ),
            )}
            <div className="my-1 border-t border-white/10" />
            <button
              onClick={() => { track("mode_switch", { to: "library" }); setIsOpen(false); router.push("/cards"); }}
              className="w-full text-left rounded-lg px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <span>📖</span>
              {t(locale, "modeLibrary")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
