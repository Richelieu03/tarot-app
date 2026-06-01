"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
import { useEffect, useState, type CSSProperties } from "react";
import type { User } from "@supabase/supabase-js"; 
import "./tarot-spread.css";
import { pickRandomTarotCard } from "../lib/draw-random";
import type { Locale } from "../lib/locale";
import { LOCALE_STORAGE_KEY, defaultLocale, isLocale } from "../lib/locale";
import { getCardDisplayName } from "../lib/tarot-labels";
import {
  formatDailyRecap,
  isEnergyRecoveryBlock,
  t,
} from "../lib/ui-i18n";
import { supabase } from "../lib/supabase";

type AppStage = "asking" | "selecting" | "reading";

const LS_USER_QUESTION = "tarot_user_question";

export default function Home() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [appStage, setAppStage] = useState<AppStage>("asking");
  const [userQuestion, setUserQuestion] = useState("");
  const [appLoaded, setAppLoaded] = useState(false);
  const [isSelecting, setIsSelecting] = useState(true);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const [flipped, setFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState("愚者");
  const [isReversed, setIsReversed] = useState(false);

  // 用来保存当前登录的用户信息
  const [user, setUser] = useState<User | null>(null);

  // 👇 专门处理语言切换，同步保存到云端
  const handleSetLocale = async (newLocale: Locale) => {
    setLocale(newLocale); // 先让页面瞬间切换，保证丝滑体验
    if (user) {
      // 如果已登录，静默更新到 Supabase 自带的用户配置中
      await supabase.auth.updateUser({
        data: { locale: newLocale }
      });
    }
  };

  // 状态监听：实时掌握用户是否登录，并读取云端配置
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // 👇 如果云端账号里记录了语言偏好，直接应用！
      if (currentUser?.user_metadata?.locale) {
        setLocale(currentUser.user_metadata.locale as Locale);
      }
      
      setAppLoaded(true); 
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      // 登录状态变化时，也同步一下语言
      if (currentUser?.user_metadata?.locale) {
        setLocale(currentUser.user_metadata.locale as Locale);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'redirectUrl' 
      }
    });

    if (error) {
      alert("登录失败: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("tarot_last_draw_date");
    localStorage.removeItem("tarot_last_drawn_card");
    localStorage.removeItem("tarot_last_card_reversed");
    localStorage.removeItem("tarot_user_question");
    localStorage.removeItem("tarot_last_ai_reading");
    window.location.reload(); 
  };
  
  const { completion, complete, error, isLoading, setCompletion } =
    useCompletion({
      api: "/api/tarot",
      streamProtocol: "text",
      onFinish: async (_prompt, result) => { 
        if (
          result.length > 10 &&
          !result.includes("Error") &&
          !result.includes("limit")
        ) {
          localStorage.setItem("tarot_last_ai_reading", result);

          const savedQuestion = localStorage.getItem("tarot_user_question") || "";
          const savedCard = localStorage.getItem("tarot_last_drawn_card") || "未知卡牌";
          const savedReversed = localStorage.getItem("tarot_last_card_reversed") === "true";

          // 👇 核心改动：插入数据时，带上当前登录用户的 ID 身份证
          const { error: dbError } = await supabase
            .from('DrawLog')
            .insert([
              {
                card_name: savedCard,
                is_reversed: savedReversed,
                question: savedQuestion,
                ai_reading: result,
                user_id: user?.id // 👈 这里绑定用户ID
              }
            ]);

          if (dbError) {
            console.error("保存云端记录失败:", dbError);
          } else {
            console.log("✅ 抽卡记录已与您的账号完美绑定并存入云端！");
          }
        }
      },
    });

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }
  }, [locale]);

  useEffect(() => {
    if (!appLoaded) return;
    
    const today = new Date().toLocaleDateString();
    const lastDrawDate = localStorage.getItem("tarot_last_draw_date");

    if (lastDrawDate === today) {
      const savedCard = localStorage.getItem("tarot_last_drawn_card") || "命运之轮";
      const savedReversed = localStorage.getItem("tarot_last_card_reversed") === "true";
      const savedQ = localStorage.getItem(LS_USER_QUESTION) ?? "";

      setIsReversed(savedReversed);
      setCurrentCard(savedCard);
      setFlipped(true);
      setIsSelecting(false);
      setAppStage("reading");
      setUserQuestion(savedQ);

      const savedReading = localStorage.getItem("tarot_last_ai_reading");
      if (savedReading) {
        setCompletion(formatDailyRecap(savedReading, locale));
      } else {
        setCompletion(`🔮 能量正在恢复中...`);
      }
    }
  }, [appLoaded, setCompletion, locale]);

  const enterSpread = () => {
    const q = userQuestion.trim();
    localStorage.setItem(LS_USER_QUESTION, q);
    setAppStage("selecting");
  };

  const handleSelectFromFan = (index: number) => {
    if (!isSelecting) return;

    setClickedIndex(index);
    setIsSelecting(false);

    const today = new Date().toLocaleDateString();
    const { name: pickedCard, reversed: isRev } = pickRandomTarotCard();

    setCurrentCard(pickedCard);
    setIsReversed(isRev);

    localStorage.setItem("tarot_last_draw_date", today);
    localStorage.setItem("tarot_last_drawn_card", pickedCard);
    localStorage.setItem("tarot_last_card_reversed", isRev.toString());
    localStorage.removeItem("tarot_last_ai_reading");

    setCompletion("");
  };

  const apiBody = () => ({
    cardName: currentCard,
    isReversed,
    locale,
    question: userQuestion.trim(),
  });

  const handleMainCardClick = () => {
    if (flipped || isSelecting) return;
    setAppStage("reading");
    setFlipped(true);
    void complete(t(locale, "readPrompt"), {
      body: apiBody(),
    });
  };

  const retryReading = () => {
    setCompletion("");
    void complete(t(locale, "readPrompt"), {
      body: apiBody(),
    });
  };

  const cardLabel = getCardDisplayName(currentCard, locale);
  const orientationLabel = isReversed ? t(locale, "reversed") : t(locale, "upright");
  const subtitleMain = isSelecting ? t(locale, "subtitleSelecting") : t(locale, "subtitleAfterSelect");
  const readingStatusLabel = isLoading
    ? t(locale, "readingLoading")
    : flipped && completion && !isEnergyRecoveryBlock(completion)
      ? t(locale, "readingDone")
      : t(locale, "readingWait");

  // 防止未加载完成时出现白闪
  if (!appLoaded) {
    return <div className="min-h-screen bg-[#05030a]" />;
  }

  // 👇 拦截器：如果没登录，直接展现绝美的神秘占卜登录墙
  if (!user) {
    return (
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#05030a] font-sans text-zinc-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_50%,rgba(139,92,246,0.18),transparent_60%)]" />
        
        {/* 把中英文切换按钮加回未登录界面 */}
        <div className="fixed right-4 top-4 z-[100] flex gap-2 rounded-full border border-white/15 bg-black/45 p-1 px-2 backdrop-blur-md items-center">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${
              locale === "en" ? "bg-violet-600/80 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale("zh")}
            className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${
              locale === "zh" ? "bg-violet-600/80 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            中文
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center gap-6"
        >
          <div className="text-4xl animate-pulse">🔮</div>
          <h1 className={`font-light text-zinc-100 whitespace-nowrap ${
            locale === "zh" 
              ? "text-3xl tracking-[0.3em]" 
              : "text-2xl tracking-[0.15em]"
          }`}>
            {locale === "zh" ? "奥秘之门" : "The Mystic Gate"}
          </h1>
          <p className="text-sm leading-relaxed text-zinc-500">
            {locale === "zh" 
              ? <>探索未知的命运轨迹，记录你的每一次心灵启示。<br/>开始前，请先开启你的专属神秘学日志。</>
              : <>Explore the unknown paths of fate and record your spiritual revelations.<br/>Please unlock your mystical journal to begin.</>
            }
          </p>
          <button
            type="button"
            onClick={loginWithGoogle}
            className="group relative mt-4 flex items-center justify-center gap-3 w-full overflow-hidden rounded-full border border-amber-400/30 bg-gradient-to-b from-violet-950/60 to-black px-8 py-4 text-sm font-medium tracking-widest text-amber-100 shadow-[0_0_40px_-10px_rgba(167,139,250,0.3)] transition-all duration-500 hover:border-amber-300/60 hover:shadow-[0_0_50px_-5px_rgba(250,204,21,0.45)] active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {locale === "zh" ? "使用 GOOGLE 账号开启" : "CONTINUE WITH GOOGLE"}
          </button>
        </motion.div>
      </div>
    );
  }

  // 👇 如果登录了，无缝展示原本完整的塔罗应用
  return (
    <div className={`relative flex flex-col overflow-x-hidden bg-[#05030a] font-sans text-zinc-50 ${appStage === "reading" ? "min-h-screen overflow-y-auto" : "h-screen overflow-hidden w-full fixed inset-0"}`}>
      <div
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_25%,rgba(140,70,255,0.25),transparent_60%)] transition-opacity duration-700 ${appStage === "asking" ? "opacity-40" : "opacity-100"}`}
      />

      <div className="fixed right-4 top-4 z-[100] flex gap-2 rounded-full border border-white/15 bg-black/45 p-1 px-2 backdrop-blur-md items-center">
        <div className="flex items-center gap-2 px-1">
          {user.user_metadata?.avatar_url && (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Avatar" 
              className="w-5 h-5 rounded-full border border-white/20"
            />
          )}
          <span className="text-xs font-medium text-zinc-300 max-w-[80px] truncate">
            {user.user_metadata?.full_name || "已登录"}
          </span>
          <button
            onClick={handleLogout}
            className="ml-1 text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
          >
            登出
          </button>
        </div>
        
        <div className="w-px h-3.5 bg-white/20 mx-0.5"></div>

        <button
          type="button"
          onClick={() => handleSetLocale("en")}
          className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${
            locale === "en" ? "bg-violet-600/80 text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => handleSetLocale("zh")}
          className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${
            locale === "zh" ? "bg-violet-600/80 text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          中文
        </button>
      </div>

      <main className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 pt-6 pb-12 md:py-12 text-center mt-4 mb-auto md:my-auto mx-auto">
          <AnimatePresence mode="wait">
          {appStage === "asking" ? (
            <motion.div
              key="ritual-asking"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center gap-10"
            >
              <div className="space-y-3">
                <h1 className="text-3xl font-light tracking-[0.2em] text-zinc-100 sm:text-4xl">
                  {t(locale, "title")}
                </h1>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {t(locale, "ritualSubtitle")}
                </p>
              </div>

              <div className="w-full space-y-14 md:space-y-8">
                <label className="sr-only" htmlFor="oracle-question">
                  {t(locale, "questionPlaceholder")}
                </label>
                <textarea
                  id="oracle-question"
                  rows={4}
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder={t(locale, "questionPlaceholder")}
                  className="w-full resize-none rounded-t-lg border-b border-transparent bg-white/[0.04] px-0 py-3 text-left text-base leading-relaxed text-zinc-100 shadow-[0_1px_0_0_rgba(167,139,250,0.35)] backdrop-blur-md transition-[box-shadow,background-color] duration-500 placeholder:text-zinc-600 focus:border-0 focus:bg-white/[0.06] focus:outline-none focus:ring-0 focus:shadow-[0_2px_24px_rgba(167,139,250,0.25),0_1px_0_0_rgba(250,204,21,0.35)] md:text-lg"
                  autoComplete="off"
                />

                <button
                  type="button"
                  onClick={enterSpread}
                  className="group relative w-full overflow-hidden rounded-full border border-amber-400/25 bg-gradient-to-b from-violet-950/80 to-black px-8 py-4 text-sm font-medium tracking-[0.35em] text-amber-100/95 shadow-[0_0_40px_-12px_rgba(250,204,21,0.45)] transition-[transform,box-shadow,border-color] duration-500 hover:border-amber-300/50 hover:shadow-[0_0_56px_-8px_rgba(250,204,21,0.55)] active:scale-[0.98]"
                >
                  <span className="relative z-10">
                    {t(locale, "enterSpread")}
                  </span>
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(250,204,21,0.12),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="spread-flow"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full flex-col items-center"
            >
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                {t(locale, "title")}
              </h1>
              <p className="mt-4 text-sm text-zinc-400">{subtitleMain}</p>

              <div className="w-[250px] max-md:w-[140px] aspect-[25/43] my-6 md:-translate-y-[10px] flex items-center justify-center [perspective:1200px]">
                <AnimatePresence>
                  {!isSelecting && (
                    <motion.div
                      layoutId={clickedIndex !== null ? `fan-card-${clickedIndex}` : "tarot-main-card"}
                      onClick={handleMainCardClick}
                      className={`relative h-full w-full rounded-none [transform-style:preserve-3d] ${!flipped && !isSelecting ? "cursor-pointer transition-shadow hover:shadow-[0_0_30px_rgba(167,139,250,0.3)]" : ""}`}
                      animate={{ rotateY: flipped ? 180 : 0 }}
                      transition={{
                        layout: { type: "spring", stiffness: 200, damping: 25 },
                        duration: 0.8,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-none border border-white/10 bg-[#0a0612] shadow-2xl [backface-visibility:hidden] [transform:translateZ(0)]">
                        <img
                          src="/tarot/维特牌背.jpg"
                          alt={t(locale, "ariaTarotBack")}
                          className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-none border border-white/20 bg-black shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(0.1px)]">
                        <img
                          src={`/tarot/${currentCard}.jpg`}
                          alt={cardLabel}
                          className={`absolute inset-0 h-full w-full object-cover object-center opacity-90 ${isReversed ? "rotate-180" : ""}`}
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1620052579624-b153545faed8?q=80&w=400&auto=format&fit=crop";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        <div className="relative z-10 mt-auto w-full px-2 pb-3 md:px-6 md:pb-8 text-center leading-tight">
                          <div className="text-[7px] md:text-[10px] tracking-widest md:tracking-[0.3em] text-violet-400 drop-shadow-md">
                            {t(locale, "oracleBadge")}
                          </div>
                          
                          <div className="mt-1 md:mt-2 text-[13px] md:text-2xl font-bold text-white drop-shadow-xl flex flex-col items-center justify-center gap-0.5 md:gap-1">
                            <span>{cardLabel}</span>
                            <span className="text-[10px] md:text-base font-normal text-zinc-300">
                              ({orientationLabel})
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative z-20 mt-4 md:mt-0 md:-translate-y-[20px] w-full max-w-lg md:max-w-2xl">
                <div className="rounded-none border border-white/5 bg-white/5 p-6 shadow-xl backdrop-blur-2xl transition-opacity duration-700">
                  <div className="mb-4 flex items-center justify-between text-[10px] tracking-widest text-zinc-500">
                    <span>{t(locale, "readingHeader")}</span>
                    <span className={isLoading ? "animate-pulse text-violet-400" : ""}>
                      {readingStatusLabel}
                    </span>
                  </div>

                  <div className="min-h-[120px] whitespace-pre-wrap text-left font-serif text-[15px] italic leading-8 text-zinc-200">
                    {error || (isEnergyRecoveryBlock(completion) && !isLoading) ? (
                      <div className="flex flex-col items-start text-sm text-red-400/80">
                        <p>🔮 占卜似乎遇到了一点迷雾，请重试。</p>
                        <button
                          type="button"
                          onClick={retryReading}
                          className="mt-4 border border-violet-500/50 px-5 py-2 text-xs text-violet-400"
                        >
                          {t(locale, "retryButton")}
                        </button>
                      </div>
                    ) : completion ? (
                      completion
                    ) : isLoading ? null : (
                      <span className="text-zinc-600">
                        {isSelecting ? t(locale, "placeholderSelecting") : !flipped ? t(locale, "placeholderAfterPick") : t(locale, "placeholderThinking")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {appStage === "selecting" && (
          <div className="tarot-fan-scene min-h-[260px] flex items-center justify-center">
            <div className="tarot-fan-scene__inner">
            {isSelecting && (
              <ul className="tarot-fan-track" key="main-tarot-fan">
                {Array.from({ length: 22 }).map((_, i) => (
                  <motion.li
                    key={`fan-card-${i}`}
                    layoutId={`fan-card-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.02, ease: "easeOut" }}
                    className="tarot-fan-cell cursor-pointer"
                    style={{
                      "--i": i,
                      visibility: clickedIndex !== null && clickedIndex !== i ? "hidden" : "visible",
                    } as CSSProperties}
                    onClick={() => handleSelectFromFan(i)}
                  >
                    <motion.div
                      className="h-full w-full"
                      initial={{ y: 0 }}
                      whileHover={{ y: -40, scale: 1.1, zIndex: 50 }}
                      transition={{ type: "spring", stiffness: 250, damping: 18 }}
                    >
                      <div className="tarot-fan-face relative h-full w-full overflow-hidden rounded-none shadow-xl">
                        <img
                          src="/tarot/维特牌背.jpg"
                          className="h-full w-full rounded-none object-cover object-center"
                          alt={t(locale, "ariaFanCard")}
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-violet-500/10 opacity-0 transition-opacity hover:opacity-100" />
                      </div>
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}