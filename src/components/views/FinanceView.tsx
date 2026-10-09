import React from 'react';
import { DollarSign, CreditCard, RotateCcw, ShieldAlert, GitCompare } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { RevenueLineChart } from '../charts/RevenueLineChart';
import { ComparisonLineChart } from '../charts/ComparisonLineChart';
import { CategoryStackedBarChart } from '../charts/CategoryStackedBarChart';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { Table, Column } from '../ui/Table';
import { NormalizedOrder } from '../../types/order';
import { StatusPill } from '../ui/StatusPill';

export const FinanceView: React.FC = () => {
  const { financeService, compareService } = useServices();
  const { filteredOrders, secondaryFilteredOrders, activeCurrency, secondaryCurrency } = useFilters();
  const { activeDataset, secondaryDataset, isCompareEnabled } = useData();

  const metricsA = financeService.calculateMetrics(filteredOrders);
  const metricsB = isCompareEnabled && secondaryDataset
    ? financeService.calculateMetrics(secondaryFilteredOrders)
    : null;

  const comparison = isCompareEnabled && secondaryDataset
    ? compareService.compareDatasets(activeDataset!, secondaryDataset, filteredOrders, secondaryFilteredOrders)
    : null;

  const refundedOrders = filteredOrders.filter(o => o.isRefunded || o.isPartiallyRefunded);

  const refundColumns: Column<NormalizedOrder>[] = [
    {
      header: 'Order #',
      accessorKey: 'orderNumber',
      sortable: true,
      className: 'font-mono text-role font-semibold'
    },
    {
      header: 'Date',
      accessorKey: 'date',
      sortable: true,
      className: 'font-mono text-slate-500 dark:text-zinc-400'
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      sortable: true
    },
    {
      header: 'Items Ordered',
      accessorKey: 'fragrancesRaw',
      className: 'max-w-xs truncate text-slate-500 dark:text-zinc-400'
    },
    {
      header: 'Refund Status',
      accessorKey: 'status',
      cell: (row) => <StatusPill status={row.status} />
    },
    {
      header: 'Order Value',
      accessorKey: 'orderValue',
      sortable: true,
      className: 'font-mono font-bold text-rose-500 dark:text-rose-400',
      cell: (row) => `${activeCurrency}${row.orderValue.toFixed(2)}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              Financial Treasury &amp; Revenue Breakdown
            </h2>
            {isCompareEnabled && secondaryDataset && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-role-subtle text-role border border-role-subtle">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparing: {activeDataset?.name} vs {secondaryDataset.name}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Cash flow accounting, dynamic product categories yield, average order value, and refund liabilities.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Gross Ledger Revenue"
          value={metricsA.totalRevenue}
          currencyPrefix={activeCurrency}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${secondaryCurrency}${metricsB.totalRevenue.toLocaleString()}` : "Sum of Order Value column"}
          trend={isCompareEnabled && comparison ? comparison.revenueDeltaPercent : undefined}
          trendLabel="Revenue delta vs B"
          icon={<DollarSign className="w-4 h-4" />}
          plainEnglishHint="The total gross sum of all completed orders paid into your store."
        />
        <KpiCard
          title="Average Order Value (AOV)"
          value={`${activeCurrency}${metricsA.aov.toFixed(2)}`}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${secondaryCurrency}${metricsB.aov.toFixed(2)}` : `${metricsA.totalOrders} total orders`}
          trend={isCompareEnabled && comparison ? comparison.aovDeltaPercent : undefined}
          trendLabel="AOV delta vs B"
          icon={<CreditCard className="w-4 h-4" />}
          plainEnglishHint="How much the typical customer spends per checkout (Total Sales ÷ Total Orders)."
        />
        <KpiCard
          title="Refund Liability"
          value={`${activeCurrency}${metricsA.totalRefundLiability.toFixed(2)}`}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${secondaryCurrency}${metricsB.totalRefundLiability.toFixed(2)}` : `${refundedOrders.length} chargebacks/refunds`}
          icon={<RotateCcw className="w-4 h-4" />}
          plainEnglishHint="The total money paid back or refunded to customers due to returns or cancellations."
        />
        <KpiCard
          title="Refund Rate"
          value={`${metricsA.refundRate}%`}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.refundRate}%` : "Share of total orders"}
          icon={<ShieldAlert className="w-4 h-4" />}
          plainEnglishHint="The percentage of orders that experienced a full or partial refund."
        />
      </div>

      {/* Charts Row */}
      {isCompareEnabled && comparison ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card
              title={`Comparative Cash Inflow Trajectory (${activeDataset?.name} vs ${secondaryDataset?.name})`}
              subtitle="Dual overlay across monthly periods"
            >
              <ComparisonLineChart
                data={comparison.monthlyOverlay}
                nameA={activeDataset?.name || 'A'}
                nameB={secondaryDataset?.name || 'B'}
                currA={activeCurrency}
                currB={secondaryCurrency}
              />
            </Card>
          </div>

          <div>
            <Card
              title={`Category Revenue (${activeDataset?.name})`}
              subtitle="Format distribution"
            >
              <CategoryDonutChart
                data={metricsA.categoryBreakdown}
                centerLabel="Total"
                centerValue={`${activeCurrency}${Math.round(metricsA.totalRevenue / 1000)}k`}
                currencySymbol={activeCurrency}
              />
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card
              title="Monthly Revenue by Product Category (Stacked)"
              subtitle="Dynamically discovered product format yield per month"
            >
              <CategoryStackedBarChart
                data={metricsA.stackedMonthlyCategory}
                currencySymbol={activeCurrency}
              />
            </Card>
          </div>

          <div>
            <Card
              title="Category Revenue Distribution"
              subtitle="All-time revenue share by format"
            >
              <CategoryDonutChart
                data={metricsA.categoryBreakdown}
                centerLabel="Net Total"
                centerValue={`${activeCurrency}${Math.round(metricsA.totalRevenue / 1000)}k`}
                currencySymbol={activeCurrency}
              />
            </Card>
          </div>
        </div>
      )}

      {/* Daily Cash Inflow Timeline if not compare */}
      {!isCompareEnabled && (
        <Card
          title="Cash Inflow Timeline"
          subtitle="Daily aggregate order values"
        >
          <RevenueLineChart
            data={metricsA.dailyRevenueSeries}
            currencySymbol={activeCurrency}
          />
        </Card>
      )}

      {/* Side-by-side category comparisons when compare is ON */}
      {isCompareEnabled && metricsB && (
        <Card
          title="Product Category Benchmark Matrix"
          subtitle={`Side-by-side format comparison between ${activeDataset?.name} and ${secondaryDataset?.name}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold text-role mb-2 uppercase tracking-wider">{activeDataset?.name} Format Yield</h4>
              <CategoryDonutChart
                data={metricsA.categoryBreakdown}
                centerLabel="A Total"
                centerValue={`${activeCurrency}${Math.round(metricsA.totalRevenue / 1000)}k`}
                currencySymbol={activeCurrency}
              />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-cyan-500 mb-2 uppercase tracking-wider">{secondaryDataset?.name} Format Yield</h4>
              <CategoryDonutChart
                data={metricsB.categoryBreakdown}
                centerLabel="B Total"
                centerValue={`${secondaryCurrency}${Math.round(metricsB.totalRevenue / 1000)}k`}
                currencySymbol={secondaryCurrency}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Refund Liability Audit Table */}
      <Card
        title="Refund &amp; Cancellation Liabilities Audit"
        subtitle="Individual orders flagged as refunded or partially refunded in Shopify"
      >
        <Table
          data={refundedOrders}
          columns={refundColumns}
          pageSize={10}
          searchPlaceholder="Search refunded order or customer..."
          exportFilename="refund_liabilities.csv"
          emptyMessage="Zero refunds detected in this dataset. Cash flow is 100% realized!"
        />
      </Card>
    </div>
  );
};
