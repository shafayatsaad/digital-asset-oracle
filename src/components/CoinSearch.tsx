
import React from 'react';
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
];

const CoinSearch = () => {
  const [open, setOpen] = React.useState(false);
  const [selectedCoin, setSelectedCoin] = React.useState(coins[0]);

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
          <div className="px-3 py-2 border-b border-[#2A2F3C]">
            <Search className="h-4 w-4 text-[#8E9196]" />
          </div>
          <div className="py-2">
            {coins.map((coin) => (
              <div
                key={coin.symbol}
                className="px-3 py-2 text-sm text-[#8E9196] hover:bg-[#2A2F3C] hover:text-white cursor-pointer"
                onClick={() => {
                  setSelectedCoin(coin);
                  setOpen(false);
                }}
              >
                {coin.symbol} - {coin.name}
              </div>
            ))}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CoinSearch;
