// src/components/ShareCardButton.tsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Locale } from "../lib/locale";
import { renderShareCard, type ShareCardInput } from "../lib/share-card";
import { t } from "../lib/ui-i18n";
import { track } from "../lib/analytics";

interface ShareCardButtonProps {
  locale: Locale;
  /** Called on click so the card always reflects the latest reading */
  getInput: () => ShareCardInput;
}

/** Button that renders a share image and opens a preview with share / save actions */
export default function ShareCardButton({ locale, getInput }: ShareCardButtonProps) {
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [canShareFile, setCanShareFile] = useState(false);

  // Release the object URL when the preview closes / changes
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  // Lock page scrolling while the preview is open (html + body: iOS Safari ignores body alone)
  useEffect(() => {
    if (!url) return;
    const html = document.documentElement;
    const prev = { html: html.style.overflow, body: document.body.style.overflow, touch: document.body.style.touchAction };
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      html.style.overflow = prev.html;
      document.body.style.overflow = prev.body;
      document.body.style.touchAction = prev.touch;
    };
  }, [url]);

  const open = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const input = getInput();
      track("share_card_open", { kind: input.kind, cards: input.cards.length });
      const blob = await renderShareCard(input);
      const f = new File([blob], `ashleys-tarot-${Date.now()}.png`, { type: "image/png" });
      setFile(f);
      setUrl(URL.createObjectURL(blob));
      // Web Share API with files: mainly iOS Safari / Android Chrome
      setCanShareFile(typeof navigator !== "undefined" && !!navigator.canShare?.({ files: [f] }));
    } catch (err) {
      console.error("Share card render failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setUrl(null);
    setFile(null);
  };

  const share = async () => {
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: "Ashley's Tarot" });
      track("share_card_shared");
    } catch {
      // user cancelled the share sheet — nothing to do
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={busy}
        className="rounded-full border border-violet-400/40 px-6 py-2.5 text-xs tracking-[0.15em] text-violet-200 transition-colors hover:bg-violet-500/10 disabled:opacity-50"
      >
        {busy ? t(locale, "shareRendering") : `✦ ${t(locale, "shareCard")}`}
      </button>

      <AnimatePresence>
        {url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[220] flex items-center justify-center overscroll-contain bg-black/85 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-full w-full max-w-sm flex-col items-center gap-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- blob URL, not optimisable */}
              <img
                src={url}
                alt={t(locale, "shareCard")}
                className="max-h-[70vh] w-auto rounded-lg border border-white/10 shadow-[0_0_40px_rgba(140,90,255,0.35)]"
              />
              <p className="text-[11px] text-zinc-500">{t(locale, "shareLongPressHint")}</p>
              <div className="flex gap-3">
                {canShareFile && (
                  <button
                    type="button"
                    onClick={share}
                    className="rounded-full bg-violet-600 px-6 py-2.5 text-xs tracking-[0.15em] text-white transition-colors hover:bg-violet-500"
                  >
                    {t(locale, "shareNow")}
                  </button>
                )}
                <a
                  href={url}
                  download={file?.name}
                  onClick={() => track("share_card_saved")}
                  className="rounded-full border border-amber-400/40 px-6 py-2.5 text-xs tracking-[0.15em] text-amber-200 transition-colors hover:bg-amber-500/10"
                >
                  {t(locale, "shareSave")}
                </a>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full border border-white/15 px-6 py-2.5 text-xs tracking-[0.15em] text-zinc-400 transition-colors hover:bg-white/5"
                >
                  {t(locale, "shareClose")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
