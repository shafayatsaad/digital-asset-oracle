
import CryptoChart from '@/components/CryptoChart';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#131722] p-4 overflow-hidden">
      <header className="max-w-[1400px] mx-auto mb-4">
        <h1 className="text-white text-2xl font-bold">Crypto Analysis Dashboard</h1>
        <p className="text-[#8E9196]">Real-time cryptocurrency analytics and predictions</p>
      </header>
      <div className="max-w-[1400px] mx-auto">
        <CryptoChart />
      </div>
    </div>
  );
};

export default Index;
