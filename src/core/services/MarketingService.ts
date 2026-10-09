import { NormalizedOrder } from '../../types/order';
import { MarketingMetrics, CityAdTarget, ProductAffinityPair, CohortMonthData } from '../../types/analytics';

export class MarketingService {
  calculateMetrics(orders: NormalizedOrder[]): MarketingMetrics {
    if (!orders || orders.length === 0) {
      return this.getEmptyMetrics();
    }

    // 1. Top Cities for Ads
    const cityMap = new Map<string, { province: string; orders: number; revenue: number }>();
    // 2. Cross-Sell Co-occurrences
    const pairMap = new Map<string, { itemA: string; itemB: string; count: number }>();
    // 3. Customer Frequency
    const customerOrders = new Map<string, { count: number; revenue: number; months: Set<string> }>();
    // 4. Cohort tracking
    const customerFirstMonth = new Map<string, string>();

    for (const order of orders) {
      // City ads aggregation
      if (order.city) {
        const cKey = order.city.trim();
        const current = cityMap.get(cKey) || { province: order.provinceState || 'N/A', orders: 0, revenue: 0 };
        current.orders += 1;
        current.revenue += order.orderValue;
        cityMap.set(cKey, current);
      }

      // Customer email tracking
      const email = (order.email || order.customerName).toLowerCase().trim();
      if (email) {
        if (!customerOrders.has(email)) {
          customerOrders.set(email, { count: 0, revenue: 0, months: new Set() });
        }
        const cust = customerOrders.get(email)!;
        cust.count += 1;
        cust.revenue += order.orderValue;
        if (order.month) cust.months.add(order.month);

        if (!customerFirstMonth.has(email) && order.month) {
          customerFirstMonth.set(email, order.month);
        } else if (order.month && order.month < customerFirstMonth.get(email)!) {
          customerFirstMonth.set(email, order.month);
        }
      }

      // Pair co-occurrences within multi-item cart
      const uniqueItemsInOrder = Array.from(new Set(order.fragrancesParsed.map(i => i.name))).filter(Boolean);
      if (uniqueItemsInOrder.length > 1) {
        for (let i = 0; i < uniqueItemsInOrder.length; i++) {
          for (let j = i + 1; j < uniqueItemsInOrder.length; j++) {
            const [itemA, itemB] = [uniqueItemsInOrder[i], uniqueItemsInOrder[j]].sort();
            const pairKey = `${itemA} + ${itemB}`;
            const pData = pairMap.get(pairKey) || { itemA, itemB, count: 0 };
            pData.count += 1;
            pairMap.set(pairKey, pData);
          }
        }
      }
    }

    // Format top cities
    const topCitiesForAds: CityAdTarget[] = Array.from(cityMap.entries())
      .map(([city, data]) => {
        let priority: CityAdTarget['priority'] = 'Emerging';
        if (data.revenue > 800 || data.orders >= 20) priority = 'High';
        else if (data.revenue > 300 || data.orders >= 10) priority = 'Medium';

        return {
          city,
          province: data.province,
          orders: data.orders,
          revenue: Math.round(data.revenue * 100) / 100,
          priority
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 15);

    // Format cross-sell affinities
    const totalMultiItemOrders = Array.from(pairMap.values()).reduce((sum, p) => sum + p.count, 0) || 1;
    const crossSellAffinities: ProductAffinityPair[] = Array.from(pairMap.values())
      .map(p => ({
        itemA: p.itemA,
        itemB: p.itemB,
        coOccurrenceCount: p.count,
        affinityPercent: Math.min(100, Math.round((p.count / totalMultiItemOrders) * 100 * 2))
      }))
      .sort((a, b) => b.coOccurrenceCount - a.coOccurrenceCount)
      .slice(0, 10);

    // Frequency tiers
    let tier1 = 0; // 1 order
    let tier2 = 0; // 2 orders
    let tier3 = 0; // 3+ orders
    let totalCustRevenue = 0;

    for (const [, cust] of customerOrders) {
      totalCustRevenue += cust.revenue;
      if (cust.count === 1) tier1++;
      else if (cust.count === 2) tier2++;
      else tier3++;
    }

    const totalCustomers = customerOrders.size || 1;
    const customerFrequencyTiers = [
      { tier: 'Single Purchase (1x)', customerCount: tier1, revenueShare: Math.round((tier1 / totalCustomers) * 100) },
      { tier: 'Repeat Buyers (2x)', customerCount: tier2, revenueShare: Math.round((tier2 / totalCustomers) * 100) },
      { tier: 'VIP Brand Advocates (3x+)', customerCount: tier3, revenueShare: Math.round((tier3 / totalCustomers) * 100) }
    ];

    // Cohort retention
    const cohortMap = new Map<string, { initial: Set<string>; returned: Set<string> }>();
    for (const [email, firstMonth] of customerFirstMonth) {
      if (!cohortMap.has(firstMonth)) {
        cohortMap.set(firstMonth, { initial: new Set(), returned: new Set() });
      }
      cohortMap.get(firstMonth)!.initial.add(email);

      const cust = customerOrders.get(email);
      if (cust && cust.months.size > 1) {
        // Returned in a subsequent month
        cohortMap.get(firstMonth)!.returned.add(email);
      }
    }

    const cohortRetention: CohortMonthData[] = Array.from(cohortMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cohortMonth, data]) => {
        const initCount = data.initial.size;
        const retCount = data.returned.size;
        return {
          cohortMonth,
          initialSize: initCount,
          subsequentReturnCount: retCount,
          retentionPercent: initCount > 0 ? Math.round((retCount / initCount) * 1000) / 10 : 0
        };
      });

    return {
      topCitiesForAds,
      crossSellAffinities,
      customerFrequencyTiers,
      cohortRetention
    };
  }

  private getEmptyMetrics(): MarketingMetrics {
    return {
      topCitiesForAds: [],
      crossSellAffinities: [],
      customerFrequencyTiers: [],
      cohortRetention: []
    };
  }
}
