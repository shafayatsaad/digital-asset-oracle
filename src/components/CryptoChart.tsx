
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TechnicalIndicators from './TechnicalIndicators';
import CorrelationMatrix from './CorrelationMatrix';
import SettingsPanel from './SettingsPanel';
import ChartControls from './chart/ChartControls';
import PriceChart from './chart/PriceChart';
import { coinData } from '@/utils/chart/coinData';
import { generateDataForTimeRange } from '@/utils/chart/generateData';
import { 
  calculateRSI, 
  calculateMACD, 
  calculateBollingerBands 
} from '@/utils/technical';
import { calculatePrediction } from '@/utils/prediction/models';
import { calculateCorrelation } from '@/utils/analysis/correlation';
import { fetchMarketSentiment } from '@/utils/analysis/sentiment';
import { runBacktest } from '@/utils/analysis/backtest';

const allCoinsData: { [key: string]: any[] } = {};

const CryptoChart = () => {
  const { toast } = useToast();
  const [showBollingerBands, setShowBollingerBands] = useState(true);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showCorrelation, setShowCorrelation] = useState(true);
  const [selectedRange, setSelectedRange] = useState('15m');
  const [selectedCoin, setSelectedCoin] = useState({ symbol: 'BTCUSDT', name: 'Bitcoin' });
  const [showIndicators, setShowIndicators] = useState(true);
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
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { data: newData, timeFormat: newTimeFormat } = generateDataForTimeRange(selectedRange, selectedCoin);
    
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
    
    const predictionPoints = 7;
    const lastThirtyPrices = prices.slice(-30);
    const newPredictionData = calculatePrediction(lastThirtyPrices, predictionPoints);
    
    // Fetch sentiment data
    fetchMarketSentiment(selectedCoin.symbol).then(sentiment => {
      setSentimentData(sentiment);
    }).catch(err => {
      console.error("Error fetching sentiment:", err);
    });
    
    // Run backtest for the current data
    const newBacktestResults = runBacktest(prices);
    setBacktestResults(newBacktestResults);
    
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
  }, [selectedRange, selectedCoin]);
  
  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
  };
  
  const handleCoinChange = (coin: { symbol: string; name: string }) => {
    setSelectedCoin(coin);
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

  const prepareChartData = () => {
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
  const chartData = prepareChartData();

  const handleBollingerBandsChange = (checked: boolean) => {
    setShowBollingerBands(checked);
    toast({
      title: checked ? "Bollinger Bands Enabled" : "Bollinger Bands Disabled",
      description: checked ? "Price volatility bands are now visible" : "Price volatility bands are now hidden"
    });
  };

  const handlePredictionsChange = (checked: boolean) => {
    setShowPredictions(checked);
    toast({
      title: checked ? "Price Predictions Enabled" : "Price Predictions Disabled",
      description: checked ? "ML-based price predictions are now visible" : "ML-based price predictions are now hidden"
    });
  };

  const handleCorrelationChange = (checked: boolean) => {
    setShowCorrelation(checked);
    toast({
      title: checked ? "Correlation Analysis Enabled" : "Correlation Analysis Disabled",
      description: checked ? "Multi-asset correlation matrix is now visible" : "Multi-asset correlation matrix is now hidden"
    });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card className="w-full bg-[#1A1F2C] border-none p-4">
          <ChartControls
            selectedCoin={selectedCoin}
            selectedRange={selectedRange}
            showIndicators={showIndicators}
            currentPrice={currentPrice}
            chartColor={chartColor}
            onCoinChange={handleCoinChange}
            onRangeChange={handleRangeChange}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onToggleIndicators={() => setShowIndicators(prev => !prev)}
          />
          
          <div className="h-[400px] w-full" ref={chartContainerRef}>
            <PriceChart
              data={chartData}
              chartColor={chartColor}
              currentPrice={currentPrice}
              zoomLevel={zoomLevel}
              showIndicators={showIndicators}
              showBollingerBands={showBollingerBands}
              bollingerBands={bollingerBands}
              showPredictions={showPredictions}
            />
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-[#8E9196] text-xs">
              {showPredictions ? 
                "Showing price prediction (purple line)" : 
                "Click to show price prediction"
              }
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`bg-transparent border-[#2A2F3C] text-[#8E9196] hover:text-white hover:bg-[#2A2F3C] ${
                showPredictions && "text-white bg-[#2A2F3C]"
              }`}
              onClick={() => setShowPredictions(!showPredictions)}
            >
              {showPredictions ? "Hide Prediction" : "Show Prediction"}
            </Button>
          </div>
        </Card>
      
        <TechnicalIndicators 
          data={data} 
          rsiData={rsiData}
          macdData={macdData}
          bollingerBands={showBollingerBands ? bollingerBands : undefined}
          timeFormat={timeFormat}
        />
        
        {sentimentData && (
          <SentimentCard sentiment={sentimentData} />
        )}
        
        {backtestResults && (
          <BacktestCard results={backtestResults} />
        )}
      </div>
      
      <div className="lg:col-span-1 space-y-4">
        <SettingsPanel 
          showBollingerBands={showBollingerBands}
          onBollingerBandsChange={handleBollingerBandsChange}
          showPredictions={showPredictions}
          onPredictionsChange={handlePredictionsChange}
          showCorrelation={showCorrelation}
          onCorrelationChange={handleCorrelationChange}
        />
        
        <CorrelationMatrix coins={allCoins} visible={showCorrelation} />
      </div>
    </div>
  );
};

export default CryptoChart;
