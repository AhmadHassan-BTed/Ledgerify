import { NormalizedOrder, DataQualitySummary } from '../../types/order';

export class AdminDataQualityService {
  analyzeQuality(orders: NormalizedOrder[]): DataQualitySummary {
    if (!orders || orders.length === 0) {
      return {
        totalRows: 0,
        validOrders: 0,
        missingEmailCount: 0,
        missingCityCount: 0,
        missingFragranceCount: 0,
        zeroValueCount: 0,
        highQuantityCount: 0,
        refundedCount: 0,
        healthScore: 100,
        status: 'healthy',
        flaggedOrders: []
      };
    }

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

    const totalCount = orders.length;
    const penalty = ((missingEmailCount * 3) + (missingCityCount * 0.4) + (missingFragranceCount * 3) + (zeroValueCount * 2)) / totalCount * 100;
    const healthScore = Math.max(0, Math.min(100, Math.round(100 - penalty)));
    const status: DataQualitySummary['status'] = healthScore >= 85 ? 'healthy' : healthScore >= 65 ? 'warning' : 'critical';

    return {
      totalRows: totalCount,
      validOrders: totalCount - zeroValueCount,
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
}
