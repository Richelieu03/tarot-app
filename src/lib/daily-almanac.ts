// src/lib/daily-almanac.ts
// The daily card reading ends with two "almanac" lines (like a Chinese 黄历):
//   宜：…、…   /  Do: …, …
//   忌：…、…   /  Avoid: …, …
// This splits them out so the page and the share card can lay them out separately.

export interface DailyAlmanac {
  /** Reading text with the 宜/忌 lines removed */
  body: string;
  dos: string[];
  donts: string[];
}

const DO_RE = /^\s*(?:\*\*)?\s*(?:宜|Do)\s*(?:\*\*)?\s*[:：]\s*(.+)$/i;
const DONT_RE = /^\s*(?:\*\*)?\s*(?:忌|Avoid|Don['’]t)\s*(?:\*\*)?\s*[:：]\s*(.+)$/i;

const splitItems = (s: string) =>
  s.replace(/\*\*/g, "").split(/[、，,;；·]/).map((x) => x.trim().replace(/[。.]$/, "")).filter(Boolean).slice(0, 4);

/** Works on partial (still streaming) text too: lines only count once they appear */
export function parseDailyAlmanac(text: string): DailyAlmanac {
  const dos: string[] = [];
  const donts: string[] = [];
  const kept: string[] = [];
  for (const line of text.split("\n")) {
    const d = line.match(DO_RE);
    const n = !d && line.match(DONT_RE);
    if (d) dos.push(...splitItems(d[1]));
    else if (n) donts.push(...splitItems(n[1]));
    else kept.push(line);
  }
  return { body: kept.join("\n").replace(/\n{3,}/g, "\n\n").trim(), dos, donts };
}
