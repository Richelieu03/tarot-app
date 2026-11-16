// src/hooks/useEncounterNumber.ts
"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface EncounterRow {
  card_name: string | null;
  spread_type: string | null;
  spread_data: unknown;
  created_at: string;
}

/** zh card names held by one DrawLog row: every Trinity slot, otherwise the single card */
function cardsInRow(row: EncounterRow): string[] {
  if (Array.isArray(row.spread_data)) {
    const names = row.spread_data
      .map((s) => (s && typeof s === "object" ? (s as { name?: unknown }).name : undefined))
      .filter((n): n is string => typeof n === "string");
    if (names.length) return names;
  }
  return row.card_name ? [row.card_name] : [];
}

function isLocalToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

/**
 * Which encounter with `cardName` the current draw is (1 = first time), from the user's DrawLog.
 * DrawLog only holds draws that got an AI reading, so the current draw is added as +1 until
 * its own row shows up (a row from today, of the same spread type, holding this card).
 * Refetches whenever `cardName` changes (e.g. each time the card view opens).
 * Returns null for guests, while loading, or if the query fails.
 */
export function useEncounterNumber(user: User | null, cardName: string | null, spreadType: string): number | null {
  const [rows, setRows] = useState<EncounterRow[] | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (!userId || !cardName) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("DrawLog")
          .select("card_name, spread_type, spread_data, created_at")
          .eq("user_id", userId)
          .not("ai_reading", "ilike", "[HIDDEN_ERROR]%");
        if (cancelled) return;
        if (error) {
          console.warn("encounter count failed:", error.message);
          setRows(null);
          return;
        }
        setRows((data as EncounterRow[]) ?? []);
      } catch (err) {
        if (!cancelled) {
          console.warn("encounter count failed:", err);
          setRows(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [userId, cardName]);

  if (!userId || !cardName || !rows) return null;

  let count = 0;
  let currentLogged = false;
  for (const row of rows) {
    const hits = cardsInRow(row).filter((c) => c === cardName).length;
    if (!hits) continue;
    count += hits;
    if (row.spread_type === spreadType && isLocalToday(row.created_at)) currentLogged = true;
  }
  return count + (currentLogged ? 0 : 1);
}

/** Footer line for the card view, e.g. 「第 3 次遇见它」 */
export function encounterLabel(n: number, zh: boolean): string {
  if (zh) return `第 ${n} 次遇见它`;
  // Placeholder English copy — feel free to change
  const v = n % 100;
  const suffix = v >= 11 && v <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `Your ${n}${suffix} encounter with this card`;
}
