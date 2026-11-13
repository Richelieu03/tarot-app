import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import type { Locale } from "../../../lib/locale";
import { getCardDisplayName } from "../../../lib/tarot-labels";
import { TAROT_DECK } from "../../../lib/tarot-deck";
import { profileToPrompt, sanitizeProfile } from "../../../lib/profile";
import { computeDailyScores, dayKeyFromOffset, scoresToPrompt } from "../../../lib/daily-scores";
import { CARD_BY_ZH } from "../../../lib/tarot-meanings";
// Daily quota per spread type. The client also limits this, but only this server check protects the API key.
import { DAILY_LIMITS, DAILY_LIMIT_MARKER, SPREAD_COOLDOWN_MS, cooldownMessage, type SpreadType } from "../../../lib/daily-limit";

const MAX_QUESTION_LENGTH = 500;
const DECK_SET = new Set<string>(TAROT_DECK);

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
  // "daily" (每日一牌) or "single" (单牌问答); ignored for spreads
  mode?: unknown;
  // Browser's Date#getTimezoneOffset(), used to decide where "today" starts
  tzOffset?: unknown;
}

function parseLocale(v: unknown): Locale {
  return v === "zh" ? "zh" : "en";
}

function textResponse(text: string, status = 200) {
  return new Response(text, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

/** ISO timestamp of 00:00 in the user's local day, given getTimezoneOffset() minutes. */
function startOfUserDay(tzOffset: unknown): string {
  const off =
    typeof tzOffset === "number" && Number.isFinite(tzOffset)
      ? Math.max(-840, Math.min(840, Math.round(tzOffset)))
      : 0;
  const local = new Date(Date.now() - off * 60_000); // local wall-clock time in UTC fields
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() + off * 60_000).toISOString();
}

/** Supabase client that acts as the calling user, so RLS policies still apply. */
function supabaseAsUser(accessToken: string) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Rate limit / overload / transient server errors are worth retrying; bad requests are not */
function isRetryableGeminiError(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  if (status && [429, 500, 503, 504].includes(status)) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /\b(429|500|503|504)\b|RESOURCE_EXHAUSTED|overloaded|UNAVAILABLE|quota/i.test(msg);
}

function isValidCard(name: unknown): name is string {
  return typeof name === "string" && DECK_SET.has(name);
}

// 2. 🌟 低耦合纯函数：解耦卡牌名称转换与正逆位逻辑
function formatCard(rawName: unknown, isReversed: unknown, locale: Locale): string {
  const zhName = typeof rawName === "string" && rawName ? rawName.trim() : "愚者";
  const displayName = getCardDisplayName(zhName, locale);
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

  // ── Auth: only signed-in users may spend AI quota ──
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return textResponse(locale === "zh" ? "请先登录后再解牌。" : "Please log in to receive a reading.", 401);
  }
  const db = supabaseAsUser(token);
  const { data: { user }, error: authError } = await db.auth.getUser(token);
  if (authError || !user) {
    return textResponse(locale === "zh" ? "登录已失效，请重新登录。" : "Session expired, please log in again.", 401);
  }

  // ── Validate input before spending anything ──
  const spreadType: SpreadType =
    body.isSpread && Array.isArray(body.spreadData) && body.spreadData.length > 0
      ? "trinity"
      : body.mode === "daily" ? "daily" : "single";
  const slots = spreadType === "trinity" ? body.spreadData!.slice(0, 3) : [];
  if (spreadType !== "trinity" ? !isValidCard(body.cardName) : !slots.every((s) => isValidCard(s.cardName))) {
    return textResponse("Invalid card", 400);
  }
  const questionRaw = (typeof body.question === "string" ? body.question.trim() : "").slice(0, MAX_QUESTION_LENGTH);

  // ── Daily quota, counted from successful readings stored in DrawLog ──
  const { count, error: countError } = await db
    .from("DrawLog")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("spread_type", spreadType)
    .gte("created_at", startOfUserDay(body.tzOffset))
    .not("ai_reading", "ilike", "[HIDDEN_ERROR]%");
  if (countError) {
    console.error("DrawLog quota check failed:", countError.message);
    return textResponse(locale === "zh" ? "服务暂时不可用，请稍后再试。" : "Service unavailable, please try again later.", 503);
  }
  if ((count ?? 0) >= DAILY_LIMITS[spreadType]) {
    const msg = spreadType === "daily"
      ? (locale === "zh" ? "今日的神谕已然降临，命运之门将于明日重新开启。" : "Today's oracle has spoken. The gate reopens tomorrow.")
      : spreadType === "single"
        ? (locale === "zh" ? "今日的三次 AI 解读已尽，牌面释义依然可查，待明日星辰重新排列，再来聆听完整神谕。" : "Today's three AI readings are used up. Card meanings are still yours to explore; return tomorrow for the full oracle.")
        : (locale === "zh" ? "今日的三次叩问已尽，待明日星辰重新排列，再来聆听。" : "Today's three questions have been asked. Return when the stars realign tomorrow.");
    return textResponse(`${DAILY_LIMIT_MARKER} ${msg}`, 429);
  }

  // ── Three-card cooldown: at least SPREAD_COOLDOWN_MS between readings (not reset at midnight) ──
  if (spreadType === "trinity") {
    const { data: last } = await db
      .from("DrawLog")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("spread_type", "trinity")
      .not("ai_reading", "ilike", "[HIDDEN_ERROR]%")
      .order("created_at", { ascending: false })
      .limit(1);
    const lastAt = last?.[0]?.created_at ? new Date(last[0].created_at).getTime() : 0;
    const waitMs = lastAt + SPREAD_COOLDOWN_MS - Date.now();
    if (waitMs > 0) {
      return textResponse(`${DAILY_LIMIT_MARKER} ${cooldownMessage(waitMs, locale)}`, 429);
    }
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const msg = locale === "en"
        ? "[Oracle] Missing API key (GEMINI_API_KEY)."
        : "【神谕提示】缺少魔法钥匙 (GEMINI_API_KEY)。";
      return textResponse(msg);
    }

    // 3. 🌟 核心分流策略：根据模式构建不同的卡牌上下文与指令目标
    let cardsContext = "";
    let taskInstruction = "";

    if (spreadType === "trinity") {
      // —— 牌阵模式（如圣三角）——
      const formattedList = slots
        .map((slot, idx) => {
          const label = typeof slot.slotLabel === "string" ? slot.slotLabel : `位置 ${idx + 1}`;
          const cardStr = formatCard(slot.cardName, slot.isReversed, locale);
          return locale === "zh" ? `- 【${label}】：${cardStr}` : `- [${label}]: ${cardStr}`;
        })
        .join("\n");

      cardsContext = locale === "zh"
        ? `求问者的三牌阵抽卡结果如下：\n${formattedList}`
        : `The querent's three-card spread:\n${formattedList}`;

      taskInstruction = locale === "zh"
    ? `【你的角色】
你是一位看透世事、高情商且极具洞察力的现代心理咨询师。你精通塔罗牌的能量运作与心理学投射，但从不掉书袋。你深知“解牌就是解心”，能精准把握用户问题的“重量”，并给出最妥帖的回应。

【核心任务与动态分析框架】
请先在内心评估该问题的“重量级别”。然后根据牌面原型与能量冲突，从以下【备选叙事逻辑箱】中，自动为其匹配最合适的一种“三牌阵”叙事线索（注意：绝对不要在回复中声明你选了哪种逻辑，直接将其化作你的行文脉络）：
【备选叙事逻辑箱】：
1. 过去的心结 / 现在的困局 / 未来的出路
2. 自身的投射 / 关系中的他人 / 羁绊的本质
3. 当前的现状 / 隐藏的阻碍 / 破局的钥匙
4. 思想的执念 / 身体的感知 / 精神的觉醒
5. 三条不同的选择路径与潜在可能
6. 需要接受的 / 必须拥抱的 / 应该放下的

随后，严格按照你评估的问题“重量级别”，采用对应的风格生成解读：

- 级别 A【日常琐事/行动抉择】（如：要去超市吗、吃什么、买不买、日常小纠结）：
  [风格定调]：轻松、幽默、一针见血、生活化。
  [解牌要求]：将牌面能量降维为“精力值、心情状态、外界阻力”。避免使用内在权威、心理创伤、人生羁绊等沉重的心理学大词。直接给出现实的接地气建议（如“干脆去做”、“睡大觉”）。

- 级别 B【深度困惑/人生迷茫】（如：如何获得幸福、情感纠葛、职业迷茫、恐惧失败）：
  [风格定调]：温柔、清醒、专业、饱含共情。
  [解牌要求]：深入浅出地剖析其心理机制与现实逻辑，揭示内心的恐惧、执念或盲区。在文末自然抛出一道用户也许未察觉到的【深层自我提问】或【心理觉察小建议】。

【输出与排版红线（极度严格）】
1. 融水式结构：必须将三张牌的能量流转编织成一篇连贯流畅的散文。必须在行文中自然提及牌名并加粗（格式：**【牌名】正/逆位**），作为叙事锚点。
2. 严禁机械罗列：绝不允许出现“第一张是XX代表XX”的生硬句式。绝不要声明你评估了什么级别或选了什么阵法逻辑。
3. 纯净排版：除了牌名加粗外，**绝对禁止**任何小标题、标号（1.2.3.）、分点论述。
4. 字数控制：请将全文字数精炼控制在 280 字左右。语气冷静客观，饱含共情。

请根据上述要求，直接输出纯文本解读正文：`
    : `[Your Role]
You are a highly emotionally intelligent, grounded, and insightful modern psychological counselor. You understand that Tarot reflects psychological states. You gauge the "weight" of the user's question to deliver the perfect response.

[Core Task & Dynamic Framework]
First, assess the "weight" of the question. Then, select the most appropriate narrative logic from the [Spread Logic Box] below (NEVER explicitly state which logic you chose; just weave it into your narrative):
[Spread Logic Box]:
1. Past unresolved issues / Current dilemma / Future way out
2. Self-projection / The other person / Essence of the bond
3. Current situation / Hidden obstacles / The key to breakthrough
4. Mental fixations / Physical sensations / Spiritual awakening
5. Three different paths of choice and potential outcomes
6. What to accept / What to embrace / What to let go of

Next, strictly adapt your style based on the assessed "weight":

- Level A [Mundane/Action Choices] (e.g., "Should I go to the grocery store?", "What to eat?", daily trivialities):
  [Tone]: Lighthearted, humorous, practical, and grounded.
  [Requirement]: Down-scale the cards to reflect "energy levels, current mood, or minor friction". STRICTLY FORBIDDEN to use heavy psychological jargon. Give practical, everyday advice.

- Level B [Deep Confusion/Life Dilemmas] (e.g., happiness, breakups, career crisis, fear of failure):
  [Tone]: Warm, professional, empathetic, and clear-headed.
  [Requirement]: Analyze the psychological mechanisms. Uncover hidden fears or fixations. Conclude smoothly with a thoughtful [Self-Inquiry Question] or [Mindfulness Suggestion].

[Output & Formatting Red Lines (Extremely Strict)]
1. Fluid Narrative: Weave the three cards into cohesive prose. You MUST naturally mention and bold the card names (format: **[Card Name] Upright/Reversed**) as narrative anchors.
2. No Robotic Listing: NEVER write "The first card is X meaning Y." 
3. Pure Prose: Aside from bolding the card names, STRICTLY FORBIDDEN to use subheadings, bullet points, or numbered lists.
4. Word Count: Keep the entire response concise, around 200-250 words.

Output the final reading text directly:`
} else {
      // —— 单牌模式 ——
      const cardStr = formatCard(body.cardName, body.isReversed, locale);
      cardsContext = locale === "zh"
        ? `求问者抽到了宿命卡牌：${cardStr}。`
        : `The querent drew a single destiny card: ${cardStr}.`;

      taskInstruction = spreadType === "daily"
        // 每日一牌: today's fortune, no question
        ? (locale === "zh"
          ? `这是求问者今天的每日一牌。请严格按以下格式输出，不要输出任何其他内容：
第一部分：一段约 100 字的今日运势，结合该牌在此正逆位状态下的含义。要求：
- 用大白话写，少用比喻和抽象的词（如「能量场」「链接」「频率」「迟钝」），每句话都要让人一读就懂、能用上。
- 先用一句话说清这张牌今天的核心意思；再明确指出今天最可能在哪一两个方面（学业或工作、感情、人际、钱、身体状态）遇到什么样的具体情况；最后给一个今天就能做的具体建议。
- 可以保留一点神秘、温暖的语气，但不要故弄玄虚，也不要吓唬人。
- 直接切入，禁止任何问候语或称呼（如"亲爱的""你好""旅人"）。
第二部分：另起一行，以"宜："开头，写 2 到 3 件今天适合做的事，用顿号分隔，每件不超过 8 个字。
第三部分：另起一行，以"忌："开头，写 2 到 3 件今天不宜做的事，用顿号分隔，每件不超过 8 个字。
宜忌的写法（重要）：
- 像一本神秘的黄历：措辞简洁、带一点古意和仪式感，但每一条都必须是现实中能做的、具体的日常小事，例如「整理旧物」「夜读三页」「写信给远方」「早些熄灯」「向东而行」。
- 宜和忌都必须是中性的事：平常日子里做了完全没问题，只是今天格外合适或不合适。「忌」可以写「大额下单」「临时改约」「深夜回消息」「赴陌生之约」，绝不能写本来就不该做的事。
- 禁止使用自带评价的词：盲目、轻信、冲动、过度、逃避、犹豫、消极、急躁、忽略等；也不要写「保持平静」「整理思绪」这类空泛的心态。
- 每一条都要能从这张牌的意象或今天的状态里找到理由，不要套用万能条目，也不要照抄上面的例子。`
          : `This is the querent's daily card. Output exactly this format and nothing else:
Part 1: one paragraph (about 70 words) on today, honoring the upright/reversed orientation:
- Write plainly. Few metaphors and no vague jargon ("energy field", "vibration", "alignment"); every sentence should be instantly clear and usable.
- Open with one sentence on what the card means today; then say concretely which one or two areas (study or work, love, friends, money, physical energy) are most likely to see what kind of situation; end with one concrete thing to do today.
- A little mystery and warmth is fine, but no mystification and no fear-mongering.
- Start directly — no greetings or forms of address ("Dear", "Hello", "traveler").
Part 2: on a new line, "Do:" followed by 2–3 things that suit today, comma-separated, each under 6 words.
Part 3: on a new line, "Avoid:" followed by 2–3 things that don't suit today, comma-separated, each under 6 words.
How to write Do / Avoid (important):
- Like an old almanac: brief, a little archaic and ritual in tone, yet every item must be a real, concrete everyday act, e.g. "Tidy an old drawer", "Read by lamplight", "Write to someone far away", "Walk east at dusk".
- Every item must be neutral: perfectly fine on an ordinary day, just especially right or wrong for today. Avoid items like "Big online orders", "Last-minute plan changes", "Answering messages past midnight" — never things that are always bad.
- Never use judgemental words (blind, reckless, impulsive, excessive, escaping, hesitating, negative) or vague states of mind ("stay calm", "clear your head").
- Each item should trace back to this card's imagery or today's energy. No stock items, and don't copy the examples above.`)
        : (locale === "zh"
          ? `请仔细考虑该牌在此正逆位状态下的深层含义。用神秘、简洁的语气，撰写一段大约 150 字的运势解读，给出具体的建议。`
          : `Honor the specific upright/reversed orientation. In a secretive, concise tone, write about 100 words of guidance and give one concrete suggestion.`);
    }

    // 4. 处理用户提问模块
    const questionContext = spreadType === "daily"
      ? (locale === "zh" ? "这是每日一牌，没有具体问题，请聚焦于今天。" : "This is a daily card with no specific question — focus on today.")
      : questionRaw
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
    
    // Pin the output language explicitly — without this, short CJK questions like "今日运势"
    // can make the model drift into Japanese.
    const languageRule = locale === "zh"
      ? "【语言要求】必须全程使用简体中文输出，禁止使用日语、繁体中文或其他语言。"
      : "[Language] Respond in English only.";

    // The user's saved profile (zodiac / MBTI / focus / situation), read from their verified account
    const profile = sanitizeProfile(user.user_metadata?.profile);
    const profileContext = profileToPrompt(profile, locale);

    // 每日一牌: the same six-axis scores the page draws (deterministic), so 宜/忌 can echo them
    let scoreContext = "";
    if (spreadType === "daily" && typeof body.cardName === "string" && CARD_BY_ZH[body.cardName]) {
      const tz = typeof body.tzOffset === "number" && Number.isFinite(body.tzOffset) ? body.tzOffset : 0;
      const scores = computeDailyScores(CARD_BY_ZH[body.cardName], !!body.isReversed, {
        profile, seed: user.id, dayKey: dayKeyFromOffset(tz), locale,
      });
      if (scores) scoreContext = `\n\n${scoresToPrompt(scores, locale, profile)}`;
    }

    const systemPrompt = `${rolePrompt}\n\n${cardsContext}\n\n${questionContext}${profileContext ? `\n\n${profileContext}` : ""}${scoreContext}\n\n${taskInstruction}\n\n${languageRule}\n注：除了直接输出解牌内容外，别的内容（如客套话）一概不要回答。`;

    // 6. 发起 AI 调用与流式返回
    const genAI = new GoogleGenerativeAI(apiKey);
    const makeModel = (name: string) =>
      genAI.getGenerativeModel({
        model: name,
        systemInstruction: languageRule,
        // 2.5 models "think" before answering by default, which adds several seconds.
        // A short reading doesn't need it. (Field isn't in this SDK's types yet, but is passed through as-is.)
        generationConfig: { thinkingConfig: { thinkingBudget: 0 } } as Record<string, unknown>,
      });

    // Free-tier Gemini rate-limits bursts (e.g. a group chat all drawing at once):
    // try the main model, retry it once after a short pause, then fall back to the lighter model.
    const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash-lite";
    const attempts = [PRIMARY_MODEL, PRIMARY_MODEL, FALLBACK_MODEL];
    let fullText = "";
    let lastError: unknown;
    for (let i = 0; i < attempts.length; i++) {
      try {
        const result = await makeModel(attempts[i]).generateContent(systemPrompt);
        fullText = result.response.text().trim();
        if (fullText) break;
      } catch (err) {
        lastError = err;
        if (!isRetryableGeminiError(err)) throw err;
        console.warn(`Gemini ${attempts[i]} busy (attempt ${i + 1}), retrying…`);
        if (i < attempts.length - 1) await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
      }
    }
    if (!fullText && lastError) throw lastError;
    // An empty answer (e.g. blocked by safety filters) must not be stored, or it would
    // use up the user's daily quota and be "restored" as a blank reading.
    if (!fullText) {
      return textResponse(locale === "zh" ? "【魔法阵崩溃】神谕没有回应，请重试。" : "[Ritual interrupted]\nThe oracle gave no answer. Please try again.");
    }

    // Record the reading server-side: this row is what the daily quota counts,
    // so it must not depend on the browser finishing the stream.
    const { error: insertError } = await db.from("DrawLog").insert([
      spreadType !== "trinity"
        ? {
            user_id: user.id,
            spread_type: spreadType,
            card_name: body.cardName,
            is_reversed: !!body.isReversed,
            question: questionRaw,
            ai_reading: fullText,
            spread_data: null,
          }
        : {
            user_id: user.id,
            spread_type: "trinity",
            card_name: slots[0].cardName,
            is_reversed: !!slots[0].isReversed,
            question: questionRaw,
            ai_reading: fullText,
            spread_data: slots.map((s) => ({
              name: s.cardName,
              is_reversed: !!s.isReversed,
              position_label: s.slotLabel ?? "",
            })),
          },
    ]);
    if (insertError) console.error("DrawLog insert failed:", insertError.message);

    const stream = new ReadableStream({
      async start(controller) {
        // Typewriter effect: a few characters per tick instead of 1 char / 30ms
        // (a 300-char reading used to take ~9s just to "type out")
        const encoder = new TextEncoder();
        const chars = Array.from(fullText);
        for (let i = 0; i < chars.length; i += 3) {
          controller.enqueue(encoder.encode(chars.slice(i, i + 3).join("")));
          await new Promise((resolve) => setTimeout(resolve, 20));
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
    return textResponse(text);
  }
}
