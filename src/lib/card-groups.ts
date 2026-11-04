// src/lib/card-groups.ts
// Grouping and ordering helpers for the card library (/cards).

import { TAROT_CARDS, type TarotCard } from "./tarot-meanings";

export type GroupKey = "major" | "wands" | "cups" | "swords" | "pentacles";

export const CARD_GROUPS: { key: GroupKey; zh: string; en: string; themeZh: string; themeEn: string }[] = [
  { key: "major", zh: "大阿卡纳", en: "Major Arcana", themeZh: "人生旅程中的重大课题与转折", themeEn: "The great lessons and turning points of life's journey" },
  { key: "wands", zh: "权杖", en: "Wands", themeZh: "火元素 · 行动、热情与创造力", themeEn: "Fire · action, passion and creativity" },
  { key: "cups", zh: "圣杯", en: "Cups", themeZh: "水元素 · 情感、关系与直觉", themeEn: "Water · emotion, relationships and intuition" },
  { key: "swords", zh: "宝剑", en: "Swords", themeZh: "风元素 · 思想、真相与冲突", themeEn: "Air · mind, truth and conflict" },
  { key: "pentacles", zh: "星币", en: "Pentacles", themeZh: "土元素 · 物质、工作与身体", themeEn: "Earth · money, work and the body" },
];

export function groupOf(card: TarotCard): GroupKey {
  return card.id.split("-")[0] as GroupKey;
}

export function cardsInGroup(key: GroupKey): TarotCard[] {
  return TAROT_CARDS.filter((c) => groupOf(c) === key);
}

/** Public image path; filenames are the Chinese card names */
export function cardImage(card: TarotCard): string {
  return `/tarot/${encodeURIComponent(card.name.zh)}.jpg`;
}

/** Previous / next card in deck order, wrapping around */
export function neighbours(id: string): { prev: TarotCard; next: TarotCard } {
  const i = TAROT_CARDS.findIndex((c) => c.id === id);
  const n = TAROT_CARDS.length;
  return { prev: TAROT_CARDS[(i - 1 + n) % n], next: TAROT_CARDS[(i + 1) % n] };
}
