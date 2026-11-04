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
  /** Calm informational message (e.g. daily limit reached); replaces the error/retry UI */
  notice?: string;
  /** When set, shows an "edit" link next to the question (only before any card is drawn) */
  onEditQuestion?: () => void;
  /** Daily card 宜/忌 lines, shown as tags under the reading */
  almanac?: { dos: string[]; donts: string[] };
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
  notice,
  onEditQuestion,
  almanac,
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
        {(question || onEditQuestion) && (
          <p className="mb-4 text-left text-xs leading-6 text-zinc-500">
            {question ? (
              <>
                {t(locale, "yourQuestion")}{locale === "zh" ? "：" : ": "}
                <span className="text-zinc-300">{question}</span>
              </>
            ) : (
              <span>{t(locale, "noQuestion")}</span>
            )}
            {onEditQuestion && (
              <button
                type="button"
                onClick={onEditQuestion}
                className="ml-3 text-violet-400/80 underline underline-offset-4 transition-colors hover:text-violet-300"
              >
                {question ? t(locale, "editQuestion") : t(locale, "addQuestion")}
              </button>
            )}
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

        {/* 文本内容区 — skipped entirely when there is nothing to show (avoids a big empty gap) */}
        {showAiSection && (notice || isErrorState || completion || isLoading || placeholderText) && (
        <div className="min-h-[120px] text-left font-serif text-[15px] italic leading-8 text-zinc-200 whitespace-pre-wrap flex flex-col justify-between">
          {notice ? (
            <p className="font-sans text-sm not-italic text-amber-300/80">🌙 {notice}</p>
          ) : isErrorState ? (
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

        {/* 宜 / 忌 */}
        {almanac && (almanac.dos.length > 0 || almanac.donts.length > 0) && (
          <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-left font-sans not-italic">
            {[
              { label: locale === "zh" ? "宜" : "Do", items: almanac.dos, cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200", badge: "text-emerald-300" },
              { label: locale === "zh" ? "忌" : "Avoid", items: almanac.donts, cls: "border-rose-400/30 bg-rose-400/10 text-rose-200", badge: "text-rose-300" },
            ].filter((row) => row.items.length > 0).map((row) => (
              <div key={row.label} className="flex flex-wrap items-center gap-2">
                <span className={`w-12 shrink-0 text-base font-semibold ${row.badge}`}>{row.label}</span>
                {row.items.map((item) => (
                  <span key={item} className={`rounded-full border px-3 py-1 text-xs ${row.cls}`}>{item}</span>
                ))}
              </div>
            ))}
          </div>
        )}

        {footer && <div className="mt-6 flex justify-center">{footer}</div>}
      </div>
    </div>
  );
}