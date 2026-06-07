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

// 定义历史记录的数据结构
interface DrawLog {
  id: number;
  created_at: string;
  card_name: string;
  is_reversed: boolean;
  question: string;
  ai_reading: string;
}

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

  // 用户状态
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

  // 侧边栏与历史记录状态
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<DrawLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // 控制当前展开的历史记录 ID
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const handleSetLocale = async (newLocale: Locale) => {
    setLocale(newLocale);
    if (user) {
      await supabase.auth.updateUser({
        data: { locale: newLocale }
      });
    }
  };

  // 云端每日限制状态对账与页面重构函数
  const checkCloudDrawStatus = async (userId: string, currentLocale: Locale) => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0); // 取今天当地时间凌晨 00:00:00

      // 去云端拉取该用户今天生成的、且排除隐藏报错的高质量抽卡数据
      const { data, error } = await supabase
        .from('DrawLog')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startOfToday.toISOString())
        .not('ai_reading', 'ilike', '[HIDDEN_ERROR]%')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("守护结界同步失败:", error);
        return;
      }

      // 如果发现今天已经有成功的日志，直接阻断并重构为今日解牌完成页
      if (data && data.length > 0) {
        const todayLog = data[0];
        setIsReversed(todayLog.is_reversed);
        setCurrentCard(todayLog.card_name);
        setFlipped(true);
        setIsSelecting(false);
        setAppStage("reading");
        setUserQuestion(todayLog.question || "");
        
        if (todayLog.ai_reading) {
          setCompletion(formatDailyRecap(todayLog.ai_reading, currentLocale));
        } else {
          setCompletion(`🔮 能量正在恢复中...`);
        }
      }
    } catch (e) {
      console.error("星界同步异常:", e);
    }
  };

  // 身份监听器，登录时立刻绑定云端状态校验
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      let activeLocale = locale;
      if (currentUser?.user_metadata?.locale) {
        activeLocale = currentUser.user_metadata.locale as Locale;
        setLocale(activeLocale);
      }
      
      if (currentUser) {
        await checkCloudDrawStatus(currentUser.id, activeLocale);
      }
      setAppLoaded(true); 
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      let activeLocale = locale;
      if (currentUser?.user_metadata?.locale) {
        activeLocale = currentUser.user_metadata.locale as Locale;
        setLocale(activeLocale);
      }

      if (currentUser && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        await checkCloudDrawStatus(currentUser.id, activeLocale);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const loginWithGoogle = async () => {
    const redirectUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl }
    });
    if (error) alert("登录失败: " + error.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim();
    const targetPassword = password.trim();
    
    if (!targetEmail || !targetPassword) return;
    if (targetPassword.length < 6) {
      alert(locale === "zh" ? "🔒 密码长度至少需要 6 位哦" : "🔒 Password must be at least 6 characters.");
      return;
    }

    setIsEmailLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: targetEmail,
        password: targetPassword,
      });
      setIsEmailLoading(false);

      if (error) {
        alert(locale === "zh" ? `注册失败: ${error.message}` : `Sign up failed: ${error.message}`);
      } else {
        alert(
          locale === "zh" 
            ? "🔮 验证邮件已发送！请前往您的邮箱点击激活链接。" 
            : "🔮 Verification email sent! Please check your inbox and click the activation link."
        );
        setPassword("");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: targetPassword,
      });
      setIsEmailLoading(false);
      if (error) {
        alert(locale === "zh" ? `登录失败: ${error.message}` : `Login failed: ${error.message}`);
      } else {
        setPassword("");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // 就算云端注销报错了（比如Token过期），也只是在控制台留个言，绝不卡死主线程
      console.error("Supabase 结界断开异常:", err);
    }
    
    // 强制执行 client 端的全面擦除与重载
    localStorage.clear();
    window.location.reload(); 
  };
  
  // 拉取历史记录时，过滤掉包含隐藏错误的日志
  const fetchHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    
    try {
      const { data, error } = await supabase
        .from('DrawLog')
        .select('*')
        .eq('user_id', user.id)
        .not('ai_reading', 'ilike', '[HIDDEN_ERROR]%') // 过滤隐蔽报错
        .order('created_at', { ascending: false }); 

      if (error) {
        console.error("拉取历史记录失败:", error);
      } else if (data) {
        setHistoryLogs(data);
      }
    } catch (err) {
      console.error("星界通信发生未预料的异常:", err);
    } finally {
      setIsLoadingHistory(false); 
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const { completion, complete, error, isLoading, setCompletion } =
    useCompletion({
      api: "/api/tarot",
      streamProtocol: "text",
      
      // 🌟 核心修改 1：拦截底层网络/503报错，使用 currentUser 破除闭包
      onError: async (err) => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        const savedQ = localStorage.getItem(LS_USER_QUESTION) || "";
        const savedC = localStorage.getItem("tarot_last_drawn_card") || "未知卡牌";
        const savedR = localStorage.getItem("tarot_last_card_reversed") === "true";
        
        await supabase.from('DrawLog').insert([{
          card_name: savedC,
          is_reversed: savedR,
          question: savedQ,
          ai_reading: `[HIDDEN_ERROR] API Network Crash: ${err.message}`, 
          user_id: currentUser.id 
        }]);
      },

      // 🌟 核心修改 2：使用 currentUser 破除闭包
      onFinish: async (_prompt, result) => { 
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        // 拦截伪装成正常返回的后端错误文本
        const isErrorText = result.includes("Error") || result.includes("limit") || result.includes("【魔法阵崩溃】") || result.includes("[Ritual interrupted]") || result.includes("503");

        if (isErrorText) {
          if (currentUser) {
            const savedQ = localStorage.getItem(LS_USER_QUESTION) || "";
            const savedC = localStorage.getItem("tarot_last_drawn_card") || "未知卡牌";
            const savedR = localStorage.getItem("tarot_last_card_reversed") === "true";
            await supabase.from('DrawLog').insert([{
              card_name: savedC,
              is_reversed: savedR,
              question: savedQ,
              ai_reading: `[HIDDEN_ERROR] Backend Exception: ${result}`,
              user_id: currentUser.id 
            }]);
          }
          return; // 发现错误即终止
        }

        // 正常保存逻辑
        if (result.length > 10) {
          localStorage.setItem("tarot_last_ai_reading", result);
          const savedQuestion = localStorage.getItem("tarot_user_question") || "";
          const savedCard = localStorage.getItem("tarot_last_drawn_card") || "未知卡牌";
          const savedReversed = localStorage.getItem("tarot_last_card_reversed") === "true";

          if (currentUser) {
            const { error: dbError } = await supabase
              .from('DrawLog')
              .insert([{
                  card_name: savedCard,
                  is_reversed: savedReversed,
                  question: savedQuestion,
                  ai_reading: result,
                  user_id: currentUser.id 
              }]);

            if (dbError) console.error("保存云端记录失败:", dbError);
          }
        }
      },
    });

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    if (typeof window !== "undefined") localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

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

  const apiBody = () => ({ cardName: currentCard, isReversed, locale, question: userQuestion.trim() });

  const handleMainCardClick = () => {
    if (flipped || isSelecting) return;
    setAppStage("reading");
    setFlipped(true);
    void complete(t(locale, "readPrompt"), { body: apiBody() });
  };

  const retryReading = () => {
    setCompletion("");
    void complete(t(locale, "readPrompt"), { body: apiBody() });
  };

  const cardLabel = getCardDisplayName(currentCard, locale);
  const orientationLabel = isReversed ? t(locale, "reversed") : t(locale, "upright");
  const subtitleMain = isSelecting ? t(locale, "subtitleSelecting") : t(locale, "subtitleAfterSelect");
  const readingStatusLabel = isLoading
    ? t(locale, "readingLoading")
    : flipped && completion && !isEnergyRecoveryBlock(completion)
      ? t(locale, "readingDone")
      : t(locale, "readingWait");

  // 错误状态雷达判定
  const isErrorState = error || completion.includes("[HIDDEN_ERROR]") || completion.includes("【魔法阵崩溃】") || completion.includes("[Ritual interrupted]") || completion.includes("能量正在恢复中");

  if (!appLoaded) {
    return <div className="min-h-screen bg-[#05030a]" />;
  }

  // 未登录拦截页面
  if (!user) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#05030a] font-sans text-zinc-50 selection:bg-violet-500/30">
        

        <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]" />
          <motion.div animate={{ rotate: 360, scale: [1, 1.05, 1] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute h-[800px] w-[800px] rounded-full border border-white/5 opacity-20" />
          <motion.div animate={{ rotate: -360, scale: [1, 1.1, 1] }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute h-[1200px] w-[1200px] rounded-full border border-violet-500/5 opacity-10" />
        </div>

        {/* 右上角语言切换器 */}
        <div className="fixed right-4 top-4 z-[100] flex gap-2 rounded-full border border-white/10 bg-black/40 p-1 px-2 backdrop-blur-md items-center">
          <button onClick={() => setLocale("en")} className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${locale === "en" ? "bg-violet-600/80 text-white" : "text-zinc-400 hover:text-zinc-200"}`}>EN</button>
          <button onClick={() => setLocale("zh")} className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${locale === "zh" ? "bg-violet-600/80 text-white" : "text-zinc-400 hover:text-zinc-200"}`}>中文</button>
        </div>

        <AnimatePresence mode="wait">
          {!showAuthForm ? (
            // 🌠 第一阶段：保留你原本的所有动效
            <motion.div 
              key="landing-hero"
              // 统一管理：让父容器控制淡入，子元素保留你原本的 y: 20 浮动逻辑
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="relative z-10 flex flex-col items-center px-6 text-center max-w-2xl w-full"
            >
              <div className="text-5xl mb-8 animate-pulse">🔮</div>
              
              {/* ⚠️ 这里保留了你原来的动效，一个字都没动 */}
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className={`mb-6 font-light text-zinc-100 ${locale === "zh" ? "text-4xl md:text-5xl tracking-[0.25em]" : "text-3xl md:text-4xl tracking-[0.15em]"}`}>
                {locale === "zh" ? "洞悉命运之轨" : "Reveal Your Destiny"}
              </motion.h1>
              
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="mb-12 text-sm leading-8 text-zinc-400 md:text-base max-w-lg mx-auto">
                {locale === "zh" 
                  ? "穿透迷雾，聆听星界的低语。通过专属的神谕结界，记录并解析你每一次的塔罗启示。在这里，每一张牌都是你潜意识的倒影。" 
                  : "Pierce through the fog and listen to the whispers of the astral plane. Record and decipher your tarot revelations in your exclusive sanctuary."}
              </motion.p>
              
              <motion.button 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }}
                onClick={() => setShowAuthForm(true)} 
                className="group relative overflow-hidden rounded-full border border-amber-400/30 bg-gradient-to-b from-violet-900/60 to-black px-10 py-4 text-sm font-medium tracking-[0.2em] text-amber-100 shadow-[0_0_40px_-10px_rgba(167,139,250,0.3)] transition-all duration-500 hover:border-amber-300/60 hover:shadow-[0_0_60px_-10px_rgba(250,204,21,0.4)] active:scale-95"
              >
                <span className="relative z-10">{locale === "zh" ? "开启奥秘之门" : "ENTER THE SANCTUARY"}</span>
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.15),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </motion.button>
            </motion.div>
          ) : (
            // 🔐 第二阶段：表单页
            <motion.div 
              key="auth-form"
              initial={{ opacity: 0, y: 40 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 text-center"
            >

              <div className="mb-8 cursor-pointer" onClick={() => setShowAuthForm(false)}>
                <div className="text-3xl text-violet-400/80 hover:text-violet-300 hover:drop-shadow-[0_0_15px_rgba(167,139,250,0.5)] transition-all">✣</div>
              </div>

              <h2 className={`font-light text-zinc-100 ${locale === "zh" ? "text-3xl tracking-[0.3em]" : "text-2xl tracking-[0.15em]"}`}>
                {isSignUp ? (locale === "zh" ? "创立契约" : "Create Covenant") : (locale === "zh" ? "验证身份" : "Verify Identity")}
              </h2>

              <p className="mb-8 text-sm text-zinc-500 h-10">
                {isSignUp ? (locale === "zh" ? "输入您的邮箱与密码，开启命运书卷" : "Bind your email and password to begin.") : (locale === "zh" ? "欢迎归来，神秘学徒" : "Welcome back, seeker.")}
              </p>

              <form onSubmit={handleEmailAuth} noValidate className="w-full space-y-3 mt-4">
                <input type="email" placeholder={locale === "zh" ? "输入您的邮箱..." : "Enter Email..."} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-full border border-white/10 bg-white/[0.03] px-6 py-3.5 text-center text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all duration-300"/>
                <input type="password" placeholder={isSignUp ? (locale === "zh" ? "设定登录密码 (至少6位)..." : "Set Password (min 6 chars)...") : (locale === "zh" ? "输入密码..." : "Enter Password...")} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-full border border-white/10 bg-white/[0.03] px-6 py-3.5 text-center text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all duration-300"/>

                <button type="submit" disabled={isEmailLoading} className={`w-full rounded-full py-4 text-xs font-bold tracking-widest transition-all duration-300 active:scale-[0.98] disabled:opacity-50 ${isSignUp ? "bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_25px_rgba(139,92,246,0.35)]" : "bg-zinc-100 text-black hover:bg-zinc-200"}`}>
                  {isEmailLoading ? (locale === "zh" ? "仪式进行中..." : "PROCESSING...") : isSignUp ? (locale === "zh" ? "发送验证邮件" : "SEND VERIFICATION EMAIL") : (locale === "zh" ? "登录" : "LOGIN")}
                </button>

                <div className="pt-2 text-center">
                  <button type="button" onClick={() => { setIsSignUp(!isSignUp); setPassword(""); }} className="text-xs text-zinc-500 hover:text-violet-400 transition-colors underline underline-offset-4">
                    {isSignUp ? (locale === "zh" ? "已有账号？去登录" : "Already have an account? Log in") : (locale === "zh" ? "初来乍到？点击创建新账号" : "New here? Sign up to create account")}
                  </button>
                </div>
              </form>

              <div className="my-6 flex w-full items-center justify-center gap-3 text-[10px] text-zinc-700 tracking-widest">
                <div className="h-[1px] w-full bg-white/5" /><span>{locale === "zh" ? "或" : "OR"}</span><div className="h-[1px] w-full bg-white/5" />
              </div>

              <button type="button" onClick={loginWithGoogle} className="group relative flex items-center justify-center gap-3 w-full overflow-hidden rounded-full border border-white/5 bg-white/[0.03] px-8 py-4.5 text-xs font-medium tracking-widest text-zinc-300 transition-all duration-300 hover:bg-white/[0.08] hover:text-white active:scale-[0.98]">

                <svg className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>

                {locale === "zh" ? "用GOOGLE账号登录" : "CONTINUE WITH GOOGLE"}

              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 已登录主界面
  return (
    <div className={`relative flex flex-col overflow-x-hidden bg-[#05030a] font-sans text-zinc-50 ${appStage === "reading" ? "min-h-screen overflow-y-auto" : "h-screen overflow-hidden w-full fixed inset-0"}`}>
      <div className={`pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_25%,rgba(140,70,255,0.25),transparent_60%)] transition-opacity duration-700 ${appStage === "asking" ? "opacity-40" : "opacity-100"}`} />

      {/* 左上角用户入口，点击唤出侧边栏 */}
      <div className="fixed left-4 top-4 z-[90]">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-2.5 rounded-full border border-white/15 bg-black/45 p-1.5 pr-4 backdrop-blur-md hover:bg-white/10 transition-colors shadow-lg"
        >
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-violet-600 border border-white/20 flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-medium text-zinc-200 max-w-[90px] truncate">
            {user.user_metadata?.full_name || user.email?.split('@')[0] || "已登录"}
          </span>
          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* 右上角语言切换器 */}
      <div className="fixed right-4 top-4 z-[90] flex gap-2 rounded-full border border-white/15 bg-black/45 p-1 px-2 backdrop-blur-md items-center">
        <button onClick={() => handleSetLocale("en")} className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${locale === "en" ? "bg-violet-600/80 text-white" : "text-zinc-400 hover:text-zinc-200"}`}>EN</button>
        <button onClick={() => handleSetLocale("zh")} className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${locale === "zh" ? "bg-violet-600/80 text-white" : "text-zinc-400 hover:text-zinc-200"}`}>中文</button>
      </div>

      <main className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 pt-6 pb-12 md:py-12 text-center mt-12 md:mt-4 mb-auto md:my-auto mx-auto">
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
                <h1 className="text-3xl font-light tracking-[0.2em] text-zinc-100 sm:text-4xl">{t(locale, "title")}</h1>
                <p className="text-sm leading-relaxed text-zinc-500">{t(locale, "ritualSubtitle")}</p>
              </div>

              <div className="w-full space-y-14 md:space-y-8">
                <label className="sr-only" htmlFor="oracle-question">{t(locale, "questionPlaceholder")}</label>
                <textarea
                  id="oracle-question"
                  rows={4}
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder={t(locale, "questionPlaceholder")}
                  className="w-full resize-none rounded-t-lg border-b border-transparent bg-white/[0.04] px-0 py-3 text-left text-base leading-relaxed text-zinc-100 shadow-[0_1px_0_0_rgba(167,139,250,0.35)] backdrop-blur-md transition-[box-shadow,background-color] duration-500 placeholder:text-zinc-600 focus:border-0 focus:bg-white/[0.06] focus:outline-none focus:ring-0 focus:shadow-[0_2px_24px_rgba(167,139,250,0.25),0_1px_0_0_rgba(250,204,21,0.35)] md:text-lg"
                  autoComplete="off"
                />

                <button type="button" onClick={enterSpread} className="group relative w-full overflow-hidden rounded-full border border-amber-400/25 bg-gradient-to-b from-violet-950/80 to-black px-8 py-4 text-sm font-medium tracking-[0.35em] text-amber-100/95 shadow-[0_0_40px_-12px_rgba(250,204,21,0.45)] transition-[transform,box-shadow,border-color] duration-500 hover:border-amber-300/50 hover:shadow-[0_0_56px_-8px_rgba(250,204,21,0.55)] active:scale-[0.98]">
                  <span className="relative z-10">{t(locale, "enterSpread")}</span>
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(250,204,21,0.12),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="spread-flow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex w-full flex-col items-center">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">{t(locale, "title")}</h1>
              <p className="mt-4 text-sm text-zinc-400">{subtitleMain}</p>

              <div className="w-[250px] max-md:w-[140px] aspect-[25/43] my-6 md:-translate-y-[10px] flex items-center justify-center [perspective:1200px]">
                <AnimatePresence>
                  {!isSelecting && (
                    <motion.div layoutId={clickedIndex !== null ? `fan-card-${clickedIndex}` : "tarot-main-card"} onClick={handleMainCardClick} className={`relative h-full w-full rounded-none [transform-style:preserve-3d] ${!flipped && !isSelecting ? "cursor-pointer transition-shadow hover:shadow-[0_0_30px_rgba(167,139,250,0.3)]" : ""}`} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ layout: { type: "spring", stiffness: 200, damping: 25 }, duration: 0.8 }}>
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-none border border-white/10 bg-[#0a0612] shadow-2xl [backface-visibility:hidden] [transform:translateZ(0)]">
                        <img src="/tarot/维特牌背.jpg" alt={t(locale, "ariaTarotBack")} className="absolute inset-0 h-full w-full object-cover object-center" />
                        <div className="absolute inset-0 bg-black/30" />
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-none border border-white/20 bg-black shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(0.1px)]">
                        <img src={`/tarot/${currentCard}.jpg`} alt={cardLabel} className={`absolute inset-0 h-full w-full object-cover object-center opacity-90 ${isReversed ? "rotate-180" : ""}`} onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1620052579624-b153545faed8?q=80&w=400&auto=format&fit=crop"; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        <div className="relative z-10 mt-auto w-full px-2 pb-3 md:px-6 md:pb-8 text-center leading-tight">
                          <div className="text-[7px] md:text-[10px] tracking-widest md:tracking-[0.3em] text-violet-400 drop-shadow-md">{t(locale, "oracleBadge")}</div>
                          <div className="mt-1 md:mt-2 text-[13px] md:text-2xl font-bold text-white drop-shadow-xl flex flex-col items-center justify-center gap-0.5 md:gap-1">
                            <span>{cardLabel}</span>
                            <span className="text-[10px] md:text-base font-normal text-zinc-300">({orientationLabel})</span>
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
                    <span className={isLoading ? "animate-pulse text-violet-400" : ""}>{readingStatusLabel}</span>
                  </div>
                  
                  {/* 使用防御层，如果遇到错误，只展示重试按钮和优雅提示 */}
                  <div className="min-h-[120px] whitespace-pre-wrap text-left font-serif text-[15px] italic leading-8 text-zinc-200">
                    {isErrorState || (isEnergyRecoveryBlock(completion) && !isLoading) ? (
                      <div className="flex flex-col items-start text-sm text-red-400/80">
                        <p>{locale === "zh" ? "🔮 网络输入波动或占卜受阻，请重新尝试召唤解牌。" : "🔮 The astral connection is disrupted. Please retry reading."}</p>
                        <button type="button" onClick={retryReading} className="mt-4 border border-violet-500/50 px-5 py-2 text-xs text-violet-400">{t(locale, "retryButton")}</button>
                      </div>
                    ) : completion ? completion : isLoading ? null : (
                      <span className="text-zinc-600">{isSelecting ? t(locale, "placeholderSelecting") : !flipped ? t(locale, "placeholderAfterPick") : t(locale, "placeholderThinking")}</span>
                    )}
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 底部散开的牌堆 */}
      {appStage === "selecting" && (
        <div className="tarot-fan-scene min-h-[260px] flex items-center justify-center">
          <div className="tarot-fan-scene__inner">
            {isSelecting && (
              <ul className="tarot-fan-track" key="main-tarot-fan">
                {Array.from({ length: 22 }).map((_, i) => (
                  <motion.li key={`fan-card-${i}`} layoutId={`fan-card-${i}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.02, ease: "easeOut" }} className="tarot-fan-cell cursor-pointer" style={{ "--i": i, visibility: clickedIndex !== null && clickedIndex !== i ? "hidden" : "visible", } as CSSProperties} onClick={() => handleSelectFromFan(i)}>
                    <motion.div className="h-full w-full" initial={{ y: 0 }} whileHover={{ y: -40, scale: 1.1, zIndex: 50 }} transition={{ type: "spring", stiffness: 250, damping: 18 }}>
                      <div className="tarot-fan-face relative h-full w-full overflow-hidden rounded-none shadow-xl">
                        <img src="/tarot/维特牌背.jpg" className="h-full w-full rounded-none object-cover object-center" alt={t(locale, "ariaFanCard")} draggable={false} />
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

      {/* 侧边栏抽屉 UI */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="fixed left-0 top-0 bottom-0 z-[101] w-72 max-w-[80vw] bg-[#0a0612] border-r border-white/10 flex flex-col shadow-2xl">
              <div className="p-8 pb-6 border-b border-white/5 flex flex-col items-center text-center">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} className="w-20 h-20 rounded-full border-2 border-violet-500/30 object-cover shadow-[0_0_20px_rgba(139,92,246,0.2)]" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-violet-900 border-2 border-violet-500/30 flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                    {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="mt-4 text-lg font-medium text-white">{user.user_metadata?.full_name || user.email?.split('@')[0] || "神秘学徒"}</h3>
                <p className="text-xs text-zinc-500 mt-1 truncate w-full">{user.email}</p>
              </div>

              <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                <button 
                  onClick={() => { fetchHistory(); setShowHistory(true); setIsSidebarOpen(false); }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-2xl transition-colors text-left"
                >
                  <span className="text-lg">📖</span>{locale === "zh" ? "命运日志 (历史记录)" : "Destiny Log (History)"}
                </button>
                <button className="w-full flex items-center gap-4 px-4 py-3.5 text-sm text-zinc-500 hover:bg-white/5 rounded-2xl transition-colors text-left cursor-not-allowed">
                  <span className="text-lg opacity-50">🔮</span>{locale === "zh" ? "牌阵解锁 (敬请期待)" : "Spreads (Coming Soon)"}
                </button>
              </div>

              <div className="p-4 border-t border-white/5">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  {locale === "zh" ? "登出" : "Logout"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 交互式可展开的全屏历史记录弹出层 */}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-0 z-[120] bg-[#05030a] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-[#05030a]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-light tracking-widest text-zinc-100">{locale === "zh" ? "命运日志" : "Destiny Log"}</h2>
              <button onClick={() => { setShowHistory(false); setExpandedLogId(null); }} className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
              {isLoadingHistory ? (
                <div className="flex justify-center py-20 text-violet-400 animate-pulse">{locale === "zh" ? "正在翻阅阿卡西记录..." : "Retrieving Akashic Records..."}</div>
              ) : historyLogs.length === 0 ? (
                <div className="flex flex-col items-center text-center py-20 text-zinc-500">
                  <div className="text-4xl mb-4">🪶</div><p>{locale === "zh" ? "你的命运之书还是一片空白" : "Your Book of Destiny is empty"}</p>
                </div>
              ) : (
                historyLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <motion.div layout="position" key={log.id} onClick={() => setExpandedLogId(isExpanded ? null : log.id)} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-4 cursor-pointer transition-colors hover:bg-white/[0.06]">
                      <div className={`flex justify-between items-start ${isExpanded ? "border-b border-white/5 pb-4" : ""}`}>
                        <div>
                          <div className="text-xs text-zinc-500 mb-1 font-mono tracking-wider">{formatDate(log.created_at)}</div>
                          <div className="text-lg font-bold text-violet-300 drop-shadow-md">
                            {locale === "en" ? getCardDisplayName(log.card_name, "en") : log.card_name} 
                            <span className="text-xs ml-2 font-normal text-zinc-400 border border-white/10 px-2 py-0.5 rounded-full bg-black/30">{log.is_reversed ? (locale === "zh" ? "逆位" : "Reversed") : (locale === "zh" ? "正位" : "Upright")}</span>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-zinc-500 mt-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </motion.div>
                      </div>
                      {log.question && (
                        <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                          <div className="text-[10px] text-zinc-500 mb-1">{locale === "zh" ? "所测之惑" : "Question"}</div>
                          <div className={`text-sm text-zinc-200 leading-relaxed italic ${!isExpanded ? "line-clamp-2" : ""}`}>"{log.question}"</div>
                        </div>
                      )}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="pt-2">
                              <div className="text-[10px] text-zinc-500 mb-2">{locale === "zh" ? "神谕启示" : "Revelation"}</div>
                              <div className="text-sm text-zinc-300 leading-7 font-serif whitespace-pre-wrap">{log.ai_reading}</div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}