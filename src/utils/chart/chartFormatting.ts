
export function formatChartPrice(value: number): string {
  if (value === undefined || value === null) return '';
  return value.toLocaleString();
}
