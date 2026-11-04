// src/components/SingleCardReading.tsx
// One-card reading page, shared by two modes:
//   - "daily":    每日一牌 — no question, today's fortune, 1 per day (home page)
//   - "question": 单牌问答 — a specific question, 3 per day (/single)
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import "../app/tarot-spread.css";
import { pickRandomTarotCard } from "../lib/draw-random";
import type { Locale } from "../lib/locale";
import { LOCALE_STORAGE_KEY, defaultLocale } from "../lib/locale";
import { getCardDisplayName } from "../lib/tarot-labels";
import { formatDailyRecap, isEnergyRecoveryBlock, t } from "../lib/ui-i18n";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth"; 

import AuthWall from "./AuthWall";
import Sidebar from "./Sidebar";
import TarotCard from "./TarotCard"; 
import LocaleSwitcher from "./LocaleSwitcher"; 
import TarotFan from "./TarotFan"; 
import ReadingBox from "./ReadingBox";
import SpreadSelector from "./SpreadSelector";
import { getAvatarColor, getInitial } from "../lib/utils";
import { getCardMeaning } from "../lib/tarot-meanings";
import { makeExcerpt } from "../lib/share-card";
import ShareCardButton from "./ShareCardButton";
import { track } from "../lib/analytics";
import { DAILY_LIMITS, DAILY_LIMIT_MARKER, dailyLimitMessage, isDailyLimitError } from "../lib/daily-limit";

type AppStage = "asking" | "selecting" | "reading";

export type SingleCardMode = "daily" | "question";

export default function SingleCardReading({ mode }: { mode: SingleCardMode }) {
  const isDaily = mode === "daily";
  // DrawLog.spread_type for this mode; also the localStorage key prefix so the two modes never mix
  const spreadType = isDaily ? "daily" : "single";
  const LS = (key: string) => `tarot_${spreadType}_${key}`;
  const LS_USER_QUESTION = LS("user_question");

  const [locale, setLocale] = useState<Locale>(defaultLocale);
  // Daily card skips the question screen and goes straight to the deck
  const [appStage, setAppStage] = useState<AppStage>(isDaily ? "selecting" : "asking");
  const [userQuestion, setUserQuestion] = useState("");
  const [isSelecting, setIsSelecting] = useState(true);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const [flipped, setFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState("愚者");
  const [isReversed, setIsReversed] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  const { user, session, appLoaded, todayCloudLog, handleLogout } = useAuth(locale, setLocale, spreadType);
  // Question mode: successful readings today (server enforces DAILY_LIMITS.single)
  const [usedToday, setUsedToday] = useState(0);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    if (typeof window !== "undefined") localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const handleSetLocale = async (newLocale: Locale) => {
    track("language_switch", { to: newLocale });
    setLocale(newLocale);
    if (user) {
      await supabase.auth.updateUser({ data: { locale: newLocale } });
    }
  };

  const { completion, complete, error, isLoading, setCompletion } = useCompletion({
    api: "/api/tarot",
    streamProtocol: "text",
    onError: async (err) => {
      // Hitting the daily limit is expected, not a crash — don't log it
      if (err.message?.startsWith(DAILY_LIMIT_MARKER)) {
        track("daily_limit_hit", { mode: spreadType });
        return;
      }
      const { data: { user: cu } } = await supabase.auth.getUser();
      if (!cu) return;
      await supabase.from('DrawLog').insert([{
        card_name: localStorage.getItem(LS("last_drawn_card")) || "未知卡牌",
        is_reversed: localStorage.getItem(LS("last_card_reversed")) === "true",
        question: localStorage.getItem(LS_USER_QUESTION) || "",
        ai_reading: `[HIDDEN_ERROR] API Network Crash: ${err.message}`, 
        user_id: cu.id,
        spread_type: spreadType,
        spread_data: null
      }]);
    },
    // DrawLog is now written by /api/tarot itself (the daily limit counts those rows)
    onFinish: (_, result) => {
      if (result.length > 10 && !result.includes("【魔法阵崩溃】") && !result.includes("[Ritual interrupted]")) {
        track("ai_reading", { mode: spreadType, locale });
      }
      if (result.length > 10 && !result.includes("Error") && !result.includes("503")) {
        localStorage.setItem(LS("last_date"), new Date().toDateString());
        localStorage.setItem(LS("last_ai_reading"), result);
        setUsedToday((n) => n + 1);
      }
    },
  });

  // Every API call carries the Supabase access token; the server verifies it and enforces the daily limit
  const completeWithAuth = (prompt: string, options: { body: object }) => {
    // Token comes from useAuth state (kept fresh by onAuthStateChange) — no getSession() round-trip
    const headers: Record<string, string> = session ? { Authorization: `Bearer ${session.access_token}` } : {};
    return complete(prompt, { ...options, headers });
  };

  useEffect(() => {
    if (!user) return; 

    if (todayCloudLog) {
      // 🌟 2. 核心拦截：如果云端最新记录是三牌阵等其他牌阵，绝对不加载到单牌阵页面！
      if (todayCloudLog.spread_type && todayCloudLog.spread_type !== spreadType) {
        return;
      }
      const todayStr = new Date().toDateString(); // current date "Sat Aug 22 2026"
      const logDateStr = new Date(todayCloudLog.created_at).toDateString(); // The date

      if (logDateStr !== todayStr) {
        return; //if the log is not from today, ignore it
      }
      setIsReversed(todayCloudLog.is_reversed);
      setCurrentCard(todayCloudLog.card_name);
      setFlipped(true);
      setIsSelecting(false);
      setAppStage("reading");
      setUserQuestion(todayCloudLog.question || "");
      if (todayCloudLog.ai_reading) {
        // "One per day" recap footer only makes sense for the daily card
        setCompletion(isDaily ? formatDailyRecap(todayCloudLog.ai_reading, locale) : todayCloudLog.ai_reading);
      } else {
        setCompletion(`🔮 能量正在恢复中...`);
      }
    }
  }, [todayCloudLog, locale, setCompletion, user, isDaily, spreadType]);

  // Question mode: count today's readings so we can show "N left today"
  useEffect(() => {
    if (!user || isDaily) return;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    supabase
      .from("DrawLog")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("spread_type", spreadType)
      .not("ai_reading", "ilike", "[HIDDEN_ERROR]%")
      .gte("created_at", startOfToday.toISOString())
      .then(({ count }) => setUsedToday(count ?? 0));
  }, [user, isDaily, spreadType]);

  const remainingToday = Math.max(0, DAILY_LIMITS.single - usedToday);

  // Question mode: start over for another question
  const askAnother = () => {
    setCompletion("");
    setUserQuestion("");
    setFlipped(false);
    setClickedIndex(null);
    setIsSelecting(true);
    localStorage.removeItem(LS("last_drawn_card"));
    localStorage.removeItem(LS("last_card_reversed"));
    localStorage.removeItem(LS_USER_QUESTION);
    setAppStage("asking");
  };

  const enterSpread = () => {
    // 单牌问答 needs an actual question
    if (!isDaily && !userQuestion.trim()) return;
    localStorage.setItem(LS_USER_QUESTION, userQuestion.trim());
    setAppStage("selecting");
  };

  const handleSelectFromFan = (index: number) => {
    if (!isSelecting) return;
    track("draw_card", { mode: spreadType, loggedIn: !!user });
    setClickedIndex(index);
    setIsSelecting(false);
    const { name: pickedCard, reversed: isRev } = pickRandomTarotCard();
    setCurrentCard(pickedCard);
    setIsReversed(isRev);
    
    // 🌟 record the time on cache
    const todayStr = new Date().toDateString(); 
    localStorage.setItem(LS("last_date"), todayStr); 

    localStorage.setItem(LS("last_drawn_card"), pickedCard);
    localStorage.setItem(LS("last_card_reversed"), isRev.toString());
    setCompletion("");
  };

  const handleMainCardClick = () => {
    if (flipped || isSelecting) return;
    track("reveal_card", { mode: spreadType, loggedIn: !!user, locale });

    setFlipped(true);
    
    // 🌟 3. 使用专属缓存键名
    const realCardName = localStorage.getItem(LS("last_drawn_card")) || currentCard;
    const realIsReversed = localStorage.getItem(LS("last_card_reversed")) === "true";

    if (!user) {
      setAppStage("reading");
      return; 
    }

    setAppStage("reading");
    void completeWithAuth(t(locale, "readPrompt"), { 
      body: { 
        cardName: realCardName, 
        isReversed: realIsReversed, 
        locale, 
        mode: spreadType,
        tzOffset: new Date().getTimezoneOffset(),
        question: isDaily ? "" : userQuestion.trim() 
      } 
    });
  };

  useEffect(() => {
    if (appLoaded && !flipped) {
      const cachedDate = localStorage.getItem(LS("last_date"));
      const todayStr = new Date().toDateString();

      if (cachedDate && cachedDate !== todayStr) {
        localStorage.removeItem(LS("last_drawn_card"));
        localStorage.removeItem(LS("last_card_reversed"));
        localStorage.removeItem(LS_USER_QUESTION);
        localStorage.removeItem(LS("last_ai_reading"));
        localStorage.removeItem(LS("last_date"));
        // return if the date is not today, to avoid loading stale data
        return; 
      }
      
      // 🌟 3. 使用专属缓存键名
      const cachedCard = localStorage.getItem(LS("last_drawn_card"));
      const cachedQuestion = localStorage.getItem(LS_USER_QUESTION);

      // Skip if today's reading is already restored from the cloud — calling the API again
      // would burn quota (and now gets rejected by the server-side daily limit)
      if (cachedCard && user && !todayCloudLog) {
        setCurrentCard(cachedCard);
        setIsReversed(localStorage.getItem(LS("last_card_reversed")) === "true");
        setUserQuestion(cachedQuestion || "");
        
        setFlipped(true);
        setAppStage("reading");
        setIsSelecting(false);
        
        void completeWithAuth(t(locale, "readPrompt"), { 
          body: { 
            cardName: cachedCard, 
            isReversed: localStorage.getItem(LS("last_card_reversed")) === "true", 
            locale, 
            mode: spreadType,
            tzOffset: new Date().getTimezoneOffset(),
            question: isDaily ? "" : (cachedQuestion || "").trim() 
          } 
        });
      }
    }
  }, [appLoaded, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const subtitleMain = isSelecting
    ? t(locale, "subtitleSelecting")
    : flipped
      ? t(locale, "subtitleRevealed")
      : t(locale, "subtitleAfterSelect");
  const readingStatusLabel = isLoading
    ? t(locale, "readingLoading")
    : flipped && completion && !isEnergyRecoveryBlock(completion)
      ? t(locale, "readingDone")
      : flipped
        ? t(locale, "readingRevealed")
        : t(locale, "readingWait");

  // Pre-written meaning: free for everyone, no API call
  const cardMeaning = flipped ? getCardMeaning(currentCard, isReversed, locale) : null;
  const meanings = cardMeaning
    ? [{
        label: `${getCardDisplayName(currentCard, locale)} (${isReversed ? t(locale, "reversed") : t(locale, "upright")})`,
        text: cardMeaning,
      }]
    : undefined;

  if (!appLoaded) return <div className="min-h-screen bg-[#05030a]" />;

  return (
    <div className={`relative flex flex-col overflow-x-hidden bg-[#05030a] font-sans text-zinc-50 ${appStage === "reading" ? "min-h-screen overflow-y-auto" : "h-screen overflow-hidden w-full fixed inset-0"}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_25%,rgba(140,70,255,0.25),transparent_60%)]" />
      
      {/* 左上角全局导航：未登录时点击头像直接唤起弹窗 */}
      <div className="fixed left-4 top-4 z-[90] flex items-center gap-2.5">
        <button 
          onClick={() => {
            if (user) {
              setIsSidebarOpen(true);
            } else {
              setShowAuthOverlay(true);
            }
          }} 
          className="flex items-center justify-center rounded-full border border-white/15 bg-black/45 p-0 backdrop-blur-md hover:bg-white/10 transition-colors shadow-lg w-11 h-11 overflow-hidden"
        >
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              className="w-full h-full object-cover" 
              alt="Avatar"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-xs font-bold text-zinc-300 ${getAvatarColor(user?.email || "")}`}>
              {getInitial(user?.email)}
            </div>
          )}
        </button>
        <SpreadSelector currentSpread={isDaily ? "daily" : "single"} locale={locale} />
      </div>

      <LocaleSwitcher currentLocale={locale} onSetLocale={handleSetLocale} />

      <main className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 text-center mx-auto pt-5">
        <AnimatePresence mode="wait">
          {appStage === "asking" ? (
            <motion.div key="ritual-asking" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center gap-10">
              <div className="space-y-3">
                <h1 className="text-3xl font-light tracking-[0.2em] text-zinc-100 sm:text-4xl">{t(locale, "title")}</h1>
                <p className="text-sm leading-relaxed text-zinc-500">{t(locale, "ritualSubtitle")}</p>
              </div>
              <div className="w-full space-y-8">
                <textarea rows={4} value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)} placeholder={t(locale, "questionPlaceholder")} className="w-full resize-none bg-white/[0.04] p-3 text-zinc-100 shadow-[0_1px_0_0_rgba(167,139,250,0.35)] focus:outline-none focus:ring-0" />
                <button type="button" onClick={enterSpread} className="group relative w-full overflow-hidden rounded-full border border-amber-400/25 bg-gradient-to-b from-violet-950/80 to-black py-4 text-amber-100 tracking-[0.35em]">
                  {t(locale, "enterSpread")}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="spread-flow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex w-full flex-col items-center">
              <h1 className="mt-10 max-sm:mt-20 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{t(locale, "title")}</h1>
              <p className="mt-4 text-sm text-zinc-400">{subtitleMain}</p>

              <div className="my-3 flex items-center justify-center ">
                <AnimatePresence mode="wait">
                {!isSelecting && (
                  <div className="mb-6 flex items-center justify-center ">
                    <TarotCard
                      layoutId={clickedIndex !== null ? `fan-card-${clickedIndex}` : "tarot-main-card"}
                      cardName={currentCard}
                      cardLabel={getCardDisplayName(currentCard, locale)}
                      orientationLabel={isReversed ? t(locale, "reversed") : t(locale, "upright")}
                      oracleBadge={t(locale, "oracleBadge")}
                      isReversed={isReversed}
                      isFlipped={flipped}
                      onClick={handleMainCardClick}
                      disabled={flipped}
                    />
                  </div>
                )}
                </AnimatePresence>
              </div>

              <div className="w-full mt-4">
                <TarotFan 
                  isOpen={isSelecting} 
                  isSelecting={isSelecting} 
                  clickedIndex={clickedIndex} 
                  onSelectCard={handleSelectFromFan} 
                />
              </div>

              <div className="w-full relative">
                <ReadingBox 
                  completion={completion}
                  isLoading={isLoading}
                  error={error}
                  isErrorState={(!!error && !isDailyLimitError(error)) || completion.includes("[HIDDEN_ERROR]") || completion.includes("【魔法阵崩溃】") || completion.includes("[Ritual interrupted]") || completion.includes("能量正在恢复中")}
                  placeholderText={
                    isLoading 
                      ? "" 
                      : isSelecting 
                        ? (locale === "zh" ? "请屏气凝神，点击上方大折扇牌堆，抽取属于你的命运卡牌..." : "Please focus and click the deck above to draw your destiny card...")
                        : !flipped 
                          ? (locale === "zh" ? "命运卡牌已就位！请点击上方牌面将其翻转，揭晓最终神谕..." : "Destiny card locked! Click the card above to flip and reveal the oracle...")
                          : "" 
                  }
                  readingStatusLabel={readingStatusLabel}
                  locale={locale}
                  className={appStage === "reading" ? "-mt-10" : "mt-10"}
                  question={isDaily ? undefined : userQuestion.trim() || undefined}
                  meanings={meanings}
                  onEditQuestion={!isDaily && isSelecting ? () => setAppStage("asking") : undefined}
                  notice={error && isDailyLimitError(error) ? dailyLimitMessage(error) : undefined}
                  showAiSection={!!user || !flipped}
                  footer={flipped && !isLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      {!user && (
                        <button
                          onClick={() => { track("login_prompt_click", { mode: spreadType }); setShowAuthOverlay(true); }}
                          className="group rounded-full border border-amber-400/30 bg-gradient-to-b from-amber-500/10 to-amber-950/50 px-8 py-3 text-xs font-bold tracking-[0.15em] text-amber-200 shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)] hover:border-amber-400/60 hover:text-amber-100 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all duration-300 active:scale-95"
                        >
                          🔮 {t(locale, "loginForReading")}
                        </button>
                      )}
                      <ShareCardButton
                        locale={locale}
                        getInput={() => {
                          // Restored readings are wrapped in the "today's recap" frame — share the raw text
                          const reading =
                            todayCloudLog?.ai_reading && completion.includes(t(locale, "dailyRecapTitle"))
                              ? todayCloudLog.ai_reading
                              : completion;
                          const usable = user && reading && !error && !isEnergyRecoveryBlock(reading) && !reading.includes("【魔法阵崩溃】") && !reading.includes("[Ritual interrupted]");
                          return {
                            locale,
                            kind: t(locale, isDaily ? "shareKindDaily" : "shareKindQuestion"),
                            cards: [{
                              name: currentCard,
                              label: getCardDisplayName(currentCard, locale),
                              orientation: isReversed ? t(locale, "reversed") : t(locale, "upright"),
                              reversed: isReversed,
                            }],
                            question: isDaily ? undefined : userQuestion.trim() || undefined,
                            excerpt: usable
                              ? makeExcerpt(reading, locale === "zh" ? 50 : 120)
                              : getCardMeaning(currentCard, isReversed, locale) ?? undefined,
                          };
                        }}
                      />
                      {!isDaily && user && (completion || error) && (
                        remainingToday > 0 ? (
                          <button
                            type="button"
                            onClick={askAnother}
                            className="rounded-full border border-violet-500/40 px-6 py-2.5 text-xs tracking-[0.15em] text-violet-300 transition-colors hover:bg-violet-500/10"
                          >
                            {t(locale, "askAnother")} · {locale === "zh" ? `${t(locale, "remainingToday")} ${remainingToday} 次` : `${remainingToday} ${t(locale, "remainingToday")}`}
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-500">{t(locale, "singleLimitReached")}</span>
                        )
                      )}
                    </div>
                  ) : undefined}
                  onRetry={() => {
                    if (user) {
                      void completeWithAuth(t(locale, "readPrompt"), { 
                        body: { cardName: currentCard, isReversed, locale, mode: spreadType, question: isDaily ? "" : userQuestion.trim(), tzOffset: new Date().getTimezoneOffset() } 
                      });
                    }
                  }}
                />

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 侧边栏联动：绑定 onLoginClick 唤起弹窗 */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
        locale={locale} 
        onLogout={handleLogout} 
        onLoginClick={() => setShowAuthOverlay(true)}
        currentSpread="single"
      />

      {/* 🌟 完美的全局居中悬浮毛玻璃 AuthWall 弹窗 */}
      <AnimatePresence>
        {showAuthOverlay && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.96, y: 8 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.96, y: 8 }} 
              className="relative w-full max-w-md bg-[#0a0612]/95 border border-white/15 rounded-2xl p-8 shadow-2xl text-center"
            >
              {/* 右上角 ✣ 退出键 */}
              <button 
                type="button" 
                onClick={() => setShowAuthOverlay(false)} 
                className="absolute right-5 top-5 text-zinc-500 hover:text-zinc-300 transition-colors z-10"
                title={locale === "zh" ? "关闭" : "Close"}
              >
                <div className="text-2xl">✣</div>
              </button>
              
              <AuthWall 
                locale={locale} 
                setLocale={setLocale} 
                isOpen={showAuthOverlay} 
                onClose={() => setShowAuthOverlay(false)} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}