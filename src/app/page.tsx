"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  const [appLoaded, setAppLoaded] = useState(false);
  const [isSelecting, setIsSelecting] = useState(true); 
  const [clickedIndex, setClickedIndex] = useState<number | null>(null); 
  
  const [flipped, setFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState("愚者");
  const [isReversed, setIsReversed] = useState(false);
  
  const { completion, complete, error, isLoading, setCompletion } = useCompletion({
    api: "/api/tarot",
    streamProtocol: "text",
    onFinish: (_prompt, result) => {
      if (result.length > 10 && !result.includes("Error") && !result.includes("limit")) {
        localStorage.setItem("tarot_last_ai_reading", result);
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
      setCurrentCard(savedCard);
      setFlipped(true); 
      setIsSelecting(false);

      const savedReading = localStorage.getItem("tarot_last_ai_reading");
      if (savedReading) {
        setCompletion(`【今日神谕回溯】\n\n${savedReading}\n\n(命运的指引每日只需一次，以上为你的今日专属解读，请明日再来探寻未知的轨迹。)`);
      } else {
        setCompletion(`🔮 灵力场波动：先前的通灵未能完整传达。请点击下方按钮重新尝试连接。`);
      }
    }
    setAppLoaded(true);
  }, [setCompletion]);

  // 🎲 玩家在牌阵中选中了一张牌
  const handleSelectFromFan = (index: number) => {
    if (!isSelecting) return;

    setClickedIndex(index);
    setIsSelecting(false);

    const today = new Date().toLocaleDateString();
    const randomIndex = Math.floor(Math.random() * TAROT_DECK.length);
    const pickedCard = TAROT_DECK[randomIndex];
    const isRev = Math.random() > 0.5; 
    
    setCurrentCard(pickedCard);
    setIsReversed(isRev);
    
    localStorage.setItem("tarot_last_draw_date", today);
    localStorage.setItem("tarot_last_drawn_card", pickedCard);
    localStorage.setItem("tarot_last_card_reversed", isRev.toString()); 
    localStorage.removeItem("tarot_last_ai_reading");
    
    setCompletion("");
  };

  // 🌟 手动点击阵眼大牌，揭晓命运
  const handleMainCardClick = () => {
    if (flipped || isSelecting) return; 
    setFlipped(true); 
    complete("请解牌", { body: { cardName: currentCard, isReversed: isReversed } });
  };

  const retryReading = () => {
    setCompletion("");
    complete("请解牌", { body: { cardName: currentCard, isReversed: isReversed } });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05030a] font-sans text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_25%,rgba(140,70,255,0.25),transparent_60%)]" />

      <main className="relative flex w-full max-w-3xl flex-col items-center px-6 py-12 text-center z-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
          神谕之门
        </h1>
        <p className="mt-4 text-sm text-zinc-400">
          {isSelecting ? "请从下方牌阵中，凭直觉抽取一张牌" : "命运的齿轮已经转动"}
        </p>

        {/* 🌟 阵眼：屏幕正中央的卡牌位（大牌区） */}
        <div className="-translate-y-[20px] h-[430px] w-[250px]" style={{ perspective: 1200 }}>
          <AnimatePresence>
            {/* 大牌只有在未选牌时才出现 */}
            {!isSelecting && appLoaded && (
              <motion.div
                // 认亲：继承被点击小牌的 ID，实现无缝飞跃！
                layoutId={clickedIndex !== null ? `fan-card-${clickedIndex}` : "tarot-main-card"} 
                onClick={handleMainCardClick}
                className={`relative h-full w-full rounded-none ${!flipped && !isSelecting ? "cursor-pointer hover:shadow-[0_0_30px_rgba(167,139,250,0.3)] transition-shadow" : ""}`}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ layout: { type: "spring", stiffness: 200, damping: 25 }, duration: 0.8 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* 大牌牌背 */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-none border border-white/10 bg-[#0a0612] shadow-2xl overflow-hidden"
                  style={{ backfaceVisibility: "hidden" }}
                >
                    <img src="/tarot/维特牌背.jpg" alt="塔罗牌背" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* 大牌牌面 */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-none border border-white/20 shadow-2xl overflow-hidden bg-black"
                  style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                >
                  <img 
                    src={`/tarot/${currentCard}.jpg`} 
                    alt={currentCard}
                    className={`absolute inset-0 w-full h-full object-cover opacity-90 ${isReversed ? 'rotate-180' : ''}`}
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1620052579624-b153545faed8?q=80&w=400&auto=format&fit=crop"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="relative z-10 w-full px-6 mt-auto pb-8 text-center">
                    <div className="text-[10px] tracking-[0.3em] text-violet-400 drop-shadow-md">TAROT ORACLE</div>
                    <div className="mt-2 text-2xl font-bold text-white drop-shadow-xl">
                      {currentCard} <span className="text-lg text-zinc-300 ml-1 font-normal">{isReversed ? "(逆位)" : "(正位)"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部解牌区 */}
        <div className="-translate-y-[10px] w-full max-w-lg z-20 relative">
          <div className="rounded-none border border-white/5 bg-white/5 p-6 backdrop-blur-2xl shadow-xl transition-opacity duration-700">
             <div className="flex items-center justify-between text-[10px] tracking-widest text-zinc-500 mb-4">
                <span>TAROT MASTER READING</span>
                <span className={isLoading ? "animate-pulse text-violet-400" : ""}>
                   {isLoading ? "正在通灵..." : flipped ? "神谕已降临" : "等待翻牌"}
                </span>
             </div>

             <div className="min-h-[120px] text-left text-[15px] leading-8 text-zinc-200 font-serif italic whitespace-pre-wrap">
               {error || (completion.includes("灵力场波动") && !isLoading) ? (
                 <div className="text-red-400/80 text-sm flex flex-col items-start">
                   <p>🔮 灵力场波动: 算命师现在太忙了...</p>
                   <button onClick={retryReading} className="mt-4 px-5 py-2 border border-violet-500/50 text-violet-400 hover:bg-violet-500/20 transition-colors text-xs tracking-wider">
                     重新呼唤算命师
                   </button>
                 </div>
               ) : completion ? (
                 completion
               ) : (
                 <span className="text-zinc-600">
                    {flipped ? "大师正在整理思绪..." : isSelecting ? "凝神静气，选出呼唤你的那张牌。" : "牌已落定。请深呼吸，点击卡牌揭晓神谕..."}
                 </span>
               )}
             </div>
          </div>
        </div>
      </main>

      {/* 🌟 22 张大阿尔卡纳 居中魔法召唤阵（小牌区） */}
      <div className="absolute inset-0 flex justify-center items-center z-50 pointer-events-none">
      <div className="relative w-full h-full flex items-center justify-center -translate-y-[120px]">
          <AnimatePresence>
            {isSelecting && appLoaded && Array.from({ length: 22 }).map((_, i) => {
               // 🌟 抛物线完美纯数学算法，告别 originY 导致的上天 Bug！
               const offset = i - 10; 
               const cardX = offset * 32; 
               const cardY = Math.pow(Math.abs(offset), 2) * 0.5; 
               const cardRotate = offset * 2.5;

               return (
                 <motion.div
                   key={`fan-card-${i}`} 
                   layoutId={`fan-card-${i}`} 
                   className="absolute w-[80px] h-[138px] sm:w-[100px] sm:h-[172px] shadow-2xl cursor-pointer pointer-events-auto"
                   
                   // 入场动画
                   initial={{ opacity: 0, x: cardX, y: cardY + 100, rotate: cardRotate }}
                   animate={{ opacity: 1, x: cardX, y: cardY, rotate: cardRotate, transition: { duration: 0.5, delay: i * 0.02 } }}
                   
                   // 退场动画：没被选中的 21 张牌完美坠落
                   exit={{ opacity: 0, y: cardY + 150, transition: { duration: 0.4 } }}
                   
                   // 悬浮特效：绝对防抖，不跳牌
                   whileHover={{
                     y: cardY - 30, 
                     scale: 1.12,   
                     zIndex: 100, 
                     boxShadow: "0px 10px 40px 5px rgba(167, 139, 250, 0.4)",
                     transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                   }}
                   
                   onClick={() => handleSelectFromFan(i)}
                 >
                   <img src="/tarot/维特牌背.jpg" className="w-full h-full object-cover rounded-none" alt="tarot back" />
                 </motion.div>
               )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}