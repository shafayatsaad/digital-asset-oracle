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

// Advanced ML prediction model (enhanced version)
export const calculatePrediction = (prices: number[], daysToPredict: number = 7): number[] => {
  if (prices.length < 10) {
    return [...Array(daysToPredict).fill(prices[0] || 0)];
  }
  
  // Use a training window for model fitting
  const trainWindow = Math.min(60, prices.length);
  const trainData = prices.slice(-trainWindow);
  
  // 1. Decompose the time series into trend, seasonality, and residuals
  const { trend, seasonality, residuals } = decomposeSeries(trainData);
  
  // 2. Forecast each component separately
  const trendForecast = forecastTrend(trend, daysToPredict);
  const seasonalForecast = forecastSeasonality(seasonality, daysToPredict);
  const residualForecast = forecastResiduals(residuals, daysToPredict);
  
  // 3. Combine the forecasts to get the final prediction
  const predictions = [];
  for (let i = 0; i < daysToPredict; i++) {
    predictions.push(trendForecast[i] + seasonalForecast[i] + residualForecast[i]);
  }
  
  // Apply a confidence band adjustment (simulated)
  return applyConfidenceBands(predictions, trainData);
};

// Time series decomposition (trend, seasonality, residuals)
const decomposeSeries = (data: number[]): { trend: number[], seasonality: number[], residuals: number[] } => {
  const n = data.length;
  
  // Extract trend using centered moving average
  const windowSize = Math.min(7, Math.floor(n / 3));
  const trend = [];
  
  // Handle edges
  for (let i = 0; i < Math.floor(windowSize / 2); i++) {
    trend.push(data[i]);
  }
  
  // Calculate centered moving average
  for (let i = Math.floor(windowSize / 2); i < n - Math.floor(windowSize / 2); i++) {
    let sum = 0;
    for (let j = i - Math.floor(windowSize / 2); j <= i + Math.floor(windowSize / 2); j++) {
      sum += data[j];
    }
    trend.push(sum / windowSize);
  }
  
  // Handle trailing edges
  for (let i = n - Math.floor(windowSize / 2); i < n; i++) {
    trend.push(data[i]);
  }
  
  // Extract seasonality - using a differencing approach with period detection
  const period = detectPeriod(data);
  const seasonality = [];
  for (let i = 0; i < n; i++) {
    const detrended = data[i] - trend[i];
    seasonality.push(detrended);
  }
  
  // Smooth seasonality
  const smoothedSeasonality = smoothSeasonality(seasonality, period);
  
  // Calculate residuals (remainder)
  const residuals = data.map((val, i) => val - trend[i] - smoothedSeasonality[i]);
  
  return { trend, seasonality: smoothedSeasonality, residuals };
};

// Detect dominant cyclical pattern in the data
const detectPeriod = (data: number[]): number => {
  // Use autocorrelation to detect periodicity
  // For simplicity, we'll use a fixed period of 7 (weekly)
  // In a real implementation, this would use autocorrelation analysis
  return 7;
};

// Smooth seasonal components by averaging similar seasonal positions
const smoothSeasonality = (seasonality: number[], period: number): number[] => {
  const result = [...seasonality];
  const n = seasonality.length;
  
  // If we have at least 2 full periods
  if (n >= period * 2) {
    // Aggregate seasonality by position in period
    for (let pos = 0; pos < period; pos++) {
      const valuesAtPosition = [];
      
      for (let i = pos; i < n; i += period) {
        valuesAtPosition.push(seasonality[i]);
      }
      
      // Calculate average seasonal effect at this position
      const avgSeasonal = valuesAtPosition.reduce((sum, val) => sum + val, 0) / valuesAtPosition.length;
      
      // Apply smoothed value
      for (let i = pos; i < n; i += period) {
        result[i] = avgSeasonal;
      }
    }
  }
  
  return result;
};

// Forecast trend component using double exponential smoothing (Holt's method)
const forecastTrend = (trend: number[], horizon: number): number[] => {
  const n = trend.length;
  if (n < 2) return Array(horizon).fill(trend[0] || 0);
  
  // Initialize level and trend
  let level = trend[0];
  let slope = trend[1] - trend[0];
  
  // Smoothing parameters (would be optimized in a full implementation)
  const alpha = 0.7; // Level smoothing
  const beta = 0.3;  // Trend smoothing
  
  // Apply Holt's method to historical data
  for (let i = 1; i < n; i++) {
    const prevLevel = level;
    level = alpha * trend[i] + (1 - alpha) * (level + slope);
    slope = beta * (level - prevLevel) + (1 - beta) * slope;
  }
  
  // Generate forecasts
  const forecast = [];
  for (let i = 1; i <= horizon; i++) {
    forecast.push(level + i * slope);
  }
  
  return forecast;
};

// Forecast seasonal component
const forecastSeasonality = (seasonality: number[], horizon: number): number[] => {
  const n = seasonality.length;
  const period = detectPeriod(seasonality);
  const forecast = [];
  
  // Use the last observed season and repeat it
  for (let i = 0; i < horizon; i++) {
    const position = (n + i) % period;
    // Find the most recent occurrence of this position
    let lastOccurrence = position;
    while (lastOccurrence < 0 || lastOccurrence >= n) {
      lastOccurrence -= period;
    }
    
    // If no valid data, use 0
    forecast.push(lastOccurrence >= 0 ? seasonality[lastOccurrence] : 0);
  }
  
  return forecast;
};

// Forecast residuals using ARMA-like approach
const forecastResiduals = (residuals: number[], horizon: number): number[] => {
  const n = residuals.length;
  if (n < 5) return Array(horizon).fill(0);
  
  // Use AR(3) model - auto-regressive with 3 lags
  const arOrder = Math.min(3, n - 1);
  
  // Calculate AR coefficients using Yule-Walker method (simplified)
  const coef = calculateARCoefficients(residuals, arOrder);
  
  // Generate forecasts
  const forecast = [];
  for (let i = 0; i < horizon; i++) {
    let pred = 0;
    for (let j = 0; j < arOrder; j++) {
      const lag = n - arOrder + j + i;
      const value = lag < n ? residuals[lag] : forecast[lag - n];
      pred += coef[j] * value;
    }
    
    // Add small random innovation (could be based on residual variance)
    const randomNoise = (Math.random() - 0.5) * 0.01 * Math.abs(residuals[n - 1] || 1);
    forecast.push(pred + randomNoise);
  }
  
  return forecast;
};

// Calculate AR coefficients using correlation structure (simplified Yule-Walker)
const calculateARCoefficients = (data: number[], order: number): number[] => {
  // For simplicity, we'll use a naive approach instead of full Yule-Walker equations
  const coef = [];
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const centered = data.map(val => val - mean);
  
  // Calculate autocorrelations at different lags
  for (let lag = 1; lag <= order; lag++) {
    let numerator = 0;
    let denominator = 0;
    
    for (let i = lag; i < data.length; i++) {
      numerator += centered[i] * centered[i - lag];
    }
    
    for (let i = 0; i < data.length; i++) {
      denominator += centered[i] * centered[i];
    }
    
    // Add dampening factor for stability
    const dampening = Math.pow(0.9, lag);
    coef.push((denominator !== 0 ? numerator / denominator : 0) * dampening);
  }
  
  return coef;
};

// Apply confidence bands to prediction and ensure forecasts are reasonable
const applyConfidenceBands = (predictions: number[], historicalData: number[]): number[] => {
  const n = historicalData.length;
  if (n < 2) return predictions;
  
  // Calculate historical volatility
  const returns = [];
  for (let i = 1; i < n; i++) {
    returns.push((historicalData[i] / historicalData[i - 1]) - 1);
  }
  
  // Calculate standard deviation of returns
  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
  const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Ensure predictions stay within reasonable bounds based on volatility
  const lastPrice = historicalData[n - 1];
  const result = [];
  
  // Impose a maximum allowed daily change based on historical volatility
  const maxDailyChange = Math.max(stdDev * 3, 0.05); // 3 std devs or minimum 5%
  
  let currentPrice = lastPrice;
  for (let i = 0; i < predictions.length; i++) {
    // Calculate percent change from previous prediction
    const targetPrice = predictions[i];
    const percentChange = (targetPrice / currentPrice) - 1;
    
    // Cap the change to the maximum allowed
    const cappedChange = Math.min(Math.max(percentChange, -maxDailyChange), maxDailyChange);
    const boundedPrice = currentPrice * (1 + cappedChange);
    
    result.push(boundedPrice);
    currentPrice = boundedPrice;
  }
  
  return result;
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
