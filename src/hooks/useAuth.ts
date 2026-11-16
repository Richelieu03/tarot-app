// src/hooks/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { LOCALE_STORAGE_KEY, isLocale, type Locale } from "../lib/locale";

/** `restoreType`: which DrawLog.spread_type to restore as todayCloudLog ("daily" | "single") */
export function useAuth(locale: Locale, setLocale: (l: Locale) => void, restoreType: string = "daily") {
  const [user, setUser] = useState<User | null>(null);
  // Kept in state so API calls can use the token without calling getSession(),
  // which can hang if the auth lock is held (see onAuthStateChange below)
  const [session, setSession] = useState<Session | null>(null);
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
        .eq('spread_type', restoreType)
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

  // The account's stored locale only fills in when this browser has no saved choice of its own.
  // Previously it was applied on every auth event (incl. hourly TOKEN_REFRESHED), so a stale
  // "en" in user_metadata kept flipping the page back to English.
  const applyAccountLocale = (u: User) => {
    const accountLocale = u.user_metadata?.locale;
    if (!isLocale(accountLocale ?? null)) return;
    try {
      if (isLocale(localStorage.getItem(LOCALE_STORAGE_KEY))) return;
      localStorage.setItem(LOCALE_STORAGE_KEY, accountLocale);
    } catch {
      // storage unavailable — still use the account locale for this page
    }
    setLocale(accountLocale);
  };

  useEffect(() => {
    // initial check for existing session and user
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      // A stale session left in localStorage (refresh token revoked or expired) makes
      // supabase-js throw "Invalid Refresh Token" on every load. Clear it locally and continue as a guest.
      if (error) {
        console.warn("Stale Supabase session cleared:", error.message);
        await supabase.auth.signOut({ scope: "local" });
        session = null;
      }
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setSession(session);
      
      if (currentUser) {
        applyAccountLocale(currentUser);
        const log = await checkCloudDrawStatus(currentUser.id);
        if (log) setTodayCloudLog(log);
      }
      setAppLoaded(true); 
    });

    // Auth status change listener
    // NOTE: this callback must stay synchronous. Awaiting another Supabase call inside it
    // deadlocks supabase-js's auth lock, after which getSession() never resolves.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setSession(session);

      if (currentUser) {
        if (event === "SIGNED_IN") applyAccountLocale(currentUser);
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          // Defer the DB query until after the auth callback has returned
          setTimeout(async () => {
            const log = await checkCloudDrawStatus(currentUser.id);
            if (log) setTodayCloudLog(log);
          }, 0);
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
    setSession(null);
    setTodayCloudLog(null);
    
    // clear localStorage to remove any cached data related to the user,
    // but keep the language choice so the site doesn't flip languages after logout
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    localStorage.clear();
    if (savedLocale) localStorage.setItem(LOCALE_STORAGE_KEY, savedLocale);
    
  };

  return { user, session, appLoaded, todayCloudLog, handleLogout };
}