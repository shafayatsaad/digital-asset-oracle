
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChartData } from "@/hooks/useChartData";
import { coinData } from "@/utils/chart/coinData";
import PriceChart from "@/components/chart/PriceChart";
import TechnicalIndicators from "@/components/TechnicalIndicators";

/** NEW COMPONENT: Shows prediction and correlation between big/low coins */
const CoinSyncPrediction = ({
  bigChart,
  lowChart,
  bigCoin,
  lowCoin,
}: {
  bigChart: ReturnType<typeof useChartData>,
  lowChart: ReturnType<typeof useChartData>,
  bigCoin: {symbol: string, name: string},
  lowCoin: {symbol: string, name: string}
}) => {
  // Find highest and lowest from both data arrays
  const bigPrices = bigChart.data.map((d) => d.price ?? 0);
  const lowPrices = lowChart.data.map((d) => d.price ?? 0);
  const n = Math.min(bigPrices.length, lowPrices.length);

  // Simple correlation function
  function pearson(a: number[], b: number[]) {
    const meanA = a.reduce((x,y) => x+y,0)/a.length;
    const meanB = b.reduce((x,y) => x+y,0)/b.length;
    const numerator = a.map((v,i)=> (v-meanA)*(b[i]-meanB)).reduce((x,y)=>x+y,0);
    const denom = Math.sqrt(
      a.reduce((x,y)=>x+Math.pow(y-meanA,2),0)
      *b.reduce((x,y)=>x+Math.pow(y-meanB,2),0)
    );
    return denom ? numerator/denom : 0;
  }

  // Lag-based predictive relationship check
  const lag = 1; // 1 point lead/lag
  const laggedBig = bigPrices.slice(0, n-lag);
  const futureLow = lowPrices.slice(lag, n);
  const leadCorr = pearson(laggedBig, futureLow);
  const lagCorr = pearson(laggedBig, lowPrices.slice(0, n-lag)); // baseline corr

  // Find the latest big move direction
  const lastBigChange = bigPrices[n-1] - bigPrices[n-2] || 0;
  const predictedLowChange = lastBigChange * (leadCorr > 0 ? 1 : -1);
  const lowVolume = lowChart.data[n-1]?.volume ?? 0;
  const predictedNextVolume = Math.round(lowVolume * (1 + Math.abs(predictedLowChange/100)));

  return (
    <div>
      <Card className="bg-[#2A3145] border-none p-4 mt-4">
        <div className="mb-2">
          <span className="font-bold text-white">Big/Low Coin Predictive Analysis</span>
        </div>
        <div className="text-[#8E9196] text-sm mb-2">
          <span>
            {bigCoin.name} last move: 
            <span className={lastBigChange > 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
              {lastBigChange > 0 ? "⬆ Rising" : "⬇ Falling"}
            </span>{" "}
            | Lead correlation with {lowCoin.name}: <span className="font-semibold text-white">{leadCorr.toFixed(2)}</span>
            <span className="mx-2">|</span>
            {leadCorr > 0.2 && (
              <span className="text-green-400">Same direction effect</span>
            )}
            {leadCorr < -0.2 && (
              <span className="text-amber-400">Inverse effect</span>
            )}
            {Math.abs(leadCorr) <= 0.2 && (
              <span className="text-slate-400">Weak effect</span>
            )}
          </span>
        </div>
        <div className="mt-2 mb-3 flex items-center gap-6">
          <div className="text-white">Predicted {lowCoin.name} volume (next period): </div>
          <span className="text-2xl font-bold" style={{color: lowChart.chartColor}}>{predictedNextVolume.toLocaleString()}</span>
        </div>
        <div className="text-[#8E9196] text-xs">
          Interpretation: When <span className="font-bold">{bigCoin.name}</span> moves sharply, 
          <span className="font-bold"> {lowCoin.name}</span> historically moves in the {leadCorr > 0 ? "SAME" : "OPPOSITE"} direction and volume 
          is {predictedLowChange > 0 ? "projected to INCREASE" : "projected to DECREASE"}.
        </div>
      </Card>
    </div>
  );
};

// --- PAGE COMPONENT ---
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

  // UseChartData() for each coin
  const bigChart = useChartData(selectedCoins[0], "1D");
  const lowChart = useChartData(selectedCoins[1], "1D");

  // Handler to swap base/alt coins
  const handleSelectCoin = (group: "big" | "low", idx: number) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const coin = ALL_COINS.find((c) => c.symbol === e.target.value);
    if (!coin) return;
    setSelectedCoins((prev) => {
      const next = [...prev];
      next[group === "big" ? 0 : 1] = coin;
      return next;
    });
  };

  // Comparative data for chart overlay display
  const chartOverlayData = useMemo(() => {
    const n = Math.min(bigChart.data.length, lowChart.data.length);
    // Normalize both prices for visual comparison
    const bigStart = bigChart.data[0]?.price || 1;
    const lowStart = lowChart.data[0]?.price || 1;
    const series = [];
    for (let i = 0; i < n; i++) {
      series.push({
        time: bigChart.data[i].time,
        [`${selectedCoins[0].symbol}`]: (bigChart.data[i].price / bigStart) * 100,
        [`${selectedCoins[1].symbol}`]: (lowChart.data[i].price / lowStart) * 100,
      })
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

        {/* Coin selectors */}
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

        {/* Overlay chart of normalized prices */}
        <Card className="bg-[#232943] p-4 border-none mb-4">
          <div className="text-white text-md font-semibold mb-2">
            Price Movements (Normalized)
          </div>
          <div className="w-full h-[220px]">
            {/* Overlay the price of both coins (Normalized to 100) */}
            <PriceChart
              data={chartOverlayData}
              chartColor="#9b87f5"
              zoomLevel={1}
              showIndicators={false}
              showBollingerBands={false}
              showPredictions={false}
              // Only show non-prediction, overlay
              compareKeys={[
                `${selectedCoins[0].symbol}`,
                `${selectedCoins[1].symbol}`
              ]}
              colors={[
                coinData[selectedCoins[0].symbol]?.color || "#9b87f5",
                coinData[selectedCoins[1].symbol]?.color || "#9b87f5"
              ]}
            />
          </div>
        </Card>

        {/* Per-coin technicals */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Big coin chart & technicals */}
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
          {/* Low coin chart & technicals */}
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

        {/* Lead/Lag Predictive Analysis */}
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

