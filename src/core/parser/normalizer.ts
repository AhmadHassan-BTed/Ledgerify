import { ParsedFragranceItem } from '../../types/order';

/**
 * Normalizes header keys to lowercase alphanumeric strings for resilient mapping
 * regardless of capitalization, spaces, or punctuation variations.
 */
export function normalizeHeader(key: string): string {
  if (!key) return '';
  return key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Header mapping dictionary matching standard order column variations found in Shopify exports.
 */
export const HEADER_MAPPINGS: Record<string, string[]> = {
  orderNumber: ['order', 'ordernumber', 'orderid', 'name', 'orderno'],
  customerName: ['customername', 'customer', 'name', 'billingname', 'shippingname'],
  email: ['email', 'customeremail', 'emailaddress'],
  city: ['city', 'shippingcity', 'billingcity'],
  provinceState: ['provincestate', 'province', 'state', 'shippingprovince', 'billingprovince'],
  country: ['country', 'shippingcountry', 'billingcountry', 'countrycode'],
  fragrancesOrdered: ['fragrancesordered', 'fragranceordered', 'lineitems', 'items', 'products', 'fragrances'],
  orderQuantity: ['orderquantity', 'quantity', 'totalquantity', 'itemsquantity', 'units'],
  orderValue: ['ordervalue', 'total', 'ordertotal', 'value', 'subtotal', 'amount', 'totalspent'],
  status: ['status', 'financialstatus', 'orderstatus', 'paymentstatus'],
  date: ['date', 'createdat', 'orderdate', 'processedat', 'timestamp'],
};

/**
 * Finds the actual row key that matches any known synonym in the dictionary.
 */
export function findMappedKey(row: Record<string, any>, targetField: keyof typeof HEADER_MAPPINGS): string | null {
  const synonyms = HEADER_MAPPINGS[targetField];
  const keys = Object.keys(row);
  for (const key of keys) {
    const normalized = normalizeHeader(key);
    if (synonyms.includes(normalized)) {
      return key;
    }
  }
  return null;
}

/**
 * Dynamically discovers category columns from headers at runtime without hardcoding.
 * Scans for "{Category} Qty" and "{Category} Amount" patterns.
 */
export function discoverCategoryColumns(headers: string[]): {
  categories: string[];
  qtyCols: Record<string, string>;
  amountCols: Record<string, string>;
} {
  const qtyCols: Record<string, string> = {};
  const amountCols: Record<string, string> = {};
  const categoriesSet = new Set<string>();

  for (const h of headers) {
    const trimmed = h.trim();

    // Check for quantity pattern: e.g. "Trio Qty", "Discovery Qty", "50ml Qty", "Sample Quantity"
    const qtyMatch = trimmed.match(/^(.+?)\s*(?:Qty|Quantity)$/i);
    if (qtyMatch && qtyMatch[1]) {
      const catName = qtyMatch[1].trim();
      categoriesSet.add(catName);
      qtyCols[catName] = h;
      continue;
    }

    // Check for amount pattern: e.g. "Trio Amount", "Discovery Amount", "50ml Amount", "100ml Value"
    const amountMatch = trimmed.match(/^(.+?)\s*(?:Amount|Value|Total|Price)$/i);
    if (amountMatch && amountMatch[1]) {
      const catName = amountMatch[1].trim();
      // Avoid matching master total "Order Value" or "Order Total"
      if (!normalizeHeader(catName).includes('order') && !normalizeHeader(catName).includes('sub')) {
        categoriesSet.add(catName);
        amountCols[catName] = h;
      }
    }
  }

  return {
    categories: Array.from(categoriesSet),
    qtyCols,
    amountCols
  };
}

/**
 * Dynamically parses raw fragrance line items like "Visionary - 50ml; Silk Odyssey - 100ml; Royal Oud - Deluxe Box"
 * at runtime without hardcoded bottle sizes or names.
 */
export function parseFragranceString(raw: string | null | undefined): ParsedFragranceItem[] {
  if (!raw || typeof raw !== 'string') return [];
  
  const items: ParsedFragranceItem[] = [];
  const parts = raw.split(';').map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    // Dynamic extraction: "<Name> - <Size/Format>" or "<Name> : <Size/Format>"
    const match = part.match(/^(.+?)(?:\s*[-–—:]\s*(.+))?$/);
    if (match) {
      const name = (match[1] || '').trim();
      const size = (match[2] || 'Standard').trim();
      if (name.length > 0) {
        items.push({ name, size, raw: part });
      }
    } else {
      items.push({ name: part, size: 'Standard', raw: part });
    }
  }

  return items;
}
