
/**
 * Bollinger Bands calculations
 */
export const calculateBollingerBands = (prices: number[], period: number = 20, stdDev: number = 2): {
  upper: number[],
  middle: number[],
  lower: number[]
} => {
  if (prices.length < period) {
    return {
      upper: Array(prices.length).fill(0),
      middle: Array(prices.length).fill(0),
      lower: Array(prices.length).fill(0)
    };
  }
  
  const middle: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];
  
  // Calculate Bollinger Bands for each point
  for (let i = 0; i < prices.length; i++) {
    // For the initial points before we have a full period, use as many points as available
    const startIndex = Math.max(0, i - period + 1);
    const window = prices.slice(startIndex, i + 1);
    const sma = window.reduce((sum, price) => sum + price, 0) / window.length;
    
    // Calculate standard deviation
    const squaredDiffs = window.map(price => Math.pow(price - sma, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / window.length;
    const standardDeviation = Math.sqrt(variance);
    
    middle.push(sma);
    upper.push(sma + (standardDeviation * stdDev));
    lower.push(sma - (standardDeviation * stdDev));
  }
  
  return { upper, middle, lower };
};
