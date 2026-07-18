// src/hooks/useDrawLogger.ts

"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { Locale } from "../lib/locale";

export function useDrawLogger(locale: Locale) {
  const { user } = useAuth(locale, () => {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 🌟 核心：更新入参结构，支持扩展字段
  const saveLog = async (params: {
    cardName: string;
    isReversed: boolean;
    question?: string;
    aiReading: string;
    spreadType?: 'single' | 'three_card'; // 新增：阵型标识
    spreadData?: any;                    // 新增：存放详细数据（JSON）
  }) => {
    if (!user) {
      console.warn("未登录用户，跳过云端存储");
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    for (let attempt = 1; attempt <= 3; attempt++) {
      // 🌟 核心：将新字段写入数据库
      const { error } = await supabase.from("DrawLog").insert([{
        card_name: params.cardName,
        is_reversed: params.isReversed,
        question: params.question || "",
        ai_reading: params.aiReading,
        user_id: user.id,
        spread_type: params.spreadType || 'single', // 存入阵型
        spread_data: params.spreadData || null      // 存入详细 JSON
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