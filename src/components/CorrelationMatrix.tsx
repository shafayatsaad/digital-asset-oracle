
import React from 'react';
import { Card } from '@/components/ui/card';
import { calculateCorrelation } from '@/utils/analysis/correlation';

interface CorrelationMatrixProps {
  coins: {
    symbol: string;
    name: string;
    data: Array<{
      time: string;
      price: number;
    }>;
  }[];
  className?: string;
  visible?: boolean;
}

const CorrelationMatrix = ({ coins, className, visible = true }: CorrelationMatrixProps) => {
  if (!visible || !coins || coins.length < 2) {
    return null;
  }
  
  // Generate correlation matrix data
  const generateCorrelationMatrix = () => {
    const matrix: Array<{
      coin1: string;
      coin2: string;
      correlation: number;
      strength: string;
      color: string;
    }> = [];
    
    // Extract price data for each coin
    const coinsWithPrices = coins.map(coin => ({
      symbol: coin.symbol,
      prices: coin.data.map(point => point.price)
    }));
    
    // Calculate correlations between each pair
    for (let i = 0; i < coinsWithPrices.length; i++) {
      for (let j = i + 1; j < coinsWithPrices.length; j++) {
        const coin1 = coinsWithPrices[i];
        const coin2 = coinsWithPrices[j];
        
        // Calculate correlation over the last 30 points (or less if not available)
        const windowSize = Math.min(30, coin1.prices.length, coin2.prices.length);
        
        if (windowSize < 2) continue;
        
        const correlationSeries = calculateCorrelation(
          coin1.prices.slice(-windowSize), 
          coin2.prices.slice(-windowSize),
          windowSize
        );
        
        // Use the latest correlation value
        const correlation = correlationSeries[correlationSeries.length - 1];
        
        // Determine correlation strength and color
        let strength = 'Weak';
        let color = '#8E9196';
        
        const absCorrelation = Math.abs(correlation);
        if (absCorrelation >= 0.7) {
          strength = 'Strong';
          color = correlation > 0 ? '#22c55e' : '#f43f5e';
        } else if (absCorrelation >= 0.3) {
          strength = 'Moderate';
          color = correlation > 0 ? '#86efac' : '#fda4af';
        }
        
        matrix.push({
          coin1: coin1.symbol,
          coin2: coin2.symbol,
          correlation,
          strength,
          color
        });
      }
    }
    
    // Sort by correlation strength
    return matrix.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  };
  
  const correlationMatrix = generateCorrelationMatrix();
  
  if (correlationMatrix.length === 0) {
    return null;
  }
  
  return (
    <Card className={`bg-[#1A1F2C] border-none p-4 ${className}`}>
      <h3 className="text-white text-sm font-medium mb-3">Correlation Analysis</h3>
      <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
        {correlationMatrix.map((item, index) => (
          <div key={index} className="flex items-center justify-between bg-[#131722] p-2 rounded-md">
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">{item.coin1.replace('USDT', '')}</span>
              <span className="text-[#8E9196]">⟷</span>
              <span className="text-white text-sm">{item.coin2.replace('USDT', '')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[#8E9196] text-xs">{item.strength}</span>
              <div
                className="w-16 h-6 rounded flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: item.color }}
              >
                {(item.correlation * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CorrelationMatrix;
