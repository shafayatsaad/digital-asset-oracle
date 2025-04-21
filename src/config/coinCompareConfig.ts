
export const BIG_COINS = [
  { symbol: "BTCUSDT", name: "Bitcoin" },
  { symbol: "ETHUSDT", name: "Ethereum" },
  { symbol: "BNBUSDT", name: "BNB" },
];
export const LOW_COINS = [
  { symbol: "ADAUSDT", name: "Cardano" },
  { symbol: "SOLUSDT", name: "Solana" },
  { symbol: "XRPUSDT", name: "XRP" },
  { symbol: "DOGEUSDT", name: "Dogecoin" },
];
export const ALL_COINS = [...BIG_COINS, ...LOW_COINS];
export const defaultSelected = [BIG_COINS[0], LOW_COINS[0]];
