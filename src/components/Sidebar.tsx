// src/components/Sidebar.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useState } from "react"; 
import { supabase } from "../lib/supabase"; 
import HistoryModal from "./HistoryModal"; 
import { getAvatarColor, getInitial } from "../lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null; 
  locale: "zh" | "en";
  onLogout: () => Promise<void>;
  onLoginClick?: () => void; 
  currentSpread?: "single" | "three"; 
}

export default function Sidebar({
  isOpen,
  onClose,
  user,
  locale,
  onLogout,
  onLoginClick,
  currentSpread = "single", 
}: SidebarProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      // show current user records, filter out those with ai_reading starting with "[HIDDEN_ERROR]", and order by created_at descending
      const { data, error } = await supabase
        .from('DrawLog')
        .select('*')
        .eq('user_id', user.id)
        .not('ai_reading', 'ilike', '[HIDDEN_ERROR]%')
        .order('created_at', { ascending: false }); 

      if (error) {
        console.error("读取报错:", error);
        return;
      }

      setHistoryLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false); 
    }
  };

  const handleOpenHistoryClick = () => {
    if (!user) return; 
    fetchHistory(); 
    setShowHistory(true); 
    onClose(); 
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* background */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={onClose} 
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" 
            />
            
            {/* sidebar */}
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }} 
              transition={{ type: "spring", bounce: 0, duration: 0.4 }} 
              className="fixed left-0 top-0 bottom-0 z-[101] w-72 max-w-[80vw] bg-[#0a0612] border-r border-white/15 flex flex-col shadow-2xl"
            >
              {/* user profile */}
              <div className="p-8 pb-6 border-b border-white/5 flex flex-col items-center text-center">
                
                {/* 🌟 profile button */}
                <button 
                  onClick={() => {
                    if (!user && onLoginClick) {
                      onClose();        // sidebar close
                      onLoginClick();   // login modal open
                    }
                  }}
                  className={`relative flex items-center justify-center rounded-full transition-transform ${
                    !user ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default"
                  }`}
                  disabled={!!user} //disable while user is logged in
                >
                  {user?.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      className="w-20 h-20 rounded-full border-2 border-violet-500/30 object-cover shadow-[0_0_20px_rgba(139,92,246,0.2)]" 
                      alt="Avatar"
                    />
                  ) : (
                    
                    <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center text-3xl font-bold text-zinc-100 shadow-[0_0_20px_rgba(139,92,246,0.1)] ${getAvatarColor(user?.email || "")}`}>
                      {getInitial(user?.user_metadata?.full_name || user?.email)}
                    </div>
                  )}
                </button>

                <h3 className="mt-4 text-lg font-medium text-white">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || (locale === "zh" ? "游荡的灵魂" : "Wandering Soul")}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 truncate w-full">
                  {user?.email || (locale === "zh" ? "暂无星界契约" : "No Astral Bond")}
                </p>
              </div>

              {/* function */}
              <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                <button 
                  onClick={handleOpenHistoryClick} 
                  disabled={!user}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 text-sm rounded-2xl transition-colors text-left ${
                    user 
                      ? "text-zinc-300 hover:text-white hover:bg-white/5" 
                      : "text-zinc-600 cursor-not-allowed opacity-50"
                  }`}
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

              {/* logout */}
              {user && (
                <div className="p-4 border-t border-white/5">
                  <button 
                    onClick={async () => {
                      await onLogout();
                      window.location.reload(); 
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {locale === "zh" ? "登出" : "Logout"}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

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