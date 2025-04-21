import React, { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChartData } from "@/hooks/useChartData";
import { coinData } from "@/utils/chart/coinData";
import PriceChart from "@/components/chart/PriceChart";
import TechnicalIndicators from "@/components/TechnicalIndicators";
import { useToast } from "@/hooks/use-toast";
import { BIG_COINS, LOW_COINS, ALL_COINS, defaultSelected } from "@/config/coinCompareConfig";
import CoinSyncPrediction from "@/components/compare/CoinSyncPrediction";

const Compare = () => {
  const { toast } = useToast();
  const [selectedCoins, setSelectedCoins] = useState(defaultSelected);
  const [chartKey, setChartKey] = useState(0);

  const bigChart = useChartData(selectedCoins[0], "1D");
  const lowChart = useChartData(selectedCoins[1], "1D");

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
    if (!bigChart.data.length || !lowChart.data.length) {
      return [];
    }
    const n = Math.min(bigChart.data.length, lowChart.data.length);
    if (n === 0) return [];
    const bigStart = bigChart.data[0]?.price || 1;
    const lowStart = lowChart.data[0]?.price || 1;
    const series = [];
    for (let i = 0; i < n; i++) {
      series.push({
        time: bigChart.data[i].time,
        [`${selectedCoins[0].symbol}`]: (bigChart.data[i].price / bigStart) * 100,
        [`${selectedCoins[1].symbol}`]: (lowChart.data[i].price / lowStart) * 100,
      });
    }
    return series;
  }, [bigChart.data, lowChart.data, selectedCoins]);

  return (
    <div className="min-h-screen bg-[#131722] p-4">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <h1 className="text-white text-2xl font-bold mb-2">Big vs Low Cap Crypto: Predictive Comparison</h1>
        <p className="text-[#8E9196] mb-3">
          Compare how big cap coins (like Bitcoin) lead or lag the price/volume of low cap coins. 
          Use this tool to spot advance signals in small coins by observing large coin moves!
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <Card className="bg-[#1A1F2C] p-4 border-none">
            <span className="text-white block mb-2">Select Big Coin</span>
            <select
              value={selectedCoins[0].symbol}
              onChange={handleSelectCoin("big", 0)}
              className="block bg-[#2A2F3C] text-white p-2 rounded"
            >
              {BIG_COINS.map((coin) => (
                <option key={coin.symbol} value={coin.symbol}>
                  {coin.name}
                </option>
              ))}
            </select>
          </Card>
          <Card className="bg-[#1A1F2C] p-4 border-none">
            <span className="text-white block mb-2">Select Low Coin</span>
            <select
              value={selectedCoins[1].symbol}
              onChange={handleSelectCoin("low", 1)}
              className="block bg-[#2A2F3C] text-white p-2 rounded"
            >
              {LOW_COINS.map((coin) => (
                <option key={coin.symbol} value={coin.symbol}>
                  {coin.name}
                </option>
              ))}
            </select>
          </Card>
        </div>

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
          <Card className="bg-[#1A1F2C] border-none p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-lg font-medium">
                {selectedCoins[0].name}
                <span className="ml-2 text-[#8E9196] text-sm">({selectedCoins[0].symbol.replace("USDT", "")})</span>
              </span>
              <span className="text-[#8E9196]">
                Price: <span style={{ color: bigChart.chartColor }}>${bigChart.currentPrice.toLocaleString()}</span>
              </span>
            </div>
            <div className="w-full h-[220px]">
              <PriceChart
                key={`big-${chartKey}`}
                data={bigChart.prepareChartData(true)}
                chartColor={bigChart.chartColor}
                currentPrice={bigChart.currentPrice}
                zoomLevel={1}
                showIndicators={true}
                showBollingerBands={true}
                bollingerBands={bigChart.bollingerBands}
                showPredictions={false}
              />
            </div>
            <TechnicalIndicators
              data={bigChart.data}
              rsiData={bigChart.rsiData}
              macdData={bigChart.macdData}
              bollingerBands={bigChart.bollingerBands}
              timeFormat={bigChart.timeFormat}
            />
          </Card>
          <Card className="bg-[#1A1F2C] border-none p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white text-lg font-medium">
                {selectedCoins[1].name}
                <span className="ml-2 text-[#8E9196] text-sm">({selectedCoins[1].symbol.replace("USDT", "")})</span>
              </span>
              <span className="text-[#8E9196]">
                Price: <span style={{ color: lowChart.chartColor }}>${lowChart.currentPrice.toLocaleString()}</span>
              </span>
            </div>
            <div className="w-full h-[220px]">
              <PriceChart
                key={`low-${chartKey}`}
                data={lowChart.prepareChartData(true)}
                chartColor={lowChart.chartColor}
                currentPrice={lowChart.currentPrice}
                zoomLevel={1}
                showIndicators={true}
                showBollingerBands={true}
                bollingerBands={lowChart.bollingerBands}
                showPredictions={true}
              />
            </div>
            <TechnicalIndicators
              data={lowChart.data}
              rsiData={lowChart.rsiData}
              macdData={lowChart.macdData}
              bollingerBands={lowChart.bollingerBands}
              timeFormat={lowChart.timeFormat}
            />
          </Card>
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
