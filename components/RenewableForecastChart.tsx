
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ForecastDataPoint } from '../types';

interface RenewableForecastChartProps {
  data: ForecastDataPoint[];
  type: 'solar' | 'wind';
}

const RenewableForecastChart: React.FC<RenewableForecastChartProps> = ({ data, type }) => {
    const chartColor = type === 'solar' ? '#F59E0B' : '#3B82F6';

    const formattedData = data.map(d => ({
        ...d,
        Hour: `${d.hour % 24}:00`,
        'Output (%)': d.outputPercentage,
    }));

  return (
    <div className="w-full h-80 bg-white p-4 rounded-lg shadow-md">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="Hour" tick={{ fill: '#4B5563' }} />
          <YAxis unit="%" tick={{ fill: '#4B5563' }} />
          <Tooltip 
            contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                border: '1px solid #E5E7EB',
                borderRadius: '0.5rem'
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="Output (%)" stroke={chartColor} strokeWidth={3} dot={{ r: 4, fill: chartColor }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RenewableForecastChart;
