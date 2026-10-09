import * as XLSX from 'xlsx';
import { IFileParser } from './IFileParser';
import { Dataset, NormalizedOrder, DataQualitySummary } from '../../types/order';
import { findMappedKey, parseFragranceString } from './normalizer';

export class XlsxParser implements IFileParser {
  async parseWorkbook(fileBuffer: ArrayBuffer, filename: string): Promise<Dataset> {
    const workbook = XLSX.read(fileBuffer, { type: 'array', cellDates: true });
    
    // Filter for ledger sheets, strictly ignoring 'Summary' sheets
    const allSheets = workbook.SheetNames;
    const ledgerSheets = allSheets.filter(name => {
      const lower = name.toLowerCase();
      return lower.includes('ledger') && !lower.includes('summary');
    });

    // Default to main 'Ledger' if available, otherwise the first ledger sheet, or first sheet
    let targetSheetName = ledgerSheets.find(s => s.toLowerCase() === 'ledger');
    if (!targetSheetName) {
      targetSheetName = ledgerSheets.length > 0 ? ledgerSheets[0] : allSheets[0];
    }

    const worksheet = workbook.Sheets[targetSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: null });

    const orders: NormalizedOrder[] = [];
    let missingEmailCount = 0;
    let missingCityCount = 0;
    let missingFragranceCount = 0;
    let zeroValueCount = 0;
    let highQuantityCount = 0;
    let refundedCount = 0;
    const flaggedOrders: NormalizedOrder[] = [];

    // Detect currency and region
    const isUK = filename.toLowerCase().includes('uk') || filename.toLowerCase().includes('gb');
    let detectedCurrency: '£' | '$' | '€' = isUK ? '£' : '$';

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];

      // Safe field extraction using resilient header mapping
      const orderNumber = String(this.getValue(row, 'orderNumber') ?? `#${i + 1}`).trim();
      const customerName = String(this.getValue(row, 'customerName') ?? 'Unknown Customer').trim();
      const email = String(this.getValue(row, 'email') ?? '').trim();
      const city = String(this.getValue(row, 'city') ?? '').trim();
      const provinceState = String(this.getValue(row, 'provinceState') ?? '').trim();
      const country = String(this.getValue(row, 'country') ?? (isUK ? 'GB' : 'US')).trim();
      const fragrancesRaw = String(this.getValue(row, 'fragrancesOrdered') ?? '').trim();
      
      const orderQuantity = Math.max(0, Number(this.getValue(row, 'orderQuantity')) || 0);
      const orderValue = Math.max(0, Number(this.getValue(row, 'orderValue')) || 0);
      const rawStatus = String(this.getValue(row, 'status') ?? 'paid').toLowerCase().trim();

      // Parse date safely
      const rawDate = this.getValue(row, 'date');
      const parsedDate = this.formatDate(rawDate);
      const month = parsedDate.substring(0, 7); // YYYY-MM
      const dateObj = new Date(parsedDate);
      const dayOfWeek = isNaN(dateObj.getTime()) ? 0 : dateObj.getDay();

      // Category quantities & amounts
      const hasTrio = Boolean(this.getValue(row, 'hasTrio'));
      const hasDiscovery = Boolean(this.getValue(row, 'hasDiscovery'));
      const trioQty = Number(this.getValue(row, 'trioQty')) || 0;
      const trioAmount = Number(this.getValue(row, 'trioAmount')) || 0;
      const discoveryQty = Number(this.getValue(row, 'discoveryQty')) || 0;
      const discoveryAmount = Number(this.getValue(row, 'discoveryAmount')) || 0;
      const qty50ml = Number(this.getValue(row, 'qty50ml')) || 0;
      const amount50ml = Number(this.getValue(row, 'amount50ml')) || 0;
      const qty100ml = Number(this.getValue(row, 'qty100ml')) || 0;
      const amount100ml = Number(this.getValue(row, 'amount100ml')) || 0;

      // Status classification
      const isRefunded = rawStatus.includes('refund') && !rawStatus.includes('partial');
      const isPartiallyRefunded = rawStatus.includes('partial');
      const isCancelled = rawStatus.includes('cancel');
      const isPaid = rawStatus === 'paid' || (!isRefunded && !isCancelled);

      // Fragrance parsing
      const fragrancesParsed = parseFragranceString(fragrancesRaw);

      // Anomaly detection flags
      const flags: string[] = [];
      if (!email) {
        flags.push('Missing Email');
        missingEmailCount++;
      }
      if (!city) {
        flags.push('Missing City');
        missingCityCount++;
      }
      if (!fragrancesRaw) {
        flags.push('Missing Fragrance Item');
        missingFragranceCount++;
      }
      if (orderValue === 0) {
        flags.push('$0 Order Value');
        zeroValueCount++;
      }
      if (orderQuantity >= 10) {
        flags.push(`High Quantity (${orderQuantity} items)`);
        highQuantityCount++;
      }
      if (isRefunded || isPartiallyRefunded) {
        refundedCount++;
      }

      const normalized: NormalizedOrder = {
        orderNumber,
        customerName,
        email,
        city,
        provinceState,
        country,
        fragrancesRaw,
        fragrancesParsed,
        orderQuantity,
        orderValue,
        status: rawStatus,
        date: parsedDate,
        month,
        dayOfWeek,
        hasTrio,
        hasDiscovery,
        trioQty,
        trioAmount,
        discoveryQty,
        discoveryAmount,
        qty50ml,
        amount50ml,
        qty100ml,
        amount100ml,
        isRefunded,
        isPartiallyRefunded,
        isCancelled,
        isPaid,
        flags
      };

      orders.push(normalized);
      if (flags.length > 0) {
        flaggedOrders.push(normalized);
      }
    }

    // Health Score calculation (100 is perfect)
    const totalCount = orders.length || 1;
    const penalty = ((missingEmailCount * 2) + (missingCityCount * 0.5) + (missingFragranceCount * 2) + (zeroValueCount * 1.5)) / totalCount * 100;
    const healthScore = Math.max(0, Math.min(100, Math.round(100 - penalty)));
    const status: DataQualitySummary['status'] = healthScore >= 85 ? 'healthy' : healthScore >= 65 ? 'warning' : 'critical';

    const dataQuality: DataQualitySummary = {
      totalRows: orders.length,
      validOrders: orders.length - zeroValueCount,
      missingEmailCount,
      missingCityCount,
      missingFragranceCount,
      zeroValueCount,
      highQuantityCount,
      refundedCount,
      healthScore,
      status,
      flaggedOrders
    };

    return {
      id: `${filename.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
      name: filename.replace(/\.xlsx$/i, ''),
      filename,
      sourceType: isUK ? 'UK' : filename.toLowerCase().includes('us') ? 'US' : 'CUSTOM',
      currency: detectedCurrency,
      orders,
      totalRows: orders.length,
      uploadedAt: new Date().toISOString(),
      availableSheets: ledgerSheets.length > 0 ? ledgerSheets : allSheets,
      selectedSheet: targetSheetName,
      dataQuality
    };
  }

  private getValue(row: Record<string, any>, targetField: any): any {
    const key = findMappedKey(row, targetField);
    return key ? row[key] : null;
  }

  private formatDate(raw: any): string {
    if (!raw) return '2026-09-01';
    if (raw instanceof Date && !isNaN(raw.getTime())) {
      return raw.toISOString().substring(0, 10);
    }
    const str = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return str.substring(0, 10);
    }
    // Attempt standard parse
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().substring(0, 10);
    }
    return str;
  }
}
