
import React, { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChartData } from "@/hooks/useChartData";
import { coinData } from "@/utils/chart/coinData";
import PriceChart from "@/components/chart/PriceChart";
import { useToast } from "@/hooks/use-toast";
import { BIG_COINS, LOW_COINS, ALL_COINS, defaultSelected } from "@/config/coinCompareConfig";
import CoinSyncPrediction from "@/components/compare/CoinSyncPrediction";
import CompareCoinChartCard from "@/components/compare/CompareCoinChartCard";
import CompareCoinSelector from "@/components/compare/CompareCoinSelector";

const Compare = () => {
  const { toast } = useToast();
  const [selectedCoins, setSelectedCoins] = useState(defaultSelected);
  const [chartKey, setChartKey] = useState(0);

  const bigChart = useChartData(selectedCoins[0], "1D");
  const lowChart = useChartData(selectedCoins[1], "1D");

  useEffect(() => {
    // Ensure data is loaded
    if (!bigChart.data?.length || !lowChart.data?.length) {
      console.log('Loading chart data...');
    }
  }, [bigChart.data, lowChart.data]);

  const handleSelectCoin = (group: "big" | "low", idx: number) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const coin = ALL_COINS.find((c) => c.symbol === e.target.value);
    if (!coin) return;
    setSelectedCoins((prev) => {
      const next = [...prev];
      next[group === "big" ? 0 : 1] = coin;
      return next;
    });
    setChartKey(prev => prev + 1);
    toast({
      title: `${group === "big" ? "Big" : "Low"} coin changed`,
      description: `Now comparing with ${coin.name}`
    });
  };

  const chartOverlayData = useMemo(() => {
    // Ensure we have data before attempting to process
    if (!bigChart.data?.length || !lowChart.data?.length) {
      return [{
        time: '00:00',
        [selectedCoins[0].symbol]: 100,
        [selectedCoins[1].symbol]: 100
      }];
    }

    const n = Math.min(bigChart.data.length, lowChart.data.length);
    if (n === 0) return [{
      time: '00:00',
      [selectedCoins[0].symbol]: 100,
      [selectedCoins[1].symbol]: 100
    }];

    // Get first valid price points to normalize against
    const bigStart = bigChart.data[0]?.price || 1;
    const lowStart = lowChart.data[0]?.price || 1;
    const series = [];

    // Create normalized data series
    for (let i = 0; i < n; i++) {
      if (bigChart.data[i] && lowChart.data[i]) {
        const bigPrice = typeof bigChart.data[i].price === 'number' ? bigChart.data[i].price : bigStart;
        const lowPrice = typeof lowChart.data[i].price === 'number' ? lowChart.data[i].price : lowStart;
        
        series.push({
          time: bigChart.data[i].time || `${i}:00`,
          [selectedCoins[0].symbol]: (bigPrice / bigStart) * 100,
          [selectedCoins[1].symbol]: (lowPrice / lowStart) * 100,
        });
      }
    }

    return series.length > 0 ? series : [{
      time: '00:00',
      [selectedCoins[0].symbol]: 100,
      [selectedCoins[1].symbol]: 100
    }];
  }, [bigChart.data, lowChart.data, selectedCoins]);

  return (
    <div className="min-h-screen bg-[#131722] p-4">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <h1 className="text-white text-2xl font-bold mb-2">Big vs Low Cap Crypto: Predictive Comparison</h1>
        <p className="text-[#8E9196] mb-3">
          Compare how big cap coins (like Bitcoin) lead or lag the price/volume of low cap coins.
          Use this tool to spot advance signals in small coins by observing large coin moves!
        </p>

        <CompareCoinSelector
          selectedBig={selectedCoins[0]}
          selectedLow={selectedCoins[1]}
          onSelectBig={handleSelectCoin("big", 0)}
          onSelectLow={handleSelectCoin("low", 1)}
        />

        <Card className="bg-[#232943] p-4 border-none mb-4">
          <div className="text-white text-md font-semibold mb-2">
            Price Movements (Normalized)
          </div>
          <div className="w-full h-[220px]">
            {chartOverlayData.length > 0 && (
              <PriceChart
                key={`overlay-${selectedCoins[0].symbol}-${selectedCoins[1].symbol}-${chartKey}`}
                data={chartOverlayData}
                chartColor="#9b87f5"
                zoomLevel={1}
                showIndicators={false}
                showBollingerBands={false}
                showPredictions={false}
                compareKeys={[
                  `${selectedCoins[0].symbol}`,
                  `${selectedCoins[1].symbol}`
                ]}
                colors={[
                  coinData[selectedCoins[0].symbol]?.color || "#9b87f5",
                  coinData[selectedCoins[1].symbol]?.color || "#9b87f5"
                ]}
              />
            )}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <CompareCoinChartCard
            name={selectedCoins[0].name}
            symbol={selectedCoins[0].symbol}
            chartColor={bigChart.chartColor}
            currentPrice={bigChart.currentPrice}
            data={bigChart.data}
            chartData={bigChart.prepareChartData(true)}
            rsiData={bigChart.rsiData}
            macdData={bigChart.macdData}
            bollingerBands={bigChart.bollingerBands}
            timeFormat={bigChart.timeFormat}
            chartKey={chartKey}
            showIndicators={true}
            showBollingerBands={true}
            showPredictions={false}
          />
          <CompareCoinChartCard
            name={selectedCoins[1].name}
            symbol={selectedCoins[1].symbol}
            chartColor={lowChart.chartColor}
            currentPrice={lowChart.currentPrice}
            data={lowChart.data}
            chartData={lowChart.prepareChartData(true)}
            rsiData={lowChart.rsiData}
            macdData={lowChart.macdData}
            bollingerBands={lowChart.bollingerBands}
            timeFormat={lowChart.timeFormat}
            chartKey={chartKey}
            showIndicators={true}
            showBollingerBands={true}
            showPredictions={true}
          />
        </div>

        <CoinSyncPrediction
          bigChart={bigChart}
          lowChart={lowChart}
          bigCoin={selectedCoins[0]}
          lowCoin={selectedCoins[1]}
        />
      </div>
    </div>
  );
};

export default Compare;
