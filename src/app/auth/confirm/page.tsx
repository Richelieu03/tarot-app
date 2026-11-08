// src/app/auth/confirm/page.tsx
// Landing page for the sign-up verification email.
// The email links here (not to *.supabase.co, which is often blocked in mainland China);
// we verify the token through our own /sb proxy, then send the user back to where they were.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import type { EmailOtpType } from "@supabase/supabase-js";

type Status = "verifying" | "error";

/** Only allow same-site paths, so the link can't bounce people to another site */
function safeNext(raw: string | null): string {
  if (!raw) return "/";
  try {
    const url = new URL(raw, window.location.origin);
    return url.origin === window.location.origin ? url.pathname + url.search + url.hash : "/";
  } catch {
    return "/";
  }
}

export default function AuthConfirmPage() {
  const [status, setStatus] = useState<Status>("verifying");
  const [isZh, setIsZh] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the browser language once on mount
    setIsZh(!navigator.language.toLowerCase().startsWith("en"));
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = (params.get("type") || "email") as EmailOtpType;
    const next = safeNext(params.get("next"));

    if (!tokenHash) {
      // Old-style email (default Supabase template): the session arrives in the URL hash and
      // supabase-js picks it up on load — just continue if that worked
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) window.location.replace(next);
        else setStatus("error");
      });
      return;
    }
    supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error }) => {
      if (error) {
        console.error("Email verification failed:", error.message);
        setStatus("error");
        return;
      }
      // Full navigation so every page picks up the new session from storage
      window.location.replace(next);
    });
  }, []);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-[#05030a] px-6 text-center">
      {status === "verifying" ? (
        <>
          <div className="animate-pulse text-3xl text-amber-200">✦</div>
          <p className="text-sm tracking-[0.2em] text-zinc-300">
            {isZh ? "正在确认你的星界契约…" : "Confirming your astral bond…"}
          </p>
        </>
      ) : (
        <>
          <p className="max-w-sm text-sm leading-7 text-zinc-300">
            {isZh
              ? "验证链接已失效或已被使用。如果你已经验证过，直接登录即可；否则请重新注册以获取新的验证邮件。"
              : "This link has expired or was already used. If you've verified before, just log in; otherwise sign up again for a new email."}
          </p>
          <Link
            href="/"
            className="rounded-full border border-violet-400/40 px-6 py-2.5 text-xs tracking-[0.15em] text-violet-200 transition-colors hover:bg-violet-500/10"
          >
            {isZh ? "返回神谕之门" : "Back to the Oracle Gate"}
          </Link>
        </>
      )}
    </main>
  );
}
