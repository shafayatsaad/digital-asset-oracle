
/**
 * Backtesting framework for strategy evaluation
 */

interface BacktestResult {
  returns: number;  // Total percentage return
  winRate: number;  // Percentage of winning trades
  maxDrawdown: number;  // Maximum drawdown (negative number)
}

// Simple moving average crossover strategy
const simpleMovingAverageCrossover = (prices: number[], shortPeriod: number = 10, longPeriod: number = 20): boolean[] => {
  if (prices.length < longPeriod) {
    return [];
  }
  
  const signals: boolean[] = [];
  
  for (let i = longPeriod; i < prices.length; i++) {
    // Calculate short MA
    const shortMA = prices.slice(i - shortPeriod, i).reduce((sum, price) => sum + price, 0) / shortPeriod;
    
    // Calculate long MA
    const longMA = prices.slice(i - longPeriod, i).reduce((sum, price) => sum + price, 0) / longPeriod;
    
    // Buy signal when short MA crosses above long MA
    const buySignal = shortMA > longMA;
    signals.push(buySignal);
  }
  
  return signals;
};

// Calculate returns based on signals
const calculateReturns = (prices: number[], signals: boolean[]): {returns: number, trades: number[], cumulativeReturns: number[]} => {
  let position = false;
  let entryPrice = 0;
  let totalReturn = 0;
  const trades: number[] = [];
  const cumulativeReturns: number[] = [0];
  
  for (let i = 0; i < signals.length; i++) {
    const currentIndex = i + 20; // Offset for the moving average periods
    
    // If we don't have a position and signal says buy
    if (!position && signals[i]) {
      position = true;
      entryPrice = prices[currentIndex];
    }
    // If we have a position and signal says sell
    else if (position && !signals[i]) {
      position = false;
      const exitPrice = prices[currentIndex];
      const tradeReturn = (exitPrice - entryPrice) / entryPrice * 100;
      totalReturn += tradeReturn;
      trades.push(tradeReturn);
      cumulativeReturns.push(totalReturn);
    }
  }
  
  // Close out any remaining position using the last price
  if (position) {
    const exitPrice = prices[prices.length - 1];
    const tradeReturn = (exitPrice - entryPrice) / entryPrice * 100;
    totalReturn += tradeReturn;
    trades.push(tradeReturn);
    cumulativeReturns.push(totalReturn);
  }
  
  return { returns: totalReturn, trades, cumulativeReturns };
};

// Calculate win rate
const calculateWinRate = (trades: number[]): number => {
  if (trades.length === 0) return 0;
  
  const winningTrades = trades.filter(trade => trade > 0).length;
  return (winningTrades / trades.length) * 100;
};

// Calculate maximum drawdown
const calculateMaxDrawdown = (cumulativeReturns: number[]): number => {
  let maxDrawdown = 0;
  let peak = cumulativeReturns[0];
  
  for (const ret of cumulativeReturns) {
    if (ret > peak) {
      peak = ret;
    }
    
    const drawdown = (ret - peak) / 100; // Convert percentage to decimal
    maxDrawdown = Math.min(maxDrawdown, drawdown);
  }
  
  return maxDrawdown * 100; // Convert back to percentage
};

// Main backtesting function
export const runBacktest = (prices: number[]): BacktestResult => {
  try {
    // Generate trading signals
    const signals = simpleMovingAverageCrossover(prices);
    
    if (signals.length === 0) {
      return {
        returns: 0,
        winRate: 0,
        maxDrawdown: 0
      };
    }
    
    // Calculate performance
    const { returns, trades, cumulativeReturns } = calculateReturns(prices, signals);
    const winRate = calculateWinRate(trades);
    const maxDrawdown = calculateMaxDrawdown(cumulativeReturns);
    
    return {
      returns: Number(returns.toFixed(2)),
      winRate: Number(winRate.toFixed(2)),
      maxDrawdown: Number(maxDrawdown.toFixed(2))
    };
  } catch (error) {
    console.error("Error running backtest:", error);
    return {
      returns: 0,
      winRate: 0,
      maxDrawdown: 0
    };
  }
};
