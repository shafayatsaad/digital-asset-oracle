
import { useState, useEffect } from "react";
import { fetchMarketSentiment } from "@/utils/analysis/sentiment";

export function useMarketSentiment(symbol: string) {
  const [sentimentData, setSentimentData] = useState<{ score: number; source: string; trend: 'positive' | 'negative' | 'neutral'; } | null>(null);
  useEffect(() => {
    if (!symbol) {
      setSentimentData(null);
      return;
    }
    fetchMarketSentiment(symbol).then(setSentimentData).catch(() => setSentimentData(null));
  }, [symbol]);
  return sentimentData;
}
