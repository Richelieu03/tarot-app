// src/components/DailyStage.tsx
"use client";

/**
 * Holds the main card, plus the six-axis radar once it exists (每日一牌, after flipping).
 *  - Phone: scroll-driven swap. The stage sticks briefly; scrolling down fades/shrinks the card
 *    away and the radar grows in its place. Scrolling back up reverses it (no scroll-jacking).
 *  - Desktop: card and radar side by side, no animation tied to scrolling.
 * The DOM shape never changes between states, so the card isn't remounted when the radar appears
 * (that would kill the flip animation).
 */

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";

const MOBILE_QUERY = "(max-width: 767px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useIsMobile = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(MOBILE_QUERY).matches, () => false);

// Phone layout (px)
const STICKY_TOP = 64;  // clears the header
const STAGE_H = 340;    // visible stage (card ≈ 240px tall, radar ≈ 300px)
const SCROLL_SPAN = 220; // extra scroll distance over which the swap happens

interface DailyStageProps {
  card: ReactNode;
  /** Render the radar; `active` turns true when it should draw its shape. null = no radar (yet). */
  radar: ((active: boolean) => ReactNode) | null;
}

export default function DailyStage({ card, radar }: DailyStageProps) {
  const isMobile = useIsMobile();
  const scrollMode = isMobile && !!radar;
  const outerRef = useRef<HTMLDivElement>(null);

  // 0 when the stage starts sticking, 1 when it lets go
  const { scrollYProgress: p } = useScroll({
    target: outerRef,
    offset: [`start ${STICKY_TOP}px`, `end ${STICKY_TOP + STAGE_H}px`],
  });
  const cardOpacity = useTransform(p, [0.08, 0.5], [1, 0]);
  const cardScale = useTransform(p, [0.08, 0.5], [1, 0.8]);
  const cardY = useTransform(p, [0, 0.5], [0, -28]);
  const cardPointer = useTransform(p, (v) => (v > 0.45 ? "none" : "auto"));
  const radarOpacity = useTransform(p, [0.4, 0.8], [0, 1]);
  const radarScale = useTransform(p, [0.4, 0.85], [0.9, 1]);

  // The radar draws its shape once it has scrolled into view (and stays drawn)
  const [revealed, setRevealed] = useState(false);
  useMotionValueEvent(p, "change", (v) => { if (v > 0.45 && !revealed) setRevealed(true); });
  const radarActive = !scrollMode || revealed;

  return (
    <div
      ref={outerRef}
      className="relative w-full"
      style={scrollMode ? { height: STAGE_H + SCROLL_SPAN } : undefined}
    >
      <div
        className={scrollMode
          ? "sticky flex items-center justify-center"
          : `flex items-center justify-center ${radar ? "gap-14" : ""}`}
        style={scrollMode ? { top: STICKY_TOP, height: STAGE_H } : undefined}
      >
        <motion.div
          className="mb-6 flex items-center justify-center"
          style={scrollMode ? { opacity: cardOpacity, scale: cardScale, y: cardY, pointerEvents: cardPointer } : undefined}
        >
          {card}
        </motion.div>

        {radar && (
          <motion.div
            className={scrollMode ? "pointer-events-none absolute inset-0 flex items-center justify-center" : ""}
            style={scrollMode ? { opacity: radarOpacity, scale: radarScale } : undefined}
          >
            {radar(radarActive)}
          </motion.div>
        )}
      </div>
    </div>
  );
}
