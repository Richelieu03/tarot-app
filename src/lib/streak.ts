// src/lib/streak.ts
// Daily check-in (签到) streak, derived from the user's 每日一牌 readings in DrawLog.
// Days are counted in the browser's local time zone, so midnight matches what the user sees.

export interface StreakInfo {
  /** Consecutive days up to today (or up to yesterday if today isn't done yet — the streak is still alive) */
  current: number;
  /** Distinct days with a daily reading, ever */
  total: number;
  /** Whether today already counts */
  checkedInToday: boolean;
}

export const EMPTY_STREAK: StreakInfo = { current: 0, total: 0, checkedInToday: false };

/** Local calendar day key, e.g. "2026-11-6" */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * @param timestamps created_at values of successful daily readings
 * @param assumeToday count today even if the row isn't visible yet (reading just finished streaming)
 */
export function computeStreak(timestamps: string[], assumeToday = false, now = new Date()): StreakInfo {
  const days = new Set(timestamps.map((ts) => dayKey(new Date(ts))));
  if (assumeToday) days.add(dayKey(now));

  const checkedInToday = days.has(dayKey(now));
  // Walk back day by day; setDate handles month/year boundaries and DST
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!checkedInToday) cursor.setDate(cursor.getDate() - 1);

  let current = 0;
  while (days.has(dayKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { current, total: days.size, checkedInToday };
}
