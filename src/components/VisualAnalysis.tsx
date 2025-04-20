
import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, BarChart2, TrendingUp, PieChart } from 'lucide-react';

interface VisualAnalysisProps {
  sentimentData: {
    score: number;
    source: string;
    trend: 'positive' | 'negative' | 'neutral';
  } | null;
  backtestResults: {
    returns: number;
    winRate: number;
    maxDrawdown: number;
  } | null;
  rsiValue: number;
  macdValue: { macdLine: number; signalLine: number; };
  className?: string;
}

const VisualAnalysis = ({ 
  sentimentData, 
  backtestResults, 
  rsiValue, 
  macdValue,
  className 
}: VisualAnalysisProps) => {
  
  // Calculate overall market score
  const calculateScore = () => {
    let score = 50; // Neutral starting point
    
    // Sentiment component (±15 points)
    if (sentimentData) {
      score += sentimentData.score * 15;
    }
    
    // RSI component (±10 points)
    if (rsiValue > 0) {
      if (rsiValue > 70) score -= 8; // Overbought
      else if (rsiValue < 30) score += 8; // Oversold
      else score += ((rsiValue - 50) / 20) * 5; // Normal range adjustment
    }
    
    // MACD component (±10 points)
    const macdSignal = macdValue.macdLine - macdValue.signalLine;
    score += macdSignal * 50; // Scale appropriately
    
    // Strategy backtest component (±15 points)
    if (backtestResults) {
      score += backtestResults.returns * 0.3;
      score += (backtestResults.winRate - 50) * 0.1;
    }
    
    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, score));
  };
  
  const marketScore = calculateScore();
  
  // Determine signal strength
  const getSignalStrength = () => {
    if (marketScore > 65) return { label: 'Strong Buy', color: 'bg-green-500' };
    if (marketScore > 55) return { label: 'Buy', color: 'bg-green-400' };
    if (marketScore > 45) return { label: 'Neutral', color: 'bg-yellow-400' };
    if (marketScore > 35) return { label: 'Sell', color: 'bg-red-400' };
    return { label: 'Strong Sell', color: 'bg-red-500' };
  };
  
  const signalStrength = getSignalStrength();
  
  return (
    <Card className={`bg-[#1A1F2C] border-none p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <LineChart className="h-5 w-5 text-[#9b87f5]" />
        <h3 className="text-white text-sm font-medium">Market Analysis</h3>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="w-full bg-[#131722] rounded-md p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#8E9196] text-xs">Signal Strength</span>
            <span className={`text-xs px-2 py-1 rounded ${signalStrength.color} text-white`}>{signalStrength.label}</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" 
              style={{width: `${marketScore}%`}}
            ></div>
          </div>
          
          <div className="flex justify-between mt-1">
            <span className="text-[#8E9196] text-xs">Bearish</span>
            <span className="text-white text-xs font-medium">{marketScore.toFixed(1)}%</span>
            <span className="text-[#8E9196] text-xs">Bullish</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#131722] rounded-md p-2 flex flex-col items-center">
            <span className="text-[#8E9196] text-xs mb-1">RSI Signal</span>
            <span className={`font-medium text-sm ${
              rsiValue > 70 ? "text-red-500" : 
              rsiValue < 30 ? "text-green-500" : 
              "text-yellow-400"
            }`}>
              {rsiValue > 70 ? "Overbought" : 
               rsiValue < 30 ? "Oversold" : 
               "Neutral"}
            </span>
          </div>
          
          <div className="bg-[#131722] rounded-md p-2 flex flex-col items-center">
            <span className="text-[#8E9196] text-xs mb-1">MACD Signal</span>
            <span className={`font-medium text-sm ${
              macdValue.macdLine > macdValue.signalLine ? "text-green-500" : "text-red-500"
            }`}>
              {macdValue.macdLine > macdValue.signalLine ? "Bullish" : "Bearish"}
            </span>
          </div>
          
          <div className="bg-[#131722] rounded-md p-2 flex flex-col items-center">
            <span className="text-[#8E9196] text-xs mb-1">Sentiment</span>
            <span className={`font-medium text-sm ${
              sentimentData?.trend === 'positive' ? "text-green-500" : 
              sentimentData?.trend === 'negative' ? "text-red-500" : 
              "text-yellow-400"
            }`}>
              {sentimentData?.trend === 'positive' ? "Bullish" : 
               sentimentData?.trend === 'negative' ? "Bearish" : 
               "Neutral"}
            </span>
          </div>
          
          <div className="bg-[#131722] rounded-md p-2 flex flex-col items-center">
            <span className="text-[#8E9196] text-xs mb-1">Strategy</span>
            <span className={`font-medium text-sm ${
              backtestResults && backtestResults.returns > 0 ? "text-green-500" : "text-red-500"
            }`}>
              {backtestResults && backtestResults.returns > 0 ? "Profitable" : "Unprofitable"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VisualAnalysis;
