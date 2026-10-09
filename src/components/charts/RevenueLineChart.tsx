import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { DailyRevenueItem } from '../../types/analytics';

interface RevenueLineChartProps {
  data: DailyRevenueItem[];
  currencySymbol?: string;
}

export const RevenueLineChart: React.FC<RevenueLineChartProps> = ({
  data,
  currencySymbol = '£'
}) => {
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#272732" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#272732' }}
            tickFormatter={(str: string) => str.slice(5)} // Show MM-DD
          />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val: number) => `${currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#121217',
              borderColor: '#323242',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#f4f4f5',
              boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
            }}
            formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Revenue']}
            labelFormatter={(label: any) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#a855f7"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#purpleAreaGrad)"
            activeDot={{ r: 5, fill: '#c084fc', stroke: '#181820', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
