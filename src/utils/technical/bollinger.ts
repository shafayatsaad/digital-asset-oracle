
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
  
  // Fill initial values
  for (let i = 0; i < period - 1; i++) {
    middle.push(0);
    upper.push(0);
    lower.push(0);
  }
  
  // Calculate Bollinger Bands for each point after the initial period
  for (let i = period - 1; i < prices.length; i++) {
    const window = prices.slice(i - period + 1, i + 1);
    const sma = window.reduce((sum, price) => sum + price, 0) / period;
    
    // Calculate standard deviation
    const squaredDiffs = window.map(price => Math.pow(price - sma, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    middle.push(sma);
    upper.push(sma + (standardDeviation * stdDev));
    lower.push(sma - (standardDeviation * stdDev));
  }
  
  return { upper, middle, lower };
};
