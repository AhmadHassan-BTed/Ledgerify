import { NormalizedOrder } from '../../types/order';
import { ExecutiveMetrics, TopCustomerItem } from '../../types/analytics';

const AVATAR_COLORS = [
  'from-indigo-600 to-indigo-800',
  'from-violet-600 to-purple-800',
  'from-indigo-500 to-violet-600',
  'from-slate-700 to-indigo-900',
  'from-purple-600 to-indigo-700',
  'from-indigo-700 to-slate-900',
];

export class ExecutiveService {
  calculateMetrics(orders: NormalizedOrder[]): ExecutiveMetrics {
    if (!orders || orders.length === 0) {
      return this.getEmptyMetrics();
    }

    let totalRevenue = 0;
    const customerMap = new Map<
      string,
      {
        name: string;
        email: string;
        orders: NormalizedOrder[];
        totalSpend: number;
      }
    >();
    const countryRevenue = new Map<string, number>();
    const monthRevenueMap = new Map<string, { revenue: number; volume: number }>();
    const fragranceUnitsMap = new Map<string, { units: number; revenue: number }>();

    for (const order of orders) {
      totalRevenue += order.orderValue;

      // Customer aggregation
      const customerKey = (order.email || order.customerName || 'Unknown Customer').toLowerCase().trim();
      if (!customerMap.has(customerKey)) {
        customerMap.set(customerKey, {
          name: order.customerName || (order.email ? order.email.split('@')[0] : 'Valued Customer'),
          email: order.email || 'Direct Checkout',
          orders: [],
          totalSpend: 0
        });
      }
      const cRecord = customerMap.get(customerKey)!;
      cRecord.orders.push(order);
      cRecord.totalSpend += order.orderValue;

      // Country / Region penetration
      const countryKey = order.country || 'Unknown';
      countryRevenue.set(countryKey, (countryRevenue.get(countryKey) || 0) + order.orderValue);

      // Monthly tracking for MoM
      const mKey = order.month || 'Unknown';
      if (!monthRevenueMap.has(mKey)) {
        monthRevenueMap.set(mKey, { revenue: 0, volume: 0 });
      }
      const mData = monthRevenueMap.get(mKey)!;
      mData.revenue += order.orderValue;
      mData.volume += 1;

      // Fragrance yields
      if (order.fragrancesParsed && order.fragrancesParsed.length > 0) {
        for (const item of order.fragrancesParsed) {
          const fName = item.name.trim();
          if (fName) {
            if (!fragranceUnitsMap.has(fName)) {
              fragranceUnitsMap.set(fName, { units: 0, revenue: 0 });
            }
            const fData = fragranceUnitsMap.get(fName)!;
            fData.units += 1;
            fData.revenue += (order.orderValue / order.fragrancesParsed.length);
          }
        }
      }
    }

    // Customer Retention & Top Customers List
    let returningCustomers = 0;
    let singleOrderCustomers = 0;

    const topCustomersList: TopCustomerItem[] = Array.from(customerMap.values())
      .map((c, idx) => {
        const orderCount = c.orders.length;
        if (orderCount > 1) {
          returningCustomers++;
        } else {
          singleOrderCustomers++;
        }

        const sortedOrders = [...c.orders].sort((a, b) => (a.date > b.date ? 1 : -1));
        const firstOrderDate = sortedOrders[0]?.date || 'N/A';
        const lastOrderDate = sortedOrders[sortedOrders.length - 1]?.date || 'N/A';

        // Extract initials
        const nameParts = c.name.trim().split(/\s+/);
        const initials = nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : (c.name.slice(0, 2) || 'VIP').toUpperCase();

        const status: 'VIP' | 'Loyal' | 'First-time' =
          c.totalSpend >= 200 || orderCount >= 3
            ? 'VIP'
            : orderCount >= 2
            ? 'Loyal'
            : 'First-time';

        const statusBadge: 'Achieved' | 'On-Process' | 'VIP' =
          c.totalSpend >= 250
            ? 'Achieved'
            : orderCount >= 2
            ? 'VIP'
            : 'On-Process';

        return {
          name: c.name,
          email: c.email,
          orderCount,
          totalSpend: Math.round(c.totalSpend * 100) / 100,
          status,
          statusBadge,
          avatarInitials: initials,
          avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
          firstOrderDate,
          lastOrderDate,
          orders: c.orders,
        };
      })
      .sort((a, b) => b.totalSpend - a.totalSpend);

    const totalCustomers = customerMap.size;
    const retentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

    // Month-over-Month Growth (compare latest substantial month to prior month)
    const validMonths = Array.from(monthRevenueMap.entries())
      .filter(([m, data]) => m !== 'Unknown' && m.includes('-') && data.volume >= 5 && data.revenue > 0)
      .sort((a, b) => a[0].localeCompare(b[0]));

    let hasMomComparison = false;
    let momRevenueGrowth = 0;
    let momVolumeGrowth = 0;
    let prevMonthLabel = '';
    let currMonthLabel = '';

    if (validMonths.length >= 2) {
      const [prevKey, prevMonth] = validMonths[validMonths.length - 2];
      const [currKey, currMonth] = validMonths[validMonths.length - 1];
      if (prevMonth.revenue > 0 && prevMonth.volume > 0) {
        momRevenueGrowth = Math.round(((currMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 1000) / 10;
        momVolumeGrowth = Math.round(((currMonth.volume - prevMonth.volume) / prevMonth.volume) * 1000) / 10;
        hasMomComparison = true;
        prevMonthLabel = prevKey;
        currMonthLabel = currKey;
      }
    }

    // Top Market Penetration
    let topMarketName = 'UK';
    let topMarketRevenue = 0;
    for (const [country, rev] of countryRevenue) {
      if (rev > topMarketRevenue) {
        topMarketRevenue = rev;
        topMarketName = country;
      }
    }
    const topMarketShare = totalRevenue > 0 ? (topMarketRevenue / totalRevenue) * 100 : 0;

    // Monthly Target Progress (dynamically scaled to store volume)
    const distinctMonthsCount = Math.max(1, new Set(orders.map(o => o.month).filter(m => m && m !== 'Unknown')).size);
    const avgMonthlyRevenue = totalRevenue / distinctMonthsCount;
    const benchmarkTarget = avgMonthlyRevenue > 0
      ? Math.max(5000, Math.ceil((avgMonthlyRevenue * 1.15) / 5000) * 5000)
      : 25000;
    const targetProgressPercent = Math.min(100, Math.round((totalRevenue / benchmarkTarget) * 100));

    // New vs Returning split
    const newVsReturningSplit = [
      {
        name: 'First-time Customers',
        count: singleOrderCustomers,
        percentage: totalCustomers > 0 ? Math.round((singleOrderCustomers / totalCustomers) * 100) : 100,
        color: '#6366f1' // Primary Indigo
      },
      {
        name: 'Repeat / Loyal Customers',
        count: returningCustomers,
        percentage: totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0,
        color: '#a5b4fc' // Soft Lavender Tint
      }
    ];

    // Top Fragrances Summary
    const topFragrancesSummary = Array.from(fragranceUnitsMap.entries())
      .map(([name, data]) => ({
        name,
        unitsSold: data.units,
        revenue: Math.round(data.revenue * 100) / 100,
        share: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      momRevenueGrowth: Math.round(momRevenueGrowth * 10) / 10,
      momVolumeGrowth: Math.round(momVolumeGrowth * 10) / 10,
      hasMomComparison,
      prevMonthLabel,
      currMonthLabel,
      totalCustomers,
      returningCustomers,
      retentionRate: Math.round(retentionRate * 10) / 10,
      monthlyTarget: benchmarkTarget,
      targetProgressPercent,
      topMarketName,
      topMarketRevenue: Math.round(topMarketRevenue * 100) / 100,
      topMarketShare: Math.round(topMarketShare * 10) / 10,
      newVsReturningSplit,
      topCustomers: topCustomersList,
      topFragrancesSummary
    };
  }

  private getEmptyMetrics(): ExecutiveMetrics {
    return {
      totalRevenue: 0,
      momRevenueGrowth: 0,
      momVolumeGrowth: 0,
      totalCustomers: 0,
      returningCustomers: 0,
      retentionRate: 0,
      monthlyTarget: 25000,
      targetProgressPercent: 0,
      topMarketName: 'N/A',
      topMarketRevenue: 0,
      topMarketShare: 0,
      newVsReturningSplit: [],
      topCustomers: [],
      topFragrancesSummary: []
    };
  }
}
