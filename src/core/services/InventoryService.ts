import { NormalizedOrder } from '../../types/order';
import { InventoryMetrics, FragranceStockItem } from '../../types/analytics';

export class InventoryService {
  calculateMetrics(orders: NormalizedOrder[]): InventoryMetrics {
    if (!orders || orders.length === 0) {
      return this.getEmptyMetrics();
    }

    let totalTrioQty = 0;
    let totalDiscoveryQty = 0;
    let total50mlQty = 0;
    let total100mlQty = 0;

    const fragranceMap = new Map<string, {
      unitsSold: number;
      size50Count: number;
      size100Count: number;
      revenue: number;
      lastDate: string;
    }>();

    for (const order of orders) {
      totalTrioQty += order.trioQty;
      totalDiscoveryQty += order.discoveryQty;
      total50mlQty += order.qty50ml;
      total100mlQty += order.qty100ml;

      // Parse individual fragrance line items
      for (const item of order.fragrancesParsed) {
        const name = item.name;
        if (!name) continue;

        if (!fragranceMap.has(name)) {
          fragranceMap.set(name, {
            unitsSold: 0,
            size50Count: 0,
            size100Count: 0,
            revenue: 0,
            lastDate: order.date
          });
        }

        const data = fragranceMap.get(name)!;
        data.unitsSold += 1;
        if (item.size === '50ml') data.size50Count += 1;
        if (item.size === '100ml') data.size100Count += 1;

        // Estimated revenue contribution per bottle
        const estPrice = item.size === '100ml' ? 22 : 16;
        data.revenue += estPrice;

        if (order.date > data.lastDate) {
          data.lastDate = order.date;
        }
      }
    }

    const totalUnitsSold = totalTrioQty + totalDiscoveryQty + total50mlQty + total100mlQty;
    const denominator = totalUnitsSold || 1;

    const unitsBySize = [
      {
        name: '100ml Bottles',
        size: '100ml Bottles',
        count: total100mlQty,
        percentage: Math.round((total100mlQty / denominator) * 100),
        color: '#8b5cf6'
      },
      {
        name: '50ml Bottles',
        size: '50ml Bottles',
        count: total50mlQty,
        percentage: Math.round((total50mlQty / denominator) * 100),
        color: '#6366f1'
      },
      {
        name: 'Trio Sets',
        size: 'Trio Sets',
        count: totalTrioQty,
        percentage: Math.round((totalTrioQty / denominator) * 100),
        color: '#ec4899'
      },
      {
        name: 'Discovery Sets',
        size: 'Discovery Sets',
        count: totalDiscoveryQty,
        percentage: Math.round((totalDiscoveryQty / denominator) * 100),
        color: '#10b981'
      }
    ];

    // Build fragrance velocity inventory list
    const allFragrances: FragranceStockItem[] = Array.from(fragranceMap.entries()).map(([name, data]) => {
      let reorderStatus: FragranceStockItem['reorderStatus'] = 'optimal';
      if (data.unitsSold > 40) {
        reorderStatus = 'urgent'; // Fast velocity, need frequent reorder
      } else if (data.unitsSold > 20) {
        reorderStatus = 'reorder_soon';
      }

      return {
        name,
        unitsSold: data.unitsSold,
        size50Count: data.size50Count,
        size100Count: data.size100Count,
        estimatedRevenue: Math.round(data.revenue * 100) / 100,
        lastSaleDate: data.lastDate || '2026-10-01',
        reorderStatus
      };
    });

    // Sort by units sold descending
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
