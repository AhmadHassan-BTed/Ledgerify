import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface DonutItem {
  name: string;
  count?: number;
  amount?: number;
  percentage: number;
  color: string;
}

interface CategoryDonutChartProps {
  data: DonutItem[];
  centerLabel?: string;
  centerValue?: string | number;
  currencySymbol?: string;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  centerLabel = 'Total',
  centerValue,
  currencySymbol = ''
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="relative w-48 h-48 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#121217' : '#ffffff',
                borderColor: isDark ? '#323242' : '#e2e8f0',
                borderRadius: '12px',
                fontSize: '12px',
                color: isDark ? '#f4f4f5' : '#0f172a',
                boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.6)' : '0 8px 30px rgba(0,0,0,0.08)'
              }}
              formatter={(val: any, name: any) => [
                `${currencySymbol}${typeof val === 'number' ? val.toLocaleString() : val}`,
                name
              ]}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey={data[0]?.amount !== undefined ? 'amount' : 'count'}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#181820' : '#ffffff'} strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 dark:text-zinc-500">
            {centerLabel}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-zinc-100">
            {centerValue !== undefined ? centerValue : data.reduce((sum, d) => sum + (d.count || d.amount || 0), 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Legend items */}
      <div className="flex-1 w-full space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-700 dark:text-zinc-300 truncate max-w-[140px] font-medium">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-600 dark:text-zinc-400 font-mono">
                {item.amount !== undefined ? `${currencySymbol}${item.amount.toLocaleString()}` : item.count?.toLocaleString()}
              </span>
              <span className="text-slate-500 dark:text-zinc-500 text-[11px] w-8 text-right font-medium">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
