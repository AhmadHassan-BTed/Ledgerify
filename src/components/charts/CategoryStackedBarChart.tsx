import React, { useMemo } from 'react';
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
import { useTheme } from '../../context/ThemeContext';

const DYNAMIC_BAR_PALETTE = [
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f97316', // Orange
  '#3b82f6', // Blue
];

interface CategoryStackedBarChartProps {
  data: StackedMonthlyCategoryItem[];
  currencySymbol?: string;
}

export const CategoryStackedBarChart: React.FC<CategoryStackedBarChartProps> = ({
  data,
  currencySymbol = '£'
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Dynamically extract all discovered category keys from data
  const dynamicKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const item of data) {
      for (const k of Object.keys(item)) {
        if (k !== 'month' && k !== 'total') {
          keys.add(k);
        }
      }
    }
    return Array.from(keys);
  }, [data]);

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#272732' : '#e2e8f0'} vertical={false} />
          <XAxis
            dataKey="month"
            stroke={isDark ? '#71717a' : '#64748b'}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: isDark ? '#272732' : '#cbd5e1' }}
          />
          <YAxis
            stroke={isDark ? '#71717a' : '#64748b'}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val: number) => `${currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#121217' : '#ffffff',
              borderColor: isDark ? '#323242' : '#e2e8f0',
              borderRadius: '12px',
              fontSize: '12px',
              color: isDark ? '#f4f4f5' : '#0f172a',
              boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.6)' : '0 8px 30px rgba(0,0,0,0.08)'
            }}
            formatter={(val: any, name: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, name]}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            iconType="circle"
          />
          {dynamicKeys.map((catKey, idx) => (
            <Bar
              key={catKey}
              dataKey={catKey}
              name={catKey}
              stackId="a"
              fill={DYNAMIC_BAR_PALETTE[idx % DYNAMIC_BAR_PALETTE.length]}
              radius={idx === dynamicKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
