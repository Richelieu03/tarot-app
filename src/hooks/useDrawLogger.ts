// src/hooks/useDrawLogger.ts
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { Locale } from "../lib/locale";

/**
 * 🌟 采用组件化/Hook架构封装的数据持久化逻辑
 */
export function useDrawLogger(locale: Locale) {
  const { user } = useAuth(locale, () => {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveLog = async (params: {
    cardName: string;
    isReversed: boolean;
    question?: string;
    aiReading: string;
  }) => {
    if (!user) {
      console.warn("未登录用户，跳过云端存储");
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    // 带重试的写入逻辑直接内聚在组件生命周期里
    for (let attempt = 1; attempt <= 3; attempt++) {
      const { error } = await supabase.from("DrawLog").insert([{
        card_name: params.cardName,
        is_reversed: params.isReversed,
        question: params.question || "",
        ai_reading: params.aiReading,
        user_id: user.id
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