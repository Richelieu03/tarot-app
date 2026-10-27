import type { Locale } from "./locale";

const ui = {
  en: {
    title: "The Oracle Gate",
    subtitleSelecting: "Draw one card from the spread below—follow your intuition.",
    subtitleAfterSelect: "The wheel of fate is turning, click to reveal.",
    upright: "Upright",
    reversed: "Reversed",
    oracleBadge: "TAROT ORACLE",
    readingHeader: "TAROT MASTER READING",
    readingLoading: "Channeling…",
    readingDone: "The oracle has spoken",
    readingWait: "Waiting to reveal",
    errorBusy: "The seer is overwhelmed right now…",
    retryButton: "Call the seer again",
    placeholderSelecting:
      "Still your mind and choose the card that calls to you.",
    placeholderAfterPick:
      "The card has chosen its place. Take a breath, then click the card to reveal the oracle.",
    placeholderThinking: "The master is gathering thoughts…",
    dailyRecapTitle: "Today's vision (recap)",
    dailyRecapFooter:
      "The stars ask for one draw per day. This was yours for today—return tomorrow to seek the next thread.",
    energyErrorIntro:
      "The previous vision could not be fully received. Tap the button below to try again.",
    energyErrorKeyword: "Energy field fluctuation",
    langShort: "EN",
    langOther: "中文",
    readPrompt: "Reading",
    ariaTarotBack: "Tarot card back",
    ariaFanCard: "Tarot card in spread",
    ritualSubtitle:
      "Quiet your mind. Speak what seeks an answer—then step into the spread.",
    questionPlaceholder:
      "  Hold your question in silence, then write it here…",
    enterSpread: "Enter the Spread",
    subtitleRevealed: "Your card has been revealed.",
    readingRevealed: "Card revealed",
    meaningTitle: "Card meaning",
    personalReadingTitle: "Personal reading",
    loginForReading: "QUICK LOGIN",
    yourQuestion: "Your question",
    drawAgain: "Draw again",
    spreadRevealed: "The answer surfaces.",
    getReading: "Get my reading",
    editQuestion: "Edit",
    addQuestion: "Add a question",
    noQuestion: "No question — general guidance",
    remainingToday: "left today",
    spreadLimitReached: "Today's three questions have been asked. Return when the stars realign tomorrow.",
    // Neutral positions: the AI picks the narrative frame (past/present/future, self/other/bond, ...)
    slot1: "Card I",
    slot2: "Card II",
    slot3: "Card III",
    readSpreadPrompt: "Please interpret my Three-Card Spread:",
  },
  zh: {
    title: "神谕之门",
    subtitleSelecting: "请从下方牌阵中，凭直觉抽取一张牌",
    subtitleAfterSelect: "点击牌背，揭晓指引",
    upright: "正位",
    reversed: "逆位",
    oracleBadge: "塔罗神谕",
    readingHeader: "塔罗大师解读",
    readingLoading: "正在通灵…",
    readingDone: "神谕已降临",
    readingWait: "等待翻牌",
    errorBusy: "算命师现在太忙了…",
    retryButton: "重新呼唤算命师",
    placeholderSelecting: "凝神静气，选出呼唤你的那张牌。",
    placeholderAfterPick: "牌已落定。请深呼吸，点击卡牌揭晓神谕…",
    placeholderThinking: "大师正在整理思绪…",
    dailyRecapTitle: "今日神谕回溯",
    dailyRecapFooter:
      "命运的指引每日只需一次，以上为你的今日专属解读，请明日再来探寻未知的轨迹。",
    energyErrorIntro:
      "先前的通灵未能完整传达。请点击下方按钮重新尝试连接。",
    energyErrorKeyword: "灵力场波动",
    langShort: "中文",
    langOther: "EN",
    readPrompt: "请解牌",
    ariaTarotBack: "塔罗牌背",
    ariaFanCard: "牌阵中的塔罗牌",
    ritualSubtitle: "静心凝神，将想问之事诉诸笔墨，再步入牌阵。",
    questionPlaceholder: "  在心中默念并输入你的问题…",
    enterSpread: "进入牌阵",
    subtitleRevealed: "你的牌已揭晓",
    readingRevealed: "牌面已揭晓",
    meaningTitle: "牌面释义",
    personalReadingTitle: "专属解读",
    loginForReading: "快速登录解牌",
    yourQuestion: "你的问题",
    drawAgain: "再占一次",
    spreadRevealed: "答案浮现",
    getReading: "获取解读",
    editQuestion: "修改",
    addQuestion: "添加问题",
    noQuestion: "未填写问题，将给出通用指引",
    remainingToday: "今日剩余",
    spreadLimitReached: "今日的三次叩问已尽，待明日星辰重新排列，再来聆听。",
    slot1: "第一张",
    slot2: "第二张",
    slot3: "第三张",
    readSpreadPrompt: "请为我的三牌阵进行综合占卜：",
  },
} as const;

export type UiKey = keyof typeof ui.en;

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}

export function formatDailyRecap(savedReading: string, locale: Locale): string {
  const title = t(locale, "dailyRecapTitle");
  const foot = t(locale, "dailyRecapFooter");
  if (locale === "en") {
    return `${title}\n\n${savedReading}\n\n${foot}`;
  }
  return `【${title}】\n\n${savedReading}\n\n（${foot}）`;
}

export function isEnergyRecoveryBlock(completion: string): boolean {
  return (
    completion.includes("灵力场波动") ||
    completion.includes(t("en", "energyErrorKeyword"))
  );
}
