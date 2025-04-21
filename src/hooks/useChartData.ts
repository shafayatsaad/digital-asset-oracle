
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { coinData } from '@/utils/chart/coinData';
import { generateDataForTimeRange } from '@/utils/chart/generateData';
import { runBacktest } from '@/utils/analysis/backtest';
import { useTechnicalIndicators } from './useTechnicalIndicators';
import { usePredictionWithSentiment } from './usePredictionWithSentiment';
import { useMarketSentiment } from './useMarketSentiment';
import { prepareChartDataWithPrediction } from '@/utils/chart/predictionOverlay';

const allCoinsData: { [key: string]: any[] } = {};

export const useChartData = (initialCoin = { symbol: 'BTCUSDT', name: 'Bitcoin' }, initialRange = '15m') => {
  const { toast } = useToast();
  const [selectedRange, setSelectedRange] = useState(initialRange);
  const [selectedCoin, setSelectedCoin] = useState(initialCoin);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [timeFormat, setTimeFormat] = useState('');
  const [allCoins, setAllCoins] = useState<{ symbol: string; name: string; data: any[]; }[]>([]);
  const [backtestResults, setBacktestResults] = useState<{ returns: number; winRate: number; maxDrawdown: number; } | null>(null);

  const dataGeneratedRef = useRef<{ coin: string; range: string; data: any; } | null>(null);

  useEffect(() => {
    if (initialCoin.symbol !== selectedCoin.symbol) {
      setSelectedCoin(initialCoin);
      dataGeneratedRef.current = null;
    }
  }, [initialCoin]);

  useEffect(() => {
    const shouldRegenerateData = !dataGeneratedRef.current || dataGeneratedRef.current.coin !== selectedCoin.symbol || dataGeneratedRef.current.range !== selectedRange;

    let newData, newTimeFormat;
    if (shouldRegenerateData) {
      const generatedData = generateDataForTimeRange(selectedRange, selectedCoin);
      newData = generatedData.data;
      newTimeFormat = generatedData.timeFormat;
      dataGeneratedRef.current = { coin: selectedCoin.symbol, range: selectedRange, data: generatedData };
    } else {
      newData = dataGeneratedRef.current.data.data;
      newTimeFormat = dataGeneratedRef.current.data.timeFormat;
    }
    const chartData = newData.map((item, idx, arr) => ({
      ...item, dataPoints: arr.slice(Math.max(0, idx - 1), idx + 1),
    }));

    setData(chartData);
    setTimeFormat(newTimeFormat);

    allCoinsData[selectedCoin.symbol] = chartData;
    const updatedAllCoins = Object.keys(allCoinsData).map(symbol => ({
      symbol,
      name: Object.keys(coinData).includes(symbol)
        ? symbol.replace('USDT', '')
        : symbol,
      data: allCoinsData[symbol]
    }));
    setAllCoins(updatedAllCoins);

    if (shouldRegenerateData) {
      const prices = chartData.map(item => item.price);
      setBacktestResults(runBacktest(prices));
    }
  }, [selectedRange, selectedCoin]);

  const sentimentData = useMarketSentiment(selectedCoin.symbol);
  const { rsiData, macdData, bollingerBands } = useTechnicalIndicators(data);

  const prices = data.map(d => d.price ?? null).filter((n): n is number => n !== null);
  const rsiCurrent = rsiData.length ? rsiData[rsiData.length - 1] : 50;
  const macd = {
    macdLine: (macdData.macdLine.length ? macdData.macdLine.at(-1) : 0) ?? 0,
    signalLine: (macdData.signalLine.length ? macdData.signalLine.at(-1) : 0) ?? 0,
  };
  const predictionData = usePredictionWithSentiment({
    prices,
    range: selectedRange,
    macd,
    rsi: rsiCurrent,
    backtestReturns: backtestResults?.returns || 0,
    coinSymbol: selectedCoin.symbol
  });

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    toast({ title: "Timeframe Changed", description: `Chart now showing ${range} timeframe data` });
  };

  const handleCoinChange = (coin: { symbol: string; name: string }) => {
    setSelectedCoin(coin);
    dataGeneratedRef.current = null;
    toast({ title: "Asset Changed", description: `Now showing data for ${coin.name}` });
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
    toast({ title: "Zoom In", description: "Chart view zoomed in" });
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    toast({ title: "Zoom Out", description: "Chart view zoomed out" });
  };

  // Refactored: prepare chart data (with/without prediction overlay)
  const prepareChartData = (showPredictions: boolean) => {
    return prepareChartDataWithPrediction(data, showPredictions ? predictionData : [], selectedRange);
  };

  const chartColor = coinData[selectedCoin.symbol]?.color || '#9b87f5';
  const currentPrice = coinData[selectedCoin.symbol]?.price || 0;

  return {
    selectedCoin,
    selectedRange,
    data,
    rsiData,
    macdData,
    bollingerBands,
    predictionData,
    timeFormat,
    allCoins,
    sentimentData,
    backtestResults,
    zoomLevel,
    chartColor,
    currentPrice,
    handleRangeChange,
    handleCoinChange,
    zoomIn,
    zoomOut,
    prepareChartData
  };
};
