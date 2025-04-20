
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, LineChart, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BacktestCardProps {
  results: {
    returns: number;
    winRate: number;
    maxDrawdown: number;
  };
  className?: string;
}

const BacktestCard = ({ results, className }: BacktestCardProps) => {
  const { returns, winRate, maxDrawdown } = results;
  
  return (
    <Card className={cn("bg-[#1A1F2C] border-none p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <LineChart className="h-5 w-5 text-[#9b87f5]" />
        <h3 className="text-white text-sm font-medium">Strategy Backtest</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#131722] p-2 rounded-md flex flex-col items-center">
          <span className="text-[#8E9196] text-xs mb-1">Returns</span>
          <span className={cn(
            "font-medium text-sm",
            returns > 0 ? "text-green-500" : "text-red-500"
          )}>
            {returns > 0 ? '+' : ''}{returns}%
          </span>
        </div>
        
        <div className="bg-[#131722] p-2 rounded-md flex flex-col items-center">
          <span className="text-[#8E9196] text-xs mb-1">Win Rate</span>
          <span className="font-medium text-sm text-white">
            {winRate}%
          </span>
        </div>
        
        <div className="bg-[#131722] p-2 rounded-md flex flex-col items-center">
          <span className="text-[#8E9196] text-xs mb-1">Max Drawdown</span>
          <span className="font-medium text-sm text-red-500">
            {maxDrawdown}%
          </span>
        </div>
      </div>
      
      <div className="mt-3 text-[#8E9196] text-xs">
        Based on Moving Average Crossover Strategy
      </div>
    </Card>
  );
};

export default BacktestCard;
