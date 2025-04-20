
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, ChartBar } from 'lucide-react';
import CoinSearch from '../CoinSearch';
import TimeRangeSelector from '../TimeRangeSelector';

interface ChartControlsProps {
  selectedCoin: { symbol: string; name: string };
  selectedRange: string;
  showIndicators: boolean;
  currentPrice: number;
  chartColor: string;
  onCoinChange: (coin: { symbol: string; name: string }) => void;
  onRangeChange: (range: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleIndicators: () => void;
}

const ChartControls = ({
  selectedCoin,
  selectedRange,
  showIndicators,
  currentPrice,
  chartColor,
  onCoinChange,
  onRangeChange,
  onZoomIn,
  onZoomOut,
  onToggleIndicators
}: ChartControlsProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4">
        <CoinSearch selectedCoin={selectedCoin} onCoinChange={onCoinChange} />
        <TimeRangeSelector selectedRange={selectedRange} onRangeChange={onRangeChange} />
      </div>
      <div className="flex items-center gap-2">
        <div className="text-[#8E9196] text-sm">
          Last Price: <span style={{ color: chartColor }}>${currentPrice.toLocaleString()}</span>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-transparent border-[#2A2F3C] text-[#8E9196] hover:text-white hover:bg-[#2A2F3C]"
          onClick={onZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-transparent border-[#2A2F3C] text-[#8E9196] hover:text-white hover:bg-[#2A2F3C]"
          onClick={onZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className={`bg-transparent border-[#2A2F3C] text-[#8E9196] hover:text-white hover:bg-[#2A2F3C] ${
            showIndicators && "text-white bg-[#2A2F3C]"
          }`}
          onClick={onToggleIndicators}
        >
          <ChartBar className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChartControls;
