// src/components/DailyRadar.tsx
"use client";

/** Hexagon radar chart for the six daily scores; the shape grows out from the centre on mount. */

import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "../lib/locale";
import type { TarotProfile } from "../lib/profile";
import { DIMENSIONS, dimensionLabel, type DailyScoreResult } from "../lib/daily-scores";

interface DailyRadarProps {
  result: DailyScoreResult;
  locale: Locale;
  profile?: TarotProfile;
  /** Shown for guests / users without a profile: personal bonuses need zodiac etc. */
  showProfileHint?: boolean;
  className?: string;
}

const SIZE = 300;
const C = SIZE / 2;
const R = 92; // radius of the 10-point ring

/** Point on axis i (0 = top, clockwise) at a 0–10 value */
function pt(i: number, value: number): [number, number] {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / DIMENSIONS.length;
  const r = (value / 10) * R;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}
const toPoints = (vals: number[]) => vals.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");

export default function DailyRadar({ result, locale, profile, showProfileHint, className = "" }: DailyRadarProps) {
  const reduce = useReducedMotion();
  const zh = locale === "zh";
  const values = DIMENSIONS.map((d) => result.scores[d]);
  const zero = DIMENSIONS.map(() => 0);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Placeholder copy — feel free to change */}
      <div className="text-[11px] tracking-[0.3em] text-zinc-500">{zh ? "今日六维" : "TODAY AT A GLANCE"}</div>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mt-2 w-[min(78vw,300px)]" role="img"
        aria-label={DIMENSIONS.map((d) => `${dimensionLabel(d, locale, profile)} ${result.scores[d]}`).join(", ")}>
        <defs>
          <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(251,191,36,0.35)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.35)" />
          </radialGradient>
        </defs>

        {/* Grid rings at 2 / 4 / 6 / 8 / 10 */}
        {[2, 4, 6, 8, 10].map((v) => (
          <polygon key={v} points={toPoints(DIMENSIONS.map(() => v))} fill="none"
            stroke={v === 10 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)"} strokeWidth={1} />
        ))}
        {/* Spokes */}
        {DIMENSIONS.map((_, i) => {
          const [x, y] = pt(i, 10);
          return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />;
        })}

        {/* Score shape */}
        <motion.polygon
          initial={{ points: toPoints(reduce ? values : zero) }}
          animate={{ points: toPoints(values) }}
          transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.15 }}
          fill="url(#radar-fill)" stroke="rgba(253,230,138,0.85)" strokeWidth={1.5} strokeLinejoin="round"
        />
        {values.map((v, i) => {
          const [x, y] = pt(i, v);
          return (
            <motion.circle key={i} cx={x} cy={y} r={3} fill="#fde68a"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 0.6 + i * 0.05 }} />
          );
        })}

        {/* Labels + scores */}
        {DIMENSIONS.map((d, i) => {
          const [x, y] = pt(i, 12.6);
          const focused = result.best.includes(d); // gold = today's best
          return (
            <g key={d}>
              <text x={x} y={y - 2} textAnchor="middle" fontSize={12}
                fill={focused ? "#fcd34d" : "rgba(212,212,216,0.85)"} style={{ letterSpacing: zh ? "0.1em" : 0 }}>
                {dimensionLabel(d, locale, profile)}
              </text>
              <text x={x} y={y + 14} textAnchor="middle" fontSize={13} fontWeight={600}
                fill={focused ? "#fde68a" : "rgba(244,244,245,0.95)"}>
                {result.scores[d]}
              </text>
            </g>
          );
        })}
      </svg>

      {result.notes.length > 0 && (
        <div className="mt-1 space-y-1 text-center text-xs text-violet-300/90">
          {result.notes.map((n) => <p key={n}>{n}</p>)}
        </div>
      )}
      {/* Placeholder copy — feel free to change */}
      {showProfileHint && (
        <p className="mt-1 text-center text-[11px] text-zinc-500">
          {zh ? "填写星座和关注领域，评分会更贴合你" : "Add your sign and focus areas for a more personal chart"}
        </p>
      )}
    </div>
  );
}
