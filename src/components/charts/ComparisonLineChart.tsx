import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useFilters } from '../../context/FilterContext';
import { ROLE_THEMES } from '../../styles/themes/roleThemes';

export interface ComparisonSeriesConfig {
  key: string;
  name: string;
  color: string;
  currency: string;
}

interface ComparisonLineChartProps {
  data: any[];
  series?: ComparisonSeriesConfig[];
  nameA?: string;
  nameB?: string;
  currA?: string;
  currB?: string;
}

export const ComparisonLineChart: React.FC<ComparisonLineChartProps> = ({
  data,
  series,
  nameA = 'Dataset A',
  nameB = 'Dataset B',
  currA = '£',
  currB = '$'
}) => {
  const { theme } = useTheme();
  const { filters } = useFilters();
  const isDark = theme === 'dark';
  const roleTheme = ROLE_THEMES[filters.activeTab] || ROLE_THEMES.executive;

  const activeSeries: ComparisonSeriesConfig[] = series && series.length > 0
    ? series
    : [
        { key: 'revenueA', name: nameA, color: roleTheme.primaryHex, currency: currA },
        { key: 'revenueB', name: nameB, color: '#06b6d4', currency: currB }
      ];

  const currencyMap = new Map(activeSeries.map(s => [s.name, s.currency]));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
            tickFormatter={(val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`}
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
            formatter={(val: any, name: any) => {
              const prefix = currencyMap.get(name) || '£';
              return [`${prefix}${Number(val).toLocaleString()}`, name];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            iconType="circle"
          />
          {activeSeries.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: s.color }}
              activeDot={{ r: 5.5, fill: s.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
