"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
import { useEffect, useState, type CSSProperties } from "react";
import "./tarot-spread.css";
import { pickRandomTarotCard } from "../lib/draw-random";
import type { Locale } from "../lib/locale";
import { LOCALE_STORAGE_KEY, defaultLocale, isLocale } from "../lib/locale";
import { getCardDisplayName } from "../lib/tarot-labels";
import {
  formatDailyRecap,
  isEnergyRecoveryBlock,
  t,
} from "../lib/ui-i18n";

export default function Home() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [appLoaded, setAppLoaded] = useState(false);
  const [isSelecting, setIsSelecting] = useState(true);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const [flipped, setFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState("愚者");
  const [isReversed, setIsReversed] = useState(false);

  const { completion, complete, error, isLoading, setCompletion } =
    useCompletion({
      api: "/api/tarot",
      streamProtocol: "text",
      onFinish: (_prompt, result) => {
        if (
          result.length > 10 &&
          !result.includes("Error") &&
          !result.includes("limit")
        ) {
          localStorage.setItem("tarot_last_ai_reading", result);
        }
      },
    });

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }
  }, [locale]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const savedLocaleRaw = localStorage.getItem(LOCALE_STORAGE_KEY);
      const initialLocale = isLocale(savedLocaleRaw)
        ? savedLocaleRaw
        : defaultLocale;
      setLocale(initialLocale);

      const today = new Date().toLocaleDateString();
      const lastDrawDate = localStorage.getItem("tarot_last_draw_date");

      if (lastDrawDate === today) {
        const savedCard =
          localStorage.getItem("tarot_last_drawn_card") || "命运之轮";
        const savedReversed =
          localStorage.getItem("tarot_last_card_reversed") === "true";
        setIsReversed(savedReversed);
        setCurrentCard(savedCard);
        setFlipped(true);
        setIsSelecting(false);

        const savedReading = localStorage.getItem("tarot_last_ai_reading");
        if (savedReading) {
          setCompletion(formatDailyRecap(savedReading, initialLocale));
        } else {
          setCompletion(
            `🔮 ${t(initialLocale, "energyErrorKeyword")}：${t(initialLocale, "energyErrorIntro")}`,
          );
        }
      }
      setAppLoaded(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [setCompletion]);

  const handleSelectFromFan = (index: number) => {
    if (!isSelecting) return;

    setClickedIndex(index);
    setIsSelecting(false);

    const today = new Date().toLocaleDateString();
    const { name: pickedCard, reversed: isRev } = pickRandomTarotCard();

    setCurrentCard(pickedCard);
    setIsReversed(isRev);

    localStorage.setItem("tarot_last_draw_date", today);
    localStorage.setItem("tarot_last_drawn_card", pickedCard);
    localStorage.setItem("tarot_last_card_reversed", isRev.toString());
    localStorage.removeItem("tarot_last_ai_reading");

    setCompletion("");
  };

  const handleMainCardClick = () => {
    if (flipped || isSelecting) return;
    setFlipped(true);
    void complete(t(locale, "readPrompt"), {
      body: { cardName: currentCard, isReversed, locale },
    });
  };

  const retryReading = () => {
    setCompletion("");
    void complete(t(locale, "readPrompt"), {
      body: { cardName: currentCard, isReversed, locale },
    });
  };

  const cardLabel = getCardDisplayName(currentCard, locale);
  const orientationLabel = isReversed
    ? t(locale, "reversed")
    : t(locale, "upright");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05030a] font-sans text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_25%,rgba(140,70,255,0.25),transparent_60%)]" />

      <div className="fixed right-4 top-4 z-[100] flex gap-1 rounded-full border border-white/15 bg-black/45 p-1 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
            locale === "en"
              ? "bg-violet-600/80 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLocale("zh")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
            locale === "zh"
              ? "bg-violet-600/80 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          中文
        </button>
      </div>

      <main
        className={`relative z-10 flex w-full max-w-3xl flex-col items-center px-6 py-12 text-center ${isSelecting ? "max-md:pb-[220px]" : ""}`}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
          {t(locale, "title")}
        </h1>
        <p className="mt-4 text-sm text-zinc-400">
          {isSelecting
            ? t(locale, "subtitleSelecting")
            : t(locale, "subtitleAfterSelect")}
        </p>

        <div
          className="w-[250px] -translate-y-[20px] max-md:w-[140px] max-md:-translate-y-[20px] max-md:mb-2 aspect-[25/43] [perspective:1200px]"
          >
          <AnimatePresence>
            {!isSelecting && appLoaded && (
              <motion.div
                layoutId={
                  clickedIndex !== null
                    ? `fan-card-${clickedIndex}`
                    : "tarot-main-card"
                }
                onClick={handleMainCardClick}
                className={`relative h-full w-full rounded-none [transform-style:preserve-3d] ${!flipped && !isSelecting ? "cursor-pointer transition-shadow hover:shadow-[0_0_30px_rgba(167,139,250,0.3)]" : ""}`}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{
                  layout: { type: "spring", stiffness: 200, damping: 25 },
                  duration: 0.8,
                }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-none border border-white/10 bg-[#0a0612] shadow-2xl [backface-visibility:hidden] [transform:translateZ(0)]"
                >
                  <img
                    src="/tarot/维特牌背.jpg"
                    alt={t(locale, "ariaTarotBack")}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </div>

                <div
                  className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-none border border-white/20 bg-black shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(0.1px)]"
                >
                  <img
                    src={`/tarot/${currentCard}.jpg`}
                    alt={cardLabel}
                    className={`absolute inset-0 h-full w-full object-cover object-center opacity-90 ${isReversed ? "rotate-180" : ""}`}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1620052579624-b153545faed8?q=80&w=400&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="relative z-10 mt-auto w-full px-6 pb-8 text-center">
                    <div className="text-[10px] tracking-[0.3em] text-violet-400 drop-shadow-md">
                      {t(locale, "oracleBadge")}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white drop-shadow-xl">
                      {cardLabel}{" "}
                      <span className="ml-1 text-lg font-normal text-zinc-300">
                        ({orientationLabel})
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className={`relative z-20 w-full max-w-lg -translate-y-[10px] max-md:translate-y-0 ${isSelecting ? "max-md:mt-16" : "max-md:mt-6"}`}
        >
          <div className="rounded-none border border-white/5 bg-white/5 p-6 shadow-xl backdrop-blur-2xl transition-opacity duration-700">
            <div className="mb-4 flex items-center justify-between text-[10px] tracking-widest text-zinc-500">
              <span>{t(locale, "readingHeader")}</span>
              <span
                className={isLoading ? "animate-pulse text-violet-400" : ""}
              >
                {isLoading
                  ? t(locale, "readingLoading")
                  : flipped
                    ? t(locale, "readingDone")
                    : t(locale, "readingWait")}
              </span>
            </div>

            <div className="min-h-[120px] whitespace-pre-wrap text-left font-serif text-[15px] italic leading-8 text-zinc-200">
              {error ||
              (isEnergyRecoveryBlock(completion) && !isLoading) ? (
                <div className="flex flex-col items-start text-sm text-red-400/80">
                  <p>
                    🔮 {t(locale, "energyErrorKeyword")}:{" "}
                    {t(locale, "errorBusy")}
                  </p>
                  <button
                    type="button"
                    onClick={retryReading}
                    className="mt-4 border border-violet-500/50 px-5 py-2 text-xs tracking-wider text-violet-400 transition-colors hover:bg-violet-500/20"
                  >
                    {t(locale, "retryButton")}
                  </button>
                </div>
              ) : completion ? (
                completion
              ) : (
                <span className="text-zinc-600">
                  {flipped
                    ? t(locale, "placeholderThinking")
                    : isSelecting
                      ? t(locale, "placeholderSelecting")
                      : t(locale, "placeholderAfterPick")}
                </span>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="tarot-fan-scene">
        <div className="tarot-fan-scene__inner">
          <AnimatePresence mode="sync">
            {isSelecting && appLoaded ? (
              <ul className="tarot-fan-track" key="tarot-fan-track">
                {Array.from({ length: 22 }).map((_, i) => (
                  <motion.li
                    key={`fan-card-${i}`}
                    layoutId={`fan-card-${i}`}
                    layout={false}
                    initial={false}
                    exit={{ opacity: 0, transition: { duration: 0.38 } }}
                    className="tarot-fan-cell"
                    style={{ "--i": i } as CSSProperties}
                    onClick={() => handleSelectFromFan(i)}
                  >
                    <div className="tarot-fan-face relative h-full w-full overflow-hidden rounded-none">
                      <img
                        src="/tarot/维特牌背.jpg"
                        className="h-full w-full rounded-none object-cover object-center"
                        alt={t(locale, "ariaFanCard")}
                        draggable={false}
                      />
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
