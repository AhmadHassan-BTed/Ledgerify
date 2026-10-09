import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: number; // e.g. 12.5 or -4.2
  trendLabel?: string;
  icon?: React.ReactNode;
  currencyPrefix?: string;
  className?: string;
  accentColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subValue,
  trend,
  trendLabel = 'vs last period',
  icon,
  currencyPrefix = '',
  className = '',
}) => {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <div
      className={`relative overflow-hidden bg-obsidian-900/90 backdrop-blur-xl border border-obsidian-700/60 rounded-2xl p-5 transition-all duration-200 hover:border-obsidian-600/80 shadow-obsidian-card group ${className}`}
    >
      {/* Subtle background glow */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-600/15 transition-all" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-obsidian-800 border border-obsidian-700/50 flex items-center justify-center text-purple-400 group-hover:text-purple-300 group-hover:border-purple-500/40 transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-50 font-sans">
          {currencyPrefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-semibold rounded-full border ${
              isPositive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : isNegative
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-400'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
            {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
            {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}

        <span className="text-xs text-zinc-400 truncate">
          {subValue || trendLabel}
        </span>
      </div>
    </div>
  );
};
