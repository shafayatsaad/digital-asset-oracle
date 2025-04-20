
/**
 * Correlation analysis calculations
 */

// Helper function to calculate Pearson correlation
const pearsonCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  
  if (n < 2) return 0;
  
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
  
  const correlation = numerator / Math.sqrt(xDenom * yDenom);
  
  // Ensure result is within [-1, 1] range
  return Math.max(-1, Math.min(1, correlation));
};

export const calculateCorrelation = (pricesA: number[], pricesB: number[], window: number = 30): number[] => {
  const minLength = Math.min(pricesA.length, pricesB.length);
  const correlations: number[] = [];
  
  if (minLength < 2) {
    return Array(Math.max(pricesA.length, pricesB.length)).fill(0);
  }
  
  // Fill initial values with 0 until we have enough data
  for (let i = 0; i < Math.min(window - 1, minLength - 1); i++) {
    correlations.push(0);
  }
  
  // Calculate rolling correlation for each window
  for (let i = Math.min(window - 1, minLength - 1); i < minLength; i++) {
    const windowSize = Math.min(window, i + 1);
    const windowA = pricesA.slice(i - windowSize + 1, i + 1);
    const windowB = pricesB.slice(i - windowSize + 1, i + 1);
    
    const correlation = pearsonCorrelation(windowA, windowB);
    correlations.push(correlation);
  }
  
  // If pricesA is longer than pricesB, pad with zeros
  while (correlations.length < pricesA.length) {
    correlations.push(0);
  }
  
  return correlations;
};
