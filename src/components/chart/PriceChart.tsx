
import React from 'react';
import {
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { CustomTooltip } from './CustomTooltip';
import { calculateChartDomain } from "@/utils/chart/domain";
import PriceChartArea from './PriceChartArea';

interface PriceChartProps {
  data: any[];
  chartColor: string;
  currentPrice?: number;
  zoomLevel: number;
  showIndicators: boolean;
  showBollingerBands: boolean;
  bollingerBands?: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  showPredictions: boolean;
  compareKeys?: string[];
  colors?: string[];
}

const PriceChart = ({
  data,
  chartColor,
  currentPrice,
  zoomLevel,
  showIndicators,
  showBollingerBands,
  bollingerBands,
  showPredictions,
  compareKeys,
  colors
}: PriceChartProps) => {
  const yDomain = calculateChartDomain({
    data,
    keys: compareKeys,
    zoomLevel
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          {/* Gradient fills */}
          <linearGradient id={`colorPrice-${chartColor}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
          </linearGradient>
          {compareKeys && colors && compareKeys.map((key, index) => (
            <linearGradient key={key} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[index] || chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors[index] || chartColor} stopOpacity={0} />
            </linearGradient>
          ))}
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
          domain={yDomain}
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
        <PriceChartArea
          compareKeys={compareKeys}
          colors={colors}
          chartColor={chartColor}
          showIndicators={showIndicators}
          showBollingerBands={showBollingerBands}
          bollingerBands={bollingerBands}
          currentPrice={currentPrice}
          showPredictions={showPredictions}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PriceChart;
