import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cardName = body.cardName || body.prompt || "愚者";
    
    // 🎴 关键新增：获取前端传来的正逆位状态，没有传就默认正位
    const isReversedStatus = body.isReversed ? "逆位" : "正位";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response("【神谕提示】缺少魔法钥匙 (GEMINI_API_KEY)。", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 🔮 关键修改：在提示词中极其明确地告诉 AI 是正位还是逆位
    const systemPrompt = `你是一位神秘的塔罗大师。用户刚刚抽到了【${cardName}】的【${isReversedStatus}】。请仔细考虑该牌在这个状态下的牌意（正位和逆位含义截然不同）。用神秘、简洁的语气，为用户撰写一段大约 100 字的今日运势，并且给出具体的建议。`;

    // 不再使用流式向 Google 索要数据，而是让它一口气全给出来，绝不断线！
    const result = await model.generateContent(systemPrompt);
    const fullText = result.response.text();

    // 在我们自己的服务器上做打字机效果，安全稳定
    const stream = new ReadableStream({
      async start(controller) {
        for (const char of fullText) {
          controller.enqueue(new TextEncoder().encode(char));
          // 这里的 30 是打字速度，数字越大越慢，你可以随意调节
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error: any) {
     return new Response(`【魔法阵崩溃】真正的报错原因是：\n${error.message || String(error)}`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
  }
}