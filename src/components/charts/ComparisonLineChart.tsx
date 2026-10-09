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

interface ComparisonLineChartProps {
  data: {
    month: string;
    revenueA: number;
    revenueB: number;
  }[];
  nameA: string;
  nameB: string;
  currA?: string;
  currB?: string;
}

export const ComparisonLineChart: React.FC<ComparisonLineChartProps> = ({
  data,
  nameA,
  nameB,
  currA = '£',
  currB = '$'
}) => {
  const { theme } = useTheme();
  const { filters } = useFilters();
  const isDark = theme === 'dark';
  const roleTheme = ROLE_THEMES[filters.activeTab] || ROLE_THEMES.executive;

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
              const prefix = name === nameA ? currA : currB;
              return [`${prefix}${Number(val).toLocaleString()}`, name];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="revenueA"
            name={nameA}
            stroke={roleTheme.primaryHex}
            strokeWidth={3}
            dot={{ r: 4, fill: roleTheme.primaryHex }}
            activeDot={{ r: 6, fill: roleTheme.accentHex }}
          />
          <Line
            type="monotone"
            dataKey="revenueB"
            name={nameB}
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{ r: 4, fill: '#06b6d4' }}
            activeDot={{ r: 6, fill: '#67e8f9' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
