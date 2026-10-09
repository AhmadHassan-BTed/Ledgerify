import { NormalizedOrder } from '../../types/order';
import { FinanceMetrics, CategoryBreakdownItem, MonthlyRevenueItem, StackedMonthlyCategoryItem, DailyRevenueItem } from '../../types/analytics';

const PALETTE = [
  '#8b5cf6', // Obsidian Purple
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#a855f7', // Lavender
  '#e11d48', // Rose
];

export class FinanceService {
  calculateMetrics(orders: NormalizedOrder[]): FinanceMetrics {
    if (!orders || orders.length === 0) {
      return this.getEmptyMetrics();
    }

    let totalRevenue = 0;
    let totalRefundLiability = 0;
    let refundOrderCount = 0;

    // Dynamically track all categories discovered across rows
    const categoryTotals = new Map<string, { amount: number; quantity: number }>();
    const monthlyMap = new Map<string, { revenue: number; orders: number; catAmounts: Record<string, number> }>();
    const dailyMap = new Map<string, { revenue: number; orders: number }>();

    for (const order of orders) {
      totalRevenue += order.orderValue;

      if (order.isRefunded || order.isPartiallyRefunded) {
        totalRefundLiability += order.orderValue;
        refundOrderCount++;
      }

      // Dynamic category accumulation
      for (const [catName, amount] of Object.entries(order.categoryAmounts)) {
        const qty = order.categoryQuantities[catName] || 0;
        if (!categoryTotals.has(catName)) {
          categoryTotals.set(catName, { amount: 0, quantity: 0 });
        }
        const cData = categoryTotals.get(catName)!;
        cData.amount += amount;
        cData.quantity += qty;
      }

      // Monthly aggregation
      const mKey = order.month || 'Other';
      if (!monthlyMap.has(mKey)) {
        monthlyMap.set(mKey, { revenue: 0, orders: 0, catAmounts: {} });
      }
      const mData = monthlyMap.get(mKey)!;
      mData.revenue += order.orderValue;
      mData.orders += 1;
      for (const [catName, amount] of Object.entries(order.categoryAmounts)) {
        mData.catAmounts[catName] = (mData.catAmounts[catName] || 0) + amount;
      }

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

    // Dynamic Category Breakdown
    const totalCatAmountSum = Array.from(categoryTotals.values()).reduce((sum, c) => sum + c.amount, 0) || totalRevenue || 1;
    const categoryBreakdown: CategoryBreakdownItem[] = Array.from(categoryTotals.entries())
      .filter(([_, data]) => data.amount > 0 || data.quantity > 0)
      .map(([name, data], idx) => ({
        name,
        amount: Math.round(data.amount * 100) / 100,
        quantity: data.quantity,
        percentage: Math.round((data.amount / totalCatAmountSum) * 100),
        color: PALETTE[idx % PALETTE.length]
      }))
      .sort((a, b) => b.amount - a.amount);

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

    // Dynamic Stacked Monthly Categories
    const stackedMonthlyCategory: StackedMonthlyCategoryItem[] = sortedMonths.map(m => {
      const data = monthlyMap.get(m)!;
      const item: StackedMonthlyCategoryItem = {
        month: m,
        total: Math.round(data.revenue * 100) / 100
      };
      for (const [catName, amt] of Object.entries(data.catAmounts)) {
        item[catName] = Math.round(amt * 100) / 100;
      }
      return item;
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
