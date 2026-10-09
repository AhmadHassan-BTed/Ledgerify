export interface ParsedFragranceItem {
  name: string;
  size: string; // Dynamically extracted: e.g. "50ml", "100ml", "Travel", "Discovery", etc.
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

  // Dynamically discovered category quantities and amounts (e.g. Trio, Discovery, 50ml, 100ml, Sample, etc.)
  categoryQuantities: Record<string, number>;
  categoryAmounts: Record<string, number>;

  // Status indicators
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

export interface SheetData {
  name: string;
  rowCount: number;
  headers: string[];
  orders: NormalizedOrder[];
  isLedger: boolean;
}

export interface Dataset {
  id: string;
  name: string;
  filename: string;
  sourceType: 'UK' | 'US' | 'CUSTOM';
  currency: string; // '£' | '$' | '€'
  totalRows: number;
  uploadedAt: string;

  // Multi-sheet / Multi-page support
  sheets: Record<string, SheetData>;
  sheetNames: string[];
  selectedSheet: string;

  // Active orders (from selectedSheet or combined)
  orders: NormalizedOrder[];

  // Dynamically derived metadata at runtime (never hardcoded)
  discoveredCategories: string[];
  discoveredVariants: string[];

  dataQuality: DataQualitySummary;
}

export type Currency = '£' | '$' | '€';
