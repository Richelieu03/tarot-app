// src/components/AuthWall.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import type { Locale } from "../lib/locale";

interface AuthWallProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export default function AuthWall({ locale, setLocale }: AuthWallProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

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

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#05030a] font-sans text-zinc-50 selection:bg-violet-500/30">
      
      {/* 动态星光背景 */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]" />
        <motion.div animate={{ rotate: 360, scale: [1, 1.05, 1] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute h-[800px] w-[800px] rounded-full border border-white/5 opacity-20" />
        <motion.div animate={{ rotate: -360, scale: [1, 1.1, 1] }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute h-[1200px] w-[1200px] rounded-full border border-violet-500/5 opacity-10" />
      </div>

      {/* 语言切换器 */}
      <div className="fixed right-4 top-4 z-[100] flex gap-2 rounded-full border border-white/10 bg-black/40 p-1 px-2 backdrop-blur-md items-center">
        <button onClick={() => setLocale("en")} className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${locale === "en" ? "bg-violet-600/80 text-white" : "text-zinc-400 hover:text-zinc-200"}`}>EN</button>
        <button onClick={() => setLocale("zh")} className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${locale === "zh" ? "bg-violet-600/80 text-white" : "text-zinc-400 hover:text-zinc-200"}`}>中文</button>
      </div>

      <AnimatePresence mode="wait">
        {!showAuthForm ? (
          // 🌠 落地页
          <motion.div 
            key="landing-hero"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="relative z-10 flex flex-col items-center px-6 text-center max-w-2xl w-full"
          >
            <div className="text-5xl mb-8 animate-pulse">🔮</div>
            
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
          // 🔐 表单页
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