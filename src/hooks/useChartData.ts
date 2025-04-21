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

// Initialize an object to store data for all coins
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
  
  // Add ref to store generated data to prevent unnecessary regeneration
  const dataGeneratedRef = useRef<{
    coin: string;
    range: string;
    data: any;
  } | null>(null);

  useEffect(() => {
    // Only regenerate data when coin or range changes
    const shouldRegenerateData = !dataGeneratedRef.current || 
      dataGeneratedRef.current.coin !== selectedCoin.symbol || 
      dataGeneratedRef.current.range !== selectedRange;
    
    let newData;
    let newTimeFormat;
    
    if (shouldRegenerateData) {
      const generatedData = generateDataForTimeRange(selectedRange, selectedCoin);
      newData = generatedData.data;
      newTimeFormat = generatedData.timeFormat;
      
      // Store generated data
      dataGeneratedRef.current = {
        coin: selectedCoin.symbol,
        range: selectedRange,
        data: generatedData
      };
    } else {
      // Use cached data
      newData = dataGeneratedRef.current.data.data;
      newTimeFormat = dataGeneratedRef.current.data.timeFormat;
    }
    
    const chartData = newData.map((item, index, arr) => ({
      ...item,
      dataPoints: arr.slice(Math.max(0, index - 1), index + 1)
    }));
    
    const prices = chartData.map(item => item.price);
    const newRsiData = calculateRSI(prices);
    const newMacdData = calculateMACD(prices);
    const newBollingerBands = calculateBollingerBands(prices);
    
    // Add Bollinger Bands to chart data
    const enhancedChartData = chartData.map((item, i) => ({
      ...item,
      upper: newBollingerBands.upper[i],
      middle: newBollingerBands.middle[i],
      lower: newBollingerBands.lower[i]
    }));
    
    // Only update sentiment data when coin or range changes
    if (shouldRegenerateData) {
      fetchMarketSentiment(selectedCoin.symbol).then(sentiment => {
        setSentimentData(sentiment);
      }).catch(err => {
        console.error("Error fetching sentiment:", err);
      });
      
      // Run backtest for the current data
      const newBacktestResults = runBacktest(prices);
      setBacktestResults(newBacktestResults);
    }
    
    // Generate predictions using all available data points
    const predictionPoints = 7;
    const predictionInputs = {
      prices,
      sentiment: sentimentData?.score || 0,
      backtestReturns: backtestResults?.returns || 0,
      rsi: newRsiData[newRsiData.length - 1] || 50,
      macd: {
        macdLine: newMacdData.macdLine[newMacdData.macdLine.length - 1] || 0,
        signalLine: newMacdData.signalLine[newMacdData.signalLine.length - 1] || 0,
      }
    };
    
    const newPredictionData = calculatePrediction(
      predictionInputs.prices,
      predictionPoints,
      predictionInputs
    );
    
    setData(enhancedChartData);
    setRsiData(newRsiData);
    setMacdData(newMacdData);
    setBollingerBands(newBollingerBands);
    setPredictionData(newPredictionData);
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
  }, [selectedRange, selectedCoin]);  // Removed other dependencies to prevent rapid updates
  
  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    toast({
      title: "Timeframe Changed",
      description: `Chart now showing ${range} timeframe data`
    });
  };
  
  const handleCoinChange = (coin: { symbol: string; name: string }) => {
    setSelectedCoin(coin);
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
    if (!showPredictions || !predictionData.length) return data;
    
    const result = [...data];
    
    const lastDataPoint = data[data.length - 1];
    const lastTime = lastDataPoint.time;
    const lastPrice = lastDataPoint.price;
    
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

  const chartColor = coinData[selectedCoin.symbol as keyof typeof coinData]?.color || '#9b87f5';
  const currentPrice = coinData[selectedCoin.symbol as keyof typeof coinData]?.price || 0;

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
