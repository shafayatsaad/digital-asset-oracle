
import { useEffect, useRef, useState } from "react";
import { calculatePrediction } from "@/utils/prediction/models";
import { useMarketSentiment } from "./useMarketSentiment";

interface UsePredictionOpts {
  prices: number[];
  range: string;
  macd: { macdLine: number; signalLine: number };
  rsi: number;
  backtestReturns: number;
  coinSymbol: string;
}

export function usePredictionWithSentiment({
  prices,
  range,
  macd,
  rsi,
  backtestReturns,
  coinSymbol
}: UsePredictionOpts) {
  const [predicted, setPredicted] = useState<number[]>([]);
  const lastInputs = useRef<string>("");
  const sentimentObj = useMarketSentiment(coinSymbol);

  useEffect(() => {
    let isActive = true;
    const sentimentScore = sentimentObj?.score ?? 0;
    const key = JSON.stringify({
      prices,
      range,
      macd,
      rsi,
      backtestReturns,
      sentiment: sentimentScore,
    });
    if (lastInputs.current === key) return;
    lastInputs.current = key;

    let daysToPredict = 7;
    if (range === "15m") daysToPredict = 4;
    else if (range === "1H") daysToPredict = 8;
    else if (range === "4H") daysToPredict = 10;
    else if (range === "1D") daysToPredict = 7;
    else if (range === "1W") daysToPredict = 4;

    if (prices && prices.length > 2) {
      const prediction = calculatePrediction(prices, daysToPredict, {
        prices,
        sentiment: sentimentScore,
        backtestReturns,
        rsi,
        macd,
      });
      if (isActive) setPredicted(prediction);
    } else {
      setPredicted([]);
    }
    return () => { isActive = false; };
    // eslint-disable-next-line
  }, [JSON.stringify(prices), range, macd.macdLine, macd.signalLine, rsi, backtestReturns, sentimentObj?.score]);

  return predicted;
}
