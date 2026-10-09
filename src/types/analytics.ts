import { NormalizedOrder, Dataset } from './order';

export interface CategoryBreakdownItem {
  name: string;
  amount: number;
  quantity: number;
  percentage: number;
  color: string;
}

export interface MonthlyRevenueItem {
  month: string;
  revenue: number;
  orders: number;
  aov: number;
}

export interface StackedMonthlyCategoryItem {
  month: string;
  total: number;
  [categoryKey: string]: any; // Dynamic category keys derived at runtime
}

export interface DailyRevenueItem {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopCustomerItem {
  name: string;
  email: string;
  orderCount: number;
  totalSpend: number;
  status: 'VIP' | 'Loyal' | 'First-time';
  statusBadge: 'Achieved' | 'On-Process' | 'VIP';
  avatarInitials: string;
  avatarColor: string;
  firstOrderDate: string;
  lastOrderDate: string;
  orders: NormalizedOrder[];
}

export interface ExecutiveMetrics {
  totalRevenue: number;
  momRevenueGrowth: number;
  momVolumeGrowth: number;
  hasMomComparison?: boolean;
  prevMonthLabel?: string;
  currMonthLabel?: string;
  totalCustomers: number;
  returningCustomers: number;
  retentionRate: number;
  monthlyTarget: number;
  targetProgressPercent: number;
  topMarketName: string;
  topMarketRevenue: number;
  topMarketShare: number;
  newVsReturningSplit: { name: string; count: number; percentage: number; color: string }[];
  topCustomers: TopCustomerItem[];
  topFragrancesSummary: { name: string; unitsSold: number; revenue: number; share: number }[];
}

export interface FinanceMetrics {
  totalRevenue: number;
  aov: number;
  totalOrders: number;
  totalRefundLiability: number;
  refundRate: number;
  categoryBreakdown: CategoryBreakdownItem[];
  monthlyRevenue: MonthlyRevenueItem[];
  stackedMonthlyCategory: StackedMonthlyCategoryItem[];
  dailyRevenueSeries: DailyRevenueItem[];
  medianOrderValue?: number;
  p75OrderValue?: number;
  p90OrderValue?: number;
  stdDeviation?: number;
}

export interface FragranceStockItem {
  name: string;
  unitsSold: number;
  variantsBreakdown: Record<string, number>; // Dynamic variants derived from line items
  estimatedRevenue: number;
  lastSaleDate: string;
  reorderStatus: 'optimal' | 'reorder_soon' | 'urgent';
}

export interface InventoryMetrics {
  totalUnitsSold: number;
  unitsBySize: { name: string; size: string; count: number; percentage: number; color: string }[];
  topFragrances: FragranceStockItem[];
  allFragrances: FragranceStockItem[];
  uniqueFragranceCount: number;
}

export interface DayOfWeekHeatmapItem {
  dayName: string;
  dayIndex: number;
  orderCount: number;
  revenue: number;
  intensityScore: number; // 0-4
}

export interface GeoHotspotItem {
  city: string;
  provinceState: string;
  orderCount: number;
  totalValue: number;
  avgOrderValue: number;
}

export interface OperationsMetrics {
  totalOrders: number;
  averageComplexity: number; // Avg items per order
  complexityDistribution: { itemsCount: string; orderCount: number; percentage: number }[];
  dayOfWeekActivity: DayOfWeekHeatmapItem[];
  geoHotspots: GeoHotspotItem[];
  triageOrders: NormalizedOrder[]; // unfulfilled, refunded, pending, abnormal
}

export interface HeroFragrance {
  name: string;
  unitsSold: number;
  revenue: number;
  sharePercentage: number;
}

export interface ShowcaseProduct {
  rank: number;
  name: string;
  unitsSold: number;
  revenue: number;
  visualHook: string;
  recommendedAsset: string;
  badge: string;
}

export interface CreativeMetrics {
  heroProduct: HeroFragrance;
  showcaseProducts: ShowcaseProduct[];
  trioVsBottleRatio: { trioPercent: number; bottlePercent: number; note: string };
  fragranceWordCloud: { text: string; count: number; weight: number }[];
}

export interface CityAdTarget {
  city: string;
  province: string;
  orders: number;
  revenue: number;
  priority: 'High' | 'Medium' | 'Emerging';
}

export interface ProductAffinityPair {
  itemA: string;
  itemB: string;
  coOccurrenceCount: number;
  affinityPercent: number;
}

export interface CohortMonthData {
  cohortMonth: string;
  initialSize: number;
  subsequentReturnCount: number;
  retentionPercent: number;
}

export interface MarketingMetrics {
  topCitiesForAds: CityAdTarget[];
  crossSellAffinities: ProductAffinityPair[];
  customerFrequencyTiers: { tier: string; customerCount: number; revenueShare: number }[];
  cohortRetention: CohortMonthData[];
}

export interface MultiDatasetSummary {
  dataset: Dataset;
  totalRevenue: number;
  totalOrders: number;
  aov: number;
  retentionRate: number;
  refundRate: number;
  refundLiability: number;
  healthScore: number;
  topFragrance: string;
  topFragranceUnits: number;
  currency: string;
  color: string;
}

export interface MultiSideBySideRow {
  metric: string;
  values: {
    datasetId: string;
    datasetName: string;
    region: string;
    currency: string;
    formattedValue: string;
    rawValue: number;
    deltaVsBaseline?: string;
    isPositive?: boolean;
  }[];
}

export interface MultiMonthlyOverlayItem {
  month: string;
  [key: string]: any; // revenue_<id>, orders_<id>
}

export interface CompareMetrics {
  datasets: Dataset[];
  summaries: MultiDatasetSummary[];
  sideBySideRows: MultiSideBySideRow[];
  monthlyOverlay: MultiMonthlyOverlayItem[];
  categoryComparison: {
    category: string;
    [key: string]: any; // <id>: amount
  }[];

  // Dual-dataset backwards compatibility:
  datasetA: Dataset;
  datasetB: Dataset;
  revenueDeltaPercent: number;
  aovDeltaPercent: number;
  ordersDeltaPercent: number;
  retentionDeltaPercent: number;
}

// Drill-Down Context & Modal Data
export type DrillDownType = 'category' | 'customer' | 'day' | 'fragrance' | 'revenue' | 'orders' | 'target';

export interface DrillDownData {
  type: DrillDownType;
  title: string;
  subtitle: string;
  badge?: string;
  summaryStats?: { label: string; value: string | number }[];
  orders: NormalizedOrder[];
  extraContent?: React.ReactNode;
}

