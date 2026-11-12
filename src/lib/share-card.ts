// src/lib/share-card.ts
// Draws a 1080×1440 (3:4, Xiaohongshu-friendly) share image on a canvas, entirely in the browser.

import type { Locale } from "./locale";

export interface ShareCardInput {
  locale: Locale;
  /** One entry for a single draw, three for a spread */
  cards: { name: string; label: string; orientation: string; reversed: boolean; position?: string; tagline?: string }[];
  question?: string;
  /** Short quote shown at the bottom (AI excerpt or pre-written meaning) */
  excerpt?: string;
  /** Small heading, e.g. "每日一牌" / "圣三角" */
  kind: string;
  /** Daily card 宜/忌 */
  almanac?: { dos: string[]; donts: string[] };
  /** Daily check-in streak, shown in the header ("连续第 5 日") */
  streak?: number;
  /** 每日一牌 six-axis scores; when present (single card) the card moves left and the radar sits on the right */
  radar?: { labels: string[]; values: number[]; focus: boolean[] };
}

/** Six-axis radar on the canvas, centred at (cx, cy) with outer radius r */
function drawRadar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, radar: NonNullable<ShareCardInput["radar"]>, serif: string) {
  const n = radar.values.length;
  const at = (i: number, v: number): [number, number] => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
    return [cx + (v / 10) * r * Math.cos(a), cy + (v / 10) * r * Math.sin(a)];
  };
  const path = (vals: number[]) => {
    ctx.beginPath();
    vals.forEach((v, i) => { const [x, y] = at(i, v); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.closePath();
  };
  ctx.save();
  // rings + spokes
  for (const v of [2, 4, 6, 8, 10]) {
    path(radar.values.map(() => v));
    ctx.strokeStyle = v === 10 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.09)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  for (let i = 0; i < n; i++) {
    const [x, y] = at(i, 10);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(255,255,255,0.09)"; ctx.stroke();
  }
  // score shape
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, "rgba(251,191,36,0.38)");
  grad.addColorStop(1, "rgba(139,92,246,0.4)");
  path(radar.values);
  ctx.fillStyle = grad; ctx.fill();
  ctx.strokeStyle = "rgba(253,230,138,0.9)"; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.stroke();
  radar.values.forEach((v, i) => {
    const [x, y] = at(i, v);
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fillStyle = "#fde68a"; ctx.fill();
  });
  // labels + values
  ctx.textAlign = "center";
  radar.labels.forEach((label, i) => {
    const [x, y] = at(i, 13.4);
    ctx.fillStyle = radar.focus[i] ? "#fcd34d" : "rgba(212,212,216,0.9)";
    ctx.font = `400 28px ${serif}`;
    ctx.fillText(label, x, y - 4);
    ctx.fillStyle = radar.focus[i] ? "#fde68a" : "#f4f4f5";
    ctx.font = `600 34px ${serif}`;
    ctx.fillText(String(radar.values[i]), x, y + 34);
  });
  ctx.restore();
}

const W = 1080;
const H = 1440;
const SITE = "ashleystarot.netlify.app";

const SERIF_ZH = `"Songti SC", "Noto Serif SC", "Source Han Serif SC", "STSong", serif`;
const SANS = `"PingFang SC", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif`;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // draw a placeholder instead of failing the whole card
    img.src = src;
  });
}

/** Splits text into wrap units: each CJK char on its own, latin words kept whole */
function tokenize(text: string): string[] {
  return text.match(/[A-Za-z0-9'’\-]+[.,!?;:)]*|\s+|./gu) ?? [];
}

/** Wraps text to maxWidth; returns at most maxLines lines (last one ellipsised if cut) */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const tok of tokenize(text)) {
    const next = line + tok;
    // Never start a line with closing punctuation (，。：etc.) — keep it on the previous line
    const isClosingPunct = /^[，。！？：；、）」』》…,.!?:;)]$/.test(tok);
    if (ctx.measureText(next).width > maxWidth && line.trim() && !isClosingPunct) {
      lines.push(line.trimEnd());
      line = tok.trimStart();
      if (lines.length === maxLines) break;
    } else {
      line = next;
    }
  }
  if (lines.length < maxLines && line.trim()) lines.push(line.trim());
  if (lines.length === maxLines) {
    const consumed = lines.join("").replace(/\s/g, "").length;
    if (consumed < text.replace(/\s/g, "").length) {
      let last = lines[maxLines - 1];
      while (last && ctx.measureText(last + "…").width > maxWidth) last = last.slice(0, -1);
      lines[maxLines - 1] = last + "…";
    }
  }
  return lines;
}

/**
 * Language a reading was actually written in (it can differ from the current UI language
 * if the user switched after drawing). Mostly-CJK text → "zh", otherwise "en".
 */
export function detectTextLocale(text: string): Locale {
  const letters = text.replace(/[\s\d\p{P}\p{S}]/gu, "");
  if (!letters) return "en";
  const cjk = (letters.match(/[\u3400-\u9fff]/g) ?? []).length;
  return cjk / letters.length > 0.3 ? "zh" : "en";
}

/** First sentence(s) of a reading, cleaned of markdown, trimmed to roughly maxChars */
export function makeExcerpt(reading: string, maxChars: number): string {
  const clean = reading
    .replace(/\*\*/g, "")
    // "【宝剑二 - 正位】" → "宝剑二正位"
    .replace(/\s*-\s*(正位|逆位)/g, "$1")
    .replace(/[【】]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const sentences = clean.match(/[^。！？!?.]+[。！？!?.]?/g) ?? [clean];
  let out = "";
  for (const s of sentences) {
    if (out && (out + s).length > maxChars) break;
    out += s;
  }
  return out.trim().slice(0, maxChars * 1.5);
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number, y: number, w: number, h: number,
  reversed: boolean,
) {
  ctx.save();
  // soft violet glow
  ctx.shadowColor = "rgba(140, 90, 255, 0.45)";
  ctx.shadowBlur = 40;
  ctx.fillStyle = "#0a0612";
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (img) {
    if (reversed) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      ctx.drawImage(img, x, y, w, h);
    }
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(251, 191, 36, 0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
}

function drawStars(ctx: CanvasRenderingContext2D) {
  // deterministic sprinkle so every card looks the same
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 90; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = rand() * 1.6 + 0.3;
    ctx.fillStyle = `rgba(255, 245, 220, ${0.15 + rand() * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export async function renderShareCard(input: ShareCardInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const zh = input.locale === "zh";
  const serif = zh ? SERIF_ZH : `Georgia, "Times New Roman", ${SERIF_ZH}`;

  // ── background ──
  ctx.fillStyle = "#05030a";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H * 0.32, 0, W / 2, H * 0.32, W * 0.75);
  glow.addColorStop(0, "rgba(140, 70, 255, 0.35)");
  glow.addColorStop(1, "rgba(140, 70, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  drawStars(ctx);

  // thin inner frame
  ctx.strokeStyle = "rgba(251, 191, 36, 0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // ── header ──
  ctx.fillStyle = "rgba(251, 191, 36, 0.85)";
  ctx.font = `500 26px ${SANS}`;
  const now = new Date();
  const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  const streakText = input.streak ? (zh ? `连续第 ${input.streak} 日` : `Day ${input.streak} streak`) : "";
  ctx.fillText(`✦  ${[input.kind, date, streakText].filter(Boolean).join("  ·  ")}  ✦`, W / 2, 112);

  ctx.fillStyle = "#f4f4f5";
  ctx.font = `300 52px ${serif}`;
  ctx.fillText(zh ? "神谕之门" : "The Oracle Gate", W / 2, 186);

  // ── cards ──
  const images = await Promise.all(
    input.cards.map((c) => loadImage(`/tarot/${encodeURIComponent(c.name)}.jpg`)),
  );

  const isSingle = input.cards.length === 1;
  // Daily card with scores: card on the left, radar on the right, text centred underneath
  const withRadar = isSingle && !!input.radar;
  const cardW = withRadar ? 320 : isSingle ? 340 : 270;
  const cardH = Math.round((cardW * 43) / 25);
  const gap = isSingle ? 0 : 42;
  const totalW = cardW * input.cards.length + gap * (input.cards.length - 1);
  let top = 250;
  if (withRadar) {
    // Centre the whole block (card + radar, name, one-liner, 宜/忌) between the title and the footer
    ctx.font = `400 30px ${serif}`;
    const taglineLines = input.cards[0].tagline ? wrapText(ctx, input.cards[0].tagline, W - 240, 2).length : 0;
    const almanacRows = input.almanac ? [input.almanac.dos, input.almanac.donts].filter((r) => r.length > 0).length : 0;
    const blockH = cardH + 64 + 46
      + (taglineLines ? 50 + (taglineLines - 1) * 42 : 0)
      + (almanacRows ? 80 + 70 + (almanacRows - 1) * 52 : 0);
    const areaTop = 230;
    const areaBottom = H - 190;
    top = areaTop + Math.max(0, Math.round((areaBottom - areaTop - blockH) / 2));
  }

  let cardsBottom = 0;
  input.cards.forEach((c, i) => {
    const x = withRadar ? 125 : (W - totalW) / 2 + i * (cardW + gap);
    drawCard(ctx, images[i], x, top, cardW, cardH, c.reversed);
    if (withRadar) drawRadar(ctx, 745, top + cardH / 2, 165, input.radar!, serif);

    const cx = withRadar ? W / 2 : x + cardW / 2;
    let ty = top + cardH + (isSingle ? 64 : 52);
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${isSingle ? 46 : 32}px ${serif}`;
    ctx.fillText(c.label, cx, ty, cardW + gap);
    ty += isSingle ? 46 : 38;
    ctx.fillStyle = c.reversed ? "rgba(252, 211, 77, 0.9)" : "rgba(196, 181, 253, 0.95)";
    ctx.font = `400 ${isSingle ? 28 : 24}px ${SANS}`;
    ctx.fillText(c.orientation, cx, ty);

    // one-line reading under the orientation
    if (c.tagline) {
      ty += isSingle ? 50 : 40;
      ctx.fillStyle = "rgba(254, 243, 199, 0.85)";
      ctx.font = `400 ${isSingle ? 30 : 22}px ${serif}`;
      const lines = wrapText(ctx, c.tagline, isSingle ? W - 240 : cardW + gap - 12, isSingle ? 2 : 3);
      lines.forEach((line, li) => {
        if (li > 0) ty += isSingle ? 42 : 32;
        ctx.fillText(line, cx, ty);
      });
    }
    cardsBottom = Math.max(cardsBottom, ty);
  });

  // ── question ──
  let y = cardsBottom + (isSingle ? 90 : 80);
  if (withRadar && input.almanac && (input.almanac.dos.length || input.almanac.donts.length)) {
    // a small divider between the one-liner and 宜/忌 (the 宜/忌 block adds its own 14px)
    ctx.fillStyle = "rgba(251, 191, 36, 0.6)";
    ctx.font = `400 26px ${SANS}`;
    ctx.fillText("—  ✧  —", W / 2, cardsBottom + 80);
    y = cardsBottom + 80 + 70 - 14;
  }
  if (input.question) {
    ctx.fillStyle = "rgba(161, 161, 170, 0.95)";
    ctx.font = `400 28px ${SANS}`;
    const q = wrapText(ctx, `${zh ? "所问之事：" : "Question: "}${input.question}`, W - 220, 2);
    for (const line of q) {
      ctx.fillText(line, W / 2, y);
      y += 42;
    }
    y += 22;
  }

  // ── excerpt ──
  if (input.excerpt) {
    ctx.fillStyle = "rgba(251, 191, 36, 0.6)";
    ctx.font = `400 26px ${SANS}`;
    ctx.fillText("—  ✧  —", W / 2, y);
    y += 56;
    ctx.fillStyle = "#e4e4e7";
    ctx.font = `italic 400 32px ${serif}`;
    const almanacSpace = input.almanac && (input.almanac.dos.length || input.almanac.donts.length) ? 70 : 0;
    const lines = wrapText(ctx, input.excerpt, W - 240, Math.max(1, Math.floor((H - 170 - almanacSpace - y) / 50)));
    for (const line of lines) {
      ctx.fillText(line, W / 2, y);
      y += 50;
    }
  }

  // ── 宜 / 忌 ──
  if (input.almanac) {
    y += 14;
    const rows = [
      { label: zh ? "宜" : "Do", items: input.almanac.dos, color: "rgba(110, 231, 183, 0.95)" },
      { label: zh ? "忌" : "Avoid", items: input.almanac.donts, color: "rgba(253, 164, 175, 0.95)" },
    ].filter((r) => r.items.length > 0);
    for (const row of rows) {
      const text = row.items.join(zh ? "、" : ", ");
      ctx.font = `600 32px ${serif}`;
      const labelW = ctx.measureText(row.label).width;
      ctx.font = `400 28px ${SANS}`;
      const fitted = wrapText(ctx, text, W - 300, 1)[0] ?? "";
      const textW = ctx.measureText(fitted).width;
      const gap = 22;
      const startX = (W - (labelW + gap + textW)) / 2;
      ctx.textAlign = "left";
      ctx.fillStyle = row.color;
      ctx.font = `600 32px ${serif}`;
      ctx.fillText(row.label, startX, y);
      ctx.fillStyle = "#e4e4e7";
      ctx.font = `400 28px ${SANS}`;
      ctx.fillText(fitted, startX + labelW + gap, y);
      ctx.textAlign = "center";
      y += 52;
    }
  }

  // ── footer ──
  ctx.fillStyle = "rgba(196, 181, 253, 0.75)";
  ctx.font = `500 26px ${SANS}`;
  ctx.fillText("Ashley's Tarot", W / 2, H - 112);
  ctx.fillStyle = "rgba(161, 161, 170, 0.7)";
  ctx.font = `400 22px ${SANS}`;
  ctx.fillText(SITE, W / 2, H - 76);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}
