// src/components/Sidebar.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useState } from "react"; // 🌟 新增：接管历史弹窗所需的内置状态
import { supabase } from "../lib/supabase"; // 🌟 新增：直接引入 Supabase 实例来复用云端抓取
import HistoryModal from "./HistoryModal"; // 🌟 新增：将历史记录弹窗直接收编为内置零件

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  locale: "zh" | "en";
  onLogout: () => Promise<void>;
  // 🌟 核心剔除：彻底删掉了 onOpenHistory 回调，从此页面不需要再写任何配套的垃圾代码
}

export default function Sidebar({
  isOpen,
  onClose,
  user,
  locale,
  onLogout,
}: SidebarProps) {
  // 🌟 状态内聚：原本写在各个 page 里的状态，现在由侧边栏自给自足
  const [showHistory, setShowHistory] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 🌟 逻辑内聚：原本在两边页面里复制粘贴的 fetchHistory 函数，现在合二为一
  const fetchHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const { data } = await supabase
        .from('DrawLog')
        .select('*')
        .eq('user_id', user.id)
        .not('ai_reading', 'ilike', '[HIDDEN_ERROR]%')
        .order('created_at', { ascending: false }); 
      if (data) setHistoryLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false); 
    }
  };

  // 🌟 点击历史记录时的内部闭合触发器
  const handleOpenHistoryClick = () => {
    fetchHistory(); // 默默去捞数据
    setShowHistory(true); // 唤醒弹窗
    onClose(); // 优雅地顺手把侧边栏抽屉合上
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩蒙层 */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={onClose} 
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" 
            />
            
            {/* 侧边栏抽屉本体 */}
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }} 
              transition={{ type: "spring", bounce: 0, duration: 0.4 }} 
              className="fixed left-0 top-0 bottom-0 z-[101] w-72 max-w-[80vw] bg-[#0a0612] border-r border-white/15 flex flex-col shadow-2xl"
            >
              {/* 用户身份信息区块 */}
              <div className="p-8 pb-6 border-b border-white/5 flex flex-col items-center text-center">
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    className="w-20 h-20 rounded-full border-2 border-violet-500/30 object-cover shadow-[0_0_20px_rgba(139,92,246,0.2)]" 
                  alt="Avatar"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-violet-900 border-2 border-violet-500/30 flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className="mt-4 text-lg font-medium text-white">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || "神秘学徒"}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 truncate w-full">{user.email}</p>
            </div>

            {/* 功能导航菜单 */}
            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
              <button 
                onClick={handleOpenHistoryClick} // 🌟 核心修正：触发自发的内聚开启逻辑
                className="w-full flex items-center gap-4 px-4 py-3.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-2xl transition-colors text-left"
              >
                <span className="text-lg">📖</span>
                {locale === "zh" ? "命运日志 (历史记录)" : "Destiny Log (History)"}
              </button>
              
              <Link 
                href="/spread" 
                onClick={onClose} 
                className="w-full flex items-center gap-4 px-4 py-3.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-2xl transition-all text-left group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-300">🔮</span>
                {locale === "zh" ? "圣三角时空阵" : "Three-Card Spread"}
              </Link>
            </div>

            {/* 底部登出退场区 */}
            <div className="p-4 border-t border-white/5">
              <button 
                onClick={onLogout} 
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {locale === "zh" ? "登出" : "Logout"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* 🌟 核心挂载：让历史记录弹窗实体作为 Sidebar 的贴身护卫，随调随到 */}
    <HistoryModal 
      isOpen={showHistory} 
      onClose={() => setShowHistory(false)} 
      isLoading={isLoadingHistory} 
      logs={historyLogs} 
      locale={locale} 
    />
  </>
);
}