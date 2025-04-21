
import React from "react";
import { Card } from "@/components/ui/card";

type CoinSyncPredictionProps = {
  bigChart: { data: any[]; chartColor: string };
  lowChart: { data: any[]; chartColor: string };
  bigCoin: { symbol: string; name: string };
  lowCoin: { symbol: string; name: string };
};

function pearson(a: number[], b: number[]) {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const meanA = a.reduce((x, y) => x + y, 0) / a.length;
  const meanB = b.reduce((x, y) => x + y, 0) / b.length;
  const numerator = a.map((v, i) => (v - meanA) * (b[i] - meanB)).reduce((x, y) => x + y, 0);
  const denom = Math.sqrt(
    a.reduce((x, y) => x + Math.pow(y - meanA, 2), 0) *
    b.reduce((x, y) => x + Math.pow(y - meanB, 2), 0)
  );
  return denom ? numerator / denom : 0;
}

const CoinSyncPrediction = ({
  bigChart,
  lowChart,
  bigCoin,
  lowCoin,
}: CoinSyncPredictionProps) => {
  // Ensure we have valid data
  const hasBigData = bigChart?.data && Array.isArray(bigChart.data) && bigChart.data.length > 0;
  const hasLowData = lowChart?.data && Array.isArray(lowChart.data) && lowChart.data.length > 0;
  
  // Extract price data with safeguards
  const bigPrices = hasBigData ? bigChart.data.map((d) => d?.price ?? 0) : [0];
  const lowPrices = hasLowData ? lowChart.data.map((d) => d?.price ?? 0) : [0];
  
  const n = Math.min(bigPrices.length, lowPrices.length);
  const lag = 1;
  const hasEnoughData = n > lag && bigPrices.length > lag && lowPrices.length > lag;

  const laggedBig = hasEnoughData ? bigPrices.slice(0, n - lag) : [];
  const futureLow = hasEnoughData ? lowPrices.slice(lag, n) : [];
  const leadCorr = hasEnoughData ? pearson(laggedBig, futureLow) : 0;
  const lastBigChange = hasEnoughData ? (bigPrices[n - 1] - bigPrices[n - 2]) || 0 : 0;
  const predictedLowChange = lastBigChange * (leadCorr > 0 ? 1 : -1);
  const lowVolume = hasLowData ? lowChart.data[n - 1]?.volume ?? 0 : 0;
  const predictedNextVolume = Math.round(lowVolume * (1 + Math.abs(predictedLowChange / 100)));

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
              {lastBigChange > 0 ? " ⬆ Rising" : " ⬇ Falling"}
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
          <span className="text-2xl font-bold" style={{ color: lowChart.chartColor }}>{predictedNextVolume.toLocaleString()}</span>
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

export default CoinSyncPrediction;
