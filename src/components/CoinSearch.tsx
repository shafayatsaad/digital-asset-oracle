
import React, { useState } from 'react';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const coins = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'BNBUSDT', name: 'Binance Coin' },
  { symbol: 'ADAUSDT', name: 'Cardano' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'XRPUSDT', name: 'Ripple' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin' }
];

interface CoinSearchProps {
  selectedCoin: { symbol: string; name: string };
  onCoinChange: (coin: { symbol: string; name: string }) => void;
}

const CoinSearch = ({ selectedCoin, onCoinChange }: CoinSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCoins = searchQuery 
    ? coins.filter(coin => 
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
        coin.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : coins;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-[180px] justify-between text-left font-normal bg-transparent border-[#2A2F3C] text-white"
        >
          {selectedCoin.symbol}
          <Search className="h-4 w-4 text-[#8E9196]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0 bg-[#1A1F2C] border-[#2A2F3C]">
        <Command>
          <div className="px-3 py-2 border-b border-[#2A2F3C] flex items-center">
            <Search className="h-4 w-4 text-[#8E9196] mr-2" />
            <input 
              className="bg-transparent border-none outline-none text-white w-full text-sm"
              placeholder="Search coins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="py-2 max-h-[200px] overflow-y-auto">
            {filteredCoins.map((coin) => (
              <div
                key={coin.symbol}
                className="px-3 py-2 text-sm text-[#8E9196] hover:bg-[#2A2F3C] hover:text-white cursor-pointer"
                onClick={() => {
                  onCoinChange(coin);
                  setOpen(false);
                  setSearchQuery('');
                }}
              >
                {coin.symbol} - {coin.name}
              </div>
            ))}
            {filteredCoins.length === 0 && (
              <div className="px-3 py-2 text-sm text-[#8E9196]">
                No coins found
              </div>
            )}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CoinSearch;
