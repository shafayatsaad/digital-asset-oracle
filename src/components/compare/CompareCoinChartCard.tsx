
import React from "react";
import { Card } from "@/components/ui/card";
import PriceChart from "@/components/chart/PriceChart";
import TechnicalIndicators from "@/components/TechnicalIndicators";

type Props = {
  name: string;
  symbol: string;
  chartColor: string;
  currentPrice: number;
  data: any[];
  chartData: any[];
  rsiData: number[];
  macdData: any;
  bollingerBands: any;
  timeFormat: string;
  chartKey: number;
  showIndicators: boolean;
  showBollingerBands: boolean;
  showPredictions: boolean;
};

const CompareCoinChartCard = ({
  name,
  symbol,
  chartColor,
  currentPrice,
  data,
  chartData,
  rsiData,
  macdData,
  bollingerBands,
  timeFormat,
  chartKey,
  showIndicators,
  showBollingerBands,
  showPredictions
}: Props) => (
  <Card className="bg-[#1A1F2C] border-none p-4 space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-white text-lg font-medium">
        {name}
        <span className="ml-2 text-[#8E9196] text-sm">
          ({symbol.replace("USDT", "")})
        </span>
      </span>
      <span className="text-[#8E9196]">
        Price: <span style={{ color: chartColor }}>${currentPrice?.toLocaleString() || '0'}</span>
      </span>
    </div>
    <div className="w-full h-[220px]">
      <PriceChart
        key={`${symbol}-${chartKey}`}
        data={chartData}
        chartColor={chartColor}
        currentPrice={currentPrice}
        zoomLevel={1}
        showIndicators={showIndicators}
        showBollingerBands={showBollingerBands}
        bollingerBands={bollingerBands}
        showPredictions={showPredictions}
      />
    </div>
    <TechnicalIndicators
      data={data}
      rsiData={rsiData}
      macdData={macdData}
      bollingerBands={bollingerBands}
      timeFormat={timeFormat}
    />
  </Card>
);

export default CompareCoinChartCard;
