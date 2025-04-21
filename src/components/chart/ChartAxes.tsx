
import React from "react";
import { XAxis, YAxis } from "recharts";
import { formatChartPrice } from "@/utils/chart/chartFormatting";

interface ChartAxesProps {
  data: any[];
  compareKeys?: string[];
  yDomain: [number, number];
}

const ChartAxes = ({ data, compareKeys, yDomain }: ChartAxesProps) => (
  <>
    <XAxis
      dataKey="time"
      stroke="#8E9196"
      fontSize={10}
      tickLine={false}
      axisLine={{ stroke: '#2A2F3C' }}
    />
    <YAxis
      stroke="#8E9196"
      fontSize={10}
      domain={yDomain}
      tickCount={8}
      tickFormatter={formatChartPrice}
      tickLine={false}
      axisLine={{ stroke: '#2A2F3C' }}
      orientation="right"
    />
  </>
);

export default ChartAxes;
