// src/components/ReadingBox.tsx
"use client";

import type { ReactNode } from "react";
import type { Locale } from "../lib/locale";
import { t } from "../lib/ui-i18n";

interface ReadingBoxProps {
  completion: string;
  isLoading: boolean;
  error: any;
  isErrorState: boolean;
  placeholderText: string;
  readingStatusLabel: string;
  locale: Locale;
  onRetry: () => void;
  className?: string;
  /** The user's question, echoed back above the reading */
  question?: string;
  /** Pre-written card meanings; shown to everyone, no API call needed */
  meanings?: { label: string; text: string }[];
  /** false hides the AI reading area (e.g. guests) */
  showAiSection?: boolean;
  /** Rendered at the bottom of the box (e.g. login call-to-action) */
  footer?: ReactNode;
}

export default function ReadingBox({
  completion,
  isLoading,
  error,
  isErrorState,
  placeholderText,
  readingStatusLabel,
  locale,
  onRetry,
  className = "mt-16",
  question,
  meanings,
  showAiSection = true,
  footer,
}: ReadingBoxProps) {
  const hasMeanings = !!meanings && meanings.length > 0;
  return (
    <div className={`relative z-20 w-full max-w-lg md:max-w-2xl ${className}`}>
      <div className="border border-white/5 bg-white/5 p-6 shadow-xl backdrop-blur-2xl">
        {/* 顶部状态栏 */}
        <div className="mb-4 flex items-center justify-between text-[10px] text-zinc-500 tracking-widest">
          <span>{t(locale, "readingHeader")}</span>
          <span className={isLoading ? "animate-pulse text-violet-400" : ""}>
            {readingStatusLabel}
          </span>
        </div>
        
        {/* 问题回显 */}
        {question && (
          <p className="mb-4 text-left text-xs leading-6 text-zinc-500">
            {t(locale, "yourQuestion")}：<span className="text-zinc-300">{question}</span>
          </p>
        )}

        {/* 预存牌义 */}
        {hasMeanings && (
          <div className="mb-2 space-y-3 text-left">
            <div className="text-[10px] tracking-widest text-amber-400/70">{t(locale, "meaningTitle")}</div>
            {meanings!.map((m) => (
              <p key={m.label} className="text-sm leading-7 text-zinc-300">
                <span className="font-semibold text-zinc-100">{m.label}</span>
                <span className="mx-2 text-zinc-600">·</span>
                {m.text}
              </p>
            ))}
          </div>
        )}

        {hasMeanings && showAiSection && (
          <div className="mb-3 mt-5 border-t border-white/10 pt-4 text-left text-[10px] tracking-widest text-violet-400/80">
            {t(locale, "personalReadingTitle")}
          </div>
        )}

        {/* 文本内容区 */}
        {showAiSection && (
        <div className="min-h-[120px] text-left font-serif text-[15px] italic leading-8 text-zinc-200 whitespace-pre-wrap flex flex-col justify-between">
          {isErrorState ? (
            <div className="flex flex-col items-start text-sm text-red-400/80 font-sans not-italic">
              <p>
                {locale === "zh" 
                  ? "🔮 网络输入波动或占卜受阻，请重新尝试召唤解牌。" 
                  : "🔮 The astral connection is disrupted. Please retry reading."}
              </p>
              <button 
                type="button" 
                onClick={onRetry} 
                className="mt-4 border border-violet-500/50 px-5 py-2 text-xs text-violet-400 hover:bg-violet-500/10 transition-colors"
              >
                {t(locale, "retryButton")}
              </button>
            </div>
          ) : completion ? (
            /* 状态 1: 正常显示 AI 解牌文字 */
            completion
          ) : isLoading ? (
            /* 🌟 状态 2: 这里是刚加的！点击翻牌瞬间亮起的动画和提示 */
            <div className="flex items-center gap-3 text-violet-400/80 font-sans mt-2">
               <svg className="animate-spin h-5 w-5 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <span className="animate-pulse tracking-widest text-[13px] not-italic">
                 {locale === "zh" ? "星界连结中，正在召唤神谕..." : "Channeling the astral oracle..."}
               </span>
            </div>
          ) : (
            /* 状态 3 */
            <span className="text-zinc-500 font-sans not-italic text-[14px]">
              {placeholderText}
            </span>
          )}
        </div>
        )}

        {footer && <div className="mt-6 flex justify-center">{footer}</div>}
      </div>
    </div>
  );
}