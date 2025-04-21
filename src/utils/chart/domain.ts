
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
}) {
  if (!data.length) return ['auto', 'auto'];

  // Comparison mode: multiple series
  if (keys && keys.length > 0) {
    const allValues: number[] = [];
    data.forEach(item => {
      keys.forEach(key => {
        if (item[key] !== undefined && item[key] !== null) {
          allValues.push(item[key]);
        }
      });
    });
    if (allValues.length === 0) return ['auto', 'auto'];
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min;
    const padding = range * 0.1;
    return [min - padding, max + padding];
  }

  // Single series mode
  const prices = data.map(item => item.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;
  const padding = range * 0.1;

  // Use zoom
  const zoomedRange = range / zoomLevel;
  const midPoint = (max + min) / 2;
  return [
    midPoint - (zoomedRange / 2) - padding,
    midPoint + (zoomedRange / 2) + padding
  ];
}
