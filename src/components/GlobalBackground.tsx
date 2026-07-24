// src/components/GlobalBackground.tsx
"use client";

import { motion } from "framer-motion";

export default function GlobalBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#05030a]">
      {/* 🌟 核心背景色与深邃星空底纹 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,15,50,0.5)_0%,#05030a_70%)]" />

      {/* 🌟 动态缓缓呼吸/浮动的神秘紫色星云光晕 1 */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.4, 0.25],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-violet-700/20 blur-[120px]"
      />

      {/* 🌟 动态缓缓浮动的星云光晕 2（与第一个错开，营造立体感） */}
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.35, 0.2],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-[20%] -right-[10%] h-[700px] w-[700px] rounded-full bg-indigo-900/20 blur-[150px]"
      />

      {/* 🌟 微弱的星光点缀网格（可选，增添神秘感） */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
    </div>
  );
}