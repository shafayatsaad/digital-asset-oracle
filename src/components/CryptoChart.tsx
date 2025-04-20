import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Line
} from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import CoinSearch from './CoinSearch';
import TechnicalIndicators from './TechnicalIndicators';
import CorrelationMatrix from './CorrelationMatrix';
import SettingsPanel from './SettingsPanel';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, ChartBar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  calculateRSI, 
  calculateMACD, 
  calculateBollingerBands,
  calculatePrediction
} from '@/utils/analyticsUtils';

const generateDataForTimeRange = (timeRange: string, selectedCoin: { symbol: string; name: string }) => {
  let basePrice = coinData[selectedCoin.symbol as keyof typeof coinData]?.price || 84000;
  let volatility = 0;
  let dataPoints = 0;
  let timeFormat = '';

  switch(timeRange) {
    case '15m':
      dataPoints = 60;
      volatility = 20;
      timeFormat = 'HH:mm';
      break;
    case '1H':
      dataPoints = 60;
      volatility = 50;
      timeFormat = 'HH:mm';
      break;
    case '4H':
      dataPoints = 48;
      volatility = 100;
      timeFormat = 'HH:mm';
      break;
    case '1D':
      dataPoints = 24;
      volatility = 200;
      timeFormat = 'HH:mm';
      break;
    case '1W':
      dataPoints = 7;
      volatility = 400;
      timeFormat = 'ddd';
      break;
    default:
      dataPoints = 60;
      volatility = 20;
      timeFormat = 'HH:mm';
  }

  const startDate = new Date();
  startDate.setMinutes(0, 0, 0);

  const data = [];
  let currentPrice = basePrice;

  for (let i = 0; i < dataPoints; i++) {
    const change = (Math.random() - 0.5) * volatility;
    currentPrice += change;
    
    const date = new Date(startDate);
    
    if (timeRange === '15m') {
      date.setMinutes(date.getMinutes() - (dataPoints - i - 1) * 15);
    } else if (timeRange === '1H') {
      date.setMinutes(date.getMinutes() - (dataPoints - i - 1) * 60);
    } else if (timeRange === '4H') {
      date.setHours(date.getHours() - (dataPoints - i - 1) * 4);
    } else if (timeRange === '1D') {
      date.setHours(date.getHours() - (dataPoints - i - 1) * 24);
    } else if (timeRange === '1W') {
      date.setDate(date.getDate() - (dataPoints - i - 1));
    }

    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    
    data.push({
      time: timeStr,
      price: parseFloat(currentPrice.toFixed(1)),
      volume: Math.floor(Math.random() * 100000)
    });
  }

  return { data, timeFormat };
};

const coinData = {
  'BTCUSDT': {
    price: 84289.6,
    color: '#F7931A'
  },
  'ETHUSDT': {
    price: 3189.4,
    color: '#627EEA'
  },
  'BNBUSDT': {
    price: 589.8,
    color: '#F3BA2F'
  },
  'ADAUSDT': {
    price: 0.45,
    color: '#0033AD'
  },
  'SOLUSDT': {
    price: 165.2,
    color: '#14F195'
  },
  'XRPUSDT': {
    price: 0.591,
    color: '#23292F'
  },
  'DOGEUSDT': {
    price: 0.123,
    color: '#C2A633'
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const currentPrice = payload[0].value;
    const dataPoints = payload[0].payload.dataPoints || [];
    
    const previousPrice = dataPoints.length > 1 ? dataPoints[0].price : currentPrice;
    const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;
    const isPositive = percentChange >= 0;

    return (
      <div className="bg-[#1A1F2C] border border-[#2A2F3C] p-2 rounded-md shadow-lg">
        <p className="text-[#8E9196] text-xs">{label}</p>
        <p className="text-white font-medium">${currentPrice.toLocaleString()}</p>
        <p className={cn(
          "text-xs font-medium",
          isPositive ? "text-green-500" : "text-red-500"
        )}>
          {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

// Collect all coin data to use for correlation analysis
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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const { data: newData, timeFormat: newTimeFormat } = generateDataForTimeRange(selectedRange, selectedCoin);
    
    // Prepare data for chart
    const chartData = newData.map((item, index, arr) => ({
      ...item,
      dataPoints: arr.slice(Math.max(0, index - 1), index + 1)
    }));
    
    // Calculate technical indicators
    const prices = chartData.map(item => item.price);
    const newRsiData = calculateRSI(prices);
    const newMacdData = calculateMACD(prices);
    const newBollingerBands = calculateBollingerBands(prices);
    const newPredictionData = calculatePrediction(prices, 5); // Predict 5 periods ahead
    
    setData(chartData);
    setRsiData(newRsiData);
    setMacdData(newMacdData);
    setBollingerBands(newBollingerBands);
    setPredictionData(newPredictionData);
    setTimeFormat(newTimeFormat);
    
    // Store this coin's data for correlation analysis
    allCoinsData[selectedCoin.symbol] = chartData;
    
    // Update all coins data for correlation matrix
    const updatedAllCoins = Object.keys(allCoinsData).map(symbol => {
      const coin = { 
        symbol, 
        name: Object.keys(coinData).includes(symbol) 
          ? symbol.replace('USDT', '') 
          : symbol,
        data: allCoinsData[symbol] 
      };
      return coin;
    });
    
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
  };
  
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
    e.preventDefault();
  }, []);
  
  const calculateDomain = () => {
    if (!data.length) return ['auto', 'auto'];
    
    const prices = data.map(item => item.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    const padding = range * 0.1;
    
    const zoomedRange = range / zoomLevel;
    const midPoint = (max + min) / 2;
    
    return [
      midPoint - (zoomedRange / 2) - padding,
      midPoint + (zoomedRange / 2) + padding
    ];
  };

  // Add prediction data to chart
  const prepareChartData = () => {
    if (!showPredictions || !predictionData.length) return data;
    
    // Create extended data with predictions
    const result = [...data];
    
    // Get the last real data point time
    const lastTime = data[data.length - 1].time;
    const lastDate = new Date();
    lastDate.setHours(parseInt(lastTime.split(':')[0]), parseInt(lastTime.split(':')[1]));
    
    // Add prediction points
    for (let i = 0; i < predictionData.length; i++) {
      const nextDate = new Date(lastDate);
      
      // Increment time based on the selected range
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
        price: null, // No real price
        predictedPrice: predictionData[i],
        isPrediction: true
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
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <CoinSearch selectedCoin={selectedCoin} onCoinChange={handleCoinChange} />
              <TimeRangeSelector selectedRange={selectedRange} onRangeChange={handleRangeChange} />
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[#8E9196] text-sm">
                Last Price: <span style={{ color: chartColor }}>${currentPrice.toLocaleString()}</span>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-transparent border-[#2A2F3C] text-[#8E9196] hover:text-white hover:bg-[#2A2F3C]"
                onClick={zoomIn}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-transparent border-[#2A2F3C] text-[#8E9196] hover:text-white hover:bg-[#2A2F3C]"
                onClick={zoomOut}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "bg-transparent border-[#2A2F3C] text-[#8E9196] hover:text-white hover:bg-[#2A2F3C]",
                  showIndicators && "text-white bg-[#2A2F3C]"
                )}
                onClick={() => setShowIndicators(prev => !prev)}
              >
                <ChartBar className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div 
            className="h-[400px] w-full" 
            ref={chartContainerRef}
            onWheel={handleWheel}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`colorPrice-${selectedCoin.symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  stroke="#8E9196" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#2A2F3C' }}
                />
                <YAxis 
                  stroke="#8E9196"
                  fontSize={10}
                  domain={calculateDomain()}
                  tickCount={8}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                  tickLine={false}
                  axisLine={{ stroke: '#2A2F3C' }}
                  orientation="right"
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: '#8E9196',
                    strokeWidth: 1,
                    strokeDasharray: '5 5'
                  }}
                />
                <ReferenceLine
                  y={currentPrice}
                  stroke="#8E9196"
                  strokeDasharray="3 3"
                />
                
                {/* Bollinger Bands */}
                {showIndicators && showBollingerBands && bollingerBands && (
                  <>
                    <Line
                      type="monotone"
                      dataKey={(entry) => {
                        const index = data.findIndex(d => d.time === entry.time);
                        return index !== -1 ? bollingerBands.upper[index] : null;
                      }}
                      stroke="#f43f5e"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey={(entry) => {
                        const index = data.findIndex(d => d.time === entry.time);
                        return index !== -1 ? bollingerBands.middle[index] : null;
                      }}
                      stroke="#8E9196"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey={(entry) => {
                        const index = data.findIndex(d => d.time === entry.time);
                        return index !== -1 ? bollingerBands.lower[index] : null;
                      }}
                      stroke="#22c55e"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </>
                )}
                
                {/* Main price chart */}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  fillOpacity={1}
                  fill={`url(#colorPrice-${selectedCoin.symbol})`}
                  strokeWidth={2}
                />
                
                {/* Prediction line */}
                {showPredictions && (
                  <Line
                    type="monotone"
                    dataKey="predictedPrice"
                    stroke="#9333ea"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: "#9333ea" }}
                    activeDot={{ r: 6, fill: "#9333ea" }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-[#8E9196] text-xs">
              {showPredictions ? 
                "Showing price prediction (dashed line)" : 
                "Click to show price prediction"
              }
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "bg-transparent border-[#2A2F3C] text-[#8E9196] hover:text-white hover:bg-[#2A2F3C]",
                showPredictions && "text-white bg-[#2A2F3C]"
              )}
              onClick={() => handlePredictionsChange(prev => !prev)}
            >
              {showPredictions ? "Hide Prediction" : "Show Prediction"}
            </Button>
          </div>
        </Card>
      
        {/* Technical Indicators */}
        {showIndicators && (
          <TechnicalIndicators 
            data={data} 
            rsiData={rsiData}
            macdData={macdData}
            bollingerBands={showBollingerBands ? bollingerBands : undefined}
            timeFormat={timeFormat}
          />
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
        
        {/* Correlation Matrix */}
        {showCorrelation && (
          <CorrelationMatrix coins={allCoins} />
        )}
      </div>
    </div>
  );
};

export default CryptoChart;
