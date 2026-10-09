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
  // Color scale for intensity
  const getBlockColor = (intensity: number) => {
    switch (intensity) {
      case 0:
        return 'bg-obsidian-800 border-obsidian-700/60 text-zinc-500';
      case 1:
        return 'bg-purple-950/60 border-purple-800/40 text-purple-300';
      case 2:
        return 'bg-purple-800/70 border-purple-600/50 text-purple-200';
      case 3:
        return 'bg-purple-600 border-purple-400/60 text-white shadow-sm';
      case 4:
        return 'bg-purple-500 border-purple-300 text-white shadow-glow-subtle font-bold';
      default:
        return 'bg-obsidian-800 border-obsidian-700 text-zinc-400';
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2.5 sm:gap-3">
        {activity.map((item) => (
          <div key={item.dayName} className="flex flex-col items-center group">
            <span className="text-[11px] font-medium text-zinc-400 mb-2">
              {item.dayName.substring(0, 3)}
            </span>
            <div
              className={`w-full aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all duration-200 group-hover:scale-105 group-hover:border-purple-400/80 cursor-pointer ${getBlockColor(
                item.intensityScore
              )}`}
              title={`${item.dayName}: ${item.orderCount} orders (${currencySymbol}${item.revenue})`}
            >
              <span className="text-sm font-semibold tracking-tight leading-none">
                {item.orderCount}
              </span>
              <span className="text-[9px] opacity-75 mt-0.5 hidden sm:block">
                orders
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1.5 font-mono">
              {currencySymbol}{Math.round(item.revenue / 1000)}k
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-obsidian-800 text-[11px] text-zinc-400">
        <span>Order Volume Density</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-500">Less</span>
          <div className="w-3 h-3 rounded bg-obsidian-800 border border-obsidian-700" />
          <div className="w-3 h-3 rounded bg-purple-950/80 border border-purple-800/50" />
          <div className="w-3 h-3 rounded bg-purple-800 border border-purple-600" />
          <div className="w-3 h-3 rounded bg-purple-600 border border-purple-400" />
          <div className="w-3 h-3 rounded bg-purple-500 border border-purple-300" />
          <span className="text-[10px] text-zinc-500">More</span>
        </div>
      </div>
    </div>
  );
};
