import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  X,
  Check,
  RotateCcw,
  ArrowRight,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { DateRange } from '../../types/filter';

interface DatePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatePeriodModal: React.FC<DatePeriodModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    filters,
    setSelectedMonth,
    setDateRange,
    availableMonths,
    dateBounds
  } = useFilters();

  const [activeMode, setActiveMode] = useState<'months' | 'range' | 'presets'>('months');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  // Sync temp dates when modal opens or filter changes
  useEffect(() => {
    if (filters.dateRange) {
      setTempStartDate(filters.dateRange.startDate || '');
      setTempEndDate(filters.dateRange.endDate || '');
      setActiveMode('range');
    } else if (filters.selectedMonth !== 'all') {
      setActiveMode('months');
      setTempStartDate('');
      setTempEndDate('');
    } else {
      setTempStartDate('');
      setTempEndDate('');
    }
  }, [filters.dateRange, filters.selectedMonth, isOpen]);

  if (!isOpen) return null;

  // Group available months by year
  const monthsByYear: Record<string, string[]> = {};
  for (const m of availableMonths) {
    if (m.includes('-')) {
      const [yr] = m.split('-');
      if (!monthsByYear[yr]) monthsByYear[yr] = [];
      monthsByYear[yr].push(m);
    }
  }
  const years = Object.keys(monthsByYear).sort().reverse();

  const formatMonthName = (m: string) => {
    if (!m.includes('-')) return m;
    const [, monthNum] = m.split('-');
    const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const idx = parseInt(monthNum, 10) - 1;
    return names[idx] || m;
  };

  const formatShortMonth = (m: string) => {
    if (!m.includes('-')) return m;
    const [, monthNum] = m.split('-');
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = parseInt(monthNum, 10) - 1;
    return names[idx] || m;
  };

  const handleSelectMonth = (month: string) => {
    setSelectedMonth(month);
    onClose();
  };

  const handleSelectAllTime = () => {
    setSelectedMonth('all');
    setDateRange(null);
    onClose();
  };

  const handleApplyRange = () => {
    if (tempStartDate || tempEndDate) {
      setDateRange({
        startDate: tempStartDate,
        endDate: tempEndDate
      });
    } else {
      setDateRange(null);
      setSelectedMonth('all');
    }
    onClose();
  };

  const handlePresetRange = (type: 'last30' | 'last90' | 'ytd' | 'q1' | 'q2' | 'q3' | 'q4') => {
    const maxDate = dateBounds.maxDate ? new Date(dateBounds.maxDate) : new Date();
    const maxStr = dateBounds.maxDate || maxDate.toISOString().slice(0, 10);
    const yr = maxDate.getFullYear();

    let startStr = '';
    let endStr = maxStr;

    if (type === 'last30') {
      const past = new Date(maxDate);
      past.setDate(past.getDate() - 30);
      startStr = past.toISOString().slice(0, 10);
    } else if (type === 'last90') {
      const past = new Date(maxDate);
      past.setDate(past.getDate() - 90);
      startStr = past.toISOString().slice(0, 10);
    } else if (type === 'ytd') {
      startStr = `${yr}-01-01`;
      endStr = maxStr;
    } else if (type === 'q1') {
      startStr = `${yr}-01-01`;
      endStr = `${yr}-03-31`;
    } else if (type === 'q2') {
      startStr = `${yr}-04-01`;
      endStr = `${yr}-06-30`;
    } else if (type === 'q3') {
      startStr = `${yr}-07-01`;
      endStr = `${yr}-09-30`;
    } else if (type === 'q4') {
      startStr = `${yr}-10-01`;
      endStr = `${yr}-12-31`;
    }

    setTempStartDate(startStr);
    setTempEndDate(endStr);
    setDateRange({ startDate: startStr, endDate: endStr });
    onClose();
  };

  const isCurrentAllTime = filters.selectedMonth === 'all' && !filters.dateRange;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-obsidian-800 flex items-center justify-between bg-slate-50/70 dark:bg-obsidian-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-role-subtle border border-role-subtle flex items-center justify-center text-role shadow-role-glow">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Select Timeframe &amp; Period
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Filter orders by specific month, custom calendar date range, or period presets.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-4 border-b border-slate-100 dark:border-obsidian-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMode('months')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeMode === 'months'
                ? 'border-role text-role'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Specific Month
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('range')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeMode === 'range'
                ? 'border-role text-role'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Custom Calendar Range
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('presets')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeMode === 'presets'
                ? 'border-role text-role'
                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Period Presets
          </button>

          <button
            type="button"
            onClick={handleSelectAllTime}
            className={`ml-auto mb-2 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              isCurrentAllTime
                ? 'bg-role text-white shadow-sm'
                : 'bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            All-Time
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Mode 1: Month Grid */}
          {activeMode === 'months' && (
            <div className="space-y-4">
              {years.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-zinc-500 text-xs">
                  No monthly data found in active workbook.
                </div>
              ) : (
                years.map((year) => (
                  <div key={year} className="space-y-2">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                      Year {year}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {monthsByYear[year].map((month) => {
                        const isSelected = filters.selectedMonth === month && !filters.dateRange;
                        return (
                          <button
                            key={month}
                            type="button"
                            onClick={() => handleSelectMonth(month)}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'bg-role text-white border-role shadow-role-glow font-bold'
                                : 'bg-slate-50/80 dark:bg-obsidian-850/70 border-slate-200 dark:border-obsidian-750 text-slate-700 dark:text-zinc-300 hover:border-role hover:bg-role-subtle/30'
                            }`}
                          >
                            <span className="text-xs font-bold block">{formatMonthName(month)}</span>
                            <span className={`text-[10px] font-mono block mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400 dark:text-zinc-500'}`}>
                              {month}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Mode 2: Custom Calendar Range */}
          {activeMode === 'range' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-obsidian-750 bg-slate-50/60 dark:bg-obsidian-850/60 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
                  <CalendarIcon className="w-4 h-4 text-role" />
                  <span>Choose Custom Start &amp; End Dates:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={tempStartDate}
                      min={dateBounds.minDate || undefined}
                      max={dateBounds.maxDate || undefined}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="w-full bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-role cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={tempEndDate}
                      min={tempStartDate || dateBounds.minDate || undefined}
                      max={dateBounds.maxDate || undefined}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="w-full bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-role cursor-pointer"
                    />
                  </div>
                </div>

                {dateBounds.minDate && dateBounds.maxDate && (
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                    Workbook Date Range: {dateBounds.minDate} → {dateBounds.maxDate}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mode 3: Period Presets */}
          {activeMode === 'presets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'last30', label: 'Last 30 Days', desc: 'Recent 30-day window' },
                { id: 'last90', label: 'Last 90 Days', desc: 'Recent quarterly window' },
                { id: 'ytd', label: 'Year to Date (YTD)', desc: 'From Jan 1st to latest date' },
                { id: 'q1', label: 'Quarter 1 (Q1)', desc: 'Jan 1 - Mar 31' },
                { id: 'q2', label: 'Quarter 2 (Q2)', desc: 'Apr 1 - Jun 30' },
                { id: 'q3', label: 'Quarter 3 (Q3)', desc: 'Jul 1 - Sep 30' },
                { id: 'q4', label: 'Quarter 4 (Q4)', desc: 'Oct 1 - Dec 31' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetRange(p.id as any)}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-obsidian-750 bg-slate-50/80 dark:bg-obsidian-850/70 hover:border-role hover:bg-role-subtle/30 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-role">
                      {p.label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-role" />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-obsidian-800 bg-slate-50/70 dark:bg-obsidian-950/70 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSelectAllTime}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-obsidian-800 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to All-Time</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-obsidian-800 transition-colors"
            >
              Cancel
            </button>

            {activeMode === 'range' && (
              <button
                type="button"
                onClick={handleApplyRange}
                className="px-5 py-2 rounded-xl bg-role text-white font-semibold text-xs shadow-role-glow hover:opacity-90 transition-opacity"
              >
                Apply Range
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
