// src/components/TarotFan.tsx
"use client";

import { motion } from "framer-motion";

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
  if (!isOpen || !isSelecting) return null;

  const totalCards = 56;//56张扇形组合牌

  return (
    // 🌟 整个容器高度完全收拢到 160px，底下绝无多余透明空白！
    <div className="w-full h-[160px] sm:h-[180px] relative flex items-center justify-center overflow-visible py-4">
      <div className="relative w-full max-w-2xl h-full flex items-center justify-center overflow-visible">
        {Array.from({ length: totalCards }).map((_, i) => {
          const isCurrentClicked = clickedIndex === i;
          const hasAnyBeenClicked = clickedIndex !== null;
          if (hasAnyBeenClicked && !isCurrentClicked) return null;

          // 🌟 核心：计算每张牌的重叠错开位置
          // 通过 -translate-x 让它们围绕中心紧密层层堆叠，再加上微微的旋转角度 (rotate)，做出极其自然的弧形扇面堆叠！
          const centerIndex = (totalCards - 1) / 2;
          const offset = i - centerIndex;
          const rotateAngle = offset * 1.2; // 每张牌偏转 1.2度
          const translateX = offset * 17;   // 每张牌横向错开 17px（数字越小，叠得越紧密）
          const translateY = Math.abs(offset) * 0.7; // 形成一个微微向下拱的优雅弧度

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
              transition={{ duration: 0.4, delay: isCurrentClicked ? 0 : i * 0.01, ease: "easeOut" }}
              className="absolute w-[76px] h-[130px] sm:w-[105px] sm:h-[175px] cursor-pointer"
              style={{
                zIndex: i, // 完美的层层压盖顺序
                transformOrigin: "bottom center"
              }}
              onClick={() => onSelectCard(i)}
            >
              <motion.div
                className="h-full w-full rounded-sm overflow-hidden border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-zinc-900"
                initial={{ y: 0 }}
                // 🌟 当鼠标划过某张叠着的牌时，它会完美地挺直、向上拔起 35px，并且放大、图层提到最前，仪式感直接拉满！
                whileHover={{ 
                  y: -35, 
                  scale: 1.15, 
                  rotate: 0, // 悬停时牌会变正，方便看清
                  zIndex: 100,
                  boxShadow: "0 12px 24px rgba(139, 92, 246, 0.3)"
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