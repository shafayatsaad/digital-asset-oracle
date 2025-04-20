
/**
 * Moving Average Convergence Divergence (MACD) calculations
 */

// Helper function to calculate EMA
const calculateEMA = (data: number[], period: number): number[] => {
  const k = 2 / (period + 1);
  const emaData: number[] = [];
  
  // Start with SMA for the first EMA value
  let ema = data.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  emaData.push(ema);
  
  // Calculate EMA for the rest of the data
  for (let i = period; i < data.length; i++) {
    ema = (data[i] * k) + (ema * (1 - k));
    emaData.push(ema);
  }
  
  return [...Array(period - 1).fill(0), ...emaData];
};

export const calculateMACD = (prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { 
  macdLine: number[],
  signalLine: number[],
  histogram: number[]
} => {
  // Calculate EMAs
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  // Calculate MACD line (difference between fast and slow EMAs)
  const macdLine = fastEMA.map((fast, i) => 
    i < slowPeriod - 1 ? 0 : fast - slowEMA[i - (slowPeriod - fastPeriod)]
  );
  
  // Calculate signal line (EMA of MACD line)
  const signalLine = calculateEMA(macdLine.slice(slowPeriod - 1), signalPeriod);
  const fullSignalLine = [...Array(slowPeriod + signalPeriod - 2).fill(0), ...signalLine];
  
  // Calculate histogram (MACD line - signal line)
  const histogram = macdLine.map((macd, i) => 
    i < slowPeriod + signalPeriod - 2 ? 0 : macd - fullSignalLine[i]
  );
  
  return {
    macdLine,
    signalLine: fullSignalLine,
    histogram
  };
};
