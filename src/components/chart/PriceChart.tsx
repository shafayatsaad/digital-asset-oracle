
import React from 'react';
import {
  AreaChart,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { CustomTooltip } from './CustomTooltip';
import ChartGradients from './ChartGradients';
import ChartAxes from './ChartAxes';
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
  // Ensure we have data to display
  const chartData = data?.length > 0 ? data : [{ time: '00:00', price: 0 }];

  // Calculate domain and ensure it always returns [number, number]
  let yDomain: [number, number] = [0, 100];
  try {
    const domain = calculateChartDomain({
      data: chartData,
      keys: compareKeys,
      zoomLevel
    });
    if (
      Array.isArray(domain) &&
      domain.length === 2 &&
      typeof domain[0] === "number" &&
      typeof domain[1] === "number"
    ) {
      yDomain = domain as [number, number];
    }
  } catch {
    // fallback to default
    yDomain = [0, 100];
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <ChartGradients chartColor={chartColor} compareKeys={compareKeys} colors={colors} />
        <ChartAxes data={chartData} compareKeys={compareKeys} yDomain={yDomain} />
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

