// src/app/single/page.tsx — 单牌问答 (one card for a specific question)
import type { Metadata } from "next";
import SingleCardReading from "../../components/SingleCardReading";

export const metadata: Metadata = {
  title: "单牌问答 Single Card",
  description: "带着一个具体的问题抽一张牌，AI 结合牌面为你解读。Ask one question, draw one card, get a personal AI reading.",
};

export default function SingleQuestion() {
  return <SingleCardReading mode="question" />;
}
