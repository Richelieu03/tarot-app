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

  // everyday check for existing DrawLog for the user
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
    // initial check for existing session and user
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

    // Auth status change listener
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
      // 1. await，wait until Supabase session is cleared, to avoid race conditions
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase 结界断开异常:", err);
    }
    
    setUser(null);
    setTodayCloudLog(null);
    
    // clear localStorage to remove any cached data related to the user
    localStorage.clear();
    
  };

  return { user, appLoaded, todayCloudLog, handleLogout };
}