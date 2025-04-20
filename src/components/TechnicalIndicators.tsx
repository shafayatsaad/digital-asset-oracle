
import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ReferenceLine,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';

interface TechnicalIndicatorsProps {
  data: any[];
  rsiData?: number[];
  macdData?: {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
  };
  bollingerBands?: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  timeFormat?: string;
  className?: string;
}

const CustomRSITooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const rsiValue = payload[0].value;
    
    let status = "Neutral";
    let color = "text-[#8E9196]";
    
    if (rsiValue >= 70) {
      status = "Overbought";
      color = "text-red-500";
    } else if (rsiValue <= 30) {
      status = "Oversold";
      color = "text-green-500";
    }
    
    return (
      <div className="bg-[#1A1F2C] border border-[#2A2F3C] p-2 rounded-md shadow-lg">
        <p className="text-[#8E9196] text-xs">{label}</p>
        <p className="text-white font-medium">RSI: {rsiValue.toFixed(2)}</p>
        <p className={cn("text-xs font-medium", color)}>
          {status}
        </p>
      </div>
    );
  }
  return null;
};

const CustomMACDTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const macdValue = payload[0]?.value || 0;
    const signalValue = payload[1]?.value || 0;
    const histogramValue = payload[2]?.value || 0;
    
    const bullish = macdValue > signalValue;
    
    return (
      <div className="bg-[#1A1F2C] border border-[#2A2F3C] p-2 rounded-md shadow-lg">
        <p className="text-[#8E9196] text-xs">{label}</p>
        <p className="text-[#9b87f5] font-medium">MACD: {macdValue.toFixed(2)}</p>
        <p className="text-[#F97316] font-medium">Signal: {signalValue.toFixed(2)}</p>
        <p className={cn(
          "text-xs font-medium",
          histogramValue >= 0 ? "text-green-500" : "text-red-500"
        )}>
          Histogram: {histogramValue.toFixed(2)}
        </p>
        <p className={cn(
          "text-xs font-medium",
          bullish ? "text-green-500" : "text-red-500"
        )}>
          {bullish ? "Bullish" : "Bearish"} Momentum
        </p>
      </div>
    );
  }
  return null;
};

const TechnicalIndicators = ({ 
  data, 
  rsiData, 
  macdData, 
  bollingerBands,
  timeFormat, 
  className 
}: TechnicalIndicatorsProps) => {
  // Combine the raw data with technical indicators
  const combinedData = data.map((item, index) => ({
    ...item,
    rsi: rsiData ? rsiData[index] || 0 : 0,
    macd: macdData ? macdData.macdLine[index] || 0 : 0,
    signal: macdData ? macdData.signalLine[index] || 0 : 0,
    histogram: macdData ? macdData.histogram[index] || 0 : 0,
    upper: bollingerBands ? bollingerBands.upper[index] || 0 : 0,
    middle: bollingerBands ? bollingerBands.middle[index] || 0 : 0,
    lower: bollingerBands ? bollingerBands.lower[index] || 0 : 0
  }));
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* RSI Chart */}
      {rsiData && (
        <Card className="bg-[#1A1F2C] border-none p-4">
          <div className="text-white text-sm font-medium mb-2">RSI (14)</div>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <XAxis 
                  dataKey="time" 
                  stroke="#8E9196" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#2A2F3C' }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#8E9196"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#2A2F3C' }}
                  orientation="right"
                />
                <Tooltip content={<CustomRSITooltip />} />
                <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
                <ReferenceLine y={50} stroke="#8E9196" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="rsi" 
                  stroke="#9b87f5" 
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
      
      {/* MACD Chart */}
      {macdData && (
        <Card className="bg-[#1A1F2C] border-none p-4">
          <div className="text-white text-sm font-medium mb-2">MACD (12, 26, 9)</div>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
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
                  tickLine={false}
                  axisLine={{ stroke: '#2A2F3C' }}
                  orientation="right"
                />
                <Tooltip content={<CustomMACDTooltip />} />
                <ReferenceLine y={0} stroke="#8E9196" />
                <Line 
                  type="monotone" 
                  dataKey="macd" 
                  stroke="#9b87f5" 
                  dot={false}
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="signal" 
                  stroke="#F97316" 
                  dot={false}
                  strokeWidth={2}
                />
                <Bar
                  dataKey="histogram"
                  fill="#22c55e" // Setting default fill color
                  barSize={3}
                >
                  {/* Use Cell components to set individual bar colors */}
                  {combinedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.histogram >= 0 ? "#22c55e" : "#f43f5e"} 
                    />
                  ))}
                </Bar>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TechnicalIndicators;
