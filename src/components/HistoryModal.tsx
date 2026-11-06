// src/components/HistoryModal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCardDisplayName } from "../lib/tarot-labels";
import ReadingText from "./ReadingText";

// 🌟 1. 定义多牌阵里单张牌的数据结构
interface CardItem {
  name: string;
  is_reversed?: boolean;
  isReversed?: boolean; // 兼容可能存在的前端命名
  position_label?: string; // 例如："过去" | "现在" | "未来"
}

// 🌟 2. 扩展历史记录日志接口，兼容新老字段
interface DrawLog {
  id: number;
  created_at: string;
  question: string;
  ai_reading: string;
  
  // 单牌阵数据
  card_name?: string;
  is_reversed?: boolean;
  
  // 兼容新数据（你的数据库中已存在的字段）
  spread_type?: "single" | "trinity" | string;
  spread_data?: CardItem[] | null;
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
                
                // 🌟 判断是否为多牌阵
                const isMultiCard = Array.isArray(log.spread_data) && log.spread_data.length > 0;
                const spreadBadgeLabel = 
                  log.spread_type === "trinity" ? (locale === "zh" ? "圣三角" : "Trinity") : 
                  log.spread_type === "celtic" ? (locale === "zh" ? "凯尔特" : "Celtic Cross") : null;

                return (
                  <motion.div 
                    layout="position" 
                    key={log.id} 
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)} 
                    className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-4 cursor-pointer transition-colors hover:bg-white/[0.06]"
                  >
                    {/* 卡片头部说明与展开箭头 */}
                    <div className={`flex justify-between items-start ${isExpanded ? "border-b border-white/5 pb-4" : ""}`}>
                      <div className="w-full mr-4">
                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                          <span className="font-mono tracking-wider">{formatDate(log.created_at)}</span>
                          
                          {/* 每日一牌 badge for single-card daily draws */}
                          {!isMultiCard && log.spread_type === "daily" && (
                            <span className="rounded-full px-2.5 py-0.5 text-[10px] tracking-widest font-medium border border-violet-400/30 bg-violet-400/10 text-violet-300">
                              {locale === "zh" ? "每日一牌" : "Daily"}
                            </span>
                          )}
                          {/* 🌟 牌阵类型标签：多牌阵才显示独立 Badge */}
                          {isMultiCard && spreadBadgeLabel && (
                            <span className="rounded-full px-2.5 py-0.5 text-[10px] tracking-widest font-medium border border-amber-400/30 bg-amber-400/10 text-amber-300">
                              {spreadBadgeLabel}
                            </span>
                          )}
                        </div>

                        {/* core card display logic */}
                        {isMultiCard ? (
                          /* 多牌阵渲染 */
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {log.spread_data!.map((card, idx) => {
                              const reversed = card.is_reversed !== undefined ? card.is_reversed : card.isReversed;
                              const displayName = locale === "en" ? getCardDisplayName(card.name, "en") : card.name;
                              return (
                                <div 
                                  key={idx} 
                                  className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-black/40 p-2.5 text-center shadow-inner"
                                >
                                  {card.position_label && (
                                    <span className="mb-1 text-[10px] text-amber-400/70 tracking-widest">
                                      {card.position_label}
                                    </span>
                                  )}
                                  <span className="text-xs font-semibold text-zinc-100 line-clamp-1">
                                    {displayName}
                                  </span>
                                  <span className={`mt-1 text-[10px] px-1.5 py-0.5 rounded-full border border-white/5 ${
                                    reversed ? "bg-amber-500/10 text-amber-300" : "bg-violet-500/10 text-violet-300"
                                  }`}>
                                    {reversed ? (locale === "zh" ? "逆位" : "Rev") : (locale === "zh" ? "正位" : "Upr")}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* 单牌阵渲染 */
                          <div className="text-lg font-bold text-violet-300 drop-shadow-md">
                            {locale === "en" && log.card_name ? getCardDisplayName(log.card_name, "en") : (log.card_name || "未知卡牌")} 
                            <span className="text-xs ml-2 font-normal text-zinc-400 border border-white/10 px-2 py-0.5 rounded-full bg-black/30">
                              {log.is_reversed ? (locale === "zh" ? "逆位" : "Reversed") : (locale === "zh" ? "正位" : "Upright")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 展开箭头的旋转动画 */}
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-zinc-500 mt-1 shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </div>

                    {/* 所测之惑 */}
                    {log.question && (
                      <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                        <div className="text-[10px] text-zinc-500 mb-1">{locale === "zh" ? "所测之惑" : "Question"}</div>
                        <div className={`text-sm text-zinc-200 leading-relaxed italic ${!isExpanded ? "line-clamp-2" : ""}`}>
                          "{log.question}"
                        </div>
                      </div>
                    )}

                    {/* 详细解牌结果展开框 */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="pt-2">
                            <div className="text-[10px] text-zinc-500 mb-2">{locale === "zh" ? "神谕启示" : "Revelation"}</div>
                            <div className="text-sm text-zinc-300 leading-7 font-serif whitespace-pre-wrap"><ReadingText text={log.ai_reading} /></div>
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