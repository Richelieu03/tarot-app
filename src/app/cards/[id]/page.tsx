// src/app/cards/[id]/page.tsx — one card: image, upright & reversed meanings (bilingual)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TAROT_CARDS } from "../../../lib/tarot-meanings";

const findCard = (id: string) => TAROT_CARDS.find((c) => c.id === id);
import { CARD_GROUPS, cardImage, groupOf, neighbours } from "../../../lib/card-groups";
import { getCardDisplayName } from "../../../lib/tarot-labels";
import type { TarotCard } from "../../../lib/tarot-meanings";
import { CARD_DETAILS } from "../../../lib/tarot-details";
import { getCardFacts } from "../../../lib/card-info";
import Bi from "../../../components/Bi";
import StaticLocaleSwitcher from "../../../components/StaticLocaleSwitcher";

/** Display name (queens show "皇后"); card.name.zh stays the internal id */
const zhTitle = (c: TarotCard) => getCardDisplayName(c.name.zh, "zh");

type Props = { params: Promise<{ id: string }> };

// Pre-render all 78 pages at build time
export function generateStaticParams() {
  return TAROT_CARDS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const card = findCard(id);
  if (!card) return {};
  return {
    title: `${zhTitle(card)} ${card.name.en}`,
    description: `${zhTitle(card)}正位：${card.up.zh} 逆位：${card.rev.zh} | ${card.name.en} upright: ${card.up.en}`,
  };
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const card = findCard(id);
  if (!card) notFound();

  const group = CARD_GROUPS.find((g) => g.key === groupOf(card))!;
  const { prev, next } = neighbours(card.id);
  // Full paragraphs and lore (server-rendered here, so they're in the HTML for search engines)
  const detail = CARD_DETAILS[card.id];
  const factsZh = getCardFacts(card, "zh");
  const factsEn = getCardFacts(card, "en");

  return (
    <div className="relative min-h-screen bg-[#05030a] text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_500px_at_30%_20%,rgba(140,70,255,0.22),transparent_60%)]" />

      <StaticLocaleSwitcher />
      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-20 pt-16 sm:px-6">
        <div className="flex items-center justify-between text-xs tracking-widest text-zinc-500">
          <Link href={`/cards#${group.key}`} className="transition-colors hover:text-violet-300">← <Bi zh="牌义图鉴" en="Card Library" /></Link>
          <Link href="/" className="transition-colors hover:text-violet-300"><Bi zh="神谕之门" en="The Oracle Gate" /> →</Link>
        </div>

        <PrevNext prev={prev} next={next} className="mt-6 border-b border-white/10 pb-4" />

        <div className="mt-10 flex flex-col items-center gap-10 md:flex-row md:items-start">
          {/* card image */}
          <div className="w-[220px] shrink-0 sm:w-[260px]">
            <div className="aspect-[25/43] w-full overflow-hidden border border-amber-400/40 bg-[#0a0612] shadow-[0_0_50px_rgba(140,90,255,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- plain static image */}
              <img src={cardImage(card)} alt={`${zhTitle(card)} ${card.name.en}`} className="h-full w-full object-cover" />
            </div>
          </div>

          {/* text */}
          <div className="w-full">
            <p className="text-xs tracking-[0.3em] text-amber-400/80"><Bi zh={group.zh} en={group.en} /></p>
            {/* Both names stay visible in Chinese mode (handy for learners); English mode shows the English name only */}
            <h1 className="mt-2 text-4xl font-light tracking-[0.1em] text-zinc-100"><Bi zh={zhTitle(card)} en={card.name.en} /></h1>
            <p className="lang-zh mt-1 text-lg text-zinc-400">{card.name.en}</p>
            <p className="mt-2 text-xs text-zinc-500"><Bi zh={group.themeZh} en={group.themeEn} /></p>

            <div className="mt-5 flex flex-wrap gap-2">
              {factsZh.map((f, i) => (
                <div key={f.label} className="rounded-full border border-violet-400/20 bg-violet-500/[0.06] px-3 py-1 text-xs">
                  <span className="text-zinc-500"><Bi zh={f.label} en={factsEn[i]?.label ?? f.label} /></span>
                  <span className="ml-1.5 text-zinc-200"><Bi zh={f.value} en={factsEn[i]?.value ?? f.value} /></span>
                </div>
              ))}
            </div>

            <section className="mt-8 border border-violet-400/20 bg-violet-500/[0.04] p-5">
              <h2 className="text-xs tracking-[0.3em] text-violet-300"><Bi zh="正位" en="UPRIGHT" /></h2>
              <p className="lang-zh mt-3 text-[15px] leading-8 text-zinc-200">{card.up.zh}</p>
              <p className="lang-en mt-3 text-[15px] leading-8 text-zinc-200">{card.up.en}</p>
              {detail && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="lang-zh text-[15px] leading-8 text-zinc-300">{detail.upLong.zh}</p>
                  <p className="lang-en text-[15px] leading-8 text-zinc-300">{detail.upLong.en}</p>
                </div>
              )}
            </section>

            <section className="mt-4 border border-amber-400/20 bg-amber-500/[0.04] p-5">
              <h2 className="text-xs tracking-[0.3em] text-amber-300"><Bi zh="逆位" en="REVERSED" /></h2>
              <p className="lang-zh mt-3 text-[15px] leading-8 text-zinc-200">{card.rev.zh}</p>
              <p className="lang-en mt-3 text-[15px] leading-8 text-zinc-200">{card.rev.en}</p>
              {detail && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="lang-zh text-[15px] leading-8 text-zinc-300">{detail.revLong.zh}</p>
                  <p className="lang-en text-[15px] leading-8 text-zinc-300">{detail.revLong.en}</p>
                </div>
              )}
            </section>

            {detail && (
              <section className="mt-4 border border-white/10 bg-white/[0.02] p-5">
                <h2 className="text-xs tracking-[0.3em] text-zinc-400"><Bi zh="前世今生" en="ORIGINS & SYMBOLS" /></h2>
                <p className="lang-zh mt-3 text-[15px] leading-8 text-zinc-300">{detail.lore.zh}</p>
                <p className="lang-en mt-3 text-[15px] leading-8 text-zinc-300">{detail.lore.en}</p>
              </section>
            )}

            <Link
              href="/"
              className="mt-8 inline-block rounded-full border border-amber-400/30 px-6 py-2.5 text-xs tracking-[0.15em] text-amber-200 transition-colors hover:bg-amber-500/10"
            >
              ☀️ <Bi zh="抽今天的每日一牌" en="Draw today's card" />
            </Link>
          </div>
        </div>

        {/* prev / next (also at the top, so you can flip through without scrolling) */}
        <PrevNext prev={prev} next={next} className="mt-16 border-t border-white/10 pt-6" />
      </main>
    </div>
  );
}

/** Links to the previous and next card */
function PrevNext({ prev, next, className }: { prev: TarotCard; next: TarotCard; className: string }) {
  return (
    <nav className={`flex items-center justify-between text-sm ${className}`}>
      <Link href={`/cards/${prev.id}`} className="text-zinc-400 transition-colors hover:text-violet-300">
        ← <Bi zh={zhTitle(prev)} en={prev.name.en} />
      </Link>
      <Link href={`/cards/${next.id}`} className="text-right text-zinc-400 transition-colors hover:text-violet-300">
        <Bi zh={zhTitle(next)} en={next.name.en} /> →
      </Link>
    </nav>
  );
}
