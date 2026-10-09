import React from 'react';
import { DayOfWeekHeatmapItem } from '../../types/analytics';

interface ActivityHeatmapProps {
  activity: DayOfWeekHeatmapItem[];
  currencySymbol?: string;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  activity,
  currencySymbol = '£'
}) => {
  const getBlockStyle = (intensity: number) => {
    switch (intensity) {
      case 0:
        return {
          backgroundColor: 'rgba(var(--role-rgb), 0.06)',
          borderColor: 'rgba(var(--role-rgb), 0.12)',
        };
      case 1:
        return {
          backgroundColor: 'rgba(var(--role-rgb), 0.22)',
          borderColor: 'rgba(var(--role-rgb), 0.32)',
          color: '#ffffff'
        };
      case 2:
        return {
          backgroundColor: 'rgba(var(--role-rgb), 0.45)',
          borderColor: 'rgba(var(--role-rgb), 0.55)',
          color: '#ffffff'
        };
      case 3:
        return {
          backgroundColor: 'rgba(var(--role-rgb), 0.75)',
          borderColor: 'rgba(var(--role-rgb), 0.85)',
          color: '#ffffff'
        };
      case 4:
        return {
          backgroundColor: 'var(--role-primary)',
          borderColor: 'var(--role-accent)',
          boxShadow: '0 0 15px -2px rgba(var(--role-rgb), 0.5)',
          color: '#ffffff',
          fontWeight: 700
        };
      default:
        return {};
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2.5 sm:gap-3">
        {activity.map((item) => (
          <div key={item.dayName} className="flex flex-col items-center group">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-2">
              {item.dayName.substring(0, 3)}
            </span>
            <div
              style={getBlockStyle(item.intensityScore)}
              className="w-full aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all duration-200 group-hover:scale-105 cursor-pointer text-slate-700 dark:text-zinc-200"
              title={`${item.dayName}: ${item.orderCount} orders (${currencySymbol}${item.revenue})`}
            >
              <span className="text-sm font-semibold tracking-tight leading-none">
                {item.orderCount}
              </span>
              <span className="text-[9px] opacity-75 mt-0.5 hidden sm:block">
                orders
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1.5 font-mono">
              {currencySymbol}{Math.round(item.revenue / 1000)}k
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-obsidian-800 text-[11px] text-slate-500 dark:text-zinc-400">
        <span>Order Volume Density</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">Less</span>
          <div className="w-3 h-3 rounded border" style={{ backgroundColor: 'rgba(var(--role-rgb), 0.06)', borderColor: 'rgba(var(--role-rgb), 0.12)' }} />
          <div className="w-3 h-3 rounded border" style={{ backgroundColor: 'rgba(var(--role-rgb), 0.22)', borderColor: 'rgba(var(--role-rgb), 0.32)' }} />
          <div className="w-3 h-3 rounded border" style={{ backgroundColor: 'rgba(var(--role-rgb), 0.45)', borderColor: 'rgba(var(--role-rgb), 0.55)' }} />
          <div className="w-3 h-3 rounded border" style={{ backgroundColor: 'rgba(var(--role-rgb), 0.75)', borderColor: 'rgba(var(--role-rgb), 0.85)' }} />
          <div className="w-3 h-3 rounded border" style={{ backgroundColor: 'var(--role-primary)', borderColor: 'var(--role-accent)' }} />
          <span className="text-[10px]">More</span>
        </div>
      </div>
    </div>
  );
};
