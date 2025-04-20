
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const timeRanges = [
  { value: '15m', label: '15m' },
  { value: '1H', label: '1H' },
  { value: '4H', label: '4H' },
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
];

const TimeRangeSelector = () => {
  return (
    <ToggleGroup type="single" defaultValue="15m" variant="outline">
      {timeRanges.map((range) => (
        <ToggleGroupItem
          key={range.value}
          value={range.value}
          className="text-[#8E9196] hover:text-white data-[state=on]:text-white data-[state=on]:bg-[#2A2F3C]"
        >
          {range.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default TimeRangeSelector;
