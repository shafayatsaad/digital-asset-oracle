
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SentimentCardProps {
  sentiment: {
    score: number;
    source: string;
    trend: 'positive' | 'negative' | 'neutral';
  };
  className?: string;
}

const SentimentCard = ({ sentiment, className }: SentimentCardProps) => {
  const { score, source, trend } = sentiment;
  
  const getTrendColor = () => {
    if (trend === 'positive') return 'text-green-500';
    if (trend === 'negative') return 'text-red-500';
    return 'text-yellow-500';
  };
  
  const getTrendIcon = () => {
    if (trend === 'positive') return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (trend === 'negative') return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };
  
  const getTrendText = () => {
    const percentScore = Math.abs(Math.round(score * 100));
    
    if (trend === 'positive') return `${percentScore}% Bullish`;
    if (trend === 'negative') return `${percentScore}% Bearish`;
    return 'Neutral';
  };
  
  return (
    <Card className={cn("bg-[#1A1F2C] border-none p-4", className)}>
      <h3 className="text-white text-sm font-medium mb-2">Market Sentiment</h3>
      
      <div className="flex items-center justify-between bg-[#131722] p-3 rounded-md">
        <div className="flex items-center space-x-3">
          {getTrendIcon()}
          <div>
            <p className={cn("font-medium", getTrendColor())}>{getTrendText()}</p>
            <p className="text-[#8E9196] text-xs">Source: {source}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div 
            className={cn(
              "text-white text-xs rounded-full px-2 py-1",
              trend === 'positive' ? "bg-green-500" : 
              trend === 'negative' ? "bg-red-500" : 
              "bg-yellow-500"
            )}
          >
            {trend === 'positive' ? '+' : trend === 'negative' ? '-' : ''}
            {Math.abs(score).toFixed(2)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SentimentCard;
