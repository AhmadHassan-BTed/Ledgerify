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
import { useFilters } from '../../context/FilterContext';
import { useTheme } from '../../context/ThemeContext';
import { ROLE_THEMES } from '../../styles/themes/roleThemes';

interface RevenueLineChartProps {
  data: DailyRevenueItem[];
  currencySymbol?: string;
}

export const RevenueLineChart: React.FC<RevenueLineChartProps> = ({
  data,
  currencySymbol = '£'
}) => {
  const { filters } = useFilters();
  const { theme } = useTheme();

  const roleTheme = ROLE_THEMES[filters.activeTab] || ROLE_THEMES.executive;
  const isDark = theme === 'dark';

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="dynamicRoleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={roleTheme.accentHex} stopOpacity={0.4} />
              <stop offset="95%" stopColor={roleTheme.primaryHex} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#272732' : '#e2e8f0'} vertical={false} />
          <XAxis
            dataKey="date"
            stroke={isDark ? '#71717a' : '#64748b'}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: isDark ? '#272732' : '#cbd5e1' }}
            tickFormatter={(str: string) => str.slice(5)} // Show MM-DD
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
            formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Revenue']}
            labelFormatter={(label: any) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={roleTheme.accentHex}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#dynamicRoleGrad)"
            activeDot={{ r: 5, fill: roleTheme.primaryHex, stroke: isDark ? '#181820' : '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
