// src/components/DailyStage.tsx
"use client";

/**
 * Holds the main card, plus the six-axis radar once it exists (每日一牌, after flipping).
 *  - Phone: card on top, radar right underneath, then the reading.
 *  - Desktop: card and radar side by side.
 * The DOM shape never changes when the radar appears, so the card isn't remounted
 * (that would kill the flip animation).
 */

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface DailyStageProps {
  card: ReactNode;
  /** The radar; null = no radar (yet) */
  radar: ReactNode | null;
}

export default function DailyStage({ card, radar }: DailyStageProps) {
  return (
    <div className="relative w-full">
      <div className={`flex flex-col items-center justify-center ${radar ? "gap-2 md:flex-row md:gap-14" : ""}`}>
        <div className="mb-6 flex items-center justify-center">{card}</div>
        {radar && (
          <motion.div
            className="mb-6 md:mb-0"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {radar}
          </motion.div>
        )}
      </div>
    </div>
  );
}
