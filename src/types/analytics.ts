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
  sets: number;
  size50ml: number;
  size100ml: number;
  other: number;
  total: number;
}

export interface DailyRevenueItem {
  date: string;
  revenue: number;
  orders: number;
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
}

export interface ExecutiveMetrics {
  totalRevenue: number;
  momRevenueGrowth: number;
  momVolumeGrowth: number;
  totalCustomers: number;
  returningCustomers: number;
  retentionRate: number;
  monthlyTarget: number;
  targetProgressPercent: number;
  topMarketName: string;
  topMarketRevenue: number;
  topMarketShare: number;
  newVsReturningSplit: { name: string; count: number; percentage: number; color: string }[];
}

export interface FragranceStockItem {
  name: string;
  unitsSold: number;
  size50Count: number;
  size100Count: number;
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

export interface CompareMetrics {
  datasetA: Dataset;
  datasetB: Dataset;
  revenueDeltaPercent: number;
  aovDeltaPercent: number;
  ordersDeltaPercent: number;
  retentionDeltaPercent: number;
  sideBySideRows: {
    metric: string;
    valueA: string;
    valueB: string;
    diff: string;
    isPositive: boolean;
  }[];
  monthlyOverlay: {
    month: string;
    revenueA: number;
    revenueB: number;
    ordersA: number;
    ordersB: number;
  }[];
  categoryComparison: {
    category: string;
    datasetA: number;
    datasetB: number;
  }[];
}
