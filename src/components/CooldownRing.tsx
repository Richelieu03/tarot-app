// src/components/CooldownRing.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CooldownRingProps {
  /** Timestamp (ms) when the cooldown ends */
  endsAt: number;
  /** Full cooldown length (ms), used to compute how much of the ring is left */
  totalMs: number;
  /** Called once when the cooldown reaches zero */
  onDone?: () => void;
  /** Message under the ring; receives the remaining ms so it can phrase it */
  children?: (remainingMs: number) => React.ReactNode;
}

const SIZE = 72;
const STROKE = 2;
const R = (SIZE - STROKE * 2) / 2 - 4;
const C = 2 * Math.PI * R;

/** 5025000 → "01:23:45" */
function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

/**
 * A slowly closing ring of light with a drifting ember on its edge.
 * The poetic message comes first; a faint hh:mm:ss countdown sits underneath for those who want the exact time.
 */
export default function CooldownRing({ endsAt, totalMs, onDone, children }: CooldownRingProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, endsAt - now);
  const fraction = totalMs > 0 ? remaining / totalMs : 0; // 1 → 0

  useEffect(() => {
    if (remaining === 0) onDone?.();
  }, [remaining, onDone]);

  // Position of the ember at the end of the remaining arc (starts at 12 o'clock, runs clockwise)
  const angle = -Math.PI / 2 + fraction * 2 * Math.PI;
  const cx = SIZE / 2 + R * Math.cos(angle);
  const cy = SIZE / 2 + R * Math.sin(angle);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="absolute inset-0">
          {/* faint full circle */}
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(167,139,250,0.12)" strokeWidth={STROKE} />
          {/* remaining arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="url(#cooldown-gradient)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - fraction)}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
          <defs>
            <linearGradient id="cooldown-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {/* glowing ember at the tip of the arc */}
          {fraction > 0 && (
            <circle cx={cx} cy={cy} r={3} fill="#fde68a" style={{ filter: "drop-shadow(0 0 6px rgba(251,191,36,0.9))", transition: "cx 1s linear, cy 1s linear" }} />
          )}
        </svg>

        {/* breathing star in the centre */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-lg text-amber-200/90"
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.08, 0.9], rotate: [0, 180, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          ✦
        </motion.div>
      </div>

      {children && (
        <motion.div
          className="max-w-xs text-center text-xs leading-6 text-zinc-400"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {children(remaining)}
        </motion.div>
      )}

      {remaining > 0 && (
        <p className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 tabular-nums">
          {formatClock(remaining)}
        </p>
      )}
    </div>
  );
}
