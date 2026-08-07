// src/app/page.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import "./tarot-spread.css";
import { pickRandomTarotCard } from "../lib/draw-random";
import type { Locale } from "../lib/locale";
import { LOCALE_STORAGE_KEY, defaultLocale } from "../lib/locale";
import { getCardDisplayName } from "../lib/tarot-labels";
import { formatDailyRecap, isEnergyRecoveryBlock, t } from "../lib/ui-i18n";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth"; 

import AuthWall from "../components/AuthWall";
import Sidebar from "../components/Sidebar";
import TarotCard from "../components/TarotCard"; 
import LocaleSwitcher from "../components/LocaleSwitcher"; 
import TarotFan from "../components/TarotFan"; 
import ReadingBox from "../components/ReadingBox";
import SpreadSelector from "../components/SpreadSelector";
import { getAvatarColor } from "../lib/utils";

type AppStage = "asking" | "selecting" | "reading";

// 🌟 1. 缓存键名加上 _single_ 前缀，彻底与多牌阵隔离
const LS_USER_QUESTION = "tarot_single_user_question";

export default function Home() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [appStage, setAppStage] = useState<AppStage>("asking");
  const [userQuestion, setUserQuestion] = useState("");
  const [isSelecting, setIsSelecting] = useState(true);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const [flipped, setFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState("愚者");
  const [isReversed, setIsReversed] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  const { user, appLoaded, todayCloudLog, handleLogout } = useAuth(locale, setLocale);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    if (typeof window !== "undefined") localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const handleSetLocale = async (newLocale: Locale) => {
    setLocale(newLocale);
    if (user) {
      await supabase.auth.updateUser({ data: { locale: newLocale } });
    }
  };

  const { completion, complete, error, isLoading, setCompletion } = useCompletion({
    api: "/api/tarot",
    streamProtocol: "text",
    onError: async (err) => {
      const { data: { user: cu } } = await supabase.auth.getUser();
      if (!cu) return;
      await supabase.from('DrawLog').insert([{
        card_name: localStorage.getItem("tarot_single_last_drawn_card") || "未知卡牌",
        is_reversed: localStorage.getItem("tarot_single_last_card_reversed") === "true",
        question: localStorage.getItem(LS_USER_QUESTION) || "",
        ai_reading: `[HIDDEN_ERROR] API Network Crash: ${err.message}`, 
        user_id: cu.id,
        spread_type: "single", // 🌟 明确写入单牌阵类型
        spread_data: null
      }]);
    },
    onFinish: async (_, result) => {
      const { data: { user: cu } } = await supabase.auth.getUser();
      if (result.length > 10 && cu && !result.includes("Error") && !result.includes("503")) {
        localStorage.setItem("tarot_single_last_ai_reading", result);
        await supabase.from('DrawLog').insert([{
          card_name: localStorage.getItem("tarot_single_last_drawn_card") || "未知卡牌",
          is_reversed: localStorage.getItem("tarot_single_last_card_reversed") === "true",
          question: localStorage.getItem(LS_USER_QUESTION) || "",
          ai_reading: result,
          user_id: cu.id,
          spread_type: "single", // 🌟 明确写入单牌阵类型
          spread_data: null
        }]);
      }
    },
  });

  useEffect(() => {
    if (!user) return; 

    if (todayCloudLog) {
      // 🌟 2. 核心拦截：如果云端最新记录是三牌阵等其他牌阵，绝对不加载到单牌阵页面！
      if (todayCloudLog.spread_type && todayCloudLog.spread_type !== "single") {
        return;
      }

      setIsReversed(todayCloudLog.is_reversed);
      setCurrentCard(todayCloudLog.card_name);
      setFlipped(true);
      setIsSelecting(false);
      setAppStage("reading");
      setUserQuestion(todayCloudLog.question || "");
      if (todayCloudLog.ai_reading) {
        setCompletion(formatDailyRecap(todayCloudLog.ai_reading, locale));
      } else {
        setCompletion(`🔮 能量正在恢复中...`);
      }
    }
  }, [todayCloudLog, locale, setCompletion, user]);

  const enterSpread = () => {
    localStorage.setItem(LS_USER_QUESTION, userQuestion.trim());
    setAppStage("selecting");
  };

  const handleSelectFromFan = (index: number) => {
    if (!isSelecting) return;
    setClickedIndex(index);
    setIsSelecting(false);
    const { name: pickedCard, reversed: isRev } = pickRandomTarotCard();
    setCurrentCard(pickedCard);
    setIsReversed(isRev);
    
    // 🌟 3. 使用专属缓存键名
    localStorage.setItem("tarot_single_last_drawn_card", pickedCard);
    localStorage.setItem("tarot_single_last_card_reversed", isRev.toString());
    setCompletion("");
  };

  const handleMainCardClick = () => {
    if (flipped || isSelecting) return;

    setFlipped(true);
    
    // 🌟 3. 使用专属缓存键名
    const realCardName = localStorage.getItem("tarot_single_last_drawn_card") || currentCard;
    const realIsReversed = localStorage.getItem("tarot_single_last_card_reversed") === "true";

    if (!user) {
      setAppStage("reading");
      return; 
    }

    setAppStage("reading");
    void complete(t(locale, "readPrompt"), { 
      body: { 
        cardName: realCardName, 
        isReversed: realIsReversed, 
        locale, 
        question: userQuestion.trim() 
      } 
    });
  };

  useEffect(() => {
    if (appLoaded && !flipped) {
      // 🌟 3. 使用专属缓存键名
      const cachedCard = localStorage.getItem("tarot_single_last_drawn_card");
      const cachedQuestion = localStorage.getItem(LS_USER_QUESTION);

      if (cachedCard && user) {
        setCurrentCard(cachedCard);
        setIsReversed(localStorage.getItem("tarot_single_last_card_reversed") === "true");
        setUserQuestion(cachedQuestion || "");
        
        setFlipped(true);
        setAppStage("reading");
        setIsSelecting(false);
        
        void complete(t(locale, "readPrompt"), { 
          body: { 
            cardName: cachedCard, 
            isReversed: localStorage.getItem("tarot_single_last_card_reversed") === "true", 
            locale, 
            question: (cachedQuestion || "").trim() 
          } 
        });
      }
    }
  }, [appLoaded, user]);

  const subtitleMain = isSelecting ? t(locale, "subtitleSelecting") : t(locale, "subtitleAfterSelect");
  const readingStatusLabel = isLoading
    ? t(locale, "readingLoading")
    : flipped && completion && !isEnergyRecoveryBlock(completion)
      ? t(locale, "readingDone")
      : t(locale, "readingWait");

  if (!appLoaded) return <div className="min-h-screen bg-[#05030a]" />;

  return (
    <div className={`relative flex flex-col overflow-x-hidden bg-[#05030a] font-sans text-zinc-50 ${user && appStage === "reading" ? "min-h-screen overflow-y-auto" : "h-screen overflow-hidden w-full fixed inset-0"}`}>
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
              {(user?.email || "🔮").charAt(0).toUpperCase()}
            </div>
          )}
        </button>
        <SpreadSelector currentSpread="single" locale={locale} />
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
              <h1 className="mt-10 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{t(locale, "title")}</h1>
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
                  isErrorState={!!error || completion.includes("[HIDDEN_ERROR]") || completion.includes("【魔法阵崩溃】") || completion.includes("[Ritual interrupted]") || completion.includes("能量正在恢复中")}
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
                  onRetry={() => {
                    if (user) {
                      void complete(t(locale, "readPrompt"), { 
                        body: { cardName: currentCard, isReversed, locale, question: userQuestion.trim() } 
                      });
                    }
                  }}
                />

                {/* 未登录且翻牌后显示快速登录引导按钮 */}
                {!user && flipped && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-6 z-20 flex flex-col items-center w-full max-w-sm px-4"
                  >
                    <button
                      onClick={() => setShowAuthOverlay(true)}
                      className="group rounded-full border border-amber-400/30 bg-gradient-to-b from-amber-500/10 to-amber-950/50 px-8 py-3 text-xs font-bold tracking-[0.15em] text-amber-200 shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)] hover:border-amber-400/60 hover:text-amber-100 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all duration-300 active:scale-95"
                    >
                      🔮 {locale === "zh" ? "快速登录解牌" : "QUICK LOGIN"}
                    </button>
                  </motion.div>
                )}
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