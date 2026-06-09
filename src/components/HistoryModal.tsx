// src/components/HistoryModal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCardDisplayName } from "../lib/tarot-labels";

// 复用历史记录的数据结构
interface DrawLog {
  id: number;
  created_at: string;
  card_name: string;
  is_reversed: boolean;
  question: string;
  ai_reading: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  logs: DrawLog[];
  locale: "zh" | "en";
}

export default function HistoryModal({ isOpen, onClose, isLoading, logs, locale }: HistoryModalProps) {
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: "100%" }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: "100%" }} 
          transition={{ type: "spring", damping: 25, stiffness: 200 }} 
          className="fixed inset-0 z-[120] bg-[#05030a] overflow-y-auto"
        >
          {/* 顶部标题栏 */}
          <div className="sticky top-0 z-10 bg-[#05030a]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-light tracking-widest text-zinc-100">
              {locale === "zh" ? "命运日志" : "Destiny Log"}
            </h2>
            <button 
              onClick={() => { onClose(); setExpandedLogId(null); }} 
              className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 历史记录列表内容 */}
          <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
            {isLoading ? (
              <div className="flex justify-center py-20 text-violet-400 animate-pulse">
                {locale === "zh" ? "正在翻阅阿卡西记录..." : "Retrieving Akashic Records..."}
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center text-center py-20 text-zinc-500">
                <div className="text-4xl mb-4">🪶</div>
                <p>{locale === "zh" ? "你的命运之书还是一片空白" : "Your Book of Destiny is empty"}</p>
              </div>
            ) : (
              logs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <motion.div 
                    layout="position" 
                    key={log.id} 
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)} 
                    className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-4 cursor-pointer transition-colors hover:bg-white/[0.06]"
                  >
                    <div className={`flex justify-between items-start ${isExpanded ? "border-b border-white/5 pb-4" : ""}`}>
                      <div>
                        <div className="text-xs text-zinc-500 mb-1 font-mono tracking-wider">{formatDate(log.created_at)}</div>
                        <div className="text-lg font-bold text-violet-300 drop-shadow-md">
                          {locale === "en" ? getCardDisplayName(log.card_name, "en") : log.card_name} 
                          <span className="text-xs ml-2 font-normal text-zinc-400 border border-white/10 px-2 py-0.5 rounded-full bg-black/30">
                            {log.is_reversed ? (locale === "zh" ? "逆位" : "Reversed") : (locale === "zh" ? "正位" : "Upright")}
                          </span>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-zinc-500 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </div>

                    {log.question && (
                      <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <div className="text-[10px] text-zinc-500 mb-1">{locale === "zh" ? "所测之惑" : "Question"}</div>
                        <div className={`text-sm text-zinc-200 leading-relaxed italic ${!isExpanded ? "line-clamp-2" : ""}`}>
                          "{log.question}"
                        </div>
                      </div>
                    )}

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="pt-2">
                            <div className="text-[10px] text-zinc-500 mb-2">{locale === "zh" ? "神谕启示" : "Revelation"}</div>
                            <div className="text-sm text-zinc-300 leading-7 font-serif whitespace-pre-wrap">{log.ai_reading}</div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}