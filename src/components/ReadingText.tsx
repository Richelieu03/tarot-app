// src/components/ReadingText.tsx
// Renders AI reading text: **bold** becomes <strong>; stray "**" (e.g. mid-stream) is hidden.

export default function ReadingText({ text }: { text: string }) {
  const parts = text.split(/\*\*([^*\n]+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold not-italic text-amber-100">{part}</strong>
        ) : (
          // unmatched markers left over while the text is still streaming in
          <span key={i}>{part.replace(/\*\*/g, "")}</span>
        ),
      )}
    </>
  );
}
