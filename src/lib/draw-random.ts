import { TAROT_DECK } from "./tarot-deck";

export function pickRandomTarotCard(): { name: string; reversed: boolean } {
  const randomIndex = Math.floor(Math.random() * TAROT_DECK.length);
  const name = TAROT_DECK[randomIndex] as string;
  const reversed = Math.random() > 0.5;
  return { name, reversed };
}
