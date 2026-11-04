// src/app/spread/layout.tsx — the spread page is a client component, so its metadata lives here
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "圣三角阵 Three-Card Spread",
  description: "三张牌交织出你此刻的命运图景，AI 根据问题自选叙事框架给出整体解读。Three cards woven into one AI reading of your question.",
};

export default function SpreadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
