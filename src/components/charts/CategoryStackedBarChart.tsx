import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { StackedMonthlyCategoryItem } from '../../types/analytics';

interface CategoryStackedBarChartProps {
  data: StackedMonthlyCategoryItem[];
  currencySymbol?: string;
}

export const CategoryStackedBarChart: React.FC<CategoryStackedBarChartProps> = ({
  data,
  currencySymbol = '£'
}) => {
  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#272732" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#272732' }}
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
            formatter={(val: any, name: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, name]}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            iconType="circle"
          />
          <Bar dataKey="size100ml" name="100ml Bottles" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
          <Bar dataKey="size50ml" name="50ml Bottles" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
          <Bar dataKey="sets" name="Sets (Trio & Disc.)" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
