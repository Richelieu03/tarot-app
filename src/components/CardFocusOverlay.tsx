// src/components/CardFocusOverlay.tsx
"use client";

/** Full-screen focus view for one card. The interactive content lives in <CardDetail>. */

import { useEffect, useRef, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "../lib/locale";
import { CARD_BY_ZH } from "../lib/tarot-meanings";
import { getCardDisplayName } from "../lib/tarot-labels";
import CardDetail from "./CardDetail";

interface CardFocusOverlayProps {
  /** zh card name (matches /public/tarot/*.jpg); null = closed */
  cardName: string | null;
  /** Orientation the user drew; omit when browsing a collection */
  isReversed?: boolean;
  locale: Locale;
  /** e.g. a Trinity position label; omitted for single-card modes */
  positionLabel?: string;
  onClose: () => void;
}

export default function CardFocusOverlay({ cardName, isReversed, locale, positionLabel, onClose }: CardFocusOverlayProps) {
  const card = cardName ? CARD_BY_ZH[cardName] : undefined;
  const open = !!card;

  // Warm the cache for the card detail text once the page is idle, so opening a card feels instant
  useEffect(() => {
    const load = () => { void import("../lib/tarot-details"); };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(load, 2000);
    return () => clearTimeout(id);
  }, []);

  // Esc closes; lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Swipe down (while scrolled to the top) also closes, like dismissing a sheet on mobile
  const touchStartY = useRef<number | null>(null);
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.currentTarget.scrollTop <= 0 ? e.touches[0].clientY : null;
  };
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current !== null && e.changedTouches[0].clientY - touchStartY.current > 90) onClose();
    touchStartY.current = null;
  };

  if (typeof document === "undefined") return null;

  // Portal to <body>: ancestors use framer-motion transforms, which would trap `position: fixed`
  return createPortal(
    <AnimatePresence>
      {card && (
        <motion.div
          key="card-focus"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label={getCardDisplayName(card.name.zh, locale)}
          className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-[#05030a]/90 cursor-zoom-out px-4 py-14 backdrop-blur-sm"
        >
          {/* key: remount (fresh orientation state) when a different card opens */}
          <CardDetail key={card.id} card={card} locale={locale} drawnReversed={isReversed} positionLabel={positionLabel} />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
