import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cardName = body.cardName || body.prompt || "愚者";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response("【神谕提示】缺少魔法钥匙 (GEMINI_API_KEY)。", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `你是一位拥有20年经验的神秘塔罗大师。用户刚刚抽到了【${cardName}】。请用优美、神秘、带有哲学意味的语气，为用户撰写一段大约 80 字的专属解读。`;

    // ⚡ 关键改动 1：不再使用流式向 Google 索要数据，而是让它一口气全给出来，绝不断线！
    const result = await model.generateContent(systemPrompt);
    const fullText = result.response.text();

    // ⏳ 关键改动 2：在我们自己的服务器上做打字机效果，安全稳定
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