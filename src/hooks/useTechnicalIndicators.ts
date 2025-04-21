
import { useState, useEffect } from "react";
import { calculateRSI, calculateMACD, calculateBollingerBands } from "@/utils/technical";

export function useTechnicalIndicators(data: any[]) {
  const [rsiData, setRsiData] = useState<number[]>([]);
  const [macdData, setMacdData] = useState<{ macdLine: number[]; signalLine: number[]; histogram: number[]; }>({ macdLine: [], signalLine: [], histogram: [] });
  const [bollingerBands, setBollingerBands] = useState<{ upper: number[]; middle: number[]; lower: number[]; }>({ upper: [], middle: [], lower: [] });

  useEffect(() => {
    if (!data.length) {
      setRsiData([]);
      setMacdData({ macdLine: [], signalLine: [], histogram: [] });
      setBollingerBands({ upper: [], middle: [], lower: [] });
      return;
    }
    const prices = data.map(item => item.price);
    setRsiData(calculateRSI(prices));
    setMacdData(calculateMACD(prices));
    setBollingerBands(calculateBollingerBands(prices));
  }, [data]);

  return { rsiData, macdData, bollingerBands };
}
