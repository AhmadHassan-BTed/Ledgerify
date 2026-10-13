import React, { createContext, useContext, useState, useMemo } from 'react';
import { ViewTab, StatusFilter, FilterState, DateRange } from '../types/filter';
import { NormalizedOrder, Currency } from '../types/order';
import { useData } from './DataContext';

interface FilterContextType {
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setSelectedMonth: (month: string) => void;
  setDateRange: (range: DateRange | null) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setMinCustomerOrders: (min: number | null) => void;
  setCustomerEmailFilter: (email: string | null) => void;
  setActiveTab: (tab: ViewTab) => void;
  setCustomCurrency: (currency: Currency | null) => void;
  resetFilters: () => void;
  filteredOrders: NormalizedOrder[];
  secondaryFilteredOrders: NormalizedOrder[];
  activeCurrency: string;
  secondaryCurrency: string;
  availableMonths: string[];
  dateBounds: { minDate: string; maxDate: string };
  customerStats: {
    totalCustomers: number;
    repeatCustomers: number;
    loyalCustomers: number;
    vipCustomers: number;
    singleCustomers: number;
  };
}

const defaultFilters: FilterState = {
  searchQuery: '',
  selectedMonth: 'all',
  dateRange: null,
  status: 'all',
  activeTab: 'executive',
  customCurrency: null,
  minCustomerOrders: null,
  customerEmailFilter: null,
};

const getInitialFilters = (): FilterState => {
  if (typeof window === 'undefined') return defaultFilters;
  try {
    const savedTab = localStorage.getItem('ledgerify_active_tab') as ViewTab | null;
    const validTabs: ViewTab[] = ['executive', 'finance', 'inventory', 'operations', 'marketing', 'creative', 'admin', 'compare'];
    const activeTab = savedTab && validTabs.includes(savedTab) ? savedTab : 'executive';
    const selectedMonth = localStorage.getItem('ledgerify_filter_month') || 'all';
    const status = (localStorage.getItem('ledgerify_filter_status') || 'all') as StatusFilter;
    const customCurrency = localStorage.getItem('ledgerify_custom_currency') as Currency | null;
    
    let minCustomerOrders: number | null = null;
    try {
      const savedMin = localStorage.getItem('ledgerify_filter_min_orders');
      if (savedMin) minCustomerOrders = parseInt(savedMin, 10) || null;
    } catch {}

    let dateRange: DateRange | null = null;
    try {
      const savedRange = localStorage.getItem('ledgerify_filter_date_range');
      if (savedRange) dateRange = JSON.parse(savedRange);
    } catch {}

    return {
      searchQuery: '',
      selectedMonth,
      dateRange,
      status,
      activeTab,
      customCurrency,
      minCustomerOrders,
      customerEmailFilter: null,
    };
  } catch {
    return defaultFilters;
  }
};

const FilterContext = createContext<FilterContextType | null>(null);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeDataset, activeOrders, secondaryDataset, secondaryOrders, isCompareEnabled } = useData();
  const [filters, setFilters] = useState<FilterState>(getInitialFilters);

  const setSearchQuery = (searchQuery: string) => setFilters(prev => ({ ...prev, searchQuery }));
  
  const setSelectedMonth = (selectedMonth: string) => {
    setFilters(prev => ({ ...prev, selectedMonth, dateRange: null }));
    try {
      localStorage.setItem('ledgerify_filter_month', selectedMonth);
      localStorage.removeItem('ledgerify_filter_date_range');
    } catch {}
  };

  const setDateRange = (dateRange: DateRange | null) => {
    setFilters(prev => ({ ...prev, dateRange, selectedMonth: 'all' }));
    try {
      if (dateRange) {
        localStorage.setItem('ledgerify_filter_date_range', JSON.stringify(dateRange));
      } else {
        localStorage.removeItem('ledgerify_filter_date_range');
      }
      localStorage.removeItem('ledgerify_filter_month');
    } catch {}
  };

  const setStatusFilter = (status: StatusFilter) => {
    setFilters(prev => ({ ...prev, status }));
    try {
      localStorage.setItem('ledgerify_filter_status', status);
    } catch {}
  };

  const setMinCustomerOrders = (minCustomerOrders: number | null) => {
    setFilters(prev => ({ ...prev, minCustomerOrders }));
    try {
      if (minCustomerOrders) {
        localStorage.setItem('ledgerify_filter_min_orders', String(minCustomerOrders));
      } else {
        localStorage.removeItem('ledgerify_filter_min_orders');
      }
    } catch {}
  };

  const setCustomerEmailFilter = (customerEmailFilter: string | null) => {
    setFilters(prev => ({ ...prev, customerEmailFilter }));
  };

  const setActiveTab = (activeTab: ViewTab) => {
    setFilters(prev => ({ ...prev, activeTab }));
    try {
      localStorage.setItem('ledgerify_active_tab', activeTab);
    } catch {}
  };

  const setCustomCurrency = (customCurrency: Currency | null) => {
    setFilters(prev => ({ ...prev, customCurrency }));
    try {
      if (customCurrency) localStorage.setItem('ledgerify_custom_currency', customCurrency);
      else localStorage.removeItem('ledgerify_custom_currency');
    } catch {}
  };
  
  const resetFilters = () => {
    try {
      localStorage.removeItem('ledgerify_filter_month');
      localStorage.removeItem('ledgerify_filter_date_range');
      localStorage.removeItem('ledgerify_filter_status');
      localStorage.removeItem('ledgerify_filter_min_orders');
    } catch {}
    setFilters(prev => ({
      ...defaultFilters,
      activeTab: prev.activeTab,
      customCurrency: prev.customCurrency
    }));
  };

  // Compute customer order counts & segmentation metrics from activeOrders
  const customerStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of activeOrders) {
      const key = (o.email || o.customerName || '').toLowerCase().trim();
      if (key) {
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    let repeat = 0;
    let loyal = 0;
    let vip = 0;
    let single = 0;
    for (const count of counts.values()) {
      if (count === 1) single++;
      if (count >= 2) repeat++;
      if (count >= 3) loyal++;
      if (count >= 5) vip++;
    }
    return {
      counts,
      totalCustomers: counts.size,
      repeatCustomers: repeat,
      loyalCustomers: loyal,
      vipCustomers: vip,
      singleCustomers: single
    };
  }, [activeOrders]);

  const secondaryCustomerStats = useMemo(() => {
    const counts = new Map<string, number>();
    if (!isCompareEnabled || !secondaryOrders) {
      return { counts, totalCustomers: 0, repeatCustomers: 0, loyalCustomers: 0, vipCustomers: 0, singleCustomers: 0 };
    }
    for (const o of secondaryOrders) {
      const key = (o.email || o.customerName || '').toLowerCase().trim();
      if (key) {
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    let repeat = 0;
    let loyal = 0;
    let vip = 0;
    let single = 0;
    for (const count of counts.values()) {
      if (count === 1) single++;
      if (count >= 2) repeat++;
      if (count >= 3) loyal++;
      if (count >= 5) vip++;
    }
    return {
      counts,
      totalCustomers: counts.size,
      repeatCustomers: repeat,
      loyalCustomers: loyal,
      vipCustomers: vip,
      singleCustomers: single
    };
  }, [secondaryOrders, isCompareEnabled]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    for (const order of activeOrders) {
      if (order.month && order.month.length >= 7) {
        months.add(order.month);
      }
    }
    return Array.from(months).sort();
  }, [activeOrders]);

  const dateBounds = useMemo(() => {
    let minDate = '';
    let maxDate = '';
    for (const o of activeOrders) {
      if (o.date && o.date.length === 10) {
        if (!minDate || o.date < minDate) minDate = o.date;
        if (!maxDate || o.date > maxDate) maxDate = o.date;
      }
    }
    return { minDate, maxDate };
  }, [activeOrders]);

  const applyFilters = (orders: NormalizedOrder[], custFreqMap: Map<string, number>) => {
    let result = orders;

    // Search query filter (matches customer email, name, order #, city, or fragrances)
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

    // Direct Customer Email filter
    if (filters.customerEmailFilter && filters.customerEmailFilter.trim()) {
      const emailQuery = filters.customerEmailFilter.toLowerCase().trim();
      result = result.filter(o => o.email.toLowerCase().trim() === emailQuery);
    }

    // Customer Order Count / Frequency filter (e.g. 2+ orders)
    if (filters.minCustomerOrders && filters.minCustomerOrders > 1) {
      result = result.filter(o => {
        const key = (o.email || o.customerName || '').toLowerCase().trim();
        const count = custFreqMap.get(key) || 1;
        return count >= filters.minCustomerOrders!;
      });
    }

    // Custom Date Range filter
    if (filters.dateRange && (filters.dateRange.startDate || filters.dateRange.endDate)) {
      const { startDate, endDate } = filters.dateRange;
      if (startDate && endDate) {
        result = result.filter(o => o.date >= startDate && o.date <= endDate);
      } else if (startDate) {
        result = result.filter(o => o.date >= startDate);
      } else if (endDate) {
        result = result.filter(o => o.date <= endDate);
      }
    } else if (filters.selectedMonth !== 'all') {
      // Specific month filter
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
  };

  const filteredOrders = useMemo(() => {
    return applyFilters(activeOrders, customerStats.counts);
  }, [activeOrders, customerStats.counts, filters.searchQuery, filters.customerEmailFilter, filters.minCustomerOrders, filters.selectedMonth, filters.dateRange, filters.status]);

  const secondaryFilteredOrders = useMemo(() => {
    if (!isCompareEnabled || !secondaryOrders) return [];
    return applyFilters(secondaryOrders, secondaryCustomerStats.counts);
  }, [secondaryOrders, isCompareEnabled, secondaryCustomerStats.counts, filters.searchQuery, filters.customerEmailFilter, filters.minCustomerOrders, filters.selectedMonth, filters.dateRange, filters.status]);

  const activeCurrency = filters.customCurrency || activeDataset?.currency || '£';
  const secondaryCurrency = secondaryDataset?.currency || (activeCurrency === '£' ? '$' : '£');

  return (
    <FilterContext.Provider
      value={{
        filters,
        setSearchQuery,
        setSelectedMonth,
        setDateRange,
        setStatusFilter,
        setMinCustomerOrders,
        setCustomerEmailFilter,
        setActiveTab,
        setCustomCurrency,
        resetFilters,
        filteredOrders,
        secondaryFilteredOrders,
        activeCurrency,
        secondaryCurrency,
        availableMonths,
        dateBounds,
        customerStats
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
