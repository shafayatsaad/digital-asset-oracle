
/**
 * Relative Strength Index (RSI) calculations
 */
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
