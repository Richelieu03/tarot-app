// src/components/Sidebar.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  locale: "zh" | "en";
  onOpenHistory: () => void;
  onLogout: () => Promise<void>;
}

export default function Sidebar({
  isOpen,
  onClose,
  user,
  locale,
  onOpenHistory,
  onLogout,
}: SidebarProps) {
  return (
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
            className="fixed left-0 top-0 bottom-0 z-[101] w-72 max-w-[80vw] bg-[#0a0612] border-r border-white/10 flex flex-col shadow-2xl"
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
                onClick={onOpenHistory}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-2xl transition-colors text-left"
              >
                <span className="text-lg">📖</span>
                {locale === "zh" ? "命运日志 (历史记录)" : "Destiny Log (History)"}
              </button>
              
              <button className="w-full flex items-center gap-4 px-4 py-3.5 text-sm text-zinc-500 hover:bg-white/5 rounded-2xl transition-colors text-left cursor-not-allowed">
                <span className="text-lg opacity-50">🔮</span>
                {locale === "zh" ? "牌阵解锁 (敬请期待)" : "Spreads (Coming Soon)"}
              </button>
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
  );
}