
import { useEffect, useRef, useState } from "react";
import { calculatePrediction } from "@/utils/prediction/models";
import { fetchMarketSentiment } from "@/utils/analysis/sentiment";

interface UsePredictionOpts {
  prices: number[];
  range: string;
  sentimentEnabled: boolean;
  macd: { macdLine: number; signalLine: number };
  rsi: number;
  backtestReturns: number;
  coinSymbol: string;
}

export function usePrediction({
  prices,
  range,
  sentimentEnabled,
  macd,
  rsi,
  backtestReturns,
  coinSymbol
}: UsePredictionOpts) {
  const [predicted, setPredicted] = useState<number[]>([]);
  const lastInputs = useRef<string>("");

  useEffect(() => {
    let isActive = true;
    // Fallback: always get sentiment before prediction if enabled
    const getSentimentAndPredict = async () => {
      let sentiment = 0;
      if (sentimentEnabled) {
        try {
          const sentimentObj = await fetchMarketSentiment(coinSymbol);
          sentiment = sentimentObj?.score ?? 0;
        } catch {
          sentiment = 0;
        }
      }
      const key = JSON.stringify({
        prices,
        range,
        macd,
        rsi,
        backtestReturns,
        sentiment
      });
      if (lastInputs.current === key) return;
      lastInputs.current = key;
      // Consistent prediction point count by range
      let daysToPredict = 7;
      if (range === "15m") daysToPredict = 4;
      else if (range === "1H") daysToPredict = 8;
      else if (range === "4H") daysToPredict = 10;
      else if (range === "1D") daysToPredict = 7;
      else if (range === "1W") daysToPredict = 4;
      const prediction = calculatePrediction(prices, daysToPredict, {
        prices,
        sentiment,
        backtestReturns,
        rsi,
        macd
      });
      if (isActive) setPredicted(prediction);
    };
    if (prices && prices.length > 2) getSentimentAndPredict();
    else setPredicted([]);
    return () => { isActive = false; };
    // deps should match ALL inputs
    // eslint-disable-next-line
  }, [JSON.stringify(prices), range, macd.macdLine, macd.signalLine, rsi, backtestReturns, coinSymbol, sentimentEnabled]);

  return predicted;
}
