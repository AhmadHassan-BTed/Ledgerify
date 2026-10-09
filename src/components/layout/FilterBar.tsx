import React from 'react';
import { Search, RotateCcw, Calendar, Filter } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { StatusFilter } from '../../types/filter';

export const FilterBar: React.FC = () => {
  const {
    filters,
    setSearchQuery,
    setSelectedMonth,
    setStatusFilter,
    resetFilters,
    availableMonths,
    filteredOrders
  } = useFilters();

  const statuses: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All Statuses' },
    { id: 'paid', label: 'Paid' },
    { id: 'refunded', label: 'Refunded' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="w-full bg-obsidian-900/60 border border-obsidian-800 rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 backdrop-blur-md">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by Order #, Customer, Email, City or Scent..."
          className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-obsidian-850/80 border border-obsidian-750 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
          >
            ×
          </button>
        )}
      </div>

      {/* Month & Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Month Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-obsidian-850/80 border border-obsidian-750 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setSelectedMonth('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              filters.selectedMonth === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Time
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
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-obsidian-850/80 border border-obsidian-750 rounded-xl text-xs">
          {statuses.map((st) => {
            const isSelected = filters.status === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-zinc-200 text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
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
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-800 rounded-lg border border-obsidian-700 transition-colors"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="text-[11px] font-mono text-zinc-400 pl-1">
          {filteredOrders.length} orders
        </div>
      </div>
    </div>
  );
};
