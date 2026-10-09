import { NormalizedOrder } from '../../types/order';
import { FinanceMetrics, CategoryBreakdownItem, MonthlyRevenueItem, StackedMonthlyCategoryItem, DailyRevenueItem } from '../../types/analytics';

export class FinanceService {
  calculateMetrics(orders: NormalizedOrder[]): FinanceMetrics {
    if (!orders || orders.length === 0) {
      return this.getEmptyMetrics();
    }

    let totalRevenue = 0;
    let totalRefundLiability = 0;
    let refundOrderCount = 0;

    let totalTrio = 0;
    let totalDiscovery = 0;
    let total50ml = 0;
    let total100ml = 0;

    let trioQty = 0;
    let discoveryQty = 0;
    let qty50ml = 0;
    let qty100ml = 0;

    const monthlyMap = new Map<string, { revenue: number; orders: number; trio: number; disc: number; s50: number; s100: number }>();
    const dailyMap = new Map<string, { revenue: number; orders: number }>();

    for (const order of orders) {
      totalRevenue += order.orderValue;

      if (order.isRefunded || order.isPartiallyRefunded) {
        totalRefundLiability += order.orderValue;
        refundOrderCount++;
      }

      totalTrio += order.trioAmount;
      totalDiscovery += order.discoveryAmount;
      total50ml += order.amount50ml;
      total100ml += order.amount100ml;

      trioQty += order.trioQty;
      discoveryQty += order.discoveryQty;
      qty50ml += order.qty50ml;
      qty100ml += order.qty100ml;

      // Monthly aggregation
      const mKey = order.month || 'Other';
      if (!monthlyMap.has(mKey)) {
        monthlyMap.set(mKey, { revenue: 0, orders: 0, trio: 0, disc: 0, s50: 0, s100: 0 });
      }
      const mData = monthlyMap.get(mKey)!;
      mData.revenue += order.orderValue;
      mData.orders += 1;
      mData.trio += order.trioAmount;
      mData.disc += order.discoveryAmount;
      mData.s50 += order.amount50ml;
      mData.s100 += order.amount100ml;

      // Daily aggregation
      const dKey = order.date || 'Unknown';
      if (!dailyMap.has(dKey)) {
        dailyMap.set(dKey, { revenue: 0, orders: 0 });
      }
      const dData = dailyMap.get(dKey)!;
      dData.revenue += order.orderValue;
      dData.orders += 1;
    }

    const totalOrders = orders.length;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const refundRate = totalOrders > 0 ? (refundOrderCount / totalOrders) * 100 : 0;

    // Category breakdown
    const categorySum = (totalTrio + totalDiscovery + total50ml + total100ml) || totalRevenue || 1;
    const categoryBreakdown: CategoryBreakdownItem[] = [
      {
        name: '100ml Bottles',
        amount: total100ml,
        quantity: qty100ml,
        percentage: Math.round((total100ml / categorySum) * 100),
        color: '#8b5cf6' // Obsidian Purple
      },
      {
        name: '50ml Bottles',
        amount: total50ml,
        quantity: qty50ml,
        percentage: Math.round((total50ml / categorySum) * 100),
        color: '#6366f1' // Indigo
      },
      {
        name: 'Trio Sets',
        amount: totalTrio,
        quantity: trioQty,
        percentage: Math.round((totalTrio / categorySum) * 100),
        color: '#ec4899' // Pink / Magenta
      },
      {
        name: 'Discovery Sets',
        amount: totalDiscovery,
        quantity: discoveryQty,
        percentage: Math.round((totalDiscovery / categorySum) * 100),
        color: '#10b981' // Emerald
      }
    ];

    // Sorted monthly revenue
    const sortedMonths = Array.from(monthlyMap.keys()).sort();
    const monthlyRevenue: MonthlyRevenueItem[] = sortedMonths.map(m => {
      const data = monthlyMap.get(m)!;
      return {
        month: m,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
        aov: data.orders > 0 ? Math.round((data.revenue / data.orders) * 100) / 100 : 0
      };
    });

    const stackedMonthlyCategory: StackedMonthlyCategoryItem[] = sortedMonths.map(m => {
      const data = monthlyMap.get(m)!;
      return {
        month: m,
        sets: Math.round((data.trio + data.disc) * 100) / 100,
        size50ml: Math.round(data.s50 * 100) / 100,
        size100ml: Math.round(data.s100 * 100) / 100,
        other: 0,
        total: Math.round(data.revenue * 100) / 100
      };
    });

    const dailyRevenueSeries: DailyRevenueItem[] = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders
      }));

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      aov: Math.round(aov * 100) / 100,
      totalOrders,
      totalRefundLiability: Math.round(totalRefundLiability * 100) / 100,
      refundRate: Math.round(refundRate * 10) / 10,
      categoryBreakdown,
      monthlyRevenue,
      stackedMonthlyCategory,
      dailyRevenueSeries
    };
  }

  private getEmptyMetrics(): FinanceMetrics {
    return {
      totalRevenue: 0,
      aov: 0,
      totalOrders: 0,
      totalRefundLiability: 0,
      refundRate: 0,
      categoryBreakdown: [],
      monthlyRevenue: [],
      stackedMonthlyCategory: [],
      dailyRevenueSeries: []
    };
  }
}
