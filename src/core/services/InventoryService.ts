import { NormalizedOrder } from '../../types/order';
import { InventoryMetrics, FragranceStockItem } from '../../types/analytics';

const PALETTE = [
  '#8b5cf6', // Purple
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#14b8a6', // Teal
];

export class InventoryService {
  calculateMetrics(orders: NormalizedOrder[]): InventoryMetrics {
    if (!orders || orders.length === 0) {
      return this.getEmptyMetrics();
    }

    // Dynamic calculations across orders
    let totalUnitsSold = 0;
    let totalRevenue = 0;
    const sizeCounts = new Map<string, number>();

    const fragranceMap = new Map<string, {
      unitsSold: number;
      variantsBreakdown: Record<string, number>;
      revenue: number;
      lastDate: string;
    }>();

    for (const order of orders) {
      totalUnitsSold += order.orderQuantity;
      totalRevenue += order.orderValue;

      // Dynamic line item parsing
      for (const item of order.fragrancesParsed) {
        const name = item.name;
        if (!name) continue;

        const sizeKey = item.size || 'Standard';
        sizeCounts.set(sizeKey, (sizeCounts.get(sizeKey) || 0) + 1);

        if (!fragranceMap.has(name)) {
          fragranceMap.set(name, {
            unitsSold: 0,
            variantsBreakdown: {},
            revenue: 0,
            lastDate: order.date
          });
        }

        const data = fragranceMap.get(name)!;
        data.unitsSold += 1;
        data.variantsBreakdown[sizeKey] = (data.variantsBreakdown[sizeKey] || 0) + 1;

        if (order.date > data.lastDate) {
          data.lastDate = order.date;
        }
      }
    }

    // Dynamically derive average unit price from real data
    const averageUnitPrice = totalUnitsSold > 0 ? (totalRevenue / totalUnitsSold) : 25;

    // Dynamically calculate estimated revenue per fragrance based on observed unit price
    for (const [, data] of fragranceMap) {
      data.revenue = Math.round(data.unitsSold * averageUnitPrice * 100) / 100;
    }

    // Dynamic units by size
    const totalParsedUnits = Array.from(sizeCounts.values()).reduce((a, b) => a + b, 0) || totalUnitsSold || 1;
    const unitsBySize = Array.from(sizeCounts.entries())
      .map(([size, count], idx) => ({
        name: size,
        size,
        count,
        percentage: Math.round((count / totalParsedUnits) * 100),
        color: PALETTE[idx % PALETTE.length]
      }))
      .sort((a, b) => b.count - a.count);

    // Build fragrance velocity inventory list
    const allFragrances: FragranceStockItem[] = Array.from(fragranceMap.entries()).map(([name, data]) => {
      let reorderStatus: FragranceStockItem['reorderStatus'] = 'optimal';
      if (data.unitsSold > 35) {
        reorderStatus = 'urgent';
      } else if (data.unitsSold > 15) {
        reorderStatus = 'reorder_soon';
      }

      return {
        name,
        unitsSold: data.unitsSold,
        variantsBreakdown: data.variantsBreakdown,
        estimatedRevenue: data.revenue,
        lastSaleDate: data.lastDate || '2026-10-01',
        reorderStatus
      };
    });

    allFragrances.sort((a, b) => b.unitsSold - a.unitsSold);
    const topFragrances = allFragrances.slice(0, 10);

    return {
      totalUnitsSold,
      unitsBySize,
      topFragrances,
      allFragrances,
      uniqueFragranceCount: allFragrances.length
    };
  }

  private getEmptyMetrics(): InventoryMetrics {
    return {
      totalUnitsSold: 0,
      unitsBySize: [],
      topFragrances: [],
      allFragrances: [],
      uniqueFragranceCount: 0
    };
  }
}
