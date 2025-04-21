
import React from 'react';
import {
  Area,
  Line,
  ReferenceLine
} from 'recharts';

interface PriceChartAreaProps {
  compareKeys?: string[];
  colors?: string[];
  chartColor: string;
  showIndicators: boolean;
  showBollingerBands: boolean;
  bollingerBands?: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  currentPrice?: number;
  showPredictions?: boolean;
}

// This subcomponent renders the area/line overlays for the PriceChart
const PriceChartArea = ({
  compareKeys,
  colors,
  chartColor,
  showIndicators,
  showBollingerBands,
  bollingerBands,
  currentPrice,
  showPredictions
}: PriceChartAreaProps) => (
  <>
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
    {/* Comparison mode for overlays */}
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
    {/* Predictions (if any, overtime) */}
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
  </>
);

export default PriceChartArea;
