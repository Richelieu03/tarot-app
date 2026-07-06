// src/components/ReadingBox.tsx
"use client";

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
}: ReadingBoxProps) {
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
        
        {/* 文本内容区 */}
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
            completion
          ) : (
            <span className="text-zinc-500 font-sans not-italic text-[14px]">
              {placeholderText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}