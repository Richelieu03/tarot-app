// src/hooks/useStreak.ts
"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { computeStreak, EMPTY_STREAK, type StreakInfo } from "../lib/streak";

/**
 * Loads the user's daily check-in streak.
 * @param assumeToday treat today as checked in (a daily reading just finished, the DB row may lag behind)
 * @param refreshKey change it to refetch (e.g. when the sidebar opens)
 */
export function useStreak(user: User | null, assumeToday = false, refreshKey: unknown = 0): StreakInfo {
  const [timestamps, setTimestamps] = useState<string[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("DrawLog")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("spread_type", "daily")
      .not("ai_reading", "ilike", "[HIDDEN_ERROR]%")
      .order("created_at", { ascending: false })
      .limit(1000)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Streak query failed:", error.message);
          return;
        }
        setTimestamps((data ?? []).map((r) => r.created_at as string));
      });
    return () => { cancelled = true; };
  }, [user, refreshKey]);

  if (!user || !timestamps) return assumeToday && user ? computeStreak([], true) : EMPTY_STREAK;
  return computeStreak(timestamps, assumeToday);
}
