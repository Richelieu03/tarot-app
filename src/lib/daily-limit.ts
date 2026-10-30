// Shared between the API route (enforcement) and the pages (UI).

/**
 * Successful AI readings allowed per user per local day, by DrawLog.spread_type:
 *   daily = 每日一牌, single = 单牌问答, trinity = 圣三角
 */
export const DAILY_LIMITS = { daily: 1, single: 3, trinity: 3 } as const;
export type SpreadType = keyof typeof DAILY_LIMITS;

/** Minimum gap between two three-card readings (tarot tradition: don't re-ask the cards in quick succession) */
export const SPREAD_COOLDOWN_MS = 2 * 60 * 60 * 1000;

/**
 * Deliberately vague, old-fashioned wait time instead of a precise countdown.
 * 一个时辰 = 2h, 半个时辰 = 1h, 一炷香 ≈ 30min, 片刻 = a few minutes.
 */
export function formatWait(ms: number, locale: "en" | "zh"): string {
  const min = Math.max(1, Math.ceil(ms / 60_000));
  if (locale === "zh") {
    if (min > 90) return "一个时辰";
    if (min > 45) return "半个时辰";
    if (min > 15) return "一炷香的工夫";
    return "片刻";
  }
  if (min > 90) return "a couple of hours";
  if (min > 45) return "about an hour";
  if (min > 15) return "a little while";
  return "a moment";
}

/** Cooldown message shown when a three-card reading is requested too soon */
export function cooldownMessage(ms: number, locale: "en" | "zh"): string {
  return locale === "zh"
    ? `上一则神谕的余音尚未散去，请静候${formatWait(ms, "zh")}，再来叩问。`
    : `The last oracle still echoes. Wait ${formatWait(ms, "en")} before asking again.`;
}

/** Prefix on the API's 429 body so the client can tell "limit reached" apart from real errors */
export const DAILY_LIMIT_MARKER = "[DAILY_LIMIT]";

export function isDailyLimitError(err?: Error | null): boolean {
  return !!err?.message?.startsWith(DAILY_LIMIT_MARKER);
}

/** The human-readable part of a daily-limit error */
export function dailyLimitMessage(err: Error): string {
  return err.message.slice(DAILY_LIMIT_MARKER.length).trim();
}
