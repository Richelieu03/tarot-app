import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Locale } from "../../../lib/locale";
import { getCardDisplayName } from "../../../lib/tarot-labels";

function parseLocale(v: unknown): Locale {
  return v === "zh" ? "zh" : "en";
}

export async function POST(req: Request) {
  let body: {
    locale?: unknown;
    cardName?: string;
    prompt?: string;
    isReversed?: boolean;
  } = {};

  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const locale = parseLocale(body.locale);

  try {
    const cardZh = body.cardName || body.prompt || "愚者";
    const cardForPrompt =
      locale === "en" ? getCardDisplayName(cardZh, "en") : cardZh;

    const isReversedStatus =
      locale === "zh"
        ? body.isReversed
          ? "逆位"
          : "正位"
        : body.isReversed
          ? "Reversed"
          : "Upright";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const msg =
        locale === "en"
          ? "[Oracle] Missing API key (GEMINI_API_KEY)."
          : "【神谕提示】缺少魔法钥匙 (GEMINI_API_KEY)。";
      return new Response(msg, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt =
      locale === "en"
        ? `You are a mystical tarot master. The querent drew **${cardForPrompt}** in **${isReversedStatus}**. Upright and reversed meanings differ sharply—honor this orientation. In a secretive, concise tone, write about 120 words of guidance for today's path and give one concrete suggestion.`
        : `你是一位神秘的塔罗大师。用户刚刚抽到了【${cardForPrompt}】的【${isReversedStatus}】。请仔细考虑该牌在这个状态下的牌意（正位和逆位含义截然不同）。用神秘、简洁的语气，为用户撰写一段大约 100 字的今日运势，并且给出具体的建议。`;

    const result = await model.generateContent(systemPrompt);
    const fullText = result.response.text();

    const stream = new ReadableStream({
      async start(controller) {
        for (const char of fullText) {
          controller.enqueue(new TextEncoder().encode(char));
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const text =
      locale === "en"
        ? `[Ritual interrupted]\n${msg}`
        : `【魔法阵崩溃】真正的报错原因是：\n${msg}`;
    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
