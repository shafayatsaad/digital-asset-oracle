
// Technical indicators calculation
export const calculateRSI = (prices: number[], period: number = 14): number[] => {
  if (prices.length < period + 1) {
    return Array(prices.length).fill(50); // Default to neutral RSI if not enough data
  }

  const deltas = prices.slice(1).map((price, i) => price - prices[i]);
  const gains = deltas.map(delta => delta > 0 ? delta : 0);
  const losses = deltas.map(delta => delta < 0 ? Math.abs(delta) : 0);

  // Calculate average gains and losses over the period
  let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;

  const rsiValues: number[] = Array(period).fill(50);
  
  // Calculate RSI for each point after the initial period
  for (let i = period; i < prices.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i - 1]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i - 1]) / period;
    
    const rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
    const rsi = 100 - (100 / (1 + rs));
    rsiValues.push(rsi);
  }

  return rsiValues;
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
  
  // Pad with zeros at the beginning to match the original data length
  return [...Array(period - 1).fill(0), ...emaData];
};

// Correlation calculation between two price series
export const calculateCorrelation = (pricesA: number[], pricesB: number[], window: number = 30): number[] => {
  if (pricesA.length !== pricesB.length || pricesA.length < window) {
    return Array(pricesA.length).fill(0);
  }
  
  const correlations: number[] = [];
  
  // Fill initial values with 0 until we have enough data
  for (let i = 0; i < window - 1; i++) {
    correlations.push(0);
  }
  
  // Calculate rolling correlation for each window
  for (let i = window - 1; i < pricesA.length; i++) {
    const windowA = pricesA.slice(i - window + 1, i + 1);
    const windowB = pricesB.slice(i - window + 1, i + 1);
    
    const correlation = pearsonCorrelation(windowA, windowB);
    correlations.push(correlation);
  }
  
  return correlations;
};

// Helper function to calculate Pearson correlation
const pearsonCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  
  // Calculate means
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate numerator and denominators
  let numerator = 0;
  let xDenom = 0;
  let yDenom = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    
    numerator += xDiff * yDiff;
    xDenom += Math.pow(xDiff, 2);
    yDenom += Math.pow(yDiff, 2);
  }
  
  // Check for division by zero
  if (xDenom === 0 || yDenom === 0) {
    return 0;
  }
  
  return numerator / Math.sqrt(xDenom * yDenom);
};

// Simple prediction model (linear regression)
export const calculatePrediction = (prices: number[], daysToPredict: number = 7): number[] => {
  if (prices.length < 2) {
    return [...prices, ...Array(daysToPredict).fill(prices[0] || 0)];
  }
  
  // Use last 30 days for the regression or all available data if less
  const period = Math.min(30, prices.length);
  const x = Array.from({ length: period }, (_, i) => i);
  const y = prices.slice(-period);
  
  // Calculate linear regression parameters
  const n = x.length;
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += Math.pow(x[i] - xMean, 2);
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;
  
  // Generate predictions
  const predictions = [];
  const lastPoint = period - 1;
  
  for (let i = 1; i <= daysToPredict; i++) {
    const predictedValue = slope * (lastPoint + i) + intercept;
    predictions.push(predictedValue);
  }
  
  return predictions;
};

// Bollinger Bands calculation
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
  
  // Fill initial values with 0 until we have enough data
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
