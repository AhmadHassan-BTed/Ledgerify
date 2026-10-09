/**
 * Ledgerify Dataset Title & Label Formatting Utility
 * Prevents redundant region repetition (e.g. avoiding "[UK] UK Orders.xlsx" or "[UAE] UAE Orders")
 */

/**
 * Strips file extensions like .xlsx, .xls, .csv from display names
 */
export function cleanDatasetExtension(filename: string): string {
  if (!filename) return '';
  return filename.replace(/\.(xlsx|xls|csv|json)$/i, '').trim();
}

/**
 * Cleans dataset name to avoid duplicate region prefixing.
 * E.g., if region is 'UK' and name is 'UK Orders.xlsx', returns 'UK Orders'.
 * If name is 'Orders.xlsx' and region is 'UK', returns 'UK Orders'.
 * If name is 'Summer Campaign' and region is 'UK', returns '[UK] Summer Campaign'.
 */
export function formatDatasetTitle(name: string, region?: string): string {
  if (!name) return region || 'Ledger';

  let clean = cleanDatasetExtension(name).trim();
  const cleanRegion = (region || '').trim();

  // Strip existing bracketed region tags like "[UK] " or "[USA] "
  clean = clean.replace(/^\[[A-Za-z0-9\s_-]+\]\s*/, '').trim();

  if (!cleanRegion) return clean;

  const lowerName = clean.toLowerCase();
  const lowerRegion = cleanRegion.toLowerCase();

  // If the title already starts with the region (e.g. "UK Orders", "UAE Store", "USA Sales")
  if (lowerName.startsWith(lowerRegion)) {
    return clean;
  }

  // Handle common variations like "US" vs "USA" or "GB" vs "UK"
  if (
    (lowerRegion === 'usa' && lowerName.startsWith('us ')) ||
    (lowerRegion === 'us' && lowerName.startsWith('usa ')) ||
    (lowerRegion === 'uk' && lowerName.startsWith('gb ')) ||
    (lowerRegion === 'uae' && (lowerName.startsWith('dubai') || lowerName.startsWith('emirates')))
  ) {
    return clean;
  }

  // If title is generic (e.g. "Orders", "Sales", "Shopify Export", "Ledger"), prefix with region
  if (
    lowerName === 'orders' ||
    lowerName === 'sales' ||
    lowerName === 'ledger' ||
    lowerName.startsWith('orders ') ||
    lowerName.startsWith('sales ') ||
    lowerName.startsWith('export')
  ) {
    return `${cleanRegion} ${clean}`;
  }

  // Otherwise, return clean name
  return clean;
}

/**
 * Returns formatted label for select options and lists
 * E.g. "UK Orders (1,200 orders · £)"
 */
export function formatDatasetOptionLabel(
  name: string,
  region?: string,
  currency?: string,
  totalRows?: number
): string {
  const title = formatDatasetTitle(name, region);
  const parts: string[] = [];

  if (totalRows !== undefined) {
    parts.push(`${totalRows.toLocaleString()} orders`);
  }
  if (currency) {
    parts.push(currency);
  }

  if (parts.length > 0) {
    return `${title} (${parts.join(' · ')})`;
  }

  return title;
}
