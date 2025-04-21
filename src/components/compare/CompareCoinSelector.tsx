
import React from "react";
import { Card } from "@/components/ui/card";
import { BIG_COINS, LOW_COINS, ALL_COINS } from "@/config/coinCompareConfig";

type CompareCoinSelectorProps = {
  selectedBig: { symbol: string; name: string };
  selectedLow: { symbol: string; name: string };
  onSelectBig: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSelectLow: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const CompareCoinSelector = ({
  selectedBig,
  selectedLow,
  onSelectBig,
  onSelectLow,
}: CompareCoinSelectorProps) => (
  <div className="flex flex-wrap gap-4 mb-6">
    <Card className="bg-[#1A1F2C] p-4 border-none">
      <span className="text-white block mb-2">Select Big Coin</span>
      <select
        value={selectedBig.symbol}
        onChange={onSelectBig}
        className="block bg-[#2A2F3C] text-white p-2 rounded w-full"
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
        value={selectedLow.symbol}
        onChange={onSelectLow}
        className="block bg-[#2A2F3C] text-white p-2 rounded w-full"
      >
        {LOW_COINS.map((coin) => (
          <option key={coin.symbol} value={coin.symbol}>
            {coin.name}
          </option>
        ))}
      </select>
    </Card>
  </div>
);

export default CompareCoinSelector;
