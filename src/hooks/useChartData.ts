import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { coinData } from '@/utils/chart/coinData';
import { generateDataForTimeRange } from '@/utils/chart/generateData';
import { 
  calculateRSI, 
  calculateMACD, 
  calculateBollingerBands 
} from '@/utils/technical';
import { calculatePrediction } from '@/utils/prediction/models';
import { fetchMarketSentiment } from '@/utils/analysis/sentiment';
import { runBacktest } from '@/utils/analysis/backtest';

const allCoinsData: { [key: string]: any[] } = {};

export const useChartData = (initialCoin = { symbol: 'BTCUSDT', name: 'Bitcoin' }, initialRange = '15m') => {
  const { toast } = useToast();
  const [selectedRange, setSelectedRange] = useState(initialRange);
  const [selectedCoin, setSelectedCoin] = useState(initialCoin);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [rsiData, setRsiData] = useState<number[]>([]);
  const [macdData, setMacdData] = useState<{
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
  }>({ macdLine: [], signalLine: [], histogram: [] });
  const [bollingerBands, setBollingerBands] = useState<{
    upper: number[];
    middle: number[];
    lower: number[];
  }>({ upper: [], middle: [], lower: [] });
  const [predictionData, setPredictionData] = useState<number[]>([]);
  const [timeFormat, setTimeFormat] = useState('');
  const [allCoins, setAllCoins] = useState<{
    symbol: string;
    name: string;
    data: any[];
  }[]>([]);
  const [sentimentData, setSentimentData] = useState<{
    score: number;
    source: string;
    trend: 'positive' | 'negative' | 'neutral';
  } | null>(null);
  const [backtestResults, setBacktestResults] = useState<{
    returns: number;
    winRate: number;
    maxDrawdown: number;
  } | null>(null);

  const lastPredictionInputs = useRef<any>({});
  const dataGeneratedRef = useRef<{
    coin: string;
    range: string;
    data: any;
  } | null>(null);

  useEffect(() => {
    if (initialCoin.symbol !== selectedCoin.symbol) {
      setSelectedCoin(initialCoin);
      dataGeneratedRef.current = null;
    }
  }, [initialCoin]);

  useEffect(() => {
    const shouldRegenerateData = !dataGeneratedRef.current ||
      dataGeneratedRef.current.coin !== selectedCoin.symbol ||
      dataGeneratedRef.current.range !== selectedRange;

    let newData, newTimeFormat;
    if (shouldRegenerateData) {
      const generatedData = generateDataForTimeRange(selectedRange, selectedCoin);
      newData = generatedData.data;
      newTimeFormat = generatedData.timeFormat;

      dataGeneratedRef.current = {
        coin: selectedCoin.symbol,
        range: selectedRange,
        data: generatedData,
      };
    } else {
      newData = dataGeneratedRef.current.data.data;
      newTimeFormat = dataGeneratedRef.current.data.timeFormat;
    }

    const chartData = newData.map((item, idx, arr) => ({
      ...item,
      dataPoints: arr.slice(Math.max(0, idx - 1), idx + 1),
    }));

    if (chartData.length === 0) {
      setData([]);
      setRsiData([]);
      setMacdData({ macdLine: [], signalLine: [], histogram: [] });
      setBollingerBands({ upper: [], middle: [], lower: [] });
      setPredictionData([]);
      return;
    }

    const prices = chartData.map(item => item.price);
    const newRsiData = calculateRSI(prices);
    const newMacdData = calculateMACD(prices);
    const newBollingerBands = calculateBollingerBands(prices);

    const enhancedChartData = chartData.map((item, i) => ({
      ...item,
      upper: newBollingerBands.upper[i],
      middle: newBollingerBands.middle[i],
      lower: newBollingerBands.lower[i]
    }));

    if (shouldRegenerateData) {
      setSentimentData(null);
      fetchMarketSentiment(selectedCoin.symbol).then(sentiment => {
        setSentimentData(sentiment);
      }).catch(err => {
        setSentimentData(null);
        console.error("Error fetching sentiment:", err);
      });

      const newBacktestResults = runBacktest(prices);
      setBacktestResults(newBacktestResults);
    }

    setData(enhancedChartData);
    setRsiData(newRsiData);
    setMacdData(newMacdData);
    setBollingerBands(newBollingerBands);
    setTimeFormat(newTimeFormat);

    allCoinsData[selectedCoin.symbol] = enhancedChartData;
    const updatedAllCoins = Object.keys(allCoinsData).map(symbol => ({
      symbol,
      name: Object.keys(coinData).includes(symbol)
        ? symbol.replace('USDT', '')
        : symbol,
      data: allCoinsData[symbol]
    }));
    setAllCoins(updatedAllCoins);
  }, [selectedRange, selectedCoin]);

  useEffect(() => {
    if (!data.length) return;
    const prices = data.map(d => d.price);

    const rsiCurrent = rsiData.length ? rsiData[rsiData.length - 1] : 50;
    const macd = {
      macdLine: (macdData.macdLine.length ? macdData.macdLine.at(-1) : 0) ?? 0,
      signalLine: (macdData.signalLine.length ? macdData.signalLine.at(-1) : 0) ?? 0,
    };

    const predInputs = {
      prices,
      sentiment: sentimentData?.score || 0,
      backtestReturns: backtestResults?.returns || 0,
      rsi: rsiCurrent,
      macd,
    };
    const predInputsHash = JSON.stringify(predInputs);

    if (lastPredictionInputs.current[selectedCoin.symbol + selectedRange] === predInputsHash) {
      return;
    }

    lastPredictionInputs.current[selectedCoin.symbol + selectedRange] = predInputsHash;

    const predictionPoints = 7;
    const prediction = calculatePrediction(
      predInputs.prices,
      predictionPoints,
      {
        ...predInputs
      }
    );
    setPredictionData(prediction);
  }, [data, rsiData, macdData, sentimentData, backtestResults, selectedCoin.symbol, selectedRange]);

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    toast({
      title: "Timeframe Changed",
      description: `Chart now showing ${range} timeframe data`
    });
  };

  const handleCoinChange = (coin: { symbol: string; name: string }) => {
    setSelectedCoin(coin);
    dataGeneratedRef.current = null;
    toast({
      title: "Asset Changed",
      description: `Now showing data for ${coin.name}`
    });
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
    toast({
      title: "Zoom In",
      description: "Chart view zoomed in"
    });
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    toast({
      title: "Zoom Out",
      description: "Chart view zoomed out"
    });
  };

  const prepareChartData = (showPredictions: boolean) => {
    if (!data.length) return [];
    if (!showPredictions || !predictionData.length) return data;

    const result = [...data];
    const lastDataPoint = data[data.length - 1];
    const lastPrice = lastDataPoint.price;
    const lastTime = lastDataPoint.time;

    const lastDate = new Date();
    if (lastTime.includes(':')) {
      const [hours, minutes] = lastTime.split(':').map(Number);
      lastDate.setHours(hours, minutes);
    }
    for (let i = 0; i < predictionData.length; i++) {
      const nextDate = new Date(lastDate);
      if (selectedRange === '15m') {
        nextDate.setMinutes(nextDate.getMinutes() + (i + 1) * 15);
      } else if (selectedRange === '1H') {
        nextDate.setHours(nextDate.getHours() + (i + 1));
      } else if (selectedRange === '4H') {
        nextDate.setHours(nextDate.getHours() + (i + 1) * 4);
      } else if (selectedRange === '1D') {
        nextDate.setDate(nextDate.getDate() + (i + 1));
      } else if (selectedRange === '1W') {
        nextDate.setDate(nextDate.getDate() + (i + 1) * 7);
      }
      const timeStr = nextDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      result.push({
        time: timeStr,
        price: null,
        predictedPrice: predictionData[i],
        isPrediction: true,
        dataPoints: [{ price: lastPrice }, { price: predictionData[i] }]
      });
    }
    return result;
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
