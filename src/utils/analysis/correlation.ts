
/**
 * Correlation analysis calculations
 */

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
