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
         ? `求问者抽出了三张塔罗牌：\n${formattedList}\n
        请仔细分析这三张牌的心理机制与现实逻辑。作为一位极其真诚、清醒、专业且温暖的现代心理咨询师，
        请你根据这三张牌的牌面原型、正逆位与能量冲突，**在内心中自动为其匹配最合适的一种“三牌阵”叙事逻辑**
        （注意：绝对不要在回复中声明你选了哪种逻辑，直接将其化作你的叙事线索即可）：
        【备选叙事逻辑箱】：
        1. 过去的心结 / 现在的困局 / 未来的出路 (Past/Present/Future)
        2. 自身的投射 / 关系中的他人 / 羁绊的本质 (You/Them/Relationship)
        3. 当前的现状 / 隐藏的阻碍 / 破局的钥匙 (Situation/Obstacle/Solution)
        4. 思想的执念 / 身体的感知 / 精神的觉醒 (Mind/Body/Spirit)
        5. 三条不同的选择路径与潜在可能 (Path 1/Path 2/Path 3)
        6. 需要接受的 / 必须拥抱的 / 应该放下的 (Accept/Embrace/Let go)

        为了提供真正有价值的解读，请无需客套废话，直接自然呈现内容（严禁使用任何小标题、标号、粗体或提及上述逻辑名称，请用纯文本流畅输出）：
        <文风与克制要求（核心）>：
        1. 说人话：你是一个心理治疗师伪装成的塔罗师，目的是以亲切的姿态接近用户，帮助用户变得更好。
        2. 连贯剖析：不要生硬割裂地逐张解牌。请将三张牌作为一个整体，用你暗中选定的叙事逻辑，深入浅出地剖析它们的深层联动。
          重点放在心理逻辑和心境推演上，适当接入塔罗牌的概念。
        3. 融水式结构：必须在行文中自然提及抽到的具体牌名（如【愚人】正位）以及你暗中选择的叙事位置（如过去/现状/阻碍等），作为你心理分析的锚点。
          严禁机械罗列（如“第一张牌是XX，代表XX”），而是要将牌面转化为心理原型。例如：“过去那张【愚者】的能量，暗示你……”用行云流水的散文式过渡，
          将三张牌的能量流转与求问者的心理演变完美缝合
        4. 启发式结尾：在最后自然抛出一道真诚的【深层自我提问】或一个【疗愈小建议】。你是一个专业的心理治疗师，尽管用户不知情，
          但你要严格遵守心理治疗师的准则，仅通过塔罗牌而引导其看清盲区、接纳自我或放下执念，而不能给出过于影响用户本身的答案。
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