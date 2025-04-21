
/**
 * Utility for preparing chart data overlays with predictions.
 */
export function prepareChartDataWithPrediction(
  data: any[],
  predictionData: number[],
  selectedRange: string
) {
  if (!data.length) return [{ time: '00:00', price: 0 }];
  if (!predictionData.length) return data;

  const result = [...data];
  const lastDataPoint = data[data.length - 1];
  const lastPrice = lastDataPoint.price ?? 0;
  const lastTime = lastDataPoint.time || '00:00';
  const lastDate = new Date();
  
  if (lastTime && lastTime.includes(':')) {
    const [hours, minutes] = lastTime.split(':').map(Number);
    lastDate.setHours(hours || 0, minutes || 0, 0, 0);
  }
  
  for (let i = 0; i < predictionData.length; i++) {
    const nextDate = new Date(lastDate);
    if (selectedRange === '15m') {
      nextDate.setMinutes(nextDate.getMinutes() + (i + 1) * 15);
    } else if (selectedRange === '1H') {
      nextDate.setHours(nextDate.getHours() + (i + 1));
    } else if (selectedRange === '4H') {
      nextDate.setHours(nextDate.getHours() + (i + 1) * 4);
    } else if (selectedRange === '1D') {
      nextDate.setDate(nextDate.getDate() + (i + 1));
    } else if (selectedRange === '1W') {
      nextDate.setDate(nextDate.getDate() + (i + 1) * 7);
    }
    const timeStr = nextDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    result.push({
      time: timeStr,
      price: null,
      predictedPrice: predictionData[i],
      isPrediction: true,
      dataPoints: [{ price: lastPrice }, { price: predictionData[i] }]
    });
  }
  return result;
}
