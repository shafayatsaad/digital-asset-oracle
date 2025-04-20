
import React from 'react';
import { cn } from '@/lib/utils';

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const currentPrice = payload[0].value;
    const dataPoints = payload[0].payload.dataPoints || [];
    
    const previousPrice = dataPoints.length > 1 ? dataPoints[0].price : currentPrice;
    const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;
    const isPositive = percentChange >= 0;

    return (
      <div className="bg-[#1A1F2C] border border-[#2A2F3C] p-3 rounded-md shadow-lg">
        <p className="text-[#8E9196] text-xs">{label}</p>
        <p className="text-white font-medium text-base">${currentPrice.toLocaleString()}</p>
        <p className={cn(
          "text-sm font-medium mt-1",
          isPositive ? "text-green-500" : "text-red-500"
        )}>
          {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};
