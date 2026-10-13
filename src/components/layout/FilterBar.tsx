import React, { useState } from 'react';
import { Search, RotateCcw, Layers, Calendar, ChevronDown, Users, X, UserCheck } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { StatusFilter } from '../../types/filter';
import { DatePeriodModal } from '../ui/DatePeriodModal';

export const FilterBar: React.FC = () => {
  const {
    filters,
    setSearchQuery,
    setStatusFilter,
    setMinCustomerOrders,
    setCustomerEmailFilter,
    resetFilters,
    filteredOrders,
    secondaryFilteredOrders,
    customerStats
  } = useFilters();

  const {
    selectedSheet,
    setSelectedSheet,
    availableSheets,
    activeDataset,
    isCompareEnabled
  } = useData();

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const statuses: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All Statuses' },
    { id: 'paid', label: 'Paid' },
    { id: 'refunded', label: 'Refunded' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const formatTimeframeLabel = () => {
    if (filters.dateRange && (filters.dateRange.startDate || filters.dateRange.endDate)) {
      const { startDate, endDate } = filters.dateRange;
      if (startDate && endDate) return `${startDate} → ${endDate}`;
      if (startDate) return `From ${startDate}`;
      if (endDate) return `Until ${endDate}`;
    }
    if (filters.selectedMonth !== 'all') {
      if (filters.selectedMonth.match(/^\d{4}-\d{2}$/)) {
        const [year, monthNum] = filters.selectedMonth.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const idx = parseInt(monthNum, 10) - 1;
        return `${monthNames[idx] || monthNum} ${year}`;
      }
      return filters.selectedMonth;
    }
    return 'All-Time Period';
  };

  const isTimeFiltered = filters.selectedMonth !== 'all' || !!filters.dateRange;
  const isFiltered = filters.searchQuery || isTimeFiltered || filters.status !== 'all' || !!filters.minCustomerOrders || !!filters.customerEmailFilter;

  return (
    <>
      <div className="w-full bg-white/95 dark:bg-obsidian-900/90 border border-slate-200/90 dark:border-obsidian-750 rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2.5 backdrop-blur-xl shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input supporting Email, Customer Name, Order #, City */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer email (e.g. user@gmail.com), name, order #..."
              className="w-full pl-9 pr-7 py-2 text-xs bg-slate-100/90 dark:bg-obsidian-850/80 border border-slate-200 dark:border-obsidian-750 rounded-xl text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-role transition-colors"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Controls: Sheet / Page Selector + Customer Order Frequency Filter + Calendar + Order Status */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Dynamic Sheet / Page Selector */}
            {availableSheets.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-role-subtle border border-role-subtle rounded-xl text-xs">
                <Layers className="w-3.5 h-3.5 text-role" />
                <span className="text-[11px] text-role font-semibold hidden sm:inline">Page:</span>
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  className="bg-transparent text-xs text-role font-bold focus:outline-none cursor-pointer max-w-[150px] truncate"
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

            {/* Customer Orders Placed Frequency Filter (e.g. 2+ orders) */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs transition-colors ${
              filters.minCustomerOrders
                ? 'bg-role-subtle border-role text-role font-bold shadow-sm'
                : 'bg-slate-100 dark:bg-obsidian-850/80 border-slate-200 dark:border-obsidian-750 text-slate-700 dark:text-zinc-300'
            }`}>
              <Users className={`w-3.5 h-3.5 ${filters.minCustomerOrders ? 'text-role' : 'text-slate-500 dark:text-zinc-400'}`} />
              <span className="text-[11px] font-semibold hidden md:inline">Orders Placed:</span>
              <select
                value={filters.minCustomerOrders ?? 'all'}
                onChange={(e) => setMinCustomerOrders(e.target.value === 'all' ? null : parseInt(e.target.value, 10))}
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer max-w-[150px] truncate"
                title="Filter by how many orders customers have placed (e.g. 2 or more orders)"
              >
                <option value="all" className="bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-200">
                  All Buyers ({customerStats.totalCustomers})
                </option>
                <option value="2" className="bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-200">
                  2+ Orders ({customerStats.repeatCustomers} repeat buyers)
                </option>
                <option value="3" className="bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-200">
                  3+ Orders ({customerStats.loyalCustomers} loyal buyers)
                </option>
                <option value="5" className="bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-200">
                  5+ Orders ({customerStats.vipCustomers} VIP buyers)
                </option>
              </select>
            </div>

            {/* Clean Interactive Calendar & Period Picker Button */}
            <button
              type="button"
              onClick={() => setIsDateModalOpen(true)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-sm ${
                isTimeFiltered
                  ? 'bg-role text-white border-role shadow-role-glow'
                  : 'bg-slate-100 dark:bg-obsidian-850 hover:bg-slate-200 dark:hover:bg-obsidian-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-obsidian-750'
              }`}
              title="Open Calendar to pick specific month, date range, or period presets"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] font-bold">
                {formatTimeframeLabel()}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-obsidian-850/80 border border-slate-200 dark:border-obsidian-750 rounded-xl text-xs">
              {statuses.map((st) => {
                const isSelected = filters.status === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(isSelected ? 'all' : st.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
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
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-obsidian-800 rounded-lg border border-slate-200 dark:border-obsidian-700 transition-colors"
                title="Reset active search & filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Filtered Order Count Pill */}
            <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 px-1.5 font-semibold">
              {filteredOrders.length} orders
              {isCompareEnabled && secondaryFilteredOrders.length > 0 && (
                <span className="text-cyan-600 dark:text-cyan-400 ml-1">vs {secondaryFilteredOrders.length}</span>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Indicators Bar */}
        {(filters.minCustomerOrders || filters.customerEmailFilter) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-obsidian-800 text-xs">
            <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">Active customer filters:</span>
            
            {filters.minCustomerOrders && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-role text-white shadow-sm">
                <UserCheck className="w-3 h-3" />
                <span>Customers with {filters.minCustomerOrders}+ Orders ({filteredOrders.length} orders)</span>
                <button
                  type="button"
                  onClick={() => setMinCustomerOrders(null)}
                  className="hover:opacity-75 transition-opacity"
                  title="Remove customer order filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.customerEmailFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-sm font-mono">
                <span>Email: {filters.customerEmailFilter}</span>
                <button
                  type="button"
                  onClick={() => setCustomerEmailFilter(null)}
                  className="hover:opacity-75 transition-opacity"
                  title="Remove customer email filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Dedicated Interactive Calendar & Date Period Modal */}
      <DatePeriodModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
      />
    </>
  );
};
