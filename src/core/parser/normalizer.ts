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
 * Header mapping dictionary matching common variations found in Shopify exports.
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
  hasTrio: ['hastrio', 'trio', 'trioset'],
  hasDiscovery: ['hasdiscovery', 'discovery', 'discoveryset'],
  trioQty: ['trioqty', 'trioquantity', 'triosetqty'],
  trioAmount: ['trioamount', 'triovalue', 'triototal'],
  discoveryQty: ['discoveryqty', 'discoveryquantity', 'discoverysetqty'],
  discoveryAmount: ['discoveryamount', 'discoveryvalue', 'discoverytotal'],
  qty50ml: ['50mlqty', '50mlquantity', 'qty50ml'],
  amount50ml: ['50mlamount', '50mlvalue', 'amount50ml'],
  qty100ml: ['100mlqty', '100mlquantity', 'qty100ml'],
  amount100ml: ['100mlamount', '100mlvalue', 'amount100ml'],
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
 * Parses raw fragrance line items like "Visionary - 50ml; Silk Odyssey - 50ml"
 */
export function parseFragranceString(raw: string | null | undefined): ParsedFragranceItem[] {
  if (!raw || typeof raw !== 'string') return [];
  
  const items: ParsedFragranceItem[] = [];
  const parts = raw.split(';').map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    let size: ParsedFragranceItem['size'] = 'other';
    let name = part;

    const lower = part.toLowerCase();
    if (lower.includes('50ml')) {
      size = '50ml';
      name = part.replace(/\s*-\s*50ml/i, '').trim();
    } else if (lower.includes('100ml')) {
      size = '100ml';
      name = part.replace(/\s*-\s*100ml/i, '').trim();
    } else if (lower.includes('trio')) {
      size = 'trio';
      name = part.replace(/\s*-\s*trio/i, '').trim();
    } else if (lower.includes('discovery')) {
      size = 'discovery';
      name = part.replace(/\s*-\s*discovery/i, '').trim();
    }

    if (name.length > 0) {
      items.push({ name, size, raw: part });
    }
  }

  return items;
}
