import { Dataset, NormalizedOrder } from '../../types/order';
import { CompareMetrics, MultiDatasetSummary, MultiSideBySideRow, MultiMonthlyOverlayItem } from '../../types/analytics';
import { FinanceService } from './FinanceService';
import { ExecutiveService } from './ExecutiveService';

const DATASET_PALETTE = [
  '#3b82f6', // Electric Blue
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316'  // Orange
];

export class CompareService {
  constructor(
    private financeService: FinanceService,
    private executiveService: ExecutiveService
  ) {}

  compareMultiDatasets(
    datasetsToCompare: Dataset[],
    customOrdersMap?: Record<string, NormalizedOrder[]>
  ): CompareMetrics {
    const list = datasetsToCompare.length > 0 ? datasetsToCompare : [];
    const datasetA = list[0] || ({} as Dataset);
    const datasetB = list[1] || list[0] || ({} as Dataset);

    if (list.length === 0) {
      return {
        datasets: [],
        summaries: [],
        sideBySideRows: [],
        monthlyOverlay: [],
        categoryComparison: [],
        datasetA,
        datasetB,
        revenueDeltaPercent: 0,
        aovDeltaPercent: 0,
        ordersDeltaPercent: 0,
        retentionDeltaPercent: 0
      };
    }

    // Calculate metrics for each dataset
    const computedList = list.map((d, index) => {
      const orders = (customOrdersMap && customOrdersMap[d.id]) || d.orders || [];
      const fin = this.financeService.calculateMetrics(orders);
      const exec = this.executiveService.calculateMetrics(orders);
      const color = DATASET_PALETTE[index % DATASET_PALETTE.length];

      const topFragranceObj = exec.topFragrancesSummary[0] || { name: 'N/A', unitsSold: 0 };

      const summary: MultiDatasetSummary = {
        dataset: d,
        totalRevenue: fin.totalRevenue,
        totalOrders: fin.totalOrders,
        aov: fin.aov,
        retentionRate: exec.retentionRate,
        refundRate: fin.refundRate,
        refundLiability: fin.totalRefundLiability,
        healthScore: d.dataQuality?.healthScore || 100,
        topFragrance: topFragranceObj.name,
        topFragranceUnits: topFragranceObj.unitsSold,
        currency: d.currency || '£',
        color
      };

      return {
        dataset: d,
        orders,
        fin,
        exec,
        summary,
        color
      };
    });

    const baseline = computedList[0];
    const calcDelta = (val: number, baseVal: number): number => {
      if (baseVal === 0) return val > 0 ? 100 : 0;
      return Math.round(((val - baseVal) / baseVal) * 1000) / 10;
    };

    // Construct Multi-Side-by-Side Rows
    const sideBySideRows: MultiSideBySideRow[] = [
      {
        metric: 'Total Net Revenue',
        values: computedList.map((c, i) => {
          const delta = i === 0 ? undefined : `${calcDelta(c.summary.totalRevenue, baseline.summary.totalRevenue) >= 0 ? '+' : ''}${calcDelta(c.summary.totalRevenue, baseline.summary.totalRevenue)}%`;
          return {
            datasetId: c.dataset.id,
            datasetName: c.dataset.name,
            region: c.dataset.region || 'UK',
            currency: c.summary.currency,
            formattedValue: `${c.summary.currency}${Math.round(c.summary.totalRevenue).toLocaleString()}`,
            rawValue: c.summary.totalRevenue,
            deltaVsBaseline: delta,
            isPositive: i === 0 ? true : (calcDelta(c.summary.totalRevenue, baseline.summary.totalRevenue) >= 0)
          };
        })
      },
      {
        metric: 'Total Order Volume',
        values: computedList.map((c, i) => {
          const delta = i === 0 ? undefined : `${calcDelta(c.summary.totalOrders, baseline.summary.totalOrders) >= 0 ? '+' : ''}${calcDelta(c.summary.totalOrders, baseline.summary.totalOrders)}%`;
          return {
            datasetId: c.dataset.id,
            datasetName: c.dataset.name,
            region: c.dataset.region || 'UK',
            currency: c.summary.currency,
            formattedValue: `${c.summary.totalOrders.toLocaleString()} orders`,
            rawValue: c.summary.totalOrders,
            deltaVsBaseline: delta,
            isPositive: i === 0 ? true : (calcDelta(c.summary.totalOrders, baseline.summary.totalOrders) >= 0)
          };
        })
      },
      {
        metric: 'Average Order Value (AOV)',
        values: computedList.map((c, i) => {
          const delta = i === 0 ? undefined : `${calcDelta(c.summary.aov, baseline.summary.aov) >= 0 ? '+' : ''}${calcDelta(c.summary.aov, baseline.summary.aov)}%`;
          return {
            datasetId: c.dataset.id,
            datasetName: c.dataset.name,
            region: c.dataset.region || 'UK',
            currency: c.summary.currency,
            formattedValue: `${c.summary.currency}${c.summary.aov.toFixed(2)}`,
            rawValue: c.summary.aov,
            deltaVsBaseline: delta,
            isPositive: i === 0 ? true : (calcDelta(c.summary.aov, baseline.summary.aov) >= 0)
          };
        })
      },
      {
        metric: 'Customer Retention Rate',
        values: computedList.map((c, i) => {
          const delta = i === 0 ? undefined : `${calcDelta(c.summary.retentionRate, baseline.summary.retentionRate) >= 0 ? '+' : ''}${calcDelta(c.summary.retentionRate, baseline.summary.retentionRate)}%`;
          return {
            datasetId: c.dataset.id,
            datasetName: c.dataset.name,
            region: c.dataset.region || 'UK',
            currency: c.summary.currency,
            formattedValue: `${c.summary.retentionRate}%`,
            rawValue: c.summary.retentionRate,
            deltaVsBaseline: delta,
            isPositive: i === 0 ? true : (calcDelta(c.summary.retentionRate, baseline.summary.retentionRate) >= 0)
          };
        })
      },
      {
        metric: 'Refund Liability',
        values: computedList.map((c, i) => {
          const delta = i === 0 ? undefined : `${calcDelta(c.summary.refundLiability, baseline.summary.refundLiability) >= 0 ? '+' : ''}${calcDelta(c.summary.refundLiability, baseline.summary.refundLiability)}%`;
          return {
            datasetId: c.dataset.id,
            datasetName: c.dataset.name,
            region: c.dataset.region || 'UK',
            currency: c.summary.currency,
            formattedValue: `${c.summary.currency}${c.summary.refundLiability.toFixed(2)}`,
            rawValue: c.summary.refundLiability,
            deltaVsBaseline: delta,
            isPositive: i === 0 ? true : (c.summary.refundLiability <= baseline.summary.refundLiability)
          };
        })
      },
      {
        metric: 'Data Quality Health',
        values: computedList.map((c, i) => {
          const diffPts = i === 0 ? undefined : `${c.summary.healthScore - baseline.summary.healthScore >= 0 ? '+' : ''}${c.summary.healthScore - baseline.summary.healthScore} pts`;
          return {
            datasetId: c.dataset.id,
            datasetName: c.dataset.name,
            region: c.dataset.region || 'UK',
            currency: c.summary.currency,
            formattedValue: `${c.summary.healthScore}/100`,
            rawValue: c.summary.healthScore,
            deltaVsBaseline: diffPts,
            isPositive: i === 0 ? true : (c.summary.healthScore >= baseline.summary.healthScore)
          };
        })
      }
    ];

    // Multi-Monthly Overlay
    const allMonths = Array.from(new Set(
      computedList.flatMap(c => c.fin.monthlyRevenue.map(m => m.month))
    )).sort();

    const monthlyOverlay: MultiMonthlyOverlayItem[] = allMonths.map(month => {
      const item: MultiMonthlyOverlayItem = { month };
      computedList.forEach(c => {
        const found = c.fin.monthlyRevenue.find(m => m.month === month);
        item[`revenue_${c.dataset.id}`] = found ? found.revenue : 0;
        item[`orders_${c.dataset.id}`] = found ? found.orders : 0;
      });
      // Backwards compatible fields:
      if (computedList[0]) item.revenueA = item[`revenue_${computedList[0].dataset.id}`] || 0;
      if (computedList[1]) item.revenueB = item[`revenue_${computedList[1].dataset.id}`] || 0;
      if (computedList[0]) item.ordersA = item[`orders_${computedList[0].dataset.id}`] || 0;
      if (computedList[1]) item.ordersB = item[`orders_${computedList[1].dataset.id}`] || 0;
      return item;
    });

    // Multi-Category Comparison
    const allCategories = Array.from(new Set(
      computedList.flatMap(c => c.fin.categoryBreakdown.map(cat => cat.name))
    ));

    const categoryComparison = allCategories.map(category => {
      const row: any = { category };
      computedList.forEach(c => {
        const found = c.fin.categoryBreakdown.find(cat => cat.name === category);
        row[c.dataset.id] = found ? found.amount : 0;
      });
      if (computedList[0]) row.datasetA = row[computedList[0].dataset.id] || 0;
      if (computedList[1]) row.datasetB = row[computedList[1].dataset.id] || 0;
      return row;
    });

    const secondComp = computedList[1] || computedList[0];
    const revenueDeltaPercent = calcDelta(secondComp.summary.totalRevenue, baseline.summary.totalRevenue);
    const aovDeltaPercent = calcDelta(secondComp.summary.aov, baseline.summary.aov);
    const ordersDeltaPercent = calcDelta(secondComp.summary.totalOrders, baseline.summary.totalOrders);
    const retentionDeltaPercent = calcDelta(secondComp.summary.retentionRate, baseline.summary.retentionRate);

    return {
      datasets: list,
      summaries: computedList.map(c => c.summary),
      sideBySideRows,
      monthlyOverlay,
      categoryComparison,
      datasetA: baseline.dataset,
      datasetB: secondComp.dataset,
      revenueDeltaPercent,
      aovDeltaPercent,
      ordersDeltaPercent,
      retentionDeltaPercent
    };
  }

  // Backwards compatible wrapper for 2 datasets
  compareDatasets(
    datasetA: Dataset,
    datasetB: Dataset,
    customOrdersA?: NormalizedOrder[],
    customOrdersB?: NormalizedOrder[]
  ): CompareMetrics {
    const map: Record<string, NormalizedOrder[]> = {};
    if (customOrdersA) map[datasetA.id] = customOrdersA;
    if (customOrdersB) map[datasetB.id] = customOrdersB;
    return this.compareMultiDatasets([datasetA, datasetB], map);
  }
}
