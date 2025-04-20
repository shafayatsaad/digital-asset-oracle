
import React from 'react';
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
import { CustomTooltip } from './CustomTooltip';

interface PriceChartProps {
  data: any[];
  chartColor: string;
  currentPrice: number;
  zoomLevel: number;
  showIndicators: boolean;
  showBollingerBands: boolean;
  bollingerBands: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  showPredictions: boolean;
}

const PriceChart = ({
  data,
  chartColor,
  currentPrice,
  zoomLevel,
  showIndicators,
  showBollingerBands,
  bollingerBands,
  showPredictions
}: PriceChartProps) => {
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`colorPrice-${chartColor}`} x1="0" y1="0" x2="0" y2="1">
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
        
        <Area
          type="monotone"
          dataKey="price"
          stroke={chartColor}
          fillOpacity={1}
          fill={`url(#colorPrice-${chartColor})`}
          strokeWidth={2}
        />
        
        {showPredictions && (
          <Area
            type="monotone"
            dataKey="predictedPrice"
            stroke="#9333ea"
            strokeWidth={2}
            fillOpacity={0.1}
            fill="url(#colorPrediction)"
            activeDot={{ r: 6, fill: "#9333ea" }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PriceChart;
