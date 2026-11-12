import type { Locale } from "./locale";

const MAJOR_EN: Record<string, string> = {
  愚者: "The Fool",
  魔术师: "The Magician",
  祭司: "The High Priestess",
  皇后: "The Empress",
  皇帝: "The Emperor",
  教皇: "The Hierophant",
  恋人: "The Lovers",
  战车: "The Chariot",
  力量: "Strength",
  隐士: "The Hermit",
  命运之轮: "Wheel of Fortune",
  正义: "Justice",
  倒吊人: "The Hanged Man",
  死神: "Death",
  节制: "Temperance",
  恶魔: "The Devil",
  高塔: "The Tower",
  星星: "The Star",
  月亮: "The Moon",
  太阳: "The Sun",
  审判: "Judgement",
  世界: "The World",
};

const SUIT_PREFIX: [string, string][] = [
  ["权杖", "Wands"],
  ["圣杯", "Cups"],
  ["宝剑", "Swords"],
  ["星币", "Pentacles"],
];

const RANK_EN: Record<string, string> = {
  一: "Ace",
  二: "Two",
  三: "Three",
  四: "Four",
  五: "Five",
  六: "Six",
  七: "Seven",
  八: "Eight",
  九: "Nine",
  十: "Ten",
  侍从: "Page",
  骑士: "Knight",
  圣母: "Queen",
  皇后: "Queen",
  国王: "King",
};

function minorZhToEn(zh: string): string | null {
  for (const [prefix, suitEn] of SUIT_PREFIX) {
    if (!zh.startsWith(prefix)) continue;
    const tail = zh.slice(prefix.length);
    const rank = RANK_EN[tail];
    if (!rank) return null;
    return `${rank} of ${suitEn}`;
  }
  return null;
}

/** 用于界面展示：资源路径仍用中文文件名（/tarot/愚者.jpg） */
// Queens keep "圣母" in their internal name (image files, DrawLog.card_name, localStorage) but display as "皇后"
export function getCardDisplayName(zhName: string, locale: Locale): string {
  if (locale === "zh") return zhName.replace(/圣母$/, "皇后");
  return MAJOR_EN[zhName] ?? minorZhToEn(zhName) ?? zhName;
}
