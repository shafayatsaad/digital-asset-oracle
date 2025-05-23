
export function formatChartPrice(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '';
  return value.toLocaleString();
}

export function formatPercentChange(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '';
  const formattedValue = value.toFixed(2);
  return value >= 0 ? `+${formattedValue}%` : `${formattedValue}%`;
}
