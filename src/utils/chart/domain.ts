
/**
 * Utility for calculating Y-axis domain for charts,
 * supporting both single-key and compareKey modes.
 */
export function calculateChartDomain({
  data,
  keys,
  zoomLevel = 1
}: {
  data: any[];
  keys?: string[];
  zoomLevel?: number;
}): [number, number] {
  if (!data || !data.length) return [0, 100]; // Default domain when no data is available

  // Comparison mode: multiple series
  if (keys && keys.length > 0) {
    const allValues: number[] = [];
    data.forEach(item => {
      keys.forEach(key => {
        if (item && item[key] !== undefined && item[key] !== null) {
          allValues.push(Number(item[key]));
        }
      });
    });
    if (allValues.length === 0) return [0, 100]; // Default domain when no values are found
    
    // Filter out any NaN values that might have been introduced
    const validValues = allValues.filter(val => !isNaN(val));
    if (validValues.length === 0) return [0, 100];
    
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    const range = max - min || 50; // Prevent 0 range
    const padding = range * 0.1;
    return [min - padding, max + padding];
  }

  // Single series mode
  const prices = data
    .map(item => (item && item.price !== undefined) ? item.price : null)
    .filter((p): p is number => p !== undefined && p !== null && !isNaN(p));
  
  if (prices.length === 0) return [0, 100]; // Default domain when no prices are found
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 50; // Prevent 0 range
  const padding = range * 0.1;

  // Use zoom
  const zoomedRange = range / zoomLevel;
  const midPoint = (max + min) / 2;
  return [
    midPoint - (zoomedRange / 2) - padding,
    midPoint + (zoomedRange / 2) + padding
  ];
}
