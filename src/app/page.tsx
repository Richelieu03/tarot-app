"use client";

import { motion } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
import { useEffect, useState } from "react";

// 🔮 78 张塔罗牌完整名单
const TAROT_DECK = [
  "愚者", "魔术师", "祭司", "皇后", "皇帝", "教皇", "恋人", "战车", "力量", "隐士", 
  "命运之轮", "正义", "倒吊人", "死神", "节制", "恶魔", "高塔", "星星", "月亮", "太阳", "审判", "世界",
  "权杖一", "权杖二", "权杖三", "权杖四", "权杖五", "权杖六", "权杖七", "权杖八", "权杖九", "权杖十", "权杖侍从", "权杖骑士", "权杖圣母", "权杖国王",
  "圣杯一", "圣杯二", "圣杯三", "圣杯四", "圣杯五", "圣杯六", "圣杯七", "圣杯八", "圣杯九", "圣杯十", "圣杯侍从", "圣杯骑士", "圣杯圣母", "圣杯国王",
  "宝剑一", "宝剑二", "宝剑三", "宝剑四", "宝剑五", "宝剑六", "宝剑七", "宝剑八", "宝剑九", "宝剑十", "宝剑侍从", "宝剑骑士", "宝剑圣母", "宝剑国王",
  "星币一", "星币二", "星币三", "星币四", "星币五", "星币六", "星币七", "星币八", "星币九", "星币十", "星币侍从", "星币骑士", "星币圣母", "星币国王"
];

export default function Home() {
  const [flipped, setFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState("愚者");
  const [isReversed, setIsReversed] = useState(false);
  const { completion, complete, error, isLoading, setCompletion } = useCompletion({
    api: "/api/tarot",
    streamProtocol: "text",
    onFinish: (_prompt, result) => {
      if (result.length > 10 && !result.includes("Error") && !result.includes("limit")) {
        const today = new Date().toLocaleDateString();
        localStorage.setItem("tarot_last_ai_reading", result);
        localStorage.setItem("tarot_last_draw_date", today);
      }
    }
  });

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const lastDrawDate = localStorage.getItem("tarot_last_draw_date");

    if (lastDrawDate === today) {
      const savedCard = localStorage.getItem("tarot_last_drawn_card") || "命运之轮";
      const savedReversed = localStorage.getItem("tarot_last_card_reversed") === "true";
      setIsReversed(savedReversed);
      const savedReading = localStorage.getItem("tarot_last_ai_reading");

      setCurrentCard(savedCard);
      setFlipped(true); 

      if (savedReading) {
        setCompletion(`【今日神谕回溯】\n\n${savedReading}\n\n(命运的指引每日只需一次，以上为你的今日专属解读，请明日再来探寻未知的轨迹。)`);
      } else {
        setCompletion(`【星象结界】\n命运的指引每日只需一次。你今日已经翻开了【${savedCard}】(${savedReversed ? '逆位' : '正位'})。\n过度窥探星辰会扰乱磁场，请明日再来吧。`);
      }
    }
  }, [setCompletion]);

  const handleCardFlip = () => {
    if (flipped) return;

    const today = new Date().toLocaleDateString();
    const lastDrawDate = localStorage.getItem("tarot_last_draw_date");
    
    if (lastDrawDate === today) return;

    const randomIndex = Math.floor(Math.random() * TAROT_DECK.length);
    const pickedCard = TAROT_DECK[randomIndex];
    
    const isRev = Math.random() > 0.5; 
    
    setCurrentCard(pickedCard);
    setIsReversed(isRev);
    
    localStorage.setItem("tarot_last_drawn_card", pickedCard);
    localStorage.setItem("tarot_last_card_reversed", isRev.toString()); 
    localStorage.removeItem("tarot_last_ai_reading");
    
    setCompletion("");
    setFlipped(true);
    
    complete("请解牌", { body: { cardName: pickedCard, isReversed: isRev } });
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
            className={`group relative h-[430px] w-[250px] outline-none ${flipped ? "cursor-default" : "cursor-pointer"}`}
            whileHover={flipped ? {} : { scale: 1.02 }}
            whileTap={flipped ? {} : { scale: 0.98 }}
          >
            <motion.div
              className="relative h-full w-full rounded-[22px]"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* 牌背（未翻开时） */}
              <div
                className="absolute inset-0 flex items-center justify-center rounded-[22px] border border-white/10 bg-[#0a0612] shadow-2xl overflow-hidden" // 💡 增加了 overflow-hidden 确保图片边缘圆润
                style={{ backfaceVisibility: "hidden" }}
              >
                  {/* 这里使用你下载好的牌背图片 */}
                  <img 
                      src="/tarot/维特牌背.jpg" // 💡 注意这里，如果你存的是 png，请改成 .png
                      alt="塔罗牌背"
                      className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* 🌟 为了保持神秘感，我在图片上面加了一个淡淡的黑色遮罩，并保留了那个提示文字 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                      <span className="text-[10px] tracking-[0.4em] text-white/60 drop-shadow-lg">TAP TO DRAW</span>
                  </div>
              </div>

              {/* 🌟 牌面（翻开后显示真实图片） */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-[22px] border border-white/20 shadow-2xl overflow-hidden bg-black"
                style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
              >
                {/* 🌟 核心：图片展示与正逆位翻转特效 */}
                <img 
                  src={`/tarot/${currentCard}.jpg`} 
                  alt={currentCard}
                  className={`absolute inset-0 w-full h-full object-cover opacity-90  ${isReversed ? 'rotate-180' : ''}`}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1620052579624-b153545faed8?q=80&w=400&auto=format&fit=crop"; 
                  }}
                />

                {/* 🌟 底部渐变遮罩，确保文字清晰可见 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* 🌟 浮在图片上方的文字信息 */}
                <div className="relative z-10 w-full px-6 mt-auto pb-8 text-center">
                  <div className="text-[10px] tracking-[0.3em] text-violet-400 drop-shadow-md">
                    TAROT ORACLE
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white drop-shadow-xl">
                    {currentCard} 
                    <span className="text-lg text-zinc-300 ml-1 font-normal">
                      {isReversed ? "(逆位)" : "(正位)"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.button>
        </div>

        <div className="mt-12 w-full max-w-lg">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-2xl shadow-xl">
             <div className="flex items-center justify-between text-[10px] tracking-widest text-zinc-500 mb-4">
                <span>TAROT MASTER READING</span>
                <span className={isLoading ? "animate-pulse text-violet-400" : ""}>
                   {isLoading ? "正在通灵..." : flipped ? "神谕已降临" : "等待翻牌"}
                </span>
             </div>

             <div className="min-h-[120px] text-left text-[15px] leading-8 text-zinc-200 font-serif italic whitespace-pre-wrap">
               {error ? (
                 <div className="text-red-400/80 text-sm">
                   <p>🔮 灵力场波动 (503/400): 算命师现在太忙了，两分钟后再来吧？</p>
                   <p className="mt-2 text-[12px] opacity-60">提示：请刷新页面，再次点击卡牌尝试挤入星象频道。</p>
                 </div>
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