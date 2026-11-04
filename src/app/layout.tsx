import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalBackground from "../components/GlobalBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://ashleystarot.netlify.app";
const DESCRIPTION =
  "Ashley's Tarot · 神谕之门 — 每日一牌、单牌问答与圣三角牌阵，AI 结合你的问题给出专属塔罗解读。Daily tarot cards, single-card questions and three-card spreads with personal AI readings.";

// Icons and the share image come from file conventions in this folder:
// icon.svg (favicon), apple-icon.png (iOS home screen), opengraph-image.jpg (link previews)
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ashley's Tarot · 神谕之门",
    template: "%s · Ashley's Tarot",
  },
  description: DESCRIPTION,
  keywords: ["塔罗", "塔罗牌", "每日一牌", "塔罗占卜", "AI 塔罗", "tarot", "daily tarot", "tarot reading"],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Ashley's Tarot",
    title: "Ashley's Tarot · 神谕之门",
    description: DESCRIPTION,
    locale: "zh_CN",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ashley's Tarot · 神谕之门",
    description: DESCRIPTION,
  },
};

// Umami analytics: set NEXT_PUBLIC_UMAMI_WEBSITE_ID (in .env.local and on Netlify) to enable
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {UMAMI_WEBSITE_ID && (
          <Script src="https://cloud.umami.is/script.js" data-website-id={UMAMI_WEBSITE_ID} strategy="afterInteractive" />
        )}
        <GlobalBackground />
        {children}
      </body>
    </html>
  );
}