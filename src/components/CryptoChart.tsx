
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TechnicalIndicators from './TechnicalIndicators';
import CorrelationMatrix from './CorrelationMatrix';
import SettingsPanel from './SettingsPanel';
import ChartControls from './chart/ChartControls';
import PriceChart from './chart/PriceChart';
import SentimentCard from './SentimentCard';
import BacktestCard from './BacktestCard';
import VisualAnalysis from './VisualAnalysis';
import { useChartData } from '@/hooks/useChartData';

const CryptoChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [showBollingerBands, setShowBollingerBands] = useState(true);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showCorrelation, setShowCorrelation] = useState(true);
  const [showIndicators, setShowIndicators] = useState(true);
  const { toast } = useToast();
  
  const chartData = useChartData();
  
  const handleBollingerBandsChange = (checked: boolean) => {
    setShowBollingerBands(checked);
    toast({
      title: checked ? "Bollinger Bands Enabled" : "Bollinger Bands Disabled",
      description: checked ? "Price volatility bands are now visible" : "Price volatility bands are now hidden"
    });
  };

  const handlePredictionsChange = (checked: boolean) => {
    setShowPredictions(checked);
    toast({
      title: checked ? "Price Predictions Enabled" : "Price Predictions Disabled",
      description: checked ? "ML-based price predictions are now visible" : "ML-based price predictions are now hidden"
    });
  };

  const handleCorrelationChange = (checked: boolean) => {
    setShowCorrelation(checked);
    toast({
      title: checked ? "Correlation Analysis Enabled" : "Correlation Analysis Disabled",
      description: checked ? "Multi-asset correlation matrix is now visible" : "Multi-asset correlation matrix is now hidden"
    });
  };
  
  // Get the latest RSI and MACD values for analysis
  const latestRsi = chartData.rsiData[chartData.rsiData.length - 1] || 50;
  const latestMacd = {
    macdLine: chartData.macdData.macdLine[chartData.macdData.macdLine.length - 1] || 0,
    signalLine: chartData.macdData.signalLine[chartData.macdData.signalLine.length - 1] || 0
  };
  
  const processedChartData = chartData.prepareChartData(showPredictions);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card className="w-full bg-[#1A1F2C] border-none p-4">
          <ChartControls
            selectedCoin={chartData.selectedCoin}
            selectedRange={chartData.selectedRange}
            showIndicators={showIndicators}
            currentPrice={chartData.currentPrice}
            chartColor={chartData.chartColor}
            onCoinChange={chartData.handleCoinChange}
            onRangeChange={chartData.handleRangeChange}
            onZoomIn={chartData.zoomIn}
            onZoomOut={chartData.zoomOut}
            onToggleIndicators={() => setShowIndicators(prev => !prev)}
          />
          
          <div className="h-[400px] w-full" ref={chartContainerRef}>
            <PriceChart
              data={processedChartData}
              chartColor={chartData.chartColor}
              currentPrice={chartData.currentPrice}
              zoomLevel={chartData.zoomLevel}
              showIndicators={showIndicators}
              showBollingerBands={showBollingerBands}
              bollingerBands={chartData.bollingerBands}
              showPredictions={showPredictions}
            />
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-[#8E9196] text-xs">
              {showPredictions ? 
                "Showing price prediction (purple line)" : 
                "Click to show price prediction"
              }
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`bg-transparent border-[#2A2F3C] text-[#8E9196] hover:text-white hover:bg-[#2A2F3C] ${
                showPredictions && "text-white bg-[#2A2F3C]"
              }`}
              onClick={() => setShowPredictions(!showPredictions)}
            >
              {showPredictions ? "Hide Prediction" : "Show Prediction"}
            </Button>
          </div>
        </Card>
      
        <TechnicalIndicators 
          data={chartData.data} 
          rsiData={chartData.rsiData}
          macdData={chartData.macdData}
          bollingerBands={showBollingerBands ? chartData.bollingerBands : undefined}
          timeFormat={chartData.timeFormat}
        />
        
        {chartData.sentimentData && (
          <SentimentCard sentiment={chartData.sentimentData} />
        )}
        
        {chartData.backtestResults && (
          <BacktestCard results={chartData.backtestResults} />
        )}
      </div>
      
      <div className="lg:col-span-1 space-y-4">
        <SettingsPanel 
          showBollingerBands={showBollingerBands}
          onBollingerBandsChange={handleBollingerBandsChange}
          showPredictions={showPredictions}
          onPredictionsChange={handlePredictionsChange}
          showCorrelation={showCorrelation}
          onCorrelationChange={handleCorrelationChange}
        />
        
        <VisualAnalysis
          sentimentData={chartData.sentimentData}
          backtestResults={chartData.backtestResults}
          rsiValue={latestRsi}
          macdValue={latestMacd}
        />
        
        <CorrelationMatrix coins={chartData.allCoins} visible={showCorrelation} />
      </div>
    </div>
  );
};

export default CryptoChart;
