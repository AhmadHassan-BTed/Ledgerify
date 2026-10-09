import React, { createContext, useContext, useState, useMemo } from 'react';
import { ViewTab, StatusFilter, FilterState } from '../types/filter';
import { NormalizedOrder, Currency } from '../types/order';
import { useData } from './DataContext';

interface FilterContextType {
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setSelectedMonth: (month: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setActiveTab: (tab: ViewTab) => void;
  setCustomCurrency: (currency: Currency | null) => void;
  resetFilters: () => void;
  filteredOrders: NormalizedOrder[];
  activeCurrency: string;
  availableMonths: string[];
}

const initialFilters: FilterState = {
  searchQuery: '',
  selectedMonth: 'all',
  status: 'all',
  activeTab: 'executive',
  customCurrency: null,
};

const FilterContext = createContext<FilterContextType | null>(null);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeDataset } = useData();
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const setSearchQuery = (searchQuery: string) => setFilters(prev => ({ ...prev, searchQuery }));
  const setSelectedMonth = (selectedMonth: string) => setFilters(prev => ({ ...prev, selectedMonth }));
  const setStatusFilter = (status: StatusFilter) => setFilters(prev => ({ ...prev, status }));
  const setActiveTab = (activeTab: ViewTab) => setFilters(prev => ({ ...prev, activeTab }));
  const setCustomCurrency = (customCurrency: Currency | null) => setFilters(prev => ({ ...prev, customCurrency }));
  
  const resetFilters = () => setFilters(prev => ({
    ...initialFilters,
    activeTab: prev.activeTab,
    customCurrency: prev.customCurrency
  }));

  const availableMonths = useMemo(() => {
    if (!activeDataset) return [];
    const months = new Set<string>();
    for (const order of activeDataset.orders) {
      if (order.month && order.month.length >= 7) {
        months.add(order.month);
      }
    }
    return Array.from(months).sort();
  }, [activeDataset]);

  const filteredOrders = useMemo(() => {
    if (!activeDataset) return [];

    let result = activeDataset.orders;

    // Search query filter (Order #, Customer Name, Email, Fragrances, City)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.fragrancesRaw.toLowerCase().includes(q)
      );
    }

    // Month filter
    if (filters.selectedMonth !== 'all') {
      result = result.filter(o => o.month === filters.selectedMonth);
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'paid') {
        result = result.filter(o => o.isPaid);
      } else if (filters.status === 'refunded') {
        result = result.filter(o => o.isRefunded || o.isPartiallyRefunded);
      } else if (filters.status === 'cancelled') {
        result = result.filter(o => o.isCancelled);
      }
    }

    return result;
  }, [activeDataset, filters.searchQuery, filters.selectedMonth, filters.status]);

  const activeCurrency = filters.customCurrency || activeDataset?.currency || '£';

  return (
    <FilterContext.Provider
      value={{
        filters,
        setSearchQuery,
        setSelectedMonth,
        setStatusFilter,
        setActiveTab,
        setCustomCurrency,
        resetFilters,
        filteredOrders,
        activeCurrency,
        availableMonths,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
