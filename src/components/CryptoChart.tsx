
import React from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import TimeRangeSelector from './TimeRangeSelector';
import CoinSearch from './CoinSearch';
import { cn } from '@/lib/utils';

const data = [
  { time: '00:00', price: 84305 },
  { time: '04:00', price: 84350 },
  { time: '08:00', price: 84400 },
  { time: '12:00', price: 84450 },
  { time: '16:00', price: 84500 },
  { time: '20:00', price: 84550 },
  { time: '24:00', price: 84600 },
];

const CryptoChart = () => {
  return (
    <Card className="w-full bg-[#1A1F2C] border-none p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <CoinSearch />
          <TimeRangeSelector />
        </div>
        <div className="text-[#8E9196] text-sm">
          Last Price: <span className="text-[#9b87f5]">$84,289.6</span>
        </div>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9b87f5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="#8E9196" 
              fontSize={12}
            />
            <YAxis 
              stroke="#8E9196"
              fontSize={12}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1A1F2C',
                border: '1px solid #2A2F3C',
                borderRadius: '4px'
              }}
              labelStyle={{ color: '#8E9196' }}
              itemStyle={{ color: '#9b87f5' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#9b87f5"
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CryptoChart;
