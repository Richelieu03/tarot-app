// src/hooks/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Locale } from "../lib/locale";

export function useAuth(locale: Locale, setLocale: (l: Locale) => void) {
  const [user, setUser] = useState<User | null>(null);
  const [appLoaded, setAppLoaded] = useState(false);
  const [todayCloudLog, setTodayCloudLog] = useState<any>(null);

  // 云端每日对账函数
  const checkCloudDrawStatus = async (userId: string) => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('DrawLog')
        .select('*')
        .eq('user_id', userId)
        .eq('spread_type', 'single')
        .gte('created_at', startOfToday.toISOString())
        .not('ai_reading', 'ilike', '[HIDDEN_ERROR]%')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("守护结界同步失败:", error);
        return null;
      }
      return data && data.length > 0 ? data[0] : null;
    } catch (e) {
      console.error("星界同步异常:", e);
      return null;
    }
  };

  useEffect(() => {
    // 1. 初始化 Session 获取
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        if (currentUser.user_metadata?.locale) {
          setLocale(currentUser.user_metadata.locale as Locale);
        }
        const log = await checkCloudDrawStatus(currentUser.id);
        if (log) setTodayCloudLog(log);
      }
      setAppLoaded(true); 
    });

    // 2. 监听全局 Auth 状态切换
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        if (currentUser.user_metadata?.locale) {
          setLocale(currentUser.user_metadata.locale as Locale);
        }
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          const log = await checkCloudDrawStatus(currentUser.id);
          if (log) setTodayCloudLog(log);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      // 1. 🌟 加上 await，必须等待 Supabase 官方彻底断开连接
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase 结界断开异常:", err);
    }
    
    // 2. 🌟 核心修复：手动清空当前状态，让主页（Home）的 if(!user) 瞬间收到清空通知，秒切回登录墙！
    setUser(null);
    setTodayCloudLog(null);
    
    // 3. 清空本地缓存
    localStorage.clear();
    
  };

  return { user, appLoaded, todayCloudLog, handleLogout };
}