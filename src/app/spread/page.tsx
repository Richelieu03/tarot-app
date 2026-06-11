// src/app/spread/page.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import "../tarot-spread.css"; 
import { pickRandomTarotCard } from "../../lib/draw-random";
import type { Locale } from "../../lib/locale";
import { LOCALE_STORAGE_KEY, defaultLocale } from "../../lib/locale";
import { getCardDisplayName } from "../../lib/tarot-labels";
import { formatDailyRecap, isEnergyRecoveryBlock, t } from "../../lib/ui-i18n";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/useAuth"; 

// 完美复用现有高复用零件库
import AuthWall from "../../components/AuthWall";
import Sidebar from "../../components/Sidebar";
import TarotCard from "../../components/TarotCard"; 
import LocaleSwitcher from "../../components/LocaleSwitcher"; 
import TarotFan from "../../components/TarotFan"; 
import ReadingBox from "../../components/ReadingBox";
import SpreadSelector from "../../components/SpreadSelector"; // 🌟 引入新封装的高复用下拉组件

type AppStage = "asking" | "selecting" | "reading";

interface CardSlot {
  id: string;
  labelKey: string; 
  cardName: string | null;
  isReversed: boolean;
  isFlipped: boolean;
}

const INITIAL_SLOTS: CardSlot[] = [
  { id: "past", labelKey: "slotPast", cardName: null, isReversed: false, isFlipped: false },
  { id: "present", labelKey: "slotPresent", cardName: null, isReversed: false, isFlipped: false },
  { id: "future", labelKey: "slotFuture", cardName: null, isReversed: false, isFlipped: false },
];

export default function ThreeCardSpread() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [appStage, setAppStage] = useState<AppStage>("asking");
  const [userQuestion, setUserQuestion] = useState("");
  const [isSelecting, setIsSelecting] = useState(true);
  
  const [slots, setSlots] = useState<CardSlot[]>(INITIAL_SLOTS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, appLoaded, handleLogout } = useAuth(locale, setLocale);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    if (typeof window !== "undefined") localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const handleSetLocale = async (newLocale: Locale) => {
    setLocale(newLocale);
    if (user) await supabase.auth.updateUser({ data: { locale: newLocale } });
  };

  const activeSlotIndex = slots.findIndex(s => s.cardName === null);
  const isAllDrawn = activeSlotIndex === -1;

  const { completion, complete, error, isLoading } = useCompletion({
    api: "/api/tarot",
    streamProtocol: "text",
  });

  const enterSpread = () => {
    if (!userQuestion.trim()) return;
    setAppStage("selecting");
  };

  const handleSelectFromFan = (index: number) => {
    if (isAllDrawn || appStage === "reading") return;

    const { name: pickedCard, reversed: isRev } = pickRandomTarotCard();
    const updatedSlots = [...slots];
    
    updatedSlots[activeSlotIndex] = {
      ...updatedSlots[activeSlotIndex],
      cardName: pickedCard,
      isReversed: isRev,
    };
    setSlots(updatedSlots);

    localStorage.setItem("tarot_three_card_last_drawn", updatedSlots.map(s => `${s.id}:${s.cardName}:${s.isReversed}`).join("|"));

    if (activeSlotIndex === slots.length - 1) {
      setIsSelecting(false);
      setAppStage("reading");
    }
  };

  const triggerSpreadAIReading = (finalSlots: CardSlot[]) => {
    const spreadData = finalSlots.map(s => ({
      slotId: s.id,
      slotLabel: t(locale, s.labelKey as any), 
      cardName: s.cardName,
      isReversed: s.isReversed
    }));

    const promptText = t(locale, "readSpreadPrompt" as any);

    void complete(promptText, { 
      body: { 
        isSpread: true, 
        spreadData, 
        locale, 
        question: userQuestion.trim() 
      } 
    });
  };

  const subtitleMain = isSelecting
    ? `${t(locale, "subtitleSelecting" as any)} (${slots.filter(s => s.cardName).length} / 3)`
    : t(locale, "subtitleAfterSelect" as any);

  const readingStatusLabel = isLoading
    ? t(locale, "readingLoading" as any)
    : slots.every(s => s.isFlipped) && completion && !isEnergyRecoveryBlock(completion)
      ? t(locale, "readingDone" as any)
      : t(locale, "readingWait" as any);

  if (!appLoaded) return <div className="min-h-screen bg-[#05030a]" />;
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#05030a] text-zinc-50 flex items-center justify-center overflow-y-auto">
        <AuthWall locale={locale} setLocale={setLocale} />
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col overflow-x-hidden bg-[#05030a] font-sans text-zinc-50 ${appStage === "reading" ? "min-h-screen overflow-y-auto" : "h-screen overflow-hidden w-full fixed inset-0"}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_25%,rgba(140,70,255,0.18),transparent_60%)]" />

      {/* 左上角全局控制枢纽 */}
      <div className="fixed left-4 top-4 z-[90] flex items-center gap-2.5">
        {/* 头像控制闸 */}
        <button onClick={() => setIsSidebarOpen(true)} className="flex items-center justify-center rounded-full border border-white/15 bg-black/45 p-1.5 backdrop-blur-md hover:bg-white/10 transition-colors shadow-lg w-11 h-11">
          {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full border border-white/20 object-cover" /> : <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">U</div>}
        </button>

        {/* 🌟 优雅复用：一行代码直接空降组件，传入 "three" 告知当前身在圣三角 */}
        <SpreadSelector currentSpread="three" locale={locale} />
      </div>

      <LocaleSwitcher currentLocale={locale} onSetLocale={handleSetLocale} />

      {/* 主画布 */}
      <main className="relative z-10 flex w-full max-w-5xl flex-col items-center px-4 text-center mx-auto pt-6">
        <AnimatePresence mode="wait">
          {appStage === "asking" ? (
            <motion.div key="three-asking" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center gap-10">
              <div className="space-y-3">
                <h1 className="text-3xl font-light tracking-[0.2em] text-zinc-100 sm:text-4xl">圣三角神谕</h1>
                <p className="text-sm leading-relaxed text-zinc-500">探寻【过去、现在、未来】的时空纠缠</p>
              </div>
              <div className="w-full space-y-8">
                <textarea rows={4} value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)} placeholder="请输入你心中渴望洞察的困惑或宿命（如：我的感情未来发展趋势）..." className="w-full resize-none bg-white/[0.04] p-3 text-zinc-100 shadow-[0_1px_0_0_rgba(167,139,250,0.35)] focus:outline-none focus:ring-0" />
                <button type="button" onClick={enterSpread} className="group relative w-full overflow-hidden rounded-full border border-amber-400/25 bg-gradient-to-b from-violet-950/80 to-black py-4 text-amber-100 tracking-[0.35em]">
                  开启三牌阵阵法
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="three-flow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex w-full flex-col items-center">
              {/* 1. 顶部文本栏 */}
              <h1 className="mt-12 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">圣三角时空星盘</h1>
              <p className="mt-3 text-sm text-zinc-400">{subtitleMain}</p>

              {/* 2. 全景三牌阵并行槽位展示区 */}
              {(slots.some(s => s.cardName !== null) || !isSelecting) && (
                <div className="my-8 flex flex-wrap items-start justify-center gap-6 sm:gap-10 w-full px-2">
                  {slots.map((slot, idx) => {
                    if (!slot.cardName) return null;
                    return (
                      <motion.div key={slot.id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3">
                        <span className={`text-xs font-semibold tracking-widest px-3 py-1 rounded-full border ${slot.isFlipped ? "border-violet-500/30 text-violet-400 bg-violet-950/20" : "border-zinc-700 text-zinc-400 bg-zinc-900/45"}`}>
                          {t(locale, slot.labelKey as any)}
                        </span>
                        
                        <TarotCard
                          layoutId={`three-card-${slot.id}`}
                          cardName={slot.cardName}
                          cardLabel={getCardDisplayName(slot.cardName, locale)}
                          orientationLabel={slot.isReversed ? t(locale, "reversed" as any) : t(locale, "upright" as any)}
                          oracleBadge={t(locale, "oracleBadge" as any)}
                          isReversed={slot.isReversed}
                          isFlipped={slot.isFlipped}
                          onClick={() => {
                            if (slot.isFlipped || isSelecting) return;
                            const updated = [...slots];
                            updated[idx].isFlipped = true;
                            setSlots(updated);

                            if (updated.every(s => s.isFlipped)) {
                              triggerSpreadAIReading(updated);
                            }
                          }}
                          disabled={slot.isFlipped}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* 3. 56张大折扇牌堆 */}
              <div className="w-full mt-4">
                <TarotFan isOpen={isSelecting} isSelecting={isSelecting} clickedIndex={null} onSelectCard={handleSelectFromFan} />
              </div>

              {/* 4. 专属综合命运演译文字框 */}
              <ReadingBox 
                completion={completion}
                isLoading={isLoading}
                error={error}
                isErrorState={!!error}
                placeholderText={isSelecting ? "请在上方牌阵中依次挑满三张宿命卡牌..." : !slots.every(s => s.isFlipped) ? "请在上方依次点击翻开这三张揭晓的卡牌，以汇聚综合神谕..." : "🔮 星界星盘交织完毕，时空神谕正在降临..." }
                readingStatusLabel={readingStatusLabel}
                locale={locale}
                className={appStage === "reading" ? "-mt-4 mb-10 w-full max-w-3xl" : "mt-6 w-full max-w-3xl"} 
                onRetry={() => triggerSpreadAIReading(slots)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} locale={locale} onLogout={handleLogout} onOpenHistory={() => {}} />
    </div>
  );
}