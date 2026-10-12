export const getAvatarColor = (email?: string) => {
  const colors = [
    "bg-violet-900/50 border-violet-500/20",
    "bg-amber-900/50 border-amber-500/20",
    "bg-emerald-900/50 border-emerald-500/20",
    "bg-blue-900/50 border-blue-500/20",
  ];
  if (!email) return colors[0];
  const hash = email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/** First visible character, uppercased. Array.from keeps emoji/CJK surrogate pairs intact. */
export const getInitial = (text?: string | null, fallback = "🔮") =>
  (Array.from(text?.trim() || "")[0] ?? fallback).toUpperCase();
