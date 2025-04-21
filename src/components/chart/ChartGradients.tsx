
import React from "react";

interface ChartGradientsProps {
  chartColor: string;
  compareKeys?: string[];
  colors?: string[];
}
const ChartGradients = ({ chartColor, compareKeys, colors }: ChartGradientsProps) => (
  <defs>
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
);

export default ChartGradients;
