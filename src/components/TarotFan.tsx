// src/components/TarotFan.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TarotFanProps {
  isOpen: boolean;
  isSelecting: boolean;
  clickedIndex: number | null;
  onSelectCard: (index: number) => void;
}

export default function TarotFan({
  isOpen,
  isSelecting,
  clickedIndex,
  onSelectCard,
}: TarotFanProps) {
  const [isMobile, setIsMobile] = useState(false);

  // 监听屏幕宽度
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isOpen || !isSelecting) return null;

  const totalCards = 56; // 👑 史诗级 56张小阿尔卡纳全牌组

  return (
    // 🌟 1. 调整容器高度，手机端高 160px（给放大的牌留出空间），电脑端保持 220px
    <div className={`w-full relative flex items-center justify-center overflow-visible py-4 ${isMobile ? "h-[160px]" : "h-[220px]"}`}>
      <div className="relative w-full max-w-2xl h-full flex items-center justify-center overflow-visible">
        {Array.from({ length: totalCards }).map((_, i) => {
          const isCurrentClicked = clickedIndex === i;
          const hasAnyBeenClicked = clickedIndex !== null;
          if (hasAnyBeenClicked && !isCurrentClicked) return null;

          const centerIndex = (totalCards - 1) / 2; // 中心索引
          const offset = i - centerIndex;
          
          // 🌟 2. 手机端 56张牌美化几何算法（解决“太小不好看”的核心）
          // 手机端：让牌堆形成一个紧密的双排交错折扇结构
          // 偏转角度在手机上微调为 0.8度，让整体弧度更柔和
          const rotateAngle = offset * (isMobile ? 0.8 : 1.2); 
          
          // 🌟 3. 手机端横向错开距离调大到 7px（之前是 5.5px，太挤了）。
          // 55 * 7 = 385px，这刚好是一个主流手机屏幕的宽度极限。
          const translateX = offset * (isMobile ? 7 : 17);   
          
          // 纵向弧度微调，手机端让两边微微向下，形成优雅的重叠感
          const translateY = Math.abs(offset) * (isMobile ? 0.8 : 0.7); 

          return (
            <motion.div
              key={`fan-card-${i}`}
              layoutId={`fan-card-${i}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: translateY,
                x: translateX,
                rotate: rotateAngle
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: isCurrentClicked ? 0 : i * 0.006, ease: "easeOut" }}
              // 🌟 4. 跨端双套物理尺寸（大幅提升手机端视觉）
              // 手机端：宽 68px, 高 115px （这是一个既能看清牌背纹理，又能在屏幕内完美堆叠的舒适尺寸！）
              // 电脑端：保持你最满意的 105x175 大气尺寸
              className="absolute w-[68px] h-[115px] sm:w-[105px] sm:h-[175px] cursor-pointer"
              style={{
                zIndex: i, // 完美的层层压盖顺序
                transformOrigin: "bottom center"
              }}
              onClick={() => onSelectCard(i)}
            >
              <motion.div
                className="h-full w-full rounded-sm overflow-hidden border border-white/10 bg-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                initial={{ y: 0 }}
                // 🌟 5. 悬停反馈微调：手机上往上拔 25px 并提到最高层，仪式感更强！
                whileHover={{ 
                  y: isMobile ? -25 : -35, 
                  scale: 1.15, 
                  rotate: 0, 
                  zIndex: 200, // 提到最高层
                  boxShadow: "0 12px 24px rgba(139, 92, 246, 0.35)"
                }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
              >
                <img
                  src="/tarot/维特牌背.jpg"
                  className="h-full w-full object-cover pointer-events-none select-none"
                  alt="Tarot Card Back"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-violet-500/5 opacity-0 transition-opacity duration-300 hover:opacity-100" />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}