import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Locale } from "../../../lib/locale";
import { getCardDisplayName } from "../../../lib/tarot-labels";

// 1. 完善类型定义，完美兼容单牌与牌阵数据结构
interface SpreadSlot {
  slotLabel?: string;
  cardName?: string;
  isReversed?: boolean;
}

interface TarotRequestBody {
  locale?: unknown;
  question?: string;
  // 单牌字段
  cardName?: string;
  isReversed?: boolean;
  // 牌阵字段
  isSpread?: boolean;
  spreadData?: SpreadSlot[];
}

function parseLocale(v: unknown): Locale {
  return v === "zh" ? "zh" : "en";
}

// 2. 🌟 低耦合纯函数：解耦卡牌名称转换与正逆位逻辑
function formatCard(rawName: unknown, isReversed: unknown, locale: Locale): string {
  const zhName = typeof rawName === "string" && rawName ? rawName.trim() : "愚者";
  const displayName = locale === "en" ? getCardDisplayName(zhName, "en") : zhName;
  const status = locale === "zh" ? (isReversed ? "逆位" : "正位") : (isReversed ? "Reversed" : "Upright");
  return locale === "zh" ? `【${displayName} - ${status}】` : `**${displayName}** (${status})`;
}

export async function POST(req: Request) {
  let body: TarotRequestBody = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const locale = parseLocale(body.locale);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const msg = locale === "en"
        ? "[Oracle] Missing API key (GEMINI_API_KEY)."
        : "【神谕提示】缺少魔法钥匙 (GEMINI_API_KEY)。";
      return new Response(msg, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    // 3. 🌟 核心分流策略：根据模式构建不同的卡牌上下文与指令目标
    let cardsContext = "";
    let taskInstruction = "";

    if (body.isSpread && Array.isArray(body.spreadData) && body.spreadData.length > 0) {
      // —— 牌阵模式（如圣三角）——
      const formattedList = body.spreadData
        .map((slot, idx) => {
          const label = typeof slot.slotLabel === "string" ? slot.slotLabel : `位置 ${idx + 1}`;
          const cardStr = formatCard(slot.cardName, slot.isReversed, locale);
          return locale === "zh" ? `- 【${label}】：${cardStr}` : `- [${label}]: ${cardStr}`;
        })
        .join("\n");

      cardsContext = locale === "zh"
        ? `求问者完成了【圣三角牌阵】抽卡，时空星盘显现如下：\n${formattedList}`
        : `The querent completed a Three-Card Spread with the following revealed array:\n${formattedList}`;

        taskInstruction = locale === "zh"
        ? `请仔细分析这三张牌在【过去、现在、未来】时空线上的心理与现实逻辑。
        为了提供真正有价值的占卜，请无需客套废话，直接自然呈现解读（严禁使用任何小标题、标号或粗体标题）：
        <文风与克制要求（核心）>：
        1. 说人话：像一位极其真诚、清醒、专业且温暖的现代心理咨询师。严禁使用任何故弄玄虚的浮夸词汇等虚词，不要走“神棍风”或“廉价星座运势风”。
        2. 连贯叙事与剖析：深入浅出地剖析「过去的心结或经历，如何导致了求问者当下的困境或状态，而未来的出路又在哪里」。重点放在心理逻辑和现实心境的推演上。
        3. 启发式结尾：在最后自然地抛出一道真诚的【深层自我提问】或一个【心理觉察小建议】（切勿给现实中的离职、分手、投资等物理决策指令，仅引导其看清自我盲区）。在温柔共情的基础上，请带出一丝促使用户行动的内在力量，避免过度沉溺于情绪解读。

        请将全文字数精炼控制在 280 字左右。语气冷静、客观看待现实，同时饱含共情与理解。`
                : `Analyze the interconnected psychological logic across the Past, Present, and Future timeline.
        Generate a narrative in 2 to 3 natural paragraphs without any introductory fluff. [NEVER use subheadings, bullet points, or bold headers]:

        Tone and Style Guardrails (Crucial):
        1. Grounded & Authentic: Speak like a clear-headed, empathetic, and highly professional modern psychological counselor. STRICTLY FORBIDDEN from using melodramatic, purple-prose, or woo-woo clichés. Avoid sounding like a cheap horoscope generator.
        2. Narrative Logic: Explain cleanly and realistically how past experiences shape the current mindset, and how the future card illuminates a cognitive shift.
        3. Mirror of Awareness: Conclude smoothly with a thoughtful self-inquiry question or an introspective mindfulness observation (NEVER give prescriptive physical-world commands or life advice; guide them to uncover their own blind spots).While remaining empathetic, infuse a subtle sense of agency/strength to avoid over-indulging in pure emotional reflection.

        Target roughly 200 words. Tone: warm, objective, psychologically insightful, and entirely grounded in reality.`;
} else {
      // —— 单牌模式 ——
      const cardStr = formatCard(body.cardName, body.isReversed, locale);
      cardsContext = locale === "zh"
        ? `求问者抽到了宿命卡牌：${cardStr}。`
        : `The querent drew a single destiny card: ${cardStr}.`;

      taskInstruction = locale === "zh"
        ? `请仔细考虑该牌在此正逆位状态下的深层含义。用神秘、简洁的语气，撰写一段大约 150 字的运势解读，给出具体的建议。`
        : `Honor the specific upright/reversed orientation. In a secretive, concise tone, write about 100 words of guidance and give one concrete suggestion.`;
    }

    // 4. 处理用户提问模块
    const questionRaw = typeof body.question === "string" ? body.question.trim() : "";
    const questionContext = questionRaw
      ? (locale === "zh" 
          ? `求问者心中渴望洞察的困惑是：「${questionRaw}」。请严格锚定此问题进行解牌。`
          : `The querent's guiding question is: "${questionRaw}". Stay strictly anchored to this question.`)
      : (locale === "zh"
          ? `求问者未提出具体问题，请提供无特定主题的通用宿命指引。`
          : `No specific question asked—provide timeless, general spiritual guidance.`);

    // 5. 模块化拼装最终 System Prompt
    const rolePrompt = locale === "zh" 
      ? "你是一位通晓星界神谕的神秘塔罗大师。" 
      : "You are a mystical tarot master grounded in astral wisdom.";
    
    const systemPrompt = `${rolePrompt}\n\n${cardsContext}\n\n${questionContext}\n\n${taskInstruction}\n注：除了直接输出解牌内容外，别的内容（如客套话）一概不要回答。`;

    // 6. 发起 AI 调用与流式返回
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
    const text = locale === "en"
      ? `[Ritual interrupted]\n${msg}`
      : `【魔法阵崩溃】真正的报错原因是：\n${msg}`;
    return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}