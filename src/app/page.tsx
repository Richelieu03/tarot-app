// src/app/page.tsx — home page: 每日一牌 (daily card, today's fortune)
import SingleCardReading from "../components/SingleCardReading";

export default function Home() {
  return <SingleCardReading mode="daily" />;
}
