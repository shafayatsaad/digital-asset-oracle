
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChartData } from "@/hooks/useChartData";
import { coinData } from "@/utils/chart/coinData";
import PriceChart from "@/components/chart/PriceChart";
import TechnicalIndicators from "@/components/TechnicalIndicators";

const BIG_COINS = [
  { symbol: "BTCUSDT", name: "Bitcoin" },
  { symbol: "ETHUSDT", name: "Ethereum" },
  { symbol: "BNBUSDT", name: "BNB" },
];
const LOW_COINS = [
  { symbol: "ADAUSDT", name: "Cardano" },
  { symbol: "SOLUSDT", name: "Solana" },
  { symbol: "XRPUSDT", name: "XRP" },
  { symbol: "DOGEUSDT", name: "Dogecoin" },
];

const ALL_COINS = [...BIG_COINS, ...LOW_COINS];

const defaultSelected = [BIG_COINS[0], LOW_COINS[0]];

const Compare = () => {
  const [selectedCoins, setSelectedCoins] = useState(defaultSelected);

  const chartDatas = selectedCoins.map((coin) => useChartData(coin, "1D"));

  const handleSelectCoin = (group: "big" | "low", idx: number) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const coin = ALL_COINS.find((c) => c.symbol === e.target.value);
    if (!coin) return;
    setSelectedCoins((prev) => {
      const next = [...prev];
      next[group === "big" ? 0 : 1] = coin;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#131722] p-4">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <h1 className="text-white text-2xl font-bold mb-2">Compare Big & Low Cap Cryptos</h1>
        <p className="text-[#8E9196] mb-4">
          Analyze, compare, and predict trends of major cryptocurrencies against low-cap coins.
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
        <div className="grid md:grid-cols-2 gap-6">
          {chartDatas.map((data, idx) => (
            <Card key={selectedCoins[idx].symbol} className="bg-[#1A1F2C] border-none p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white text-lg font-medium">
                  {selectedCoins[idx].name}
                  <span className="ml-2 text-[#8E9196] text-sm">({selectedCoins[idx].symbol.replace("USDT", "")})</span>
                </span>
                <span className="text-[#8E9196]">
                  Price: <span style={{ color: data.chartColor }}>${data.currentPrice.toLocaleString()}</span>
                </span>
              </div>
              <div className="w-full h-[250px]">
                <PriceChart
                  data={data.prepareChartData(true)}
                  chartColor={data.chartColor}
                  currentPrice={data.currentPrice}
                  zoomLevel={1}
                  showIndicators={true}
                  showBollingerBands={true}
                  bollingerBands={data.bollingerBands}
                  showPredictions={true}
                />
              </div>
              <TechnicalIndicators
                data={data.data}
                rsiData={data.rsiData}
                macdData={data.macdData}
                bollingerBands={data.bollingerBands}
                timeFormat={data.timeFormat}
              />
            </Card>
          ))}
        </div>
        {/* Simple predicted volume comparison UI */}
        <Card className="bg-[#22263c] p-4 border-none mt-9">
          <h2 className="text-white text-md font-semibold mb-3">
            Predicted Next Market Volume (Simulated)
          </h2>
          <div className="flex flex-wrap gap-8 items-end">
            {chartDatas.map((d, idx) => {
              // Simulate volume prediction as a little random walk
              const volumes = d.data.map(pt => pt.volume || 0);
              const predicted = Math.round((volumes.reduce((a, b) => a + b, 0) / volumes.length || 1) * (1 + Math.random() * 0.08 - 0.04));
              const color = d.chartColor;
              return (
                <div key={selectedCoins[idx].symbol} className="flex flex-col gap-2 min-w-[130px]">
                  <span className="text-white font-medium">{selectedCoins[idx].name}</span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color }}
                  >
                    {predicted.toLocaleString()}
                  </span>
                  <span className="text-[#8E9196] text-xs mb-2">
                    (Randomized Predicted Volume)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Compare;
