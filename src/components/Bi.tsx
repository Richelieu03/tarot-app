// src/components/Bi.tsx
/**
 * Bilingual text for static pages: both languages are in the HTML (good for search engines),
 * and CSS in globals.css shows only the one matching <html data-lang>.
 */
export default function Bi({ zh, en }: { zh: React.ReactNode; en: React.ReactNode }) {
  return (
    <>
      <span className="lang-zh">{zh}</span>
      <span className="lang-en">{en}</span>
    </>
  );
}
