"use client";

import { motion } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
import { useEffect, useState } from "react";

// 🔮 78 张塔罗牌完整名单
const TAROT_DECK = [
  "愚者", "魔术师", "女祭司", "皇后", "皇帝", "教皇", "恋人", "战车", "力量", "隐士", 
  "命运之轮", "正义", "倒吊人", "死神", "节制", "恶魔", "高塔", "星星", "月亮", "太阳", "审判", "世界",
  "权杖一", "权杖二", "权杖三", "权杖四", "权杖五", "权杖六", "权杖七", "权杖八", "权杖九", "权杖十", "权杖侍从", "权杖骑士", "权杖圣母", "权杖国王",
  "圣杯一", "圣杯二", "圣杯三", "圣杯四", "圣杯五", "圣杯六", "圣杯七", "圣杯八", "圣杯九", "圣杯十", "圣杯侍从", "圣杯骑士", "圣杯圣母", "圣杯国王",
  "宝剑一", "宝剑二", "宝剑三", "宝剑四", "宝剑五", "宝剑六", "宝剑七", "宝剑八", "宝剑九", "宝剑十", "宝剑侍从", "宝剑骑士", "宝剑圣母", "宝剑国王",
  "星币一", "星币二", "星币三", "星币四", "星币五", "星币六", "星币七", "星币八", "星币九", "星币十", "星币侍从", "星币骑士", "星币圣母", "星币国王"
];

export default function Home() {
  const [flipped, setFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState("愚者");

  const { completion, complete, error, isLoading, setCompletion } = useCompletion({
    api: "/api/tarot",
    streamProtocol: "text",
    // 💾 关键改动 1：当 AI 打完字后，把完整的话偷偷存在浏览器里
    onFinish: (_prompt, result) => {
      localStorage.setItem("tarot_last_ai_reading", result);
    }
  });


  // 👁️ 网页加载时的第一道防线：检查并恢复记忆
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const lastDrawDate = localStorage.getItem("tarot_last_draw_date");

    if (lastDrawDate === today) {
      const savedCard = localStorage.getItem("tarot_last_drawn_card") || "命运之轮";
      // 💾 关键改动 2：从记忆里把 AI 的解牌词翻出来
      const savedReading = localStorage.getItem("tarot_last_ai_reading");

      setCurrentCard(savedCard);
      setFlipped(true); 

      // 如果存了原文，就展示原文并加上温馨提示
      if (savedReading) {
        setCompletion(`【今日神谕回溯】\n\n${savedReading}\n\n(命运的指引每日只需一次，以上为你的今日专属解读，请明日再来探寻未知的轨迹。)`);
      } else {
        // 万一没存上，就给个保底提示
        setCompletion(`【星象结界】\n命运的指引每日只需一次。你今日已经翻开了【${savedCard}】。\n过度窥探星辰会扰乱磁场，请明日再来吧。`);
      }
    }
  }, [setCompletion]);

  // 🎲 点击卡牌时的逻辑
  const handleCardFlip = () => {
    if (flipped) return;

    const today = new Date().toLocaleDateString();
    const lastDrawDate = localStorage.getItem("tarot_last_draw_date");
    if (lastDrawDate === today) return;

    const randomIndex = Math.floor(Math.random() * TAROT_DECK.length);
    const pickedCard = TAROT_DECK[randomIndex];
    setCurrentCard(pickedCard);
    
    // 记下今天的日期和抽到的牌
    localStorage.setItem("tarot_last_draw_date", today);
    localStorage.setItem("tarot_last_drawn_card", pickedCard);
    // 抽新牌时，先清空旧的解牌记忆，以免错乱
    localStorage.removeItem("tarot_last_ai_reading");
    
    setCompletion("");
    setFlipped(true);
    
    complete("", { body: { cardName: pickedCard } });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05030a] font-sans text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_25%,rgba(140,70,255,0.25),transparent_60%)]" />

      <main className="relative flex w-full max-w-3xl flex-col items-center px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
          神谕之门
        </h1>
        <p className="mt-4 text-sm text-zinc-400">
          点击卡牌，抽取属于你的今日运势
        </p>

        <div className="mt-14" style={{ perspective: 1200 }}>
          <motion.button
            onClick={handleCardFlip}
            className={`group relative h-[380px] w-[250px] outline-none ${flipped ? "cursor-default" : "cursor-pointer"}`}
            whileHover={flipped ? {} : { scale: 1.02 }}
            whileTap={flipped ? {} : { scale: 0.98 }}
          >
            <motion.div
              className="relative h-full w-full rounded-[22px]"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center rounded-[22px] border border-white/10 bg-[#0a0612] shadow-2xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="h-[90%] w-[85%] rounded-[16px] border border-white/5 flex flex-col items-center justify-center">
                   <div className="mb-4 h-12 w-12 rounded-full border border-violet-500/30 bg-violet-500/10 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.5)]" />
                   </div>
                   <span className="text-[10px] tracking-[0.4em] text-zinc-500">TAP TO DRAW</span>
                </div>
              </div>

              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-[22px] border border-white/20 bg-gradient-to-b from-zinc-900 to-black shadow-2xl"
                style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
              >
                <div className="px-6">
                  <div className="text-[10px] tracking-[0.3em] text-violet-400">TAROT ORACLE</div>
                  <div className="mt-4 text-3xl font-bold text-white">{currentCard}</div>
                  <div className="mt-8 text-[11px] text-zinc-500 leading-relaxed uppercase">
                    Your destiny is being revealed...
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.button>
        </div>

        <div className="mt-12 w-full max-w-lg">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-2xl shadow-xl">
             <div className="flex items-center justify-between text-[10px] tracking-widest text-zinc-500 mb-4">
                <span>AI MASTER READING</span>
                <span className={isLoading ? "animate-pulse text-violet-400" : ""}>
                   {isLoading ? "正在通灵..." : flipped ? "神谕已降临" : "等待翻牌"}
                </span>
             </div>

             <div className="min-h-[120px] text-left text-[15px] leading-8 text-zinc-200 font-serif italic whitespace-pre-wrap">
               {error ? (
                 <span className="text-red-400">占卜中断：{error.message}</span>
               ) : completion ? (
                 completion
               ) : (
                 <span className="text-zinc-600">
                    {flipped ? "大师正在整理思绪..." : "每一张牌都预示着一种可能。翻开它，听听星辰的回响。"}
                 </span>
               )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}