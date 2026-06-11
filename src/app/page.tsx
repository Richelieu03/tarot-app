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
import { useAuth } from "../lib/useAuth"; 

// 引入通用零件库
import AuthWall from "../components/AuthWall";
import HistoryModal from "../components/HistoryModal";
import Sidebar from "../components/Sidebar";
import TarotCard from "../components/TarotCard"; 
import LocaleSwitcher from "../components/LocaleSwitcher"; 
import TarotFan from "../components/TarotFan"; 
import ReadingBox from "../components/ReadingBox";
import SpreadSelector from "../components/SpreadSelector";

type AppStage = "asking" | "selecting" | "reading";
const LS_USER_QUESTION = "tarot_user_question";

export default function Home() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [appStage, setAppStage] = useState<AppStage>("asking");
  const [userQuestion, setUserQuestion] = useState("");
  const [isSelecting, setIsSelecting] = useState(true);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const [flipped, setFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState("愚者");
  const [isReversed, setIsReversed] = useState(false);

  // 侧边栏与历史记录状态
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 1. 挂载 Auth 核心 Hook
  const { user, appLoaded, todayCloudLog, handleLogout } = useAuth(locale, setLocale);

  // 全局多语言同步
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

  // 获取历史记录
  const fetchHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const { data } = await supabase
        .from('DrawLog')
        .select('*')
        .eq('user_id', user.id)
        .not('ai_reading', 'ilike', '[HIDDEN_ERROR]%')
        .order('created_at', { ascending: false }); 
      if (data) setHistoryLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false); 
    }
  };

  // 2. AI useCompletion 钩子
  const { completion, complete, error, isLoading, setCompletion } = useCompletion({
    api: "/api/tarot",
    streamProtocol: "text",
    onError: async (err) => {
      const { data: { user: cu } } = await supabase.auth.getUser();
      if (!cu) return;
      await supabase.from('DrawLog').insert([{
        card_name: localStorage.getItem("tarot_last_drawn_card") || "未知卡牌",
        is_reversed: localStorage.getItem("tarot_last_card_reversed") === "true",
        question: localStorage.getItem(LS_USER_QUESTION) || "",
        ai_reading: `[HIDDEN_ERROR] API Network Crash: ${err.message}`, 
        user_id: cu.id 
      }]);
    },
    onFinish: async (_, result) => {
      const { data: { user: cu } } = await supabase.auth.getUser();
      if (result.length > 10 && cu && !result.includes("Error") && !result.includes("503")) {
        localStorage.setItem("tarot_last_ai_reading", result);
        await supabase.from('DrawLog').insert([{
          card_name: localStorage.getItem("tarot_last_drawn_card") || "未知卡牌",
          is_reversed: localStorage.getItem("tarot_last_card_reversed") === "true",
          question: localStorage.getItem("tarot_user_question") || "",
          ai_reading: result,
          user_id: cu.id 
        }]);
      }
    },
  });

  // 3. 处理今日已对账完成的同步
  useEffect(() => {
    if (todayCloudLog) {
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
  }, [todayCloudLog, locale, setCompletion]);

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
    localStorage.setItem("tarot_last_drawn_card", pickedCard);
    localStorage.setItem("tarot_last_card_reversed", isRev.toString());
    setCompletion("");
  };

  const handleMainCardClick = () => {
    if (flipped || isSelecting) return;
    setAppStage("reading");
    setFlipped(true);

    const realCardName = localStorage.getItem("tarot_last_drawn_card") || currentCard;
    const realIsReversed = localStorage.getItem("tarot_last_card_reversed") === "true";

    void complete(t(locale, "readPrompt"), { 
      body: { 
        cardName: realCardName, 
        isReversed: realIsReversed, 
        locale, 
        question: userQuestion.trim() 
      } 
    });
  };

  const subtitleMain = isSelecting ? t(locale, "subtitleSelecting") : t(locale, "subtitleAfterSelect");
  const readingStatusLabel = isLoading
    ? t(locale, "readingLoading")
    : flipped && completion && !isEnergyRecoveryBlock(completion)
      ? t(locale, "readingDone")
      : t(locale, "readingWait");

  // 拦截层 (干净、无重复)
  if (!appLoaded) return <div className="min-h-screen bg-[#05030a]" />;
  if (!user) return <AuthWall locale={locale} setLocale={setLocale} />;

  return (
    <div className={`relative flex flex-col overflow-x-hidden bg-[#05030a] font-sans text-zinc-50 ${user && appStage === "reading" ? "min-h-screen overflow-y-auto" : "h-screen overflow-hidden w-full fixed inset-0"}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_25%,rgba(140,70,255,0.25),transparent_60%)]" />
      
      {/* 🌟 完美的左上角全局控制枢纽：并排放置头像与高复用下拉框 */}
      <div className="fixed left-4 top-4 z-[90] flex items-center gap-2.5">
        {/* 头像控制闸 */}
        <button onClick={() => setIsSidebarOpen(true)} className="flex items-center justify-center rounded-full border border-white/15 bg-black/45 p-1.5 backdrop-blur-md hover:bg-white/10 transition-colors shadow-lg w-11 h-11">
          {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full border border-white/20 object-cover" /> : <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">U</div>}
        </button>

        {/* 智能数据驱动选择盘 */}
        <SpreadSelector currentSpread="single" locale={locale} />
      </div>

      <LocaleSwitcher currentLocale={locale} onSetLocale={handleSetLocale} />

      {/* 主画布内容区 */}
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
              {/* 1. 主题文字 */}
              <h1 className="mt-10 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{t(locale, "title")}</h1>
              <p className="mt-4 text-sm text-zinc-400">{subtitleMain}</p>

              {/* 2. 3D塔罗卡牌 */}
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

              {/* 3. 散开的牌堆 */}
              <div className="w-full mt-4">
                <TarotFan 
                  isOpen={isSelecting} 
                  isSelecting={isSelecting} 
                  clickedIndex={clickedIndex} 
                  onSelectCard={handleSelectFromFan} 
                />
              </div>

              {/* 4. 抽离后的高复用解牌展示框组件 */}
              <ReadingBox 
                completion={completion}
                isLoading={isLoading}
                error={error}
                isErrorState={!!error || completion.includes("[HIDDEN_ERROR]") || completion.includes("【魔法阵崩溃】") || completion.includes("[Ritual interrupted]") || completion.includes("能量正在恢复中")}
                placeholderText={isSelecting ? t(locale, "placeholderSelecting") : !flipped ? t(locale, "placeholderAfterPick") : t(locale, "placeholderThinking")}
                readingStatusLabel={readingStatusLabel}
                locale={locale}
                className={appStage === "reading" ? "-mt-10" : "mt-10"}
                onRetry={() => void complete(t(locale, "readPrompt"), { 
                  body: { cardName: currentCard, isReversed, locale, question: userQuestion.trim() } 
                })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 侧边栏与模态框零件（在外部闭合布局里各司其职） */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
        locale={locale} 
        onLogout={handleLogout} 
      />
      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} isLoading={isLoadingHistory} logs={historyLogs} locale={locale} />
    </div>
  );
}