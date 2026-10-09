import { NormalizedOrder } from '../../types/order';
import { OperationsMetrics, DayOfWeekHeatmapItem, GeoHotspotItem } from '../../types/analytics';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export class OperationsService {
  calculateMetrics(orders: NormalizedOrder[]): OperationsMetrics {
    if (!orders || orders.length === 0) {
      return this.getEmptyMetrics();
    }

    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayRevenues = [0, 0, 0, 0, 0, 0, 0];
    let totalItems = 0;

    const cityMap = new Map<string, { province: string; count: number; totalVal: number }>();
    const complexityBuckets = { single: 0, duo: 0, trio: 0, bulk: 0 };
    const triageOrders: NormalizedOrder[] = [];

    for (const order of orders) {
      totalItems += order.orderQuantity;
      const dIndex = Math.max(0, Math.min(6, order.dayOfWeek));
      dayCounts[dIndex]++;
      dayRevenues[dIndex] += order.orderValue;

      // Geographic tracking
      const cityKey = order.city || 'Unspecified';
      if (!cityMap.has(cityKey)) {
        cityMap.set(cityKey, {
          province: order.provinceState || 'N/A',
          count: 0,
          totalVal: 0
        });
      }
      const cData = cityMap.get(cityKey)!;
      cData.count++;
      cData.totalVal += order.orderValue;

      // Complexity breakdown
      if (order.orderQuantity <= 1) complexityBuckets.single++;
      else if (order.orderQuantity === 2) complexityBuckets.duo++;
      else if (order.orderQuantity === 3) complexityBuckets.trio++;
      else complexityBuckets.bulk++;

      // Triage candidates: refunded, partially refunded, cancelled, or high quantity
      if (order.isRefunded || order.isPartiallyRefunded || order.isCancelled || order.orderQuantity >= 6 || order.flags.length > 0) {
        triageOrders.push(order);
      }
    }

    const totalOrders = orders.length;
    const averageComplexity = totalOrders > 0 ? Math.round((totalItems / totalOrders) * 10) / 10 : 1;

    // Day of week activity heatmap
    const maxDayCount = Math.max(...dayCounts, 1);
    const dayOfWeekActivity: DayOfWeekHeatmapItem[] = DAYS.map((dayName, idx) => {
      const orderCount = dayCounts[idx];
      const intensityScore = Math.min(4, Math.floor((orderCount / maxDayCount) * 4));
      return {
        dayName,
        dayIndex: idx,
        orderCount,
        revenue: Math.round(dayRevenues[idx] * 100) / 100,
        intensityScore
      };
    });

    // Complexity distribution
    const complexityDistribution = [
      { itemsCount: '1 Item (Quick Pack)', orderCount: complexityBuckets.single, percentage: Math.round((complexityBuckets.single / totalOrders) * 100) },
      { itemsCount: '2 Items (Standard)', orderCount: complexityBuckets.duo, percentage: Math.round((complexityBuckets.duo / totalOrders) * 100) },
      { itemsCount: '3 Items (Multi-Pack)', orderCount: complexityBuckets.trio, percentage: Math.round((complexityBuckets.trio / totalOrders) * 100) },
      { itemsCount: '4+ Items (Heavy Box)', orderCount: complexityBuckets.bulk, percentage: Math.round((complexityBuckets.bulk / totalOrders) * 100) },
    ];

    // Geographic hotspots
    const geoHotspots: GeoHotspotItem[] = Array.from(cityMap.entries())
      .filter(([city]) => city !== 'Unspecified')
      .map(([city, data]) => ({
        city,
        provinceState: data.province,
        orderCount: data.count,
        totalValue: Math.round(data.totalVal * 100) / 100,
        avgOrderValue: data.count > 0 ? Math.round((data.totalVal / data.count) * 100) / 100 : 0
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 15);

    return {
      totalOrders,
      averageComplexity,
      complexityDistribution,
      dayOfWeekActivity,
      geoHotspots,
      triageOrders: triageOrders.slice(0, 50)
    };
  }

  private getEmptyMetrics(): OperationsMetrics {
    return {
      totalOrders: 0,
      averageComplexity: 1,
      complexityDistribution: [],
      dayOfWeekActivity: [],
      geoHotspots: [],
      triageOrders: []
    };
  }
}
