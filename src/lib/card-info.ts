// src/lib/card-info.ts
// Static "about this card" facts: group, number, element, and (Major Arcana) Golden Dawn astrology.

import type { Locale } from "./locale";
import type { TarotCard } from "./tarot-meanings";
import { CARD_GROUPS, groupOf } from "./card-groups";

type Text = { en: string; zh: string };

const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

const FIRE: Text = { zh: "火", en: "Fire" };
const WATER: Text = { zh: "水", en: "Water" };
const AIR: Text = { zh: "风", en: "Air" };
const EARTH: Text = { zh: "土", en: "Earth" };

const SUIT_ELEMENT: Record<string, Text> = { wands: FIRE, cups: WATER, swords: AIR, pentacles: EARTH };

// Golden Dawn attributions, indexed by Rider–Waite number (Strength = VIII, Justice = XI)
const MAJOR_ASTRO: { astro: Text; element?: Text }[] = [
  { astro: { zh: "天王星", en: "Uranus" }, element: AIR },        // 0 Fool
  { astro: { zh: "水星", en: "Mercury" } },                       // I Magician
  { astro: { zh: "月亮", en: "Moon" } },                          // II High Priestess
  { astro: { zh: "金星", en: "Venus" } },                         // III Empress
  { astro: { zh: "白羊座", en: "Aries" }, element: FIRE },         // IV Emperor
  { astro: { zh: "金牛座", en: "Taurus" }, element: EARTH },       // V Hierophant
  { astro: { zh: "双子座", en: "Gemini" }, element: AIR },         // VI Lovers
  { astro: { zh: "巨蟹座", en: "Cancer" }, element: WATER },       // VII Chariot
  { astro: { zh: "狮子座", en: "Leo" }, element: FIRE },           // VIII Strength
  { astro: { zh: "处女座", en: "Virgo" }, element: EARTH },        // IX Hermit
  { astro: { zh: "木星", en: "Jupiter" } },                       // X Wheel of Fortune
  { astro: { zh: "天秤座", en: "Libra" }, element: AIR },          // XI Justice
  { astro: { zh: "海王星", en: "Neptune" }, element: WATER },      // XII Hanged Man
  { astro: { zh: "天蝎座", en: "Scorpio" }, element: WATER },      // XIII Death
  { astro: { zh: "射手座", en: "Sagittarius" }, element: FIRE },   // XIV Temperance
  { astro: { zh: "摩羯座", en: "Capricorn" }, element: EARTH },    // XV Devil
  { astro: { zh: "火星", en: "Mars" } },                          // XVI Tower
  { astro: { zh: "水瓶座", en: "Aquarius" }, element: AIR },       // XVII Star
  { astro: { zh: "双鱼座", en: "Pisces" }, element: WATER },       // XVIII Moon
  { astro: { zh: "太阳", en: "Sun" } },                           // XIX Sun
  { astro: { zh: "冥王星", en: "Pluto" }, element: FIRE },         // XX Judgement
  { astro: { zh: "土星", en: "Saturn" } },                        // XXI World
];

const COURT: Record<string, Text> = {
  page: { zh: "侍从", en: "Page" },
  knight: { zh: "骑士", en: "Knight" },
  queen: { zh: "皇后", en: "Queen" },
  king: { zh: "国王", en: "King" },
};

export interface CardFact {
  label: string;
  value: string;
}

/** Short labelled facts for a card, in display order. */
export function getCardFacts(card: TarotCard, locale: Locale): CardFact[] {
  const zh = locale === "zh";
  const pick = (x: Text) => x[locale];
  const group = groupOf(card);
  const groupInfo = CARD_GROUPS.find((g) => g.key === group)!;
  const rank = card.id.split("-")[1];
  const facts: CardFact[] = [];

  if (group === "major") {
    const n = Number(rank);
    facts.push({ label: zh ? "牌组" : "Arcana", value: zh ? "大阿卡纳" : "Major Arcana" });
    facts.push({ label: zh ? "编号" : "Number", value: ROMAN[n] ?? rank });
    const a = MAJOR_ASTRO[n];
    if (a?.element) facts.push({ label: zh ? "元素" : "Element", value: pick(a.element) });
    if (a) facts.push({ label: zh ? "星象" : "Astrology", value: pick(a.astro) });
  } else {
    facts.push({ label: zh ? "牌组" : "Suit", value: zh ? groupInfo.zh : groupInfo.en });
    const court = COURT[rank];
    facts.push({
      label: zh ? "等级" : "Rank",
      value: court ? `${zh ? "宫廷牌 · " : "Court · "}${pick(court)}` : Number(rank) === 1 ? (zh ? "王牌 Ace" : "Ace") : String(Number(rank)),
    });
    facts.push({ label: zh ? "元素" : "Element", value: pick(SUIT_ELEMENT[group]) });
  }
  return facts;
}

/** One-line theme of the card's group (e.g. "火元素 · 行动、热情与创造力") */
export function getGroupTheme(card: TarotCard, locale: Locale): string {
  const g = CARD_GROUPS.find((x) => x.key === groupOf(card))!;
  return locale === "zh" ? g.themeZh : g.themeEn;
}
