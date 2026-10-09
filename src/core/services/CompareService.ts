import { Dataset } from '../../types/order';
import { CompareMetrics } from '../../types/analytics';
import { FinanceService } from './FinanceService';
import { ExecutiveService } from './ExecutiveService';

export class CompareService {
  constructor(
    private financeService: FinanceService,
    private executiveService: ExecutiveService
  ) {}

  compareDatasets(datasetA: Dataset, datasetB: Dataset): CompareMetrics {
    const finA = this.financeService.calculateMetrics(datasetA.orders);
    const finB = this.financeService.calculateMetrics(datasetB.orders);
    const execA = this.executiveService.calculateMetrics(datasetA.orders);
    const execB = this.executiveService.calculateMetrics(datasetB.orders);

    const calcDelta = (valA: number, valB: number): number => {
      if (valA === 0) return valB > 0 ? 100 : 0;
      return Math.round(((valB - valA) / valA) * 1000) / 10;
    };

    const revenueDelta = calcDelta(finA.totalRevenue, finB.totalRevenue);
    const aovDelta = calcDelta(finA.aov, finB.aov);
    const ordersDelta = calcDelta(finA.totalOrders, finB.totalOrders);
    const retentionDelta = calcDelta(execA.retentionRate, execB.retentionRate);

    const currA = datasetA.currency || '£';
    const currB = datasetB.currency || '$';

    const sideBySideRows = [
      {
        metric: 'Total Net Revenue',
        valueA: `${currA}${finA.totalRevenue.toLocaleString()}`,
        valueB: `${currB}${finB.totalRevenue.toLocaleString()}`,
        diff: `${revenueDelta >= 0 ? '+' : ''}${revenueDelta}%`,
        isPositive: revenueDelta >= 0
      },
      {
        metric: 'Total Order Volume',
        valueA: `${finA.totalOrders.toLocaleString()} orders`,
        valueB: `${finB.totalOrders.toLocaleString()} orders`,
        diff: `${ordersDelta >= 0 ? '+' : ''}${ordersDelta}%`,
        isPositive: ordersDelta >= 0
      },
      {
        metric: 'Average Order Value (AOV)',
        valueA: `${currA}${finA.aov.toFixed(2)}`,
        valueB: `${currB}${finB.aov.toFixed(2)}`,
        diff: `${aovDelta >= 0 ? '+' : ''}${aovDelta}%`,
        isPositive: aovDelta >= 0
      },
      {
        metric: 'Customer Retention Rate',
        valueA: `${execA.retentionRate}%`,
        valueB: `${execB.retentionRate}%`,
        diff: `${retentionDelta >= 0 ? '+' : ''}${retentionDelta}%`,
        isPositive: retentionDelta >= 0
      },
      {
        metric: 'Refund Liability',
        valueA: `${currA}${finA.totalRefundLiability.toFixed(2)}`,
        valueB: `${currB}${finB.totalRefundLiability.toFixed(2)}`,
        diff: `${finB.totalRefundLiability > finA.totalRefundLiability ? '+' : ''}${calcDelta(finA.totalRefundLiability, finB.totalRefundLiability)}%`,
        isPositive: finB.totalRefundLiability <= finA.totalRefundLiability
      },
      {
        metric: 'Data Health Score',
        valueA: `${datasetA.dataQuality.healthScore}/100`,
        valueB: `${datasetB.dataQuality.healthScore}/100`,
        diff: `${datasetB.dataQuality.healthScore - datasetA.dataQuality.healthScore >= 0 ? '+' : ''}${datasetB.dataQuality.healthScore - datasetA.dataQuality.healthScore} pts`,
        isPositive: datasetB.dataQuality.healthScore >= datasetA.dataQuality.healthScore
      }
    ];

    // Monthly Overlay
    const allMonths = Array.from(new Set([
      ...finA.monthlyRevenue.map(m => m.month),
      ...finB.monthlyRevenue.map(m => m.month)
    ])).sort();

    const mapA = new Map(finA.monthlyRevenue.map(m => [m.month, m]));
    const mapB = new Map(finB.monthlyRevenue.map(m => [m.month, m]));

    const monthlyOverlay = allMonths.map(month => ({
      month,
      revenueA: mapA.get(month)?.revenue || 0,
      revenueB: mapB.get(month)?.revenue || 0,
      ordersA: mapA.get(month)?.orders || 0,
      ordersB: mapB.get(month)?.orders || 0
    }));

    // Category comparison
    const catMapA = new Map(finA.categoryBreakdown.map(c => [c.name, c.amount]));
    const catMapB = new Map(finB.categoryBreakdown.map(c => [c.name, c.amount]));
    const allCategories = ['100ml Bottles', '50ml Bottles', 'Trio Sets', 'Discovery Sets'];

    const categoryComparison = allCategories.map(cat => ({
      category: cat,
      datasetA: catMapA.get(cat) || 0,
      datasetB: catMapB.get(cat) || 0
    }));

    return {
      datasetA,
      datasetB,
      revenueDeltaPercent: revenueDelta,
      aovDeltaPercent: aovDelta,
      ordersDeltaPercent: ordersDelta,
      retentionDeltaPercent: retentionDelta,
      sideBySideRows,
      monthlyOverlay,
      categoryComparison
    };
  }
}
