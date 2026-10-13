// src/hooks/useDrawLogger.ts

"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useDrawLogger(user: User | null) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // core function to save draw log to Supabase
  const saveLog = async (params: {
    cardName: string;
    isReversed: boolean;
    question?: string;
    aiReading: string;
    spreadType?: 'single' | 'trinity'; // card spread type
    spreadData?: any;                    // json data for the spread, if applicable
  }) => {
    if (!user) {
      console.warn("未登录用户，跳过云端存储");
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    for (let attempt = 1; attempt <= 3; attempt++) {
      // Attempt to save the log to Supabase
      const { error } = await supabase.from("DrawLog").insert([{
        card_name: params.cardName,
        is_reversed: params.isReversed,
        question: params.question || "",
        ai_reading: params.aiReading,
        user_id: user.id,
        spread_type: params.spreadType || 'single', // card spread type
        spread_data: params.spreadData || null      // json data for the spread, if applicable
      }]);

      if (!error) {
        setIsSaving(false);
        return true;
      }

      if (attempt === 3) {
        setSaveError(error.message);
      } else {
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }

    setIsSaving(false);
    return false;
  };

  return { saveLog, isSaving, saveError };
}