// src/app/cards/page.tsx — 牌义图鉴: browse all 78 cards
import type { Metadata } from "next";
import Link from "next/link";
import { CARD_GROUPS, cardImage, cardsInGroup } from "../../lib/card-groups";

export const metadata: Metadata = {
  title: "牌义图鉴 Card Library",
  description: "78 张韦特塔罗牌的正位与逆位含义，中英双语。The upright and reversed meanings of all 78 Rider–Waite tarot cards, in Chinese and English.",
};

export default function CardLibrary() {
  return (
    <div className="relative min-h-screen bg-[#05030a] text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_0%,rgba(140,70,255,0.22),transparent_60%)]" />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6">
        <Link href="/" className="text-xs tracking-widest text-zinc-500 transition-colors hover:text-violet-300">
          ← 神谕之门 The Oracle Gate
        </Link>

        <header className="mt-8 text-center">
          <p className="text-xs tracking-[0.4em] text-amber-400/80">✦ CARD LIBRARY ✦</p>
          <h1 className="mt-3 text-3xl font-light tracking-[0.2em] text-zinc-100 sm:text-4xl">牌义图鉴</h1>
          <p className="mt-3 text-sm text-zinc-500">78 张韦特塔罗牌的正位与逆位 · The meanings of all 78 cards</p>
        </header>

        {/* jump links */}
        <nav className="sticky top-0 z-20 -mx-4 mt-8 flex justify-center gap-2 overflow-x-auto bg-[#05030a]/80 px-4 py-3 backdrop-blur-md">
          {CARD_GROUPS.map((g) => (
            <a
              key={g.key}
              href={`#${g.key}`}
              className="shrink-0 rounded-full border border-white/10 px-4 py-1.5 text-xs text-zinc-300 transition-colors hover:border-violet-400/50 hover:text-violet-200"
            >
              {g.zh}
            </a>
          ))}
        </nav>

        {CARD_GROUPS.map((g) => (
          <section key={g.key} id={g.key} className="scroll-mt-20 pt-12">
            <div className="mb-6 border-b border-white/10 pb-3">
              <h2 className="text-xl font-light tracking-[0.15em] text-zinc-100">
                {g.zh} <span className="ml-2 text-sm tracking-normal text-zinc-500">{g.en}</span>
              </h2>
              <p className="mt-1 text-xs text-amber-400/70">{g.themeZh} · {g.themeEn}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-5 md:grid-cols-6">
              {cardsInGroup(g.key).map((card) => (
                <Link key={card.id} href={`/cards/${card.id}`} className="group flex flex-col items-center gap-2 text-center">
                  <div className="aspect-[25/43] w-full overflow-hidden border border-white/10 bg-[#0a0612] shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:border-amber-400/50 group-hover:shadow-[0_0_25px_rgba(140,90,255,0.4)]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- plain static images, lazy-loaded */}
                    <img src={cardImage(card)} alt={`${card.name.zh} ${card.name.en}`} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm text-zinc-100 transition-colors group-hover:text-amber-200">{card.name.zh}</div>
                    <div className="text-[10px] text-zinc-500">{card.name.en}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
