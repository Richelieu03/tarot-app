// src/components/TarotCard.tsx

/** this file usage is card front and back showing, and turning motion */
"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";

export const CARD_BACK_SRC = "/tarot/维特牌背.jpg";
const cardFaceSrc = (cardName: string) => `/tarot/${cardName}.jpg`;

interface TarotCardProps {
  cardName: string;          // 牌的英文/拼音标识符 (用于找图片)
  cardLabel: string;         // 牌的中文/英文显示名称
  orientationLabel: string;  // 正位 / 逆位 文本
  oracleBadge?: string;      // "神谕启示" 等小标签
  isReversed: boolean;       // 是否逆位
  isFlipped: boolean;        // 是否翻开
  layoutId?: string;         // 用于跨页面平滑飞入的动画 ID
  onClick?: () => void;      // 点击事件
  disabled?: boolean;        // 是否禁用点击
  sizeClassName?: string;    // width classes; height follows from the 25:43 aspect ratio
}

export default function TarotCard({
  cardName,
  cardLabel,
  orientationLabel,
  oracleBadge,
  isReversed,
  isFlipped,
  layoutId,
  onClick,
  disabled = false,
  sizeClassName = "w-[250px] max-md:w-[140px]",
}: TarotCardProps) {
  // Ask the browser for the images as early as possible (React 19 hoists these into <head>)
  preload(CARD_BACK_SRC, { as: "image" });
  if (cardName) preload(cardFaceSrc(cardName), { as: "image", fetchPriority: "high" });

  // The face fades in once its image has arrived, instead of popping in half-drawn on slow networks
  const faceRef = useRef<HTMLImageElement>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const faceLoaded = !!cardName && loadedSrc === cardFaceSrc(cardName);
  useEffect(() => {
    // Cached images can finish before React attaches onLoad
    const img = faceRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoadedSrc(cardFaceSrc(cardName)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [cardName]);

  return (
    <div className={`${sizeClassName} aspect-[25/43] flex items-center justify-center [perspective:1200px]`}>
      <motion.div
        layoutId={layoutId}
        onClick={!disabled ? onClick : undefined}
        className={`relative h-full w-full rounded-none [transform-style:preserve-3d] ${
          !isFlipped && !disabled ? "cursor-pointer transition-shadow hover:shadow-[0_0_30px_rgba(167,139,250,0.3)]" : ""
        } ${isFlipped && !disabled && onClick ? "cursor-zoom-in" : ""}`}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ layout: { type: "spring", stiffness: 200, damping: 25 }, duration: 0.8 }}
      >
        {/* 1. 牌背 */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-none border border-white/10 bg-[#0a0612] shadow-2xl [backface-visibility:hidden] [transform:translateZ(0)]">
          <img
            src={CARD_BACK_SRC}
            alt="Tarot Back"
            className="absolute inset-0 h-full w-full object-cover object-center"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* 2. 牌面 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-none border border-white/20 bg-black shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(0.1px)]">
          {/* faint shimmer while the face image is still on its way */}
          {!faceLoaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-violet-950/60 to-black" />}
          <img
            ref={faceRef}
            src={cardFaceSrc(cardName)}
            alt={isFlipped ? cardLabel : ""}
            loading="eager"
            decoding="async"
            onLoad={() => setLoadedSrc(cardFaceSrc(cardName))}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${
              faceLoaded ? "opacity-90" : "opacity-0"
            } ${isReversed ? "rotate-180" : ""}`}
            onError={(e) => {
              setLoadedSrc(cardFaceSrc(cardName)); // show the fallback rather than an endless shimmer
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1620052579624-b153545faed8?q=80&w=400&auto=format&fit=crop";
            }}
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          {/* 卡牌标签文本 — only rendered once flipped, so the result isn't readable in the DOM early */}
          {isFlipped && (
          <div className="relative z-10 mt-auto w-full px-2 pb-3 md:px-6 md:pb-8 text-center leading-tight">
            {oracleBadge && (
              <div className="text-[7px] md:text-[10px] tracking-widest md:tracking-[0.3em] text-violet-400 drop-shadow-md">
                {oracleBadge}
              </div>
            )}
            <div className="mt-1 md:mt-2 text-[13px] md:text-2xl font-bold text-white drop-shadow-xl flex flex-col items-center justify-center gap-0.5 md:gap-1">
              <span>{cardLabel}</span>
              <span className="text-[10px] md:text-base font-normal text-zinc-300">({orientationLabel})</span>
            </div>
          </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}