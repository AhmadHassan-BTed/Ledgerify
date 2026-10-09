import * as XLSX from 'xlsx';
import { IFileParser } from './IFileParser';
import { Dataset, NormalizedOrder, DataQualitySummary, SheetData } from '../../types/order';
import { findMappedKey, parseFragranceString, discoverCategoryColumns } from './normalizer';

export class XlsxParser implements IFileParser {
  async parseWorkbook(fileBuffer: ArrayBuffer, filename: string): Promise<Dataset> {
    const workbook = XLSX.read(fileBuffer, { type: 'array', cellDates: true });
    const allSheetNames = workbook.SheetNames;

    const isUK = filename.toLowerCase().includes('uk') || filename.toLowerCase().includes('gb');
    const detectedCurrency: '£' | '$' | '€' = isUK ? '£' : '$';

    const sheets: Record<string, SheetData> = {};
    const globalCategories = new Set<string>();
    const globalVariants = new Set<string>();

    // Parse every sheet in the workbook
    for (const sheetName of allSheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const matrix = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: null });

      if (!matrix || matrix.length === 0) continue;

      // Find the header row (first row with at least 2 non-empty string cells)
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(10, matrix.length); i++) {
        const row = matrix[i];
        if (Array.isArray(row)) {
          const stringCells = row.filter(c => typeof c === 'string' && c.trim().length > 0);
          if (stringCells.length >= 2) {
            headerRowIndex = i;
            break;
          }
        }
      }

      const rawHeaders = (matrix[headerRowIndex] || []).map((h: any) => String(h || '').trim());
      const rawDataRows = matrix.slice(headerRowIndex + 1);

      // Map rows to row objects based on detected headers
      const rowsAsObjects: Record<string, any>[] = [];
      for (const rowArr of rawDataRows) {
        if (!Array.isArray(rowArr) || rowArr.length === 0) continue;
        const hasContent = rowArr.some(c => c !== null && c !== undefined && c !== '');
        if (!hasContent) continue;

        const obj: Record<string, any> = {};
        rawHeaders.forEach((header, idx) => {
          if (header) {
            obj[header] = rowArr[idx] ?? null;
          }
        });
        rowsAsObjects.push(obj);
      }

      // Check if this sheet is a ledger-like sheet
      const lowerName = sheetName.toLowerCase();
      const hasOrderCol = rawHeaders.some(h => findMappedKey({ [h]: '' }, 'orderNumber') !== null);
      const isLedger = lowerName.includes('ledger') || hasOrderCol;

      // Discover dynamic category columns in this sheet
      const { categories, qtyCols, amountCols } = discoverCategoryColumns(rawHeaders);
      categories.forEach(c => globalCategories.add(c));

      // Parse orders from this sheet
      const sheetOrders: NormalizedOrder[] = [];
      for (let i = 0; i < rowsAsObjects.length; i++) {
        const row = rowsAsObjects[i];

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

        // Safe date parse
        const rawDate = this.getValue(row, 'date');
        const parsedDate = this.formatDate(rawDate);
        const month = parsedDate.substring(0, 7);
        const dateObj = new Date(parsedDate);
        const dayOfWeek = isNaN(dateObj.getTime()) ? 0 : dateObj.getDay();

        // Dynamically extract category quantities and amounts
        const categoryQuantities: Record<string, number> = {};
        const categoryAmounts: Record<string, number> = {};

        for (const cat of categories) {
          const qCol = qtyCols[cat];
          const aCol = amountCols[cat];
          categoryQuantities[cat] = qCol ? Math.max(0, Number(row[qCol]) || 0) : 0;
          categoryAmounts[cat] = aCol ? Math.max(0, Number(row[aCol]) || 0) : 0;
        }

        // Dynamically parse fragrance items
        const fragrancesParsed = parseFragranceString(fragrancesRaw);
        fragrancesParsed.forEach(f => {
          if (f.size) globalVariants.add(f.size);
        });

        // Status classification
        const isRefunded = rawStatus.includes('refund') && !rawStatus.includes('partial');
        const isPartiallyRefunded = rawStatus.includes('partial');
        const isCancelled = rawStatus.includes('cancel');
        const isPaid = rawStatus === 'paid' || (!isRefunded && !isCancelled);

        // Anomaly flags
        const flags: string[] = [];
        if (!email && isLedger) flags.push('Missing Email');
        if (!city && isLedger) flags.push('Missing City');
        if (!fragrancesRaw && isLedger) flags.push('Missing Fragrance Item');
        if (orderValue === 0 && isLedger) flags.push('$0 Order Value');
        if (orderQuantity >= 10) flags.push(`High Quantity (${orderQuantity} items)`);

        sheetOrders.push({
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
          categoryQuantities,
          categoryAmounts,
          isRefunded,
          isPartiallyRefunded,
          isCancelled,
          isPaid,
          flags
        });
      }

      sheets[sheetName] = {
        name: sheetName,
        rowCount: sheetOrders.length,
        headers: rawHeaders,
        orders: sheetOrders,
        isLedger
      };
    }

    // Determine target/default sheet
    const availableSheets = Object.keys(sheets);
    let selectedSheet = availableSheets.find(s => s.toLowerCase() === 'ledger');
    if (!selectedSheet) {
      selectedSheet = availableSheets.find(s => sheets[s].isLedger && sheets[s].rowCount > 0);
    }
    if (!selectedSheet && availableSheets.length > 0) {
      selectedSheet = availableSheets[0];
    }
    selectedSheet = selectedSheet || 'Default';

    // Primary active orders
    const activeOrders = sheets[selectedSheet]?.orders || [];
    const dataQuality = this.calculateDataQuality(activeOrders);

    return {
      id: `${filename.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
      name: filename.replace(/\.xlsx$/i, ''),
      filename,
      sourceType: isUK ? 'UK' : filename.toLowerCase().includes('us') ? 'US' : 'CUSTOM',
      currency: detectedCurrency,
      totalRows: activeOrders.length,
      uploadedAt: new Date().toISOString(),
      sheets,
      sheetNames: availableSheets,
      selectedSheet,
      orders: activeOrders,
      discoveredCategories: Array.from(globalCategories),
      discoveredVariants: Array.from(globalVariants),
      dataQuality
    };
  }

  private calculateDataQuality(orders: NormalizedOrder[]): DataQualitySummary {
    let missingEmailCount = 0;
    let missingCityCount = 0;
    let missingFragranceCount = 0;
    let zeroValueCount = 0;
    let highQuantityCount = 0;
    let refundedCount = 0;
    const flaggedOrders: NormalizedOrder[] = [];

    for (const order of orders) {
      if (!order.email) missingEmailCount++;
      if (!order.city) missingCityCount++;
      if (!order.fragrancesRaw) missingFragranceCount++;
      if (order.orderValue === 0) zeroValueCount++;
      if (order.orderQuantity >= 10) highQuantityCount++;
      if (order.isRefunded || order.isPartiallyRefunded) refundedCount++;

      if (order.flags.length > 0) {
        flaggedOrders.push(order);
      }
    }

    const totalCount = orders.length || 1;
    const penalty = ((missingEmailCount * 2) + (missingCityCount * 0.4) + (missingFragranceCount * 2) + (zeroValueCount * 1.5)) / totalCount * 100;
    const healthScore = Math.max(0, Math.min(100, Math.round(100 - penalty)));
    const status: DataQualitySummary['status'] = healthScore >= 85 ? 'healthy' : healthScore >= 65 ? 'warning' : 'critical';

    return {
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
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().substring(0, 10);
    }
    return str;
  }
}
