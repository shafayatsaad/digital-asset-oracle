import React from 'react';
import CryptoChart from '@/components/CryptoChart';
import { Card } from '@/components/ui/card';
import PostForm from '@/components/PostForm';
import PostList from '@/components/PostList';
import { MonitorSmartphone, BarChart, LineChart, TrendingUp, TrendingDown } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#131722] p-4 overflow-auto">
      <header className="max-w-[1400px] mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold flex items-center gap-2">
              <MonitorSmartphone className="h-6 w-6 text-[#9b87f5]" />
              Crypto Analysis Dashboard
            </h1>
            <p className="text-[#8E9196]">
              Real-time cryptocurrency analytics and predictions with technical indicators
            </p>
          </div>
          <Card className="bg-[#1A1F2C] border-none p-4">
            <div className="flex flex-col">
              <span className="text-[#8E9196] text-sm">Current Version</span>
              <span className="text-white font-medium">Phase 5.0</span>
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card className="bg-[#1A1F2C] border-none p-4">
            <div className="flex flex-col">
              <span className="text-[#8E9196] text-sm">Technical Analysis</span>
              <span className="text-[#9b87f5] text-xl font-medium">RSI + MACD</span>
            </div>
          </Card>
          <Card className="bg-[#1A1F2C] border-none p-4">
            <div className="flex flex-col">
              <span className="text-[#8E9196] text-sm">Price Patterns</span>
              <span className="text-[#F97316] text-xl font-medium">Bollinger</span>
            </div>
          </Card>
          <Card className="bg-[#1A1F2C] border-none p-4">
            <div className="flex flex-col">
              <span className="text-[#8E9196] text-sm">Advanced Features</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#22c55e]" />
                <span className="text-[#22c55e] text-xl font-medium">Sentiment</span>
              </div>
            </div>
          </Card>
          <Card className="bg-[#1A1F2C] border-none p-4">
            <div className="flex flex-col">
              <span className="text-[#8E9196] text-sm">Backtesting</span>
              <div className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-[#f43f5e]" />
                <span className="text-[#f43f5e] text-xl font-medium">Strategy</span>
              </div>
            </div>
          </Card>
        </div>
      </header>
      <div className="max-w-[1400px] mx-auto space-y-4">
        <CryptoChart />
        <PostForm />
        <PostList />
      </div>
    </div>
  );
};

export default Index;
