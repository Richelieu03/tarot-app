// src/components/ProfileModal.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Locale } from "../lib/locale";
import {
  FOCUS_AREAS, MBTI_TYPES, NICKNAME_MAX, SITUATION_MAX, ZODIAC_SIGNS,
  sanitizeProfile, type TarotProfile,
} from "../lib/profile";
import { track } from "../lib/analytics";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  locale: Locale;
}

/** Form for the tarot profile; saved to Supabase user_metadata.profile */
export default function ProfileModal({ isOpen, onClose, user, locale }: ProfileModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          {/* Mounted fresh each time it opens, so the form starts from the saved profile */}
          <ProfileForm user={user} locale={locale} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProfileForm({ user, locale, onClose }: { user: User; locale: Locale; onClose: () => void }) {
  const zh = locale === "zh";
  const [profile, setProfile] = useState<TarotProfile>(() => sanitizeProfile(user.user_metadata?.profile));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const set = <K extends keyof TarotProfile>(key: K, value: TarotProfile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const toggleFocus = (key: string) => {
    const cur = profile.focus ?? [];
    set("focus", cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const clean = sanitizeProfile(profile);
    const { error } = await supabase.auth.updateUser({ data: { profile: clean } });
    setSaving(false);
    if (error) {
      setMessage(zh ? `保存失败：${error.message}` : `Couldn't save: ${error.message}`);
      return;
    }
    track("profile_saved", {
      zodiac: !!clean.zodiac, mbti: !!clean.mbti, focus: clean.focus?.length ?? 0, situation: !!clean.situation,
    });
    setMessage(zh ? "档案已保存，之后的解读会参考它" : "Saved — future readings will draw on it");
    setTimeout(onClose, 900);
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none";
  const labelCls = "mb-2 block text-xs tracking-widest text-zinc-400";

  return (
    <motion.div
      initial={{ scale: 0.96, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.96, y: 10 }}
      onClick={(e) => e.stopPropagation()}
      className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-violet-500/30 bg-[#0d0818] p-6 shadow-2xl"
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-light tracking-[0.2em] text-zinc-100">{zh ? "我的档案" : "My Profile"}</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {zh ? "全部选填。填写后，AI 解读会结合你的特质与近况。" : "All optional. Readings will take your traits and situation into account."}
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-xl text-zinc-500 transition-colors hover:text-zinc-200" aria-label={zh ? "关闭" : "Close"}>
          ✣
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelCls}>{zh ? "昵称" : "Nickname"}</label>
          <input
            className={inputCls}
            maxLength={NICKNAME_MAX}
            value={profile.nickname ?? ""}
            onChange={(e) => set("nickname", e.target.value)}
            placeholder={zh ? "想被怎么称呼" : "What should we call you"}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{zh ? "星座" : "Zodiac sign"}</label>
            <select className={inputCls} value={profile.zodiac ?? ""} onChange={(e) => set("zodiac", e.target.value || undefined)}>
              <option value="">{zh ? "未选择" : "Not set"}</option>
              {ZODIAC_SIGNS.map((z) => (
                <option key={z.key} value={z.key}>{zh ? z.zh : z.en}（{z.range}）</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>MBTI</label>
            <select className={inputCls} value={profile.mbti ?? ""} onChange={(e) => set("mbti", e.target.value || undefined)}>
              <option value="">{zh ? "不确定" : "Not sure"}</option>
              {MBTI_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>{zh ? "最近关注（可多选）" : "Current focus (pick any)"}</label>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map((a) => {
              const on = profile.focus?.includes(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleFocus(a.key)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                    on ? "border-violet-400/60 bg-violet-500/20 text-violet-100" : "border-white/10 text-zinc-400 hover:border-white/25"
                  }`}
                >
                  {zh ? a.zh : a.en}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelCls}>
            {zh ? "一句话近况" : "Life lately, in a sentence"}
            <span className="ml-2 text-zinc-600">{(profile.situation ?? "").length}/{SITUATION_MAX}</span>
          </label>
          <textarea
            rows={3}
            maxLength={SITUATION_MAX}
            className={`${inputCls} resize-none`}
            value={profile.situation ?? ""}
            onChange={(e) => set("situation", e.target.value)}
            placeholder={zh ? "例如：在准备期末，压力有点大" : "e.g. Studying for finals, feeling the pressure"}
          />
        </div>
      </div>

      {message && <p className="mt-4 text-center text-xs text-amber-300/90">{message}</p>}

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-5 py-2.5 text-xs tracking-widest text-zinc-400 hover:bg-white/5">
          {zh ? "取消" : "Cancel"}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-violet-600 px-6 py-2.5 text-xs tracking-widest text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? (zh ? "保存中…" : "Saving…") : zh ? "保存档案" : "Save"}
        </button>
      </div>
    </motion.div>
  );
}
