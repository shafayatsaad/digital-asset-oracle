
/**
 * Advanced prediction models
 */

// Time series decomposition
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
  
  // Extract seasonality using a differencing approach with period detection
  const period = detectPeriod(data);
  const seasonality = data.map((val, i) => val - trend[i]);
  
  // Smooth seasonality
  const smoothedSeasonality = smoothSeasonality(seasonality, period);
  
  // Calculate residuals
  const residuals = data.map((val, i) => val - trend[i] - smoothedSeasonality[i]);
  
  return { trend, seasonality: smoothedSeasonality, residuals };
};

// Detect dominant cyclical pattern
const detectPeriod = (data: number[]): number => {
  return 7; // Simplified to weekly pattern
};

// Smooth seasonal components
const smoothSeasonality = (seasonality: number[], period: number): number[] => {
  const result = [...seasonality];
  const n = seasonality.length;
  
  if (n >= period * 2) {
    for (let pos = 0; pos < period; pos++) {
      const valuesAtPosition = [];
      
      for (let i = pos; i < n; i += period) {
        valuesAtPosition.push(seasonality[i]);
      }
      
      const avgSeasonal = valuesAtPosition.reduce((sum, val) => sum + val, 0) / valuesAtPosition.length;
      
      for (let i = pos; i < n; i += period) {
        result[i] = avgSeasonal;
      }
    }
  }
  
  return result;
};

// Forecast trend component using Holt's method
const forecastTrend = (trend: number[], horizon: number): number[] => {
  const n = trend.length;
  if (n < 2) return Array(horizon).fill(trend[0] || 0);
  
  let level = trend[0];
  let slope = trend[1] - trend[0];
  
  const alpha = 0.7;
  const beta = 0.3;
  
  for (let i = 1; i < n; i++) {
    const prevLevel = level;
    level = alpha * trend[i] + (1 - alpha) * (level + slope);
    slope = beta * (level - prevLevel) + (1 - beta) * slope;
  }
  
  return Array(horizon).fill(0).map((_, i) => level + (i + 1) * slope);
};

// Forecast seasonal component
const forecastSeasonality = (seasonality: number[], horizon: number): number[] => {
  const period = detectPeriod(seasonality);
  return Array(horizon).fill(0).map((_, i) => {
    const position = (seasonality.length + i) % period;
    let lastOccurrence = position;
    while (lastOccurrence < 0 || lastOccurrence >= seasonality.length) {
      lastOccurrence -= period;
    }
    return lastOccurrence >= 0 ? seasonality[lastOccurrence] : 0;
  });
};

// Calculate AR coefficients
const calculateARCoefficients = (data: number[], order: number): number[] => {
  const coef = [];
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const centered = data.map(val => val - mean);
  
  for (let lag = 1; lag <= order; lag++) {
    let numerator = 0;
    let denominator = 0;
    
    for (let i = lag; i < data.length; i++) {
      numerator += centered[i] * centered[i - lag];
    }
    
    for (let i = 0; i < data.length; i++) {
      denominator += centered[i] * centered[i];
    }
    
    const dampening = Math.pow(0.9, lag);
    coef.push((denominator !== 0 ? numerator / denominator : 0) * dampening);
  }
  
  return coef;
};

// Forecast residuals using ARMA-like approach
const forecastResiduals = (residuals: number[], horizon: number): number[] => {
  const n = residuals.length;
  if (n < 5) return Array(horizon).fill(0);
  
  const arOrder = Math.min(3, n - 1);
  const coef = calculateARCoefficients(residuals, arOrder);
  
  const forecast = [];
  for (let i = 0; i < horizon; i++) {
    let pred = 0;
    for (let j = 0; j < arOrder; j++) {
      const lag = n - arOrder + j + i;
      const value = lag < n ? residuals[lag] : forecast[lag - n];
      pred += coef[j] * value;
    }
    
    const randomNoise = (Math.random() - 0.5) * 0.01 * Math.abs(residuals[n - 1] || 1);
    forecast.push(pred + randomNoise);
  }
  
  return forecast;
};

// Apply confidence bands
const applyConfidenceBands = (
  predictions: number[], 
  historicalData: number[], 
  marketSignals: {
    sentiment?: number;
    backtestReturns?: number;
    rsi?: number;
    macd?: { macdLine: number; signalLine: number; };
  } = {}
): number[] => {
  const n = historicalData.length;
  if (n < 2) return predictions;
  
  const returns = [];
  for (let i = 1; i < n; i++) {
    returns.push((historicalData[i] / historicalData[i - 1]) - 1);
  }
  
  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
  const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Adjust confidence bands based on market signals
  let confidenceAdjustment = 1.0; // Default

  // Adjust based on RSI (Overbought/Oversold)
  if (marketSignals.rsi !== undefined) {
    if (marketSignals.rsi > 70) {
      confidenceAdjustment *= 1.2; // Higher volatility expected during overbought
    } else if (marketSignals.rsi < 30) {
      confidenceAdjustment *= 1.2; // Higher volatility expected during oversold
    }
  }
  
  // Adjust based on MACD divergence
  if (marketSignals.macd) {
    const macdDivergence = Math.abs(marketSignals.macd.macdLine - marketSignals.macd.signalLine);
    if (macdDivergence > 0.01) {
      confidenceAdjustment *= 1 + (macdDivergence * 5); // Stronger divergence = higher volatility
    }
  }
  
  // Adjust based on sentiment (more extreme sentiment = wider bands)
  if (marketSignals.sentiment !== undefined) {
    const sentimentStrength = Math.abs(marketSignals.sentiment);
    confidenceAdjustment *= 1 + (sentimentStrength * 0.5);
  }
  
  // Adjust based on backtest returns
  if (marketSignals.backtestReturns !== undefined) {
    if (marketSignals.backtestReturns > 10) {
      confidenceAdjustment *= 0.9; // Reduce volatility if strategy is working well
    } else if (marketSignals.backtestReturns < 0) {
      confidenceAdjustment *= 1.1; // Increase volatility if strategy is not working well
    }
  }
  
  const maxDailyChange = Math.max(stdDev * 3 * confidenceAdjustment, 0.05);
  
  // Apply trend bias based on indicators
  let trendBias = 0;
  
  // RSI-based bias
  if (marketSignals.rsi !== undefined) {
    trendBias += (marketSignals.rsi - 50) / 100; // Range roughly -0.5 to +0.5
  }
  
  // MACD-based bias
  if (marketSignals.macd) {
    const macdDiff = marketSignals.macd.macdLine - marketSignals.macd.signalLine;
    trendBias += macdDiff * 10; // Scale to reasonable magnitude
  }
  
  // Sentiment-based bias
  if (marketSignals.sentiment !== undefined) {
    trendBias += marketSignals.sentiment * 0.2; // Range roughly -0.2 to +0.2
  }
  
  // Backtest-based bias
  if (marketSignals.backtestReturns !== undefined) {
    trendBias += marketSignals.backtestReturns / 100; // Scale to reasonable magnitude
  }
  
  // Apply the biased confidence bands
  let currentPrice = historicalData[n - 1];
  return predictions.map((targetPrice, i) => {
    const basePrediction = targetPrice;
    
    // Apply trend bias (increases effect over time)
    const biasEffect = trendBias * (i + 1) * 0.005;
    
    const percentChange = ((basePrediction / currentPrice) - 1) + biasEffect;
    const cappedChange = Math.min(Math.max(percentChange, -maxDailyChange), maxDailyChange);
    const boundedPrice = currentPrice * (1 + cappedChange);
    
    currentPrice = boundedPrice;
    return boundedPrice;
  });
};

interface PredictionInputs {
  prices: number[];
  sentiment?: number;
  backtestReturns?: number;
  rsi?: number;
  macd?: { macdLine: number; signalLine: number; };
}

export const calculatePrediction = (
  prices: number[], 
  daysToPredict: number = 7,
  additionalInputs: PredictionInputs = { prices }
): number[] => {
  if (prices.length < 10) {
    return Array(daysToPredict).fill(prices[0] || 0);
  }
  
  const trainWindow = Math.min(60, prices.length);
  const trainData = prices.slice(-trainWindow);
  
  const { trend, seasonality, residuals } = decomposeSeries(trainData);
  
  const trendForecast = forecastTrend(trend, daysToPredict);
  const seasonalForecast = forecastSeasonality(seasonality, daysToPredict);
  const residualForecast = forecastResiduals(residuals, daysToPredict);
  
  const rawPredictions = Array(daysToPredict).fill(0)
    .map((_, i) => trendForecast[i] + seasonalForecast[i] + residualForecast[i]);
  
  return applyConfidenceBands(rawPredictions, trainData, {
    sentiment: additionalInputs.sentiment,
    backtestReturns: additionalInputs.backtestReturns,
    rsi: additionalInputs.rsi,
    macd: additionalInputs.macd
  });
};
