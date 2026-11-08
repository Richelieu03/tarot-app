import type { MetadataRoute } from "next";

// Web app manifest: lets "Add to Home Screen" open full-screen like an app, with a dark splash instead of a white flash
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ashley's Tarot · 神谕之门",
    short_name: "Ashley's Tarot",
    description: "每日一牌、单牌问答与圣三角牌阵 · Daily tarot with personal AI readings",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#05030a",
    theme_color: "#05030a",
    lang: "zh-CN",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
