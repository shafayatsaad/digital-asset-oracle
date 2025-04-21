
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
import { calculateChartDomain } from "@/utils/chart/domain";

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
  // Refactored: domain logic is now imported
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
        {currentPrice && (
          <ReferenceLine
            y={currentPrice}
            stroke="#8E9196"
            strokeDasharray="3 3"
          />
        )}
        {showIndicators && showBollingerBands && bollingerBands && (
          <>
            <Line
              type="monotone"
              dataKey="upper"
              stroke="#f43f5e"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="middle"
              stroke="#8E9196"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="lower"
              stroke="#22c55e"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />
          </>
        )}
        {/* Comparison mode for normalized overlays */}
        {compareKeys && colors ? (
          compareKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index] || chartColor}
              fill={`url(#color-${key})`}
              strokeWidth={2}
              fillOpacity={0.3}
              dot={false}
              isAnimationActive={false}
            />
          ))
        ) : (
          // Single-coin chart
          <Area
            type="monotone"
            dataKey="price"
            stroke={chartColor}
            fillOpacity={1}
            fill={`url(#colorPrice-${chartColor})`}
            strokeWidth={2}
            isAnimationActive={false}
          />
        )}
        {showPredictions && (
          <Area
            type="monotone"
            dataKey="predictedPrice"
            stroke="#9333ea"
            strokeWidth={2}
            fillOpacity={0.1}
            fill="url(#colorPrediction)"
            activeDot={{ r: 6, fill: "#9333ea" }}
            isAnimationActive={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PriceChart;
