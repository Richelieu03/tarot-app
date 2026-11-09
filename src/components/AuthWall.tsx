// src/components/AuthWall.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import type { Locale } from "../lib/locale";

interface AuthWallProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isOpen: boolean;       
  onClose: () => void;   
  subtitle?: string;     
  /** Where Google login / the verification email should land. Carries a guest's pending draw. */
  redirectTo?: string;
}

type Notice = { kind: "error" | "success"; text: string } | null;

/** "code" = email one-time code (default, no password, no link to click); "password" = classic email + password */
type AuthMethod = "code" | "password";

/** Seconds before another code can be requested (matches Supabase's default per-email send interval) */
const RESEND_SECONDS = 60;

/** Turns common Supabase auth errors into friendlier wording; anything else falls back to the raw message */
function authErrorText(message: string, locale: Locale): string {
  const m = message.toLowerCase();
  const zh = locale === "zh";
  if (m.includes("invalid login credentials")) return zh ? "邮箱或密码不正确" : "Incorrect email or password.";
  if (m.includes("email not confirmed")) return zh ? "邮箱还未验证，请先点击验证邮件里的链接" : "Please confirm your email first — check your inbox for the link.";
  if (m.includes("already registered")) return zh ? "这个邮箱已经注册过了，请直接登录" : "This email is already registered. Please log in.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) return zh ? "操作太频繁，请稍后再试" : "Too many attempts. Please try again later.";
  if (m.includes("expired") || (m.includes("invalid") && m.includes("token"))) return zh ? "验证码错误或已过期，请重新获取" : "The code is wrong or has expired. Please request a new one.";
  return message;
}

export default function AuthWall({ 
  locale, 
  setLocale, 
  isOpen, 
  onClose,
  subtitle,
  redirectTo,
}: AuthWallProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  // Inline message inside the dialog (replaces browser alert())
  const [notice, setNotice] = useState<Notice>(null);

  // Email-code (OTP) login state
  const [method, setMethod] = useState<AuthMethod>("code");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const confirmRedirect = () =>
    `${window.location.origin}/auth/confirm?next=${encodeURIComponent(redirectTo ?? window.location.pathname)}`;

  /** Sends a one-time code. Creates the account on first use, so this doubles as sign-up. */
  const sendCode = async () => {
    const targetEmail = email.trim();
    if (!targetEmail || cooldown > 0) return;
    setNotice(null);
    setIsEmailLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      // Only used if the email template still contains a link; the code alone is enough
      options: { shouldCreateUser: true, emailRedirectTo: confirmRedirect() },
    });
    setIsEmailLoading(false);
    if (error) {
      setNotice({ kind: "error", text: `${locale === "zh" ? "发送失败：" : "Could not send code: "}${authErrorText(error.message, locale)}` });
      return;
    }
    setCodeSent(true);
    setCode("");
    setCooldown(RESEND_SECONDS);
    setNotice({
      kind: "success",
      text: locale === "zh"
        ? `验证码已发送至 ${targetEmail}，没收到请看看垃圾箱`
        : `Code sent to ${targetEmail}. Check your spam folder if it's not there.`,
    });
  };

  /** Verifies the code; on success the auth listener in the parent picks up the session on this same page */
  const verifyCode = async () => {
    const token = code.replace(/\s/g, "");
    if (!token) return;
    setNotice(null);
    setIsEmailLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: "email" });
    setIsEmailLoading(false);
    if (error) {
      setNotice({ kind: "error", text: authErrorText(error.message, locale) });
    } else {
      setCode("");
      setCodeSent(false);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void (codeSent ? verifyCode() : sendCode());
  };

  const switchMethod = (next: AuthMethod) => {
    setMethod(next);
    setIsSignUp(false);
    setPassword("");
    setCode("");
    setCodeSent(false);
    setNotice(null);
  };

  const loginWithGoogle = async () => {
    const redirectUrl = redirectTo ?? (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl }
    });
    if (error) setNotice({ kind: "error", text: `${locale === "zh" ? "登录失败：" : "Login failed: "}${authErrorText(error.message, locale)}` });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim();
    const targetPassword = password.trim();
    
    if (!targetEmail || !targetPassword) return;
    if (targetPassword.length < 6) {
      setNotice({ kind: "error", text: locale === "zh" ? "🔒 密码长度至少需要 6 位哦" : "🔒 Password must be at least 6 characters." });
      return;
    }
    setNotice(null);

    setIsEmailLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: targetEmail,
        password: targetPassword,
        // The verification link often opens in a different browser (e.g. WeChat → Safari),
        // so the drawn card travels in this URL instead of relying on localStorage
        // The "Confirm signup" email template links to /auth/confirm on this site (not *.supabase.co),
        // which verifies the token and then continues to `next`.
        options: { emailRedirectTo: confirmRedirect() },
      });
      setIsEmailLoading(false);

      if (error) {
        setNotice({ kind: "error", text: `${locale === "zh" ? "注册失败：" : "Sign up failed: "}${authErrorText(error.message, locale)}` });
      } else {
        setNotice({
          kind: "success",
          text: locale === "zh" 
            ? "🔮 验证邮件已发送！请前往您的邮箱点击激活链接。" 
            : "🔮 Verification email sent! Please check your inbox and click the activation link.",
        });
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
        setNotice({ kind: "error", text: `${locale === "zh" ? "登录失败：" : "Login failed: "}${authErrorText(error.message, locale)}` });
      } else {
        setPassword("");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          // 🌟 用原生渲染的深邃半透明层替代滤镜，稳如泰山
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4"
        >
          <motion.div 
            initial={{ scale: 0.96, y: 8 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.96, y: 8 }} 
            // 🌟 采用双重渐变与透光边框，完美还原高级玻璃质感，绝不发黑
            className="relative w-full max-w-md rounded-2xl border border-violet-500/30 p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
            style={{
              background: "linear-gradient(135deg, rgba(26, 15, 46, 0.92) 0%, rgba(10, 6, 18, 0.96) 100%)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
            }}
          >
            {/* 右上角 ✣ 退出键 */}
            <button 
              type="button" 
              onClick={() => { setNotice(null); onClose(); }} 
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-all duration-300 hover:bg-white/10 hover:text-amber-200 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] cursor-pointer"
              title={locale === "zh" ? "关闭" : "Close"}
            >
              <div className="text-xl transition-transform duration-500 hover:rotate-45">✣</div>
            </button>

            {/* 如果有副标题则展示 */}
            {subtitle && (
              <div className="mb-4">
                <span className="text-xs uppercase tracking-[0.2em] text-amber-400/80">
                  {subtitle}
                </span>
              </div>
            )}

            {/* 表单主体 */}
            <div className="w-full flex flex-col items-center text-center font-sans text-zinc-50">
              <h2 className={`font-light text-zinc-100 ${locale === "zh" ? "text-3xl tracking-[0.25em]" : "text-2xl tracking-[0.15em]"}`}>
                {isSignUp ? (locale === "zh" ? "创立契约" : "Create Covenant") : (locale === "zh" ? "验证身份" : "Verify Identity")}
              </h2>

              <p className="mb-6 mt-3 text-sm text-zinc-400">
                {isSignUp ? (locale === "zh" ? "输入您的邮箱与密码，开启命运书卷" : "Bind your email and password to begin.") : (locale === "zh" ? "欢迎归来，神秘学徒" : "Welcome back, seeker.")}
              </p>

              <AnimatePresence>
                {notice && (
                  <motion.p
                    key={notice.text}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role={notice.kind === "error" ? "alert" : "status"}
                    className={`mb-2 w-full rounded-xl border px-4 py-3 text-xs leading-5 ${
                      notice.kind === "error"
                        ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
                        : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                    }`}
                  >
                    {notice.text}
                  </motion.p>
                )}
              </AnimatePresence>

              {method === "code" ? (
              <form onSubmit={handleCodeSubmit} className="w-full space-y-4 mt-2">
                <input type="email" autoComplete="email" readOnly={codeSent} placeholder={locale === "zh" ? "输入您的邮箱..." : "Enter Email..."} value={email} onChange={(e) => { setEmail(e.target.value); if (notice?.kind === "error") setNotice(null); }} className={`w-full rounded-full border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-violet-500/35 transition-all duration-300 ${codeSent ? "opacity-60" : ""}`}/>

                {codeSent && (
                  <input type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus maxLength={10} placeholder={locale === "zh" ? "输入邮件里的验证码" : "Enter the code from your email"} value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); if (notice?.kind === "error") setNotice(null); }} className="w-full rounded-full border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-lg tracking-[0.5em] text-zinc-100 placeholder:text-sm placeholder:tracking-normal placeholder:text-zinc-500 focus:border-violet-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-violet-500/35 transition-all duration-300"/>
                )}

                <button type="submit" disabled={isEmailLoading || (!codeSent && cooldown > 0)} className="w-[220px] rounded-full bg-zinc-100 py-4 text-xs font-bold tracking-widest text-black transition-all duration-300 hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50">
                  {isEmailLoading
                    ? (locale === "zh" ? "仪式进行中..." : "PROCESSING...")
                    : codeSent
                      ? (locale === "zh" ? "验证并登录" : "VERIFY & LOGIN")
                      : (locale === "zh" ? "发送验证码" : "SEND CODE")}
                </button>

                {codeSent && (
                  <div className="flex items-center justify-center gap-5 pt-1 text-[11px]">
                    <button type="button" disabled={cooldown > 0 || isEmailLoading} onClick={() => void sendCode()} className="text-zinc-400 underline underline-offset-4 transition-colors hover:text-violet-400 disabled:no-underline disabled:opacity-60 disabled:hover:text-zinc-400">
                      {cooldown > 0
                        ? (locale === "zh" ? `重新发送 (${cooldown}s)` : `Resend (${cooldown}s)`)
                        : (locale === "zh" ? "重新发送" : "Resend code")}
                    </button>
                    <button type="button" onClick={() => { setCodeSent(false); setCode(""); setNotice(null); }} className="text-zinc-400 underline underline-offset-4 transition-colors hover:text-violet-400">
                      {locale === "zh" ? "换个邮箱" : "Change email"}
                    </button>
                  </div>
                )}

                <div className="pt-2 text-center">
                  <button type="button" onClick={() => switchMethod("password")} className="text-[11px] text-zinc-400 hover:text-violet-400 transition-colors underline underline-offset-4">
                    {locale === "zh" ? "用密码登录 / 注册" : "Use a password instead"}
                  </button>
                </div>
              </form>
              ) : (
              <form onSubmit={handleEmailAuth} className="w-full space-y-4 mt-2">
                <input type="email" placeholder={locale === "zh" ? "输入您的邮箱..." : "Enter Email..."} value={email} onChange={(e) => { setEmail(e.target.value); if (notice?.kind === "error") setNotice(null); }} className="w-full rounded-full border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-violet-500/35 transition-all duration-300"/>
                <input type="password" placeholder={isSignUp ? (locale === "zh" ? "设定登录密码 (至少6位)..." : "Set Password (min 6 chars)...") : (locale === "zh" ? "输入密码..." : "Enter Password...")} value={password} onChange={(e) => { setPassword(e.target.value); if (notice?.kind === "error") setNotice(null); }} className="w-full rounded-full border border-white/10 bg-white/[0.04] px-6 py-4 text-center text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-violet-500/35 transition-all duration-300"/>

                <button type="submit" disabled={isEmailLoading} className={`w-[220px] rounded-full py-4 text-xs font-bold tracking-widest transition-all duration-300 active:scale-[0.98] disabled:opacity-50 ${isSignUp ? "bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_25px_rgba(139,92,246,0.35)]" : "bg-zinc-100 text-black hover:bg-zinc-200"}`}>
                  {isEmailLoading ? (locale === "zh" ? "仪式进行中..." : "PROCESSING...") : isSignUp ? (locale === "zh" ? "发送验证邮件" : "SEND VERIFICATION EMAIL") : (locale === "zh" ? "登录" : "LOGIN")}
                </button>

                <div className="pt-2 text-center">
                  <button type="button" onClick={() => { setIsSignUp(!isSignUp); setPassword(""); setNotice(null); }} className="text-[11px] text-zinc-400 hover:text-violet-400 transition-colors underline underline-offset-4">
                    {isSignUp ? (locale === "zh" ? "已有账号？去登录" : "Already have an account? Log in") : (locale === "zh" ? "初来乍到？点击创建新账号" : "New here? Sign up to create account")}
                  </button>
                </div>

                <div className="text-center">
                  <button type="button" onClick={() => switchMethod("code")} className="text-[11px] text-zinc-400 hover:text-violet-400 transition-colors underline underline-offset-4">
                    {locale === "zh" ? "用邮箱验证码登录（免密码）" : "Log in with an email code (no password)"}
                  </button>
                </div>
              </form>
              )}

              <div className="my-6 flex w-full items-center justify-center gap-3 text-[10px] text-zinc-600 tracking-widest">
                <div className="h-[1px] w-full bg-white/10" /><span>{locale === "zh" ? "或" : "OR"}</span><div className="h-[1px] w-full bg-white/10" />
              </div>

              <button type="button" onClick={loginWithGoogle} className="group relative flex items-center justify-center gap-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.04] px-8 py-4.5 text-xs font-medium tracking-widest text-zinc-200 transition-all duration-300 hover:bg-white/[0.08] hover:text-white active:scale-[0.98]">
                <svg className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                {locale === "zh" ? "用GOOGLE账号登录" : "CONTINUE WITH GOOGLE"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}