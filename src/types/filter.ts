export type ViewTab =
  | 'executive'
  | 'finance'
  | 'inventory'
  | 'operations'
  | 'admin'
  | 'creative'
  | 'marketing'
  | 'compare';

export type StatusFilter = 'all' | 'paid' | 'refunded' | 'cancelled';

export interface FilterState {
  searchQuery: string;
  selectedMonth: string; // 'all' or '2026-08', '2026-09', etc.
  status: StatusFilter;
  activeTab: ViewTab;
  customCurrency?: '£' | '$' | '€' | null;
}
