// src/lib/daily-scores.ts
// Six-axis daily fortune scores (0–10) for 每日一牌.
//   score = card base (upright / reversed)
//         + zodiac element vs card element
//         + "本命牌" bonus when the card is the major arcana of the user's sign
//         + a small per-user, per-day jitter (-1 / 0 / +1, fixed for the whole day)
// Pure and deterministic: the page uses it to draw the chart, the API uses it to brief the AI.
// MBTI deliberately does NOT change scores — it only shapes the AI's advice (see the API prompt).

import type { Locale } from "./locale";
import type { TarotProfile } from "./profile";
import type { TarotCard } from "./tarot-meanings";

export const DIMENSIONS = ["money", "love", "career", "luck", "state", "social"] as const;
export type Dimension = (typeof DIMENSIONS)[number];
export type Scores = Record<Dimension, number>;

const LABELS: Record<Dimension, { zh: string; en: string }> = {
  money: { zh: "金钱", en: "Money" },
  love: { zh: "情感", en: "Love" },
  career: { zh: "事业", en: "Career" },
  luck: { zh: "奇遇", en: "Serendipity" },
  state: { zh: "状态", en: "Energy" },
  social: { zh: "人际", en: "Social" },
};

// Base scores, order: [money, love, career, luck, state, social]
type Row = [number, number, number, number, number, number];
const BASE: Record<string, { up: Row; rev: Row }> = {
  "major-00": { up: [5, 6, 6, 8, 8, 7], rev: [3, 4, 3, 4, 5, 5] },
  "major-01": { up: [7, 6, 9, 7, 8, 7], rev: [4, 4, 4, 3, 5, 4] },
  "major-02": { up: [5, 6, 6, 6, 7, 5], rev: [4, 3, 4, 3, 4, 3] },
  "major-03": { up: [8, 9, 6, 7, 8, 8], rev: [5, 4, 4, 4, 4, 5] },
  "major-04": { up: [8, 5, 9, 5, 7, 6], rev: [4, 3, 4, 3, 5, 3] },
  "major-05": { up: [6, 6, 7, 5, 6, 8], rev: [4, 4, 4, 4, 5, 4] },
  "major-06": { up: [6, 10, 6, 7, 7, 8], rev: [4, 3, 4, 4, 5, 4] },
  "major-07": { up: [7, 5, 9, 7, 8, 6], rev: [4, 3, 4, 3, 4, 4] },
  "major-08": { up: [6, 7, 7, 6, 9, 7], rev: [4, 4, 4, 4, 3, 4] },
  "major-09": { up: [5, 4, 6, 5, 6, 3], rev: [4, 3, 4, 4, 4, 3] },
  "major-10": { up: [8, 7, 8, 10, 7, 7], rev: [4, 4, 4, 2, 5, 5] },
  "major-11": { up: [7, 6, 8, 5, 7, 7], rev: [4, 4, 4, 3, 5, 4] },
  "major-12": { up: [4, 5, 4, 5, 5, 5], rev: [3, 3, 3, 3, 3, 4] },
  "major-13": { up: [4, 4, 5, 5, 5, 5], rev: [3, 3, 3, 3, 3, 4] },
  "major-14": { up: [7, 7, 7, 6, 9, 8], rev: [4, 4, 4, 4, 3, 4] },
  "major-15": { up: [6, 5, 5, 4, 3, 4], rev: [5, 6, 5, 4, 6, 5] },
  "major-16": { up: [2, 3, 2, 3, 3, 3], rev: [4, 4, 3, 5, 4, 4] },
  "major-17": { up: [7, 8, 7, 9, 9, 8], rev: [4, 4, 4, 3, 3, 5] },
  "major-18": { up: [4, 5, 3, 4, 3, 4], rev: [5, 5, 6, 5, 6, 5] },
  "major-19": { up: [9, 9, 9, 9, 10, 9], rev: [6, 6, 6, 5, 5, 7] },
  "major-20": { up: [6, 7, 8, 7, 7, 7], rev: [4, 4, 4, 4, 3, 5] },
  "major-21": { up: [9, 8, 9, 8, 9, 9], rev: [5, 5, 4, 5, 5, 6] },

  "wands-01": { up: [6, 6, 8, 7, 8, 6], rev: [4, 4, 3, 4, 3, 5] },
  "wands-02": { up: [6, 5, 7, 6, 6, 5], rev: [4, 4, 3, 5, 4, 4] },
  "wands-03": { up: [7, 5, 8, 7, 7, 6], rev: [4, 4, 4, 3, 4, 4] },
  "wands-04": { up: [7, 8, 7, 7, 8, 9], rev: [5, 4, 5, 4, 5, 4] },
  "wands-05": { up: [4, 4, 5, 4, 4, 3], rev: [5, 5, 5, 5, 6, 4] },
  "wands-06": { up: [7, 6, 9, 8, 8, 8], rev: [4, 4, 3, 4, 4, 3] },
  "wands-07": { up: [5, 4, 6, 4, 5, 4], rev: [4, 3, 4, 3, 3, 3] },
  "wands-08": { up: [7, 6, 8, 8, 7, 6], rev: [4, 4, 4, 3, 4, 4] },
  "wands-09": { up: [5, 4, 6, 4, 4, 4], rev: [3, 3, 3, 3, 2, 3] },
  "wands-10": { up: [4, 3, 5, 3, 2, 4], rev: [5, 4, 5, 4, 5, 5] },
  "wands-page": { up: [5, 6, 6, 7, 7, 7], rev: [4, 4, 4, 3, 4, 5] },
  "wands-knight": { up: [6, 6, 7, 7, 8, 6], rev: [4, 3, 4, 3, 4, 4] },
  "wands-queen": { up: [7, 7, 7, 6, 8, 8], rev: [4, 4, 4, 4, 4, 3] },
  "wands-king": { up: [8, 6, 9, 6, 8, 7], rev: [4, 4, 4, 4, 4, 3] },

  "cups-01": { up: [6, 9, 6, 8, 8, 8], rev: [4, 3, 4, 4, 4, 4] },
  "cups-02": { up: [6, 10, 6, 7, 7, 8], rev: [4, 3, 4, 4, 5, 4] },
  "cups-03": { up: [6, 8, 6, 7, 8, 10], rev: [4, 4, 4, 4, 4, 3] },
  "cups-04": { up: [5, 4, 5, 4, 4, 4], rev: [5, 5, 5, 6, 6, 5] },
  "cups-05": { up: [4, 3, 4, 3, 3, 4], rev: [5, 6, 5, 4, 5, 5] },
  "cups-06": { up: [5, 8, 5, 7, 7, 8], rev: [4, 4, 4, 4, 5, 3] },
  "cups-07": { up: [4, 5, 4, 5, 4, 5], rev: [5, 5, 6, 4, 5, 5] },
  "cups-08": { up: [4, 4, 5, 4, 4, 4], rev: [4, 3, 4, 4, 4, 5] },
  "cups-09": { up: [8, 8, 7, 9, 8, 8], rev: [5, 4, 5, 4, 4, 4] },
  "cups-10": { up: [7, 10, 6, 8, 8, 9], rev: [5, 4, 5, 4, 5, 4] },
  "cups-page": { up: [5, 8, 5, 7, 7, 7], rev: [4, 3, 4, 4, 4, 5] },
  "cups-knight": { up: [5, 9, 5, 7, 7, 7], rev: [4, 3, 4, 4, 5, 4] },
  "cups-queen": { up: [6, 8, 6, 6, 7, 8], rev: [4, 4, 4, 4, 3, 4] },
  "cups-king": { up: [7, 7, 7, 6, 8, 8], rev: [4, 3, 4, 4, 4, 5] },

  "swords-01": { up: [6, 5, 8, 6, 7, 5], rev: [4, 3, 4, 3, 4, 3] },
  "swords-02": { up: [5, 4, 5, 4, 4, 4], rev: [4, 4, 4, 3, 3, 5] },
  "swords-03": { up: [5, 1, 4, 3, 3, 4], rev: [5, 4, 5, 4, 4, 5] },
  "swords-04": { up: [5, 5, 4, 5, 6, 4], rev: [4, 4, 4, 4, 3, 4] },
  "swords-05": { up: [4, 3, 4, 3, 4, 2], rev: [5, 5, 5, 4, 5, 6] },
  "swords-06": { up: [5, 5, 5, 6, 6, 5], rev: [4, 4, 4, 3, 4, 5] },
  "swords-07": { up: [4, 3, 5, 3, 4, 3], rev: [5, 5, 5, 4, 6, 5] },
  "swords-08": { up: [3, 4, 3, 3, 2, 4], rev: [5, 4, 6, 4, 6, 5] },
  "swords-09": { up: [4, 3, 4, 3, 2, 4], rev: [5, 5, 4, 5, 6, 5] },
  "swords-10": { up: [2, 2, 2, 2, 2, 3], rev: [4, 4, 4, 5, 4, 5] },
  "swords-page": { up: [5, 4, 7, 5, 6, 5], rev: [4, 3, 4, 4, 4, 3] },
  "swords-knight": { up: [5, 4, 7, 6, 6, 4], rev: [4, 3, 4, 3, 4, 3] },
  "swords-queen": { up: [6, 5, 8, 5, 6, 5], rev: [4, 3, 4, 4, 4, 3] },
  "swords-king": { up: [7, 5, 8, 5, 7, 6], rev: [4, 3, 4, 4, 4, 3] },

  "pentacles-01": { up: [9, 6, 8, 8, 7, 6], rev: [4, 4, 4, 3, 4, 4] },
  "pentacles-02": { up: [6, 5, 6, 6, 5, 6], rev: [4, 4, 4, 4, 3, 4] },
  "pentacles-03": { up: [7, 6, 8, 6, 7, 8], rev: [4, 4, 4, 4, 4, 3] },
  "pentacles-04": { up: [7, 4, 6, 5, 5, 4], rev: [3, 4, 4, 4, 5, 5] },
  "pentacles-05": { up: [2, 4, 3, 3, 3, 3], rev: [6, 5, 5, 5, 5, 6] },
  "pentacles-06": { up: [7, 6, 6, 7, 6, 8], rev: [4, 4, 5, 4, 4, 3] },
  "pentacles-07": { up: [6, 5, 6, 5, 6, 5], rev: [3, 4, 4, 4, 4, 5] },
  "pentacles-08": { up: [7, 5, 8, 5, 7, 5], rev: [4, 4, 3, 4, 5, 4] },
  "pentacles-09": { up: [9, 6, 7, 7, 8, 6], rev: [3, 4, 4, 4, 5, 4] },
  "pentacles-10": { up: [10, 8, 8, 8, 8, 9], rev: [5, 4, 5, 4, 5, 4] },
  "pentacles-page": { up: [6, 5, 7, 6, 6, 5], rev: [4, 5, 3, 4, 5, 4] },
  "pentacles-knight": { up: [7, 5, 7, 5, 7, 5], rev: [4, 4, 3, 4, 4, 5] },
  "pentacles-queen": { up: [8, 7, 6, 6, 8, 7], rev: [4, 4, 5, 4, 3, 4] },
  "pentacles-king": { up: [9, 6, 8, 6, 7, 7], rev: [5, 4, 5, 4, 4, 4] },
};

// ── Elements ──
type Element = "fire" | "earth" | "air" | "water";
const ELEMENT_ZH: Record<Element, string> = { fire: "火", earth: "土", air: "风", water: "水" };
const ELEMENT_EN: Record<Element, string> = { fire: "Fire", earth: "Earth", air: "Air", water: "Water" };

const SIGN_ELEMENT: Record<string, Element> = {
  aries: "fire", leo: "fire", sagittarius: "fire",
  taurus: "earth", virgo: "earth", capricorn: "earth",
  gemini: "air", libra: "air", aquarius: "air",
  cancer: "water", scorpio: "water", pisces: "water",
};
const SUIT_ELEMENT: Record<string, Element> = { wands: "fire", cups: "water", swords: "air", pentacles: "earth" };
// Golden Dawn elements of the Major Arcana (null = planetary card, no element); same as card-info.ts
const MAJOR_ELEMENT: (Element | null)[] = [
  "air", null, null, null, "fire", "earth", "air", "water", "fire", "earth", null,
  "air", "water", "water", "fire", "earth", null, "air", "water", null, "fire", null,
];
// The major arcana card of each sign (Golden Dawn)
const NATAL_CARD: Record<string, string> = {
  aries: "major-04", taurus: "major-05", gemini: "major-06", cancer: "major-07",
  leo: "major-08", virgo: "major-09", libra: "major-11", scorpio: "major-13",
  sagittarius: "major-14", capricorn: "major-15", aquarius: "major-17", pisces: "major-18",
};

function cardElement(card: TarotCard): Element | null {
  const [group, rank] = card.id.split("-");
  return group === "major" ? MAJOR_ELEMENT[Number(rank)] ?? null : SUIT_ELEMENT[group] ?? null;
}

const SUPPORTIVE = new Set(["fire|air", "air|fire", "earth|water", "water|earth"]);
const OPPOSED = new Set(["fire|water", "water|fire", "air|earth", "earth|air"]);

// ── Deterministic per-day jitter (FNV-1a hash) ──
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Local calendar day as YYYY-MM-DD from a getTimezoneOffset() value — identical on client and server */
export function dayKeyFromOffset(tzOffsetMinutes: number, now = Date.now()): string {
  return new Date(now - tzOffsetMinutes * 60_000).toISOString().slice(0, 10);
}

export interface DailyScoreResult {
  scores: Scores;
  /** Short explanations of the personal adjustments, for display under the chart */
  notes: string[];
  /** Dimensions the user said they care about */
  focus: Dimension[];
  /** Today's highest-scoring dimension(s), highlighted in gold; ties all count */
  best: Dimension[];
}

const FOCUS_TO_DIM: Record<string, Dimension> = { study: "career", career: "career", love: "love", health: "state", social: "social" };

export function computeDailyScores(
  card: TarotCard,
  reversed: boolean,
  opts: { profile?: TarotProfile; seed: string; dayKey: string; locale: Locale },
): DailyScoreResult | null {
  const base = BASE[card.id];
  if (!base) return null;
  const zh = opts.locale === "zh";
  const row = reversed ? base.rev : base.up;
  const notes: string[] = [];

  // Zodiac element vs card element
  let elementBonus = 0;
  const sign = opts.profile?.zodiac;
  const userEl = sign ? SIGN_ELEMENT[sign] : undefined;
  const cardEl = cardElement(card);
  if (userEl && cardEl) {
    const pair = `${userEl}|${cardEl}`;
    if (userEl === cardEl) elementBonus = 1;
    else if (SUPPORTIVE.has(pair)) elementBonus = 0.5;
    else if (OPPOSED.has(pair)) elementBonus = -0.5;
    if (elementBonus !== 0) {
      const u = zh ? ELEMENT_ZH[userEl] : ELEMENT_EN[userEl];
      const c = zh ? ELEMENT_ZH[cardEl] : ELEMENT_EN[cardEl];
      notes.push(
        elementBonus > 0
          ? (zh ? `${u}象星座 × ${c}元素牌：能量${elementBonus === 1 ? "共鸣" : "相生"}` : `${u} sign × ${c} card: energies ${elementBonus === 1 ? "resonate" : "support each other"}`)
          : (zh ? `${u}象星座 × ${c}元素牌：能量相克，今日多一分耐心` : `${u} sign × ${c} card: energies clash, take it a little slower`),
      );
    }
  }

  // 本命牌: the card ruled by the user's own sign
  const natal = !!sign && NATAL_CARD[sign] === card.id;
  if (natal) notes.push(zh ? "本命牌：这张牌守护着你的星座" : "Your sign’s own card: it watches over you today");

  const scores = {} as Scores;
  DIMENSIONS.forEach((dim, i) => {
    const jitter = (hash(`${opts.seed}|${opts.dayKey}|${dim}`) % 3) - 1;
    const raw = row[i] + elementBonus + (natal ? 1 : 0) + jitter;
    scores[dim] = Math.max(0, Math.min(10, Math.round(raw)));
  });

  // Never show six identical numbers: if bonuses + jitter flattened the shape, pull two axes apart
  const vals = DIMENSIONS.map((d) => scores[d]);
  if (vals.every((v) => v === vals[0])) {
    const v = vals[0];
    const h = hash(`${opts.seed}|${opts.dayKey}|spread|${card.id}`);
    const up = DIMENSIONS[h % 6];
    const down = DIMENSIONS[(h % 6 + 1 + (Math.floor(h / 6) % 5)) % 6];
    scores[up] = v < 10 ? v + 1 : v - 1;
    scores[down] = v > 0 ? v - 1 : v + 1;
  }

  const focus = Array.from(new Set((opts.profile?.focus ?? []).map((f) => FOCUS_TO_DIM[f]).filter(Boolean)));
  const top = Math.max(...DIMENSIONS.map((d) => scores[d]));
  const best = DIMENSIONS.filter((d) => scores[d] === top);
  return { scores, notes, focus, best };
}

/** Axis label; students (focus on 学业 but not 事业) see 学业 instead of 事业 */
export function dimensionLabel(dim: Dimension, locale: Locale, profile?: TarotProfile): string {
  if (dim === "career") {
    const f = profile?.focus ?? [];
    if (f.includes("study") && !f.includes("career")) return locale === "zh" ? "学业" : "Study";
  }
  return LABELS[dim][locale];
}

/** One line for the AI prompt, e.g. "金钱 7、感情 5、…" */
export function scoresToPrompt(r: DailyScoreResult, locale: Locale, profile?: TarotProfile): string {
  const parts = DIMENSIONS.map((d) => `${dimensionLabel(d, locale, profile)} ${r.scores[d]}`);
  // MBTI never changes the numbers; it only changes how the advice is phrased
  const mbti = profile?.mbti;
  const mbtiZh = mbti ? `\n同样的分数，请按 ${mbti} 的性格偏好给出不同的具体建议（例如同样是人际偏低，外向的人和内向的人适合的做法不同），同样不要提及 MBTI 或性格类型。` : "";
  const mbtiEn = mbti ? `\nTailor the concrete advice to an ${mbti}'s preferences (the same low Social score calls for different moves for an extravert and an introvert), without naming the MBTI type.` : "";
  return locale === "zh"
    ? `【今日六维评分（0–10，页面上会以雷达图展示给求问者）】${parts.join("、")}\n请让「宜」「忌」与评分呼应：分数最低的一项要在「忌」里给出提醒，分数最高的一项可以在「宜」里顺势而为。正文不要复述具体分数。${mbtiZh}`
    : `[Today's six-axis scores (0–10, shown to the querent as a radar chart)] ${parts.join(", ")}\nMake the Do / Avoid lines echo these scores: give a caution about the lowest one under Avoid, and lean into the highest one under Do. Don't repeat the numbers in the paragraph.${mbtiEn}`;
}
