// src/app/spread/page.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
import { useEffect, useState, useRef } from "react";
import "../tarot-spread.css"; 
import { pickRandomTarotCard } from "../../lib/draw-random";
import type { Locale } from "../../lib/locale";
import { LOCALE_STORAGE_KEY, getInitialLocale } from "../../lib/locale";
import { getCardDisplayName } from "../../lib/tarot-labels";
import { isEnergyRecoveryBlock, t } from "../../lib/ui-i18n";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth"; 
import { getAvatarColor, getInitial } from "../../lib/utils";
import { CARD_BY_ZH, getCardMeaning } from "../../lib/tarot-meanings";
import { DAILY_LIMITS, DAILY_LIMIT_MARKER, SPREAD_COOLDOWN_MS, cooldownMessage, dailyLimitMessage, isDailyLimitError } from "../../lib/daily-limit";
import { useDrawLogger } from "../../hooks/useDrawLogger"; 

import AuthWall from "../../components/AuthWall";
import Sidebar from "../../components/Sidebar";
import TarotCard from "../../components/TarotCard"; 
import LocaleSwitcher from "../../components/LocaleSwitcher"; 
import TarotFan from "../../components/TarotFan"; 
import ReadingBox from "../../components/ReadingBox";
import SpreadSelector from "../../components/SpreadSelector"; 
import CooldownRing from "../../components/CooldownRing";
import { track } from "../../lib/analytics";
import ShareCardButton from "../../components/ShareCardButton";
import { detectTextLocale, makeExcerpt } from "../../lib/share-card";
import type { ReactNode } from "react";

type AppStage = "asking" | "selecting" | "reading";

interface CardSlot {
  id: string;
  labelKey: string; 
  cardName: string | null;
  isReversed: boolean;
  isFlipped: boolean;
}

const INITIAL_SLOTS: CardSlot[] = [
  { id: "past", labelKey: "slot1", cardName: null, isReversed: false, isFlipped: false },
  { id: "present", labelKey: "slot2", cardName: null, isReversed: false, isFlipped: false },
  { id: "future", labelKey: "slot3", cardName: null, isReversed: false, isFlipped: false },
];

export default function ThreeCardSpread() {
  // Saved choice, else browser language
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

    useEffect(() => {
      document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      }
  }, [locale]);
  const [appStage, setAppStage] = useState<AppStage>("asking");
  const [userQuestion, setUserQuestion] = useState("");
  const [isSelecting, setIsSelecting] = useState(true);
  
  const [slots, setSlots] = useState<CardSlot[]>(INITIAL_SLOTS);
  // Successful three-card readings today (server enforces DAILY_LIMITS.trinity)
  const [usedToday, setUsedToday] = useState(0);
  const restoredRef = useRef(false);
  // Guests can draw too; their cards get an AI reading once they log in
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const guestPendingRef = useRef(false); // cards drawn as a guest (or carried back via ?resume=) still need a reading
  // Time of the latest successful three-card reading (for the 2-hour cooldown)
  const [lastSpreadAt, setLastSpreadAt] = useState<number | null>(null);
  // Re-render once a minute so the cooldown countdown stays current
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, session, appLoaded, handleLogout } = useAuth(locale, setLocale);
  const { saveLog } = useDrawLogger(user);

  const slotsRef = useRef(slots);
  const questionRef = useRef(userQuestion);
  useEffect(() => {
    slotsRef.current = slots;
    questionRef.current = userQuestion;
  }, [slots, userQuestion]);

  const activeSlotIndex = slots.findIndex(s => s.cardName === null);
  const isAllDrawn = activeSlotIndex === -1;

  const { completion, complete, error, isLoading, setCompletion } = useCompletion({
    api: "/api/tarot",
    streamProtocol: "text",
    onError: async (err) => {
      // Hitting the daily limit is expected, not a crash — don't log it
      if (err.message?.startsWith(DAILY_LIMIT_MARKER)) {
        track("daily_limit_hit", { mode: "trinity" });
        return;
      }
      await saveLog({
        spreadType: "trinity",
        cardName: slotsRef.current[0]?.cardName || "愚者",
        isReversed: slotsRef.current[0]?.isReversed || false,
        question: `【圣三角阵报错】${questionRef.current}`,
        aiReading: `[HIDDEN_ERROR] API Network Crash: ${err.message}`, 
      });
    },
    // Successful readings are saved by /api/tarot (spread_type "trinity" + spread_data),
    // which is also what the server-side daily limit counts.
    onFinish: (_, result) => {
      if (result.length > 10 && !result.includes("【魔法阵崩溃】") && !result.includes("[Ritual interrupted]")) {
        track("ai_reading", { mode: "trinity", locale });
      }
      if (result.length > 10 && !result.includes("[Ritual interrupted]") && !result.includes("【魔法阵崩溃】")) {
        setUsedToday((n) => n + 1);
        setLastSpreadAt(Date.now());
        setNow(Date.now());
      }
    },
  });

  // On load: count today's three-card readings and restore the latest one,
  // so a refresh doesn't lose the result (and doesn't tempt a second paid call).
  useEffect(() => {
    if (!user || restoredRef.current) return;
    restoredRef.current = true;
    (async () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const [todayRes, latestRes] = await Promise.all([
        // today's count (daily limit)
        supabase.from("DrawLog").select("id", { count: "exact", head: true })
          .eq("user_id", user.id).eq("spread_type", "trinity")
          .not("ai_reading", "ilike", "[HIDDEN_ERROR]%")
          .gte("created_at", startOfToday.toISOString()),
        // latest reading, any day (cooldown can span midnight)
        supabase.from("DrawLog").select("*")
          .eq("user_id", user.id).eq("spread_type", "trinity")
          .not("ai_reading", "ilike", "[HIDDEN_ERROR]%")
          .order("created_at", { ascending: false }).limit(1),
      ]);
      if (todayRes.error || latestRes.error) return;
      setUsedToday(todayRes.count ?? 0);

      const latest = latestRes.data?.[0];
      if (!latest) return;
      const latestAt = new Date(latest.created_at).getTime();
      setLastSpreadAt(latestAt);

      // A guest just drew cards and logged in: keep those, don't swap in the last saved reading
      if (guestPendingRef.current) return;

      // Restore it if it's from today or still within the cooldown window
      const stillRelevant = latestAt >= startOfToday.getTime() || Date.now() - latestAt < SPREAD_COOLDOWN_MS;
      const cards = Array.isArray(latest.spread_data) ? latest.spread_data : null;
      if (!stillRelevant || !cards || cards.length !== INITIAL_SLOTS.length) return;
      setSlots(INITIAL_SLOTS.map((slot, i) => ({
        ...slot,
        cardName: cards[i].name,
        isReversed: !!cards[i].is_reversed,
        isFlipped: true,
      })));
      setUserQuestion(latest.question || "");
      setIsSelecting(false);
      setAppStage("reading");
      setCompletion(latest.ai_reading || "");
    })();
  }, [user, setCompletion]);

  // Coming back from the verification email / Google login with ?resume=…: restore the guest's three cards
  useEffect(() => {
    const url = new URL(window.location.href);
    const raw = url.searchParams.get("resume");
    if (!raw) return;
    try {
      const p = JSON.parse(raw) as { m?: string; s?: [string, boolean][]; q?: string; d?: string };
      const valid = p.m === "trinity" && p.d === new Date().toDateString()
        && Array.isArray(p.s) && p.s.length === INITIAL_SLOTS.length && p.s.every(([n]) => !!CARD_BY_ZH[n]);
      if (valid) {
        guestPendingRef.current = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off restore from the URL on mount
        setSlots(INITIAL_SLOTS.map((slot, i) => ({ ...slot, cardName: p.s![i][0], isReversed: !!p.s![i][1], isFlipped: true })));
        setUserQuestion((p.q ?? "").slice(0, 500));
        setIsSelecting(false);
        setAppStage("reading");
      }
    } catch {
      // malformed link — ignore
    }
    url.searchParams.delete("resume");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, []);

  // Return URL for login / sign-up that carries a guest's three cards
  const authRedirect =
    typeof window !== "undefined" && !user && slots.every(s => s.cardName)
      ? `${window.location.origin}${window.location.pathname}?resume=${encodeURIComponent(JSON.stringify({
          m: "trinity",
          s: slots.map(s => [s.cardName, s.isReversed]),
          q: userQuestion.trim(),
          d: new Date().toDateString(),
        }))}`
      : undefined;

  const remainingToday = Math.max(0, DAILY_LIMITS.trinity - usedToday);
  const cooldownLeftMs = lastSpreadAt ? lastSpreadAt + SPREAD_COOLDOWN_MS - now : 0;

  const resetSpread = () => {
    setSlots(INITIAL_SLOTS.map((s) => ({ ...s })));
    setUserQuestion("");
    setCompletion("");
    setIsSelecting(true);
    setAppStage("asking");
  };

  // Every API call carries the Supabase access token; the server verifies it and enforces the daily limit
  const completeWithAuth = (prompt: string, options: { body: object }) => {
    // Token comes from useAuth state (kept fresh by onAuthStateChange) — no getSession() round-trip
    const headers: Record<string, string> = session ? { Authorization: `Bearer ${session.access_token}` } : {};
    return complete(prompt, { ...options, headers });
  };

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    if (typeof window !== "undefined") localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const handleSetLocale = async (newLocale: Locale) => {
    track("language_switch", { to: newLocale });
    setLocale(newLocale);
    if (user) await supabase.auth.updateUser({ data: { locale: newLocale } });
  };

  const enterSpread = () => {
    if (!userQuestion.trim()) return;
    setAppStage("selecting");
  };

  const handleSelectFromFan = (index: number) => {
    if (isAllDrawn || appStage === "reading") return;

    let pickedCard = "";
    let isRev = false;
    let attempts = 0; // 安全锁，防止死循环

    // 🌟 if been picked then repick another card
    do {
      const result = pickRandomTarotCard();
      pickedCard = result.name;
      isRev = result.reversed;
      attempts++;
    } while (
      slots.some(slot => slot.cardName === pickedCard) && attempts < 100
    );

  const updatedSlots = [...slots];
    
    updatedSlots[activeSlotIndex] = {
      ...updatedSlots[activeSlotIndex],
      cardName: pickedCard,
      isReversed: isRev,
    };
    setSlots(updatedSlots);

    localStorage.setItem("tarot_three_card_last_drawn", updatedSlots.map(s => `${s.id}:${s.cardName}:${s.isReversed}`).join("|"));

    if (activeSlotIndex === slots.length - 1) {
      track("draw_card", { mode: "trinity", loggedIn: !!user });
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

    const cardsDescription = finalSlots.map(s => {
      const position = t(locale, s.labelKey as any); 
      const cardDisplayName = getCardDisplayName(s.cardName || "", locale); 
      const orientation = s.isReversed ? t(locale, "reversed" as any) : t(locale, "upright" as any); 
      return `- 【${position}】: ${cardDisplayName} (${orientation})`;
    }).join("\n");

    const basePrompt = t(locale, "readSpreadPrompt" as any);
    
    const fullPrompt = locale === "zh" 
      ? `${basePrompt}\n\n占卜问题：${userQuestion.trim()}\n\n圣三角牌阵抽卡结果如下：\n${cardsDescription}\n\n请将三张牌的能量编织为一个整体，为求问者提供深度、连贯的神谕破译。`
      : `${basePrompt}\n\nQuestion: ${userQuestion.trim()}\n\nThree-Card Spread Results:\n${cardsDescription}\n\nPlease weave the three cards into one deep, coherent oracle interpretation.`;

    void completeWithAuth(fullPrompt, { 
      body: { 
        isSpread: true, 
        spreadData, 
        locale, 
        question: userQuestion.trim(),
        tzOffset: new Date().getTimezoneOffset(),
        cardName: finalSlots[0]?.cardName || "愚者",
        isReversed: finalSlots[0]?.isReversed || false
      } 
    });
  };

  // Once a guest with three flipped cards logs in (same page or via ?resume=), fetch their reading
  useEffect(() => {
    if (!user || !guestPendingRef.current || isLoading || completion) return;
    if (!slots.every(s => s.isFlipped && s.cardName)) return;
    guestPendingRef.current = false;
    triggerSpreadAIReading(slots);
  }, [user, slots]); // eslint-disable-line react-hooks/exhaustive-deps

  const subtitleMain = isSelecting
    ? `${t(locale, "subtitleSelecting" as any)} (${slots.filter(s => s.cardName).length} / 3)`
    : slots.every(s => s.isFlipped)
      ? t(locale, "spreadRevealed")
      : t(locale, "subtitleAfterSelect" as any);

  const readingStatusLabel = isLoading
    ? t(locale, "readingLoading" as any)
    : slots.every(s => s.isFlipped) && completion && !isEnergyRecoveryBlock(completion)
      ? t(locale, "readingDone" as any)
      : slots.every(s => s.isFlipped)
        ? t(locale, "readingRevealed")
        : t(locale, "readingWait" as any);

  // Pre-written meanings for each slot once all three cards are face up
  const spreadMeanings = slots.every(s => s.isFlipped && s.cardName)
    ? slots.map(s => ({
        label: `${t(locale, s.labelKey as any)} · ${getCardDisplayName(s.cardName!, locale)} (${s.isReversed ? t(locale, "reversed") : t(locale, "upright")})`,
        text: getCardMeaning(s.cardName!, s.isReversed, locale) ?? "",
      }))
    : undefined;

  // Share button sits above whatever footer action is showing, once the reading is in
  const allFlipped = slots.every(s => s.isFlipped && s.cardName);
  const hasReading = allFlipped && !!completion && !error && !isLoading
    && !completion.includes("【魔法阵崩溃】") && !completion.includes("[Ritual interrupted]");
  const canShare = hasReading || (!user && allFlipped);
  const withShare = (main: ReactNode) => {
    if (!canShare) return main || undefined;
    return (
      <div className="flex flex-col items-center gap-5">
        <ShareCardButton
          locale={locale}
          getInput={() => {
            // The whole card follows the reading's language, not the current UI language
            const cl = hasReading ? detectTextLocale(completion) : locale;
            return {
              locale: cl,
              kind: t(cl, "shareKindSpread"),
              cards: slots.map(s => ({
                name: s.cardName!,
                label: getCardDisplayName(s.cardName!, cl),
                orientation: s.isReversed ? t(cl, "reversed") : t(cl, "upright"),
                reversed: s.isReversed,
              })),
              question: userQuestion.trim() || undefined,
              excerpt: hasReading
                ? makeExcerpt(completion, cl === "zh" ? 100 : 220)
                // guest: the three pre-written meanings
                : slots.map(s => getCardMeaning(s.cardName!, s.isReversed, cl)).filter(Boolean).join(cl === "zh" ? "" : " "),
            };
          }}
        />
        {main}
      </div>
    );
  };

  if (!appLoaded) return <div className="min-h-screen bg-[#05030a]" />;
  

  return (
    <div className={`relative flex flex-col overflow-x-hidden bg-[#05030a] font-sans text-zinc-50 ${appStage === "reading" ? "min-h-screen overflow-y-auto" : "h-screen overflow-hidden w-full fixed inset-0"}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_25%,rgba(140,70,255,0.18),transparent_60%)]" />

      {/* 左上角全局控制枢纽 */}
      <div className="fixed left-4 top-4 z-[90] flex items-center gap-2.5">
        <button 
            onClick={() => (user ? setIsSidebarOpen(true) : setShowAuthOverlay(true))} 
            className="flex items-center justify-center rounded-full border border-white/15 bg-black/45 p-1.5 backdrop-blur-md hover:bg-white/10 transition-colors shadow-lg w-11 h-11 overflow-hidden"
            >
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                className="w-full h-full rounded-full object-cover" 
                alt="Avatar"
              />
            ) : (
              <div className={`w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-zinc-400 ${getAvatarColor(user?.email || "")}`}>
                {getInitial(user?.email)}
              </div>
          )}
        </button>

        <SpreadSelector currentSpread="three" locale={locale} />
      </div>

      <LocaleSwitcher currentLocale={locale} onSetLocale={handleSetLocale} />

      {/* 主画布 */}
      <main className="relative z-10 flex w-full max-w-5xl flex-col items-center px-4 text-center mx-auto pt-6">
        <AnimatePresence mode="wait">
          {appStage === "asking" ? (
            <motion.div key="three-asking" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center gap-10">
              <div className="space-y-3">
                <h1 className="text-3xl font-light tracking-[0.2em] text-zinc-100 sm:text-4xl">
                  {locale === "zh" ? "圣三角神谕" : "Holy Trinity Spread"}
                </h1>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {locale === "zh" ? "让三张牌交织出你此刻的命运图景" : "Let three cards weave the shape of your fate"}
                </p>
              </div>
              <div className="w-full space-y-8">
                <textarea 
                  rows={4} 
                  value={userQuestion} 
                  onChange={(e) => setUserQuestion(e.target.value)} 
                  placeholder={
                    locale === "zh" 
                      ? "请输入你心中渴望洞察的困惑或宿命（如：我的感情未来发展趋势）..." 
                      : "Enter your question or destiny insight (e.g., How will my career evolve?)..."
                  } 
                  className="w-full resize-none bg-white/[0.04] p-3 text-zinc-100 shadow-[0_1px_0_0_rgba(167,139,250,0.35)] focus:outline-none focus:ring-0" 
                />
                <button type="button" onClick={enterSpread} className="group relative w-full overflow-hidden rounded-full border border-amber-400/25 bg-gradient-to-b from-violet-950/80 to-black py-4 text-amber-100 tracking-[0.35em]">
                  {locale === "zh" ? "开启三牌阵阵法" : "ENTER THREE-CARD SPREAD"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="three-flow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex w-full flex-col items-center">
              <h1 className="mt-12 max-sm:mt-20 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                {locale === "zh" ? "圣三角时空星盘" : "Three-Card Astral Matrix"}
              </h1>
              <p className="mt-3 text-sm text-zinc-400">{subtitleMain}</p>

              {/* 全景三牌阵槽位展示区 */}
              {(slots.some(s => s.cardName !== null) || !isSelecting) && (
                <div className="my-8 flex flex-wrap max-md:flex-nowrap items-start justify-center gap-6 max-md:gap-2 sm:gap-10 w-full px-2">
                  {slots.map((slot, idx) => {
                    if (!slot.cardName) return null;
                    return (
                      <motion.div key={slot.id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3">
                        <span className={`text-xs font-semibold tracking-widest px-3 py-1 rounded-full border ${slot.isFlipped ? "border-violet-500/30 text-violet-400 bg-violet-950/20" : "border-zinc-700 text-zinc-400 bg-zinc-900/45"}`}>
                          {t(locale, slot.labelKey as any)}
                        </span>
                        
                        <TarotCard
                          sizeClassName="w-[250px] max-md:w-[27vw]"
                          layoutId={`three-card-${slot.id}`}
                          cardName={slot.cardName}
                          cardLabel={getCardDisplayName(slot.cardName, locale)}
                          orientationLabel={slot.isReversed ? t(locale, "reversed" as any) : t(locale, "upright" as any)}
                          oracleBadge={t(locale, "oracleBadge" as any)}
                          isReversed={slot.isReversed}
                          isFlipped={slot.isFlipped}
                          onClick={() => {
                            if (slot.isFlipped || isSelecting) return;
                            // Copy the slot instead of mutating state in place
                            const updated = slots.map((s, i) => (i === idx ? { ...s, isFlipped: true } : s));
                            setSlots(updated);

                            if (updated.every(s => s.isFlipped)) {
                              track("reveal_card", { mode: "trinity", loggedIn: !!user, locale });
                              // Guests see the card meanings now and get the AI reading after logging in
                              if (user) triggerSpreadAIReading(updated);
                              else guestPendingRef.current = true;
                            }
                          }}
                          disabled={slot.isFlipped}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* 56张大折扇牌堆 */}
              <div className="w-full mt-4">
                <TarotFan isOpen={isSelecting} isSelecting={isSelecting} clickedIndex={null} onSelectCard={handleSelectFromFan} />
              </div>

              <ReadingBox 
                completion={completion}
                isLoading={isLoading}
                error={error}
                isErrorState={!!error && !isDailyLimitError(error)}
                notice={error && isDailyLimitError(error) ? dailyLimitMessage(error) : undefined}
                placeholderText={
                  isLoading 
                    ? "" 
                    : isSelecting 
                      ? (locale === "zh" ? "请在上方牌阵中依次挑满三张宿命卡牌..." : "Please select 3 destiny cards from the deck above...")
                      : !slots.every(s => s.isFlipped) 
                        ? (locale === "zh" ? "请在上方依次点击翻开这三张揭晓的卡牌，以汇聚综合神谕..." : "Click to flip the 3 revealed cards above to awaken the combined oracle...")
                        : "" 
                }
                readingStatusLabel={readingStatusLabel}
                locale={locale}
                className={appStage === "reading" ? "-mt-4 mb-10 w-full max-w-3xl" : "mt-6 w-full max-w-3xl"} 
                onRetry={() => triggerSpreadAIReading(slots)}
                question={userQuestion.trim() || undefined}
                meanings={spreadMeanings}
                showAiSection={!!user || !allFlipped}
                onEditQuestion={isSelecting && slots.every(s => !s.cardName) ? () => setAppStage("asking") : undefined}
                footer={withShare(
                  // Guest with all three cards face up: invite them to log in for the reading
                  !user && appStage === "reading" && allFlipped ? (
                    <button
                      type="button"
                      onClick={() => { track("login_prompt_click", { mode: "trinity" }); setShowAuthOverlay(true); }}
                      className="rounded-full border border-amber-400/30 bg-gradient-to-b from-amber-500/10 to-amber-950/50 px-8 py-3 text-xs font-bold tracking-[0.15em] text-amber-200 shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)] transition-all duration-300 hover:border-amber-400/60 hover:text-amber-100 active:scale-95"
                    >
                      🔮 {t(locale, "loginForReading")}
                    </button>
                  ) :
                  // All cards face up but no reading yet (request never fired or came back empty): let the user ask for it
                  user && appStage === "reading" && slots.every(s => s.isFlipped) && !isLoading && !completion && !error ? (
                    <button
                      type="button"
                      onClick={() => triggerSpreadAIReading(slots)}
                      className="rounded-full border border-amber-400/40 px-6 py-2.5 text-xs tracking-[0.15em] text-amber-200 transition-colors hover:bg-amber-500/10"
                    >
                      🔮 {t(locale, "getReading")}
                    </button>
                  ) : appStage === "reading" && slots.every(s => s.isFlipped) && !isLoading && (completion || error) ? (
                    remainingToday > 0 && cooldownLeftMs > 0 ? (
                      <CooldownRing
                        endsAt={lastSpreadAt! + SPREAD_COOLDOWN_MS}
                        totalMs={SPREAD_COOLDOWN_MS}
                        onDone={() => setNow(Date.now())}
                      >
                        {(left) => (
                          <>
                            {cooldownMessage(left, locale)}
                            <br />
                            <span className="text-zinc-600">
                              {locale === "zh" ? `今日尚余 ${remainingToday} 次叩问` : `${remainingToday} left today`}
                            </span>
                          </>
                        )}
                      </CooldownRing>
                    ) : remainingToday > 0 ? (
                      <button
                        type="button"
                        onClick={resetSpread}
                        className="rounded-full border border-violet-500/40 px-6 py-2.5 text-xs tracking-[0.15em] text-violet-300 transition-colors hover:bg-violet-500/10"
                      >
                        {t(locale, "drawAgain")} · {locale === "zh" ? `${t(locale, "remainingToday")} ${remainingToday} 次` : `${remainingToday} ${t(locale, "remainingToday")}`}
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500">{t(locale, "spreadLimitReached")}</span>
                    )
                  ) : undefined
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
        locale={locale} 
        onLogout={handleLogout} 
        onLoginClick={() => setShowAuthOverlay(true)}
      />

      {/* Login dialog for guests (avatar or "log in for reading") */}
      {!user && (
        <AuthWall
          locale={locale}
          setLocale={setLocale}
          isOpen={showAuthOverlay}
          onClose={() => setShowAuthOverlay(false)}
          redirectTo={authRedirect}
        />
      )}
    </div>
  );
}