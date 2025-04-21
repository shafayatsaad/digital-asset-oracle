
import { coinData } from './coinData';

// Add a cache to store generated data
const dataCache: Record<string, any> = {};

export const generateDataForTimeRange = (timeRange: string, selectedCoin: { symbol: string; name: string }) => {
  const cacheKey = `${selectedCoin.symbol}-${timeRange}`;
  
  // Return cached data if available
  if (dataCache[cacheKey]) {
    return dataCache[cacheKey];
  }
  
  let basePrice = coinData[selectedCoin.symbol as keyof typeof coinData]?.price || 84000;
  let volatility = 0;
  let dataPoints = 0;
  let timeFormat = '';

  switch(timeRange) {
    case '15m':
      dataPoints = 60;
      volatility = 500;
      timeFormat = 'HH:mm';
      break;
    case '1H':
      dataPoints = 60;
      volatility = 1000;
      timeFormat = 'HH:mm';
      break;
    case '4H':
      dataPoints = 48;
      volatility = 2000;
      timeFormat = 'HH:mm';
      break;
    case '1D':
      dataPoints = 24;
      volatility = 3000;
      timeFormat = 'HH:mm';
      break;
    case '1W':
      dataPoints = 7;
      volatility = 5000;
      timeFormat = 'ddd';
      break;
    default:
      dataPoints = 60;
      volatility = 500;
      timeFormat = 'HH:mm';
  }

  const startDate = new Date();
  startDate.setMinutes(0, 0, 0);

  const data = [];
  let currentPrice = basePrice;
  
  // Use a seed based on coin symbol and timeframe to get consistent random values
  const seed = selectedCoin.symbol.charCodeAt(0) + timeRange.charCodeAt(0);
  const pseudoRandom = (n: number) => {
    return ((seed * 9301 + 49297) * n) % 233280 / 233280;
  };

  const trendBias = pseudoRandom(1) > 0.5 ? 1 : -1;

  for (let i = 0; i < dataPoints; i++) {
    const trendComponent = trendBias * (pseudoRandom(i + 1) * volatility * 0.2);
    const randomComponent = (pseudoRandom(i + 2) - 0.5) * volatility;
    const largeMovement = pseudoRandom(i + 3) > 0.9 ? (pseudoRandom(i + 4) - 0.5) * volatility * 3 : 0;
    
    const change = trendComponent + randomComponent + largeMovement;
    currentPrice += change;
    
    if (currentPrice <= 0) {
      currentPrice = basePrice * 0.1;
    }
    
    const date = new Date(startDate);
    
    if (timeRange === '15m') {
      date.setMinutes(date.getMinutes() - (dataPoints - i - 1) * 15);
    } else if (timeRange === '1H') {
      date.setMinutes(date.getMinutes() - (dataPoints - i - 1) * 60);
    } else if (timeRange === '4H') {
      date.setHours(date.getHours() - (dataPoints - i - 1) * 4);
    } else if (timeRange === '1D') {
      date.setHours(date.getHours() - (dataPoints - i - 1) * 24);
    } else if (timeRange === '1W') {
      date.setDate(date.getDate() - (dataPoints - i - 1));
    }

    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    
    data.push({
      time: timeStr,
      price: parseFloat(currentPrice.toFixed(1)),
      volume: Math.floor(pseudoRandom(i + 5) * 100000)
    });
  }

  const result = { data, timeFormat };
  
  // Store in cache for future use
  dataCache[cacheKey] = result;
  
  return result;
};
