import React from 'react';
import { Search, RotateCcw, Layers } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { StatusFilter } from '../../types/filter';

export const FilterBar: React.FC = () => {
  const {
    filters,
    setSearchQuery,
    setSelectedMonth,
    setStatusFilter,
    resetFilters,
    availableMonths,
    filteredOrders,
    secondaryFilteredOrders
  } = useFilters();

  const {
    selectedSheet,
    setSelectedSheet,
    availableSheets,
    activeDataset,
    isCompareEnabled
  } = useData();

  const statuses: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All Statuses' },
    { id: 'paid', label: 'Paid' },
    { id: 'refunded', label: 'Refunded' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="w-full bg-white/95 dark:bg-obsidian-900/60 border border-slate-200/90 dark:border-obsidian-800 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 backdrop-blur-md shadow-sm transition-colors">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search any order #, customer, city, or scent..."
          className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-100/90 dark:bg-obsidian-850/80 border border-slate-200 dark:border-obsidian-750 rounded-xl text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-role transition-colors"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-xs"
          >
            ×
          </button>
        )}
      </div>

      {/* Sheet / Page Selector + Month & Status Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Dynamic Sheet / Page Selector */}
        {availableSheets.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-role-subtle border border-role-subtle rounded-xl text-xs">
            <Layers className="w-3.5 h-3.5 text-role" />
            <span className="text-[11px] text-role font-semibold hidden sm:inline">Page:</span>
            <select
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
              className="bg-transparent text-xs text-role font-bold focus:outline-none cursor-pointer max-w-[170px] truncate"
              title="Select specific sheet or page from the uploaded workbook"
            >
              {availableSheets.map(s => {
                const count = s === 'All Sheets (Combined)'
                  ? activeDataset?.totalRows
                  : activeDataset?.sheets[s]?.rowCount;
                return (
                  <option key={s} value={s} className="bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-200">
                    {s} {count !== undefined ? `(${count})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Month Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-obsidian-850/80 border border-slate-200 dark:border-obsidian-750 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setSelectedMonth('all')}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
              filters.selectedMonth === 'all'
                ? 'bg-role text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            All
          </button>
          {availableMonths.map((month) => {
            const isSelected = filters.selectedMonth === month;
            const label = month.endsWith('-08')
              ? 'Aug'
              : month.endsWith('-09')
              ? 'Sep'
              : month.endsWith('-10')
              ? 'Oct'
              : month;
            return (
              <button
                key={month}
                type="button"
                onClick={() => setSelectedMonth(month)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-role text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-obsidian-850/80 border border-slate-200 dark:border-obsidian-750 rounded-xl text-xs">
          {statuses.map((st) => {
            const isSelected = filters.status === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-role text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        {/* Reset Filter Button */}
        {(filters.searchQuery || filters.selectedMonth !== 'all' || filters.status !== 'all') && (
          <button
            type="button"
            onClick={resetFilters}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-obsidian-800 rounded-lg border border-slate-200 dark:border-obsidian-700 transition-colors"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 pl-1 font-semibold">
          {filteredOrders.length} orders
          {isCompareEnabled && secondaryFilteredOrders.length > 0 && (
            <span className="text-cyan-600 dark:text-cyan-400 ml-1">vs {secondaryFilteredOrders.length}</span>
          )}
        </div>
      </div>
    </div>
  );
};
