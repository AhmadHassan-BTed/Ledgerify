export interface ParsedFragranceItem {
  name: string;
  size: '50ml' | '100ml' | 'trio' | 'discovery' | 'other';
  raw: string;
}

export interface NormalizedOrder {
  orderNumber: string;
  customerName: string;
  email: string;
  city: string;
  provinceState: string;
  country: string;
  fragrancesRaw: string;
  fragrancesParsed: ParsedFragranceItem[];
  orderQuantity: number;
  orderValue: number;
  status: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  dayOfWeek: number; // 0-6 (Sun-Sat)
  hasTrio: boolean;
  hasDiscovery: boolean;
  trioQty: number;
  trioAmount: number;
  discoveryQty: number;
  discoveryAmount: number;
  qty50ml: number;
  amount50ml: number;
  qty100ml: number;
  amount100ml: number;
  isRefunded: boolean;
  isPartiallyRefunded: boolean;
  isCancelled: boolean;
  isPaid: boolean;
  flags: string[];
}

export interface DataQualitySummary {
  totalRows: number;
  validOrders: number;
  missingEmailCount: number;
  missingCityCount: number;
  missingFragranceCount: number;
  zeroValueCount: number;
  highQuantityCount: number;
  refundedCount: number;
  healthScore: number; // 0 to 100
  status: 'healthy' | 'warning' | 'critical';
  flaggedOrders: NormalizedOrder[];
}

export interface Dataset {
  id: string;
  name: string;
  filename: string;
  sourceType: 'UK' | 'US' | 'CUSTOM';
  currency: string; // '£' | '$' | '€'
  orders: NormalizedOrder[];
  totalRows: number;
  uploadedAt: string;
  availableSheets: string[];
  selectedSheet: string;
  dataQuality: DataQualitySummary;
}

export type Currency = '£' | '$' | '€';
