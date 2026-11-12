// src/components/CardDetail.tsx
"use client";

/**
 * Interactive view of one card: tilting card image, upright/reversed toggle (the card turns),
 * the meaning for the chosen orientation, and "about this card" facts.
 * Used by the full-screen focus overlay; meant to be reused by a personal card collection later.
 */

import { useEffect, useId, useState, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { Locale } from "../lib/locale";
import { getCardOneLiner, type TarotCard } from "../lib/tarot-meanings";
import { getCardDisplayName } from "../lib/tarot-labels";
import { getCardFacts, getGroupTheme } from "../lib/card-info";
import { cardImage } from "../lib/card-groups";
// Type only: the detail text itself is loaded on demand (see the effect below)
import type { CardDetailText } from "../lib/tarot-details";

interface CardDetailProps {
  card: TarotCard;
  locale: Locale;
  /** Orientation the user actually drew; omit when browsing (starts upright, no "drawn" marker) */
  drawnReversed?: boolean;
  /** e.g. a Trinity position label */
  positionLabel?: string;
  /** Extra line under the facts (e.g. "3rd time you've met this card") */
  footer?: ReactNode;
}

export default function CardDetail({ card, locale, drawnReversed, positionLabel, footer }: CardDetailProps) {
  const zh = locale === "zh";
  const pillId = useId();
  const reduceMotion = useReducedMotion();
  const [reversed, setReversed] = useState(!!drawnReversed);

  // Long meanings + lore are a large static file; fetch it only when a card is opened.
  // undefined = still loading, null = no entry for this card
  const [detail, setDetail] = useState<CardDetailText | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    import("../lib/tarot-details")
      .then((m) => { if (alive) setDetail(m.CARD_DETAILS[card.id] ?? null); })
      .catch(() => { if (alive) setDetail(null); });
    return () => { alive = false; };
  }, [card.id]);

  // ── Pointer tilt (mouse only; touch devices keep the card still) ──
  const px = useMotionValue(0); // -0.5 … 0.5 across the card
  const py = useMotionValue(0);
  const spring = { stiffness: 180, damping: 18 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [12, -12]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), spring);
  const glareX = useTransform(px, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(py, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.22), transparent 55%)`;
  const glareOpacity = useSpring(0, spring);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
    glareOpacity.set(1);
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
    glareOpacity.set(0);
  };

  const facts = getCardFacts(card, locale);
  // Cards without detail text yet fall back to the full pre-written meaning
  const short = getCardOneLiner(card, reversed, locale);
  const meaning = detail ? (reversed ? detail.revLong : detail.upLong)[locale] : (reversed ? card.rev : card.up)[locale];
  const zhName = getCardDisplayName(card.name.zh, "zh");
  const name = zh ? zhName : card.name.en;
  const orientations = [
    { rev: false, label: zh ? "正位" : "Upright" },
    { rev: true, label: zh ? "逆位" : "Reversed" },
  ];

  return (
    <div
      className="my-auto flex w-full max-w-5xl flex-col items-center gap-8 md:flex-row md:items-start md:justify-center md:gap-14"
    >
      {/* ── Card ── */}
      <motion.div
        initial={{ scale: 0.85, y: 14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="[perspective:1000px] md:sticky md:top-8"
      >
        <motion.div
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          style={{ rotateX, rotateY }}
          className="relative aspect-[25/43] w-[min(58vw,300px)] [transform-style:preserve-3d]"
        >
          <motion.button
            type="button"
            onClick={(e) => { e.stopPropagation(); setReversed((r) => !r); }}
            aria-label={zh ? "切换正逆位" : "Turn the card"}
            animate={{ rotate: reversed ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 16 }}
            whileTap={{ scale: 0.97 }}
            className="relative block h-full w-full cursor-pointer overflow-hidden border border-amber-300/30 shadow-[0_0_60px_rgba(139,92,246,0.35)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- plain static image */}
            <img src={cardImage(card)} alt={name} className="h-full w-full object-cover" draggable={false} />
            <motion.div className="pointer-events-none absolute inset-0" style={{ background: glare, opacity: glareOpacity }} />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ── Text ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="w-full max-w-md text-center md:text-left"
      >
        {positionLabel && <div className="mb-3 text-xs tracking-[0.3em] text-violet-400">{positionLabel}</div>}
        <h2 className={`font-light text-zinc-50 ${zh ? "text-3xl tracking-[0.25em]" : "text-3xl tracking-[0.06em]"}`}>{name}</h2>
        <p className="mt-1 text-xs text-zinc-500">{zh ? card.name.en : zhName}</p>

        {/* Upright / reversed toggle — the active pill slides between the two */}
        <div onClick={(e) => e.stopPropagation()} className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
          {orientations.map((o) => {
            const active = reversed === o.rev;
            const drawn = drawnReversed !== undefined && drawnReversed === o.rev;
            return (
              <button
                key={o.label}
                type="button"
                onClick={(e) => { e.stopPropagation(); setReversed(o.rev); }}
                className={`relative cursor-pointer rounded-full px-5 py-1.5 text-xs tracking-widest transition-colors ${active ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-200"}`}
              >
                {active && (
                  <motion.span
                    layoutId={`orient-pill-${pillId}`}
                    className="absolute inset-0 rounded-full bg-amber-100"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">
                  {o.label}
                  {/* Placeholder copy — feel free to change */}
                  {drawn && <span className={`ml-1.5 text-[10px] ${active ? "text-violet-700" : "text-violet-400"}`}>{zh ? "· 你抽到的" : "· drawn"}</span>}
                </span>
              </button>
            );
          })}
        </div>

        {/* Meaning, cross-fading when the orientation changes */}
        <div className="relative mt-5 min-h-[9rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={reversed ? "rev" : "up"}
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.22 }}
            >
              <p className={`text-lg text-amber-100 ${zh ? "tracking-[0.12em]" : ""}`}>{short}</p>
              {detail === undefined ? (
                <div className="mt-4 space-y-2.5" aria-hidden>
                  {[100, 92, 96, 70].map((w) => (
                    <div key={w} className="h-3 animate-pulse rounded-full bg-white/[0.07]" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[15px] leading-7 text-zinc-300">{meaning}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The card's background: imagery, symbolism, history */}
        {detail && (
          <div className="mt-8 border-t border-white/10 pt-5">
            {/* Placeholder copy — feel free to change */}
            <div className="text-[11px] tracking-[0.3em] text-zinc-500">{zh ? "前世今生" : "ORIGINS & SYMBOLS"}</div>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{detail.lore[locale]}</p>
          </div>
        )}

        {/* About this card */}
        <div className="mt-6 border-t border-white/10 pt-5">
          {/* Placeholder copy — feel free to change */}
          <div className="text-[11px] tracking-[0.3em] text-zinc-500">{zh ? "关于这张牌" : "ABOUT THIS CARD"}</div>
          <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
            {facts.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="rounded-full border border-violet-400/20 bg-violet-500/[0.06] px-3 py-1 text-xs"
              >
                <span className="text-zinc-500">{f.label}</span>
                <span className="ml-1.5 text-zinc-200">{f.value}</span>
              </motion.div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-amber-200/60">{getGroupTheme(card, locale)}</p>
          {footer && <div className="mt-4 text-sm text-violet-300">{footer}</div>}
          {/* Placeholder copy — feel free to change */}
          <p className="mt-8 text-[11px] tracking-widest text-zinc-600">{zh ? "轻点空白处返回" : "Tap anywhere to go back"}</p>
        </div>
      </motion.div>
    </div>
  );
}
