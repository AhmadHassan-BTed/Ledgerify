import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export interface DonutItem {
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
  onSliceClick?: (categoryName: string) => void;
  layout?: 'stacked' | 'side-by-side' | 'auto';
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  centerLabel = 'Total',
  centerValue,
  currencySymbol = '',
  onSliceClick,
  layout = 'auto'
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isAmountBased = data[0]?.amount !== undefined;
  const totalRaw = data.reduce((sum, d) => sum + (d.amount !== undefined ? d.amount : (d.count || 0)), 0);

  const displayCenterValue = centerValue !== undefined
    ? centerValue
    : isAmountBased
    ? `${currencySymbol}${Math.round(totalRaw).toLocaleString()}`
    : totalRaw.toLocaleString();

  return (
    <div className={`w-full overflow-hidden flex ${
      layout === 'side-by-side'
        ? 'flex-row items-center justify-between gap-4'
        : layout === 'stacked'
        ? 'flex-col items-center gap-4'
        : 'flex-col xl:flex-row items-center justify-between gap-4'
    }`}>
      {/* Donut Chart Container */}
      <div className="relative w-44 h-44 flex-shrink-0 mx-auto">
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
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey={isAmountBased ? 'amount' : 'count'}
              cursor={onSliceClick ? 'pointer' : 'default'}
              onClick={(entry: any) => onSliceClick && entry && entry.name && onSliceClick(String(entry.name))}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={isDark ? '#121218' : '#ffffff'}
                  strokeWidth={2}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 text-center">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">
            {centerLabel}
          </span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 truncate max-w-full font-mono">
            {displayCenterValue}
          </span>
        </div>
      </div>

      {/* Legend items */}
      <div className="flex-1 w-full min-w-0 space-y-1.5 overflow-hidden">
        {data.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => onSliceClick && onSliceClick(item.name)}
            className={`w-full flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors text-left ${
              onSliceClick
                ? 'hover:bg-slate-100 dark:hover:bg-obsidian-850 cursor-pointer'
                : 'cursor-default'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-700 dark:text-zinc-300 truncate font-medium">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 font-mono">
              <span className="text-slate-600 dark:text-zinc-400 text-[11px]">
                {item.amount !== undefined ? `${currencySymbol}${Math.round(item.amount).toLocaleString()}` : item.count?.toLocaleString()}
              </span>
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] w-7 text-right">
                {item.percentage}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
