
import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Settings2 } from 'lucide-react';

interface SettingsPanelProps {
  showBollingerBands: boolean;
  onBollingerBandsChange: (checked: boolean) => void;
  showPredictions: boolean;
  onPredictionsChange: (checked: boolean) => void;
  showCorrelation: boolean;
  onCorrelationChange: (checked: boolean) => void;
}

const SettingsPanel = ({
  showBollingerBands,
  onBollingerBandsChange,
  showPredictions,
  onPredictionsChange,
  showCorrelation,
  onCorrelationChange
}: SettingsPanelProps) => {
  return (
    <Card className="bg-[#1A1F2C] border-none p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="h-5 w-5 text-[#9b87f5]" />
        <h3 className="text-white font-medium">Advanced Settings</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[#8E9196] text-sm">Bollinger Bands</label>
          <Switch
            checked={showBollingerBands}
            onCheckedChange={onBollingerBandsChange}
            className="data-[state=checked]:bg-[#9b87f5]"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-[#8E9196] text-sm">Price Predictions</label>
          <Switch
            checked={showPredictions}
            onCheckedChange={onPredictionsChange}
            className="data-[state=checked]:bg-[#22c55e]"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-[#8E9196] text-sm">Correlation Analysis</label>
          <Switch
            checked={showCorrelation}
            onCheckedChange={onCorrelationChange}
            className="data-[state=checked]:bg-[#f43f5e]"
          />
        </div>
      </div>
    </Card>
  );
};

export default SettingsPanel;
