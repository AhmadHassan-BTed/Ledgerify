import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle, Sparkles, ChevronRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: number; // e.g. 12.5 or -4.2
  trendLabel?: string;
  icon?: React.ReactNode;
  currencyPrefix?: string;
  className?: string;
  insightHint?: string; // Executive definition and business context
  onClick?: () => void;
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
  insightHint,
  onClick
}) => {
  const [showHint, setShowHint] = useState(false);
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  const activeHint = insightHint;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white dark:bg-obsidian-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-obsidian-700/60 rounded-2xl p-5 transition-all duration-200 shadow-sm dark:shadow-obsidian-card group ${
        onClick
          ? 'cursor-pointer hover:border-role hover:shadow-role-glow/10 hover:-translate-y-0.5'
          : 'hover:border-slate-300 dark:hover:border-obsidian-600/80'
      } ${className}`}
    >
      {/* Subtle dynamic background role glow */}
      <div
        className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-all duration-300 opacity-40 group-hover:opacity-100"
        style={{ backgroundColor: 'rgba(var(--role-rgb), 0.15)' }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 truncate">
            {title}
          </span>
          {activeHint && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHint(prev => !prev);
              }}
              className="text-slate-400 hover:text-role dark:text-zinc-500 dark:hover:text-role transition-colors flex-shrink-0"
              title="Click for metric definition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-role-subtle border border-role-subtle flex items-center justify-center text-role group-hover:scale-105 transition-all flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      {/* Professional metric insight callout */}
      {showHint && activeHint && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-role-subtle border border-role-subtle text-[11px] text-slate-800 dark:text-zinc-200 animate-fade-in leading-relaxed">
          <span className="font-bold text-role inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Metric Definition:</span>
          </span> {activeHint}
        </div>
      )}

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 font-sans">
          {currencyPrefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-obsidian-800/60">
        <div className="flex items-center gap-2 min-w-0">
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-bold rounded-full border ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400'
                  : isNegative
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800/80 dark:border-zinc-700 dark:text-zinc-400'
              }`}
            >
              {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
              {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
              {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
          )}

          <span className="text-xs text-slate-500 dark:text-zinc-400 truncate">
            {subValue || trendLabel}
          </span>
        </div>

        {onClick && (
          <div className="flex items-center text-[10px] text-slate-400 group-hover:text-role font-medium gap-0.5 transition-colors flex-shrink-0">
            <span className="hidden group-hover:inline">Inspect</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>
    </div>
  );
};

