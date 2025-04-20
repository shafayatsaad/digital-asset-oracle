
import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import CoinSearch from './CoinSearch';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Generate more realistic sample data
const generateDataForTimeRange = (timeRange: string) => {
  // Base price around 84000 with some volatility
  let basePrice = 84000;
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

  // Create an array of timestamps and prices
  const startDate = new Date();
  startDate.setMinutes(0, 0, 0);

  const data = [];
  let currentPrice = basePrice;

  for (let i = 0; i < dataPoints; i++) {
    // Generate a random price movement
    const change = (Math.random() - 0.5) * volatility;
    currentPrice += change;
    
    // Create a timestamp
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

    // Format the time string based on the time range
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

  return data;
};

const coinData = {
  'BTCUSDT': {
    price: 84289.6,
    color: '#F7931A' // Bitcoin orange
  },
  'ETHUSDT': {
    price: 3189.4,
    color: '#627EEA' // Ethereum blue
  },
  'BNBUSDT': {
    price: 589.8,
    color: '#F3BA2F' // Binance yellow
  },
  'ADAUSDT': {
    price: 0.45,
    color: '#0033AD' // Cardano blue
  },
  'SOLUSDT': {
    price: 165.2,
    color: '#14F195' // Solana green
  },
  'XRPUSDT': {
    price: 0.591,
    color: '#23292F' // XRP black
  },
  'DOGEUSDT': {
    price: 0.123,
    color: '#C2A633' // Dogecoin gold
  }
};

const CryptoChart = () => {
  const [selectedRange, setSelectedRange] = useState('15m');
  const [selectedCoin, setSelectedCoin] = useState({ symbol: 'BTCUSDT', name: 'Bitcoin' });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [data, setData] = useState(() => generateDataForTimeRange('15m'));
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Update data when range or coin changes
  React.useEffect(() => {
    setData(generateDataForTimeRange(selectedRange));
  }, [selectedRange, selectedCoin]);
  
  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
  };
  
  const handleCoinChange = (coin: { symbol: string; name: string }) => {
    setSelectedCoin(coin);
  };
  
  // Zoom in and out functions
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };
  
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  // Handle mouse wheel zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
    e.preventDefault();
  }, []);
  
  // Calculate chart domain based on zoom level
  const calculateDomain = () => {
    if (!data.length) return ['auto', 'auto'];
    
    const prices = data.map(item => item.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    const padding = range * 0.1; // Add 10% padding
    
    const zoomedRange = range / zoomLevel;
    const midPoint = (max + min) / 2;
    
    return [
      midPoint - (zoomedRange / 2) - padding,
      midPoint + (zoomedRange / 2) + padding
    ];
  };

  const chartColor = coinData[selectedCoin.symbol as keyof typeof coinData]?.color || '#9b87f5';
  const currentPrice = coinData[selectedCoin.symbol as keyof typeof coinData]?.price || 0;
  
  return (
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
        </div>
      </div>
      <div 
        className="h-[400px] w-full" 
        ref={chartContainerRef}
        onWheel={handleWheel}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`colorPrice-${selectedCoin.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
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
              contentStyle={{ 
                backgroundColor: '#1A1F2C',
                border: '1px solid #2A2F3C',
                borderRadius: '4px'
              }}
              labelStyle={{ color: '#8E9196' }}
              itemStyle={{ color: chartColor }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Price']}
            />
            <ReferenceLine
              y={currentPrice}
              stroke="#8E9196"
              strokeDasharray="3 3"
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              fillOpacity={1}
              fill={`url(#colorPrice-${selectedCoin.symbol})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CryptoChart;
