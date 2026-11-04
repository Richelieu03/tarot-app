// src/app/cards/[id]/page.tsx — one card: image, upright & reversed meanings (bilingual)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TAROT_CARDS } from "../../../lib/tarot-meanings";

const findCard = (id: string) => TAROT_CARDS.find((c) => c.id === id);
import { CARD_GROUPS, cardImage, groupOf, neighbours } from "../../../lib/card-groups";

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
    title: `${card.name.zh} ${card.name.en}`,
    description: `${card.name.zh}正位：${card.up.zh} 逆位：${card.rev.zh} | ${card.name.en} upright: ${card.up.en}`,
  };
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const card = findCard(id);
  if (!card) notFound();

  const group = CARD_GROUPS.find((g) => g.key === groupOf(card))!;
  const { prev, next } = neighbours(card.id);

  return (
    <div className="relative min-h-screen bg-[#05030a] text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_500px_at_30%_20%,rgba(140,70,255,0.22),transparent_60%)]" />

      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-20 pt-8 sm:px-6">
        <div className="flex items-center justify-between text-xs tracking-widest text-zinc-500">
          <Link href={`/cards#${group.key}`} className="transition-colors hover:text-violet-300">← 牌义图鉴 Card Library</Link>
          <Link href="/" className="transition-colors hover:text-violet-300">神谕之门 →</Link>
        </div>

        <div className="mt-10 flex flex-col items-center gap-10 md:flex-row md:items-start">
          {/* card image */}
          <div className="w-[220px] shrink-0 sm:w-[260px]">
            <div className="aspect-[25/43] w-full overflow-hidden border border-amber-400/40 bg-[#0a0612] shadow-[0_0_50px_rgba(140,90,255,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- plain static image */}
              <img src={cardImage(card)} alt={`${card.name.zh} ${card.name.en}`} className="h-full w-full object-cover" />
            </div>
          </div>

          {/* text */}
          <div className="w-full">
            <p className="text-xs tracking-[0.3em] text-amber-400/80">{group.zh} · {group.en}</p>
            <h1 className="mt-2 text-4xl font-light tracking-[0.1em] text-zinc-100">{card.name.zh}</h1>
            <p className="mt-1 text-lg text-zinc-400">{card.name.en}</p>
            <p className="mt-2 text-xs text-zinc-500">{group.themeZh}</p>

            <section className="mt-8 border border-violet-400/20 bg-violet-500/[0.04] p-5">
              <h2 className="text-xs tracking-[0.3em] text-violet-300">正位 · UPRIGHT</h2>
              <p className="mt-3 text-[15px] leading-8 text-zinc-200">{card.up.zh}</p>
              <p className="mt-2 text-sm italic leading-7 text-zinc-400">{card.up.en}</p>
            </section>

            <section className="mt-4 border border-amber-400/20 bg-amber-500/[0.04] p-5">
              <h2 className="text-xs tracking-[0.3em] text-amber-300">逆位 · REVERSED</h2>
              <p className="mt-3 text-[15px] leading-8 text-zinc-200">{card.rev.zh}</p>
              <p className="mt-2 text-sm italic leading-7 text-zinc-400">{card.rev.en}</p>
            </section>

            <Link
              href="/"
              className="mt-8 inline-block rounded-full border border-amber-400/30 px-6 py-2.5 text-xs tracking-[0.15em] text-amber-200 transition-colors hover:bg-amber-500/10"
            >
              ☀️ 抽今天的每日一牌 Draw today&apos;s card
            </Link>
          </div>
        </div>

        {/* prev / next */}
        <nav className="mt-16 flex items-center justify-between border-t border-white/10 pt-6 text-sm">
          <Link href={`/cards/${prev.id}`} className="text-zinc-400 transition-colors hover:text-violet-300">
            ← {prev.name.zh} <span className="text-xs text-zinc-600">{prev.name.en}</span>
          </Link>
          <Link href={`/cards/${next.id}`} className="text-right text-zinc-400 transition-colors hover:text-violet-300">
            {next.name.zh} <span className="text-xs text-zinc-600">{next.name.en}</span> →
          </Link>
        </nav>
      </main>
    </div>
  );
}
