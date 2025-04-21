
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function useChartHandlers(initialRange: string, initialCoin: { symbol: string; name: string }) {
  const { toast } = useToast();
  const [selectedRange, setSelectedRange] = useState(initialRange);
  const [selectedCoin, setSelectedCoin] = useState(initialCoin);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    toast({ title: "Timeframe Changed", description: `Chart now showing ${range} timeframe data` });
  };

  const handleCoinChange = (coin: { symbol: string; name: string }) => {
    setSelectedCoin(coin);
    toast({ title: "Asset Changed", description: `Now showing data for ${coin.name}` });
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
    toast({ title: "Zoom In", description: "Chart view zoomed in" });
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    toast({ title: "Zoom Out", description: "Chart view zoomed out" });
  };

  return {
    selectedRange,
    setSelectedRange,
    selectedCoin,
    setSelectedCoin,
    zoomLevel,
    setZoomLevel,
    handleRangeChange,
    handleCoinChange,
    zoomIn,
    zoomOut,
  };
}
