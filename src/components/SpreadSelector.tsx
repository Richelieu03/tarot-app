// src/components/SpreadSelector.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "../lib/locale";

interface SpreadSelectorProps {
  currentSpread: "single" | "three";
  locale: Locale;
}

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
        {isThree ? (
          <span>🔮 {locale === "zh" ? "圣三角阵" : "Three-Card Spread"}</span>
        ) : (
          <span>🃏 {locale === "zh" ? "单牌神谕" : "Single Oracle"}</span>
        )}
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
            className="absolute left-0 mt-2 w-40 rounded-xl border border-white/10 bg-black/85 p-1.5 backdrop-blur-xl shadow-2xl overflow-hidden z-[100]"
          >
            {/* 选项一：单牌神谕 */}
            {currentSpread === "single" ? (
              <button
                disabled
                className="w-full text-left rounded-lg px-3 py-2 text-xs bg-violet-500/10 text-violet-200 flex items-center justify-between cursor-default"
              >
                <div className="flex items-center gap-2"><span>🃏</span>{locale === "zh" ? "单牌神谕" : "Single"}</div>
                <span className="text-[10px]">●</span>
              </button>
            ) : (
              <button
                onClick={() => { setIsOpen(false); router.push("/"); }}
                className="w-full text-left rounded-lg px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <span>🃏</span>
                {locale === "zh" ? "单牌神谕" : "Single Oracle"}
              </button>
            )}

            {/* 选项二：圣三角阵 */}
            {currentSpread === "three" ? (
              <button
                disabled
                className="w-full text-left rounded-lg px-3 py-2 text-xs bg-amber-500/10 text-amber-200 flex items-center justify-between cursor-default"
              >
                <div className="flex items-center gap-2"><span>🔮</span>{locale === "zh" ? "圣三角阵" : "Three-Card"}</div>
                <span className="text-[10px]">●</span>
              </button>
            ) : (
              <button
                onClick={() => { setIsOpen(false); router.push("/spread"); }}
                className="w-full text-left rounded-lg px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <span>🔮</span>
                {locale === "zh" ? "圣三角阵" : "Three-Card"}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}