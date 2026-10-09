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
import { formatDatasetTitle } from '../../utils/datasetTitle';

export const FinanceView: React.FC = () => {
  const { financeService, compareService } = useServices();
  const { filteredOrders, secondaryFilteredOrders, activeCurrency, secondaryCurrency } = useFilters();
  const { activeDataset, secondaryDataset, isCompareEnabled, openDrillDown } = useData();

  const titleA = formatDatasetTitle(activeDataset?.name || '', activeDataset?.region);
  const titleB = secondaryDataset ? formatDatasetTitle(secondaryDataset.name, secondaryDataset.region) : '';

  const metricsA = financeService.calculateMetrics(filteredOrders);
  const metricsB = isCompareEnabled && secondaryDataset
    ? financeService.calculateMetrics(secondaryFilteredOrders)
    : null;

  const comparison = isCompareEnabled && secondaryDataset
    ? compareService.compareDatasets(activeDataset!, secondaryDataset, filteredOrders, secondaryFilteredOrders)
    : null;

  const refundedOrders = filteredOrders.filter(o => o.isRefunded || o.isPartiallyRefunded);

  const handleCategoryClick = (categoryName: string) => {
    const categoryOrders = filteredOrders.filter(o =>
      (o.categoryQuantities && o.categoryQuantities[categoryName] > 0) ||
      (o.categoryAmounts && o.categoryAmounts[categoryName] > 0) ||
      (o.fragrancesRaw && o.fragrancesRaw.toLowerCase().includes(categoryName.toLowerCase()))
    );

    const totalCatRevenue = categoryOrders.reduce((sum, o) => sum + (o.categoryAmounts?.[categoryName] || o.orderValue), 0);
    const totalCatUnits = categoryOrders.reduce((sum, o) => sum + (o.categoryQuantities?.[categoryName] || 1), 0);

    openDrillDown({
      type: 'category',
      title: `${categoryName} Financial Performance`,
      subtitle: `Analyzing revenue and line-item yield for ${categoryName}`,
      badge: `${activeCurrency}${Math.round(totalCatRevenue).toLocaleString()}`,
      summaryStats: [
        { label: 'Category Revenue', value: `${activeCurrency}${Math.round(totalCatRevenue).toLocaleString()}` },
        { label: 'Units Dispatched', value: totalCatUnits.toLocaleString() },
        { label: 'Associated Orders', value: categoryOrders.length.toLocaleString() },
        { label: 'Avg Basket Size', value: `${activeCurrency}${Math.round(totalCatRevenue / Math.max(1, categoryOrders.length))}` }
      ],
      orders: categoryOrders
    });
  };

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
      {/* Title & Explicit Container Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              Financial Treasury &amp; Revenue Breakdown
            </h2>
            {isCompareEnabled && secondaryDataset && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-role-subtle text-role border border-role-subtle">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparing: {titleA} vs {titleB}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Cash flow accounting, dynamic product categories yield, average order value, and refund liabilities.
          </p>
        </div>

        {/* Explicit Container Action */}
        <button
          type="button"
          onClick={() => {
            openDrillDown({
              type: 'revenue',
              title: 'Treasury & Cash Flow Transaction Register',
              subtitle: `Audited record across all ${filteredOrders.length} transactions in ${titleA}`,
              badge: `${activeCurrency}${Math.round(metricsA.totalRevenue).toLocaleString()}`,
              summaryStats: [
                { label: 'Gross Revenue', value: `${activeCurrency}${Math.round(metricsA.totalRevenue).toLocaleString()}` },
                { label: 'Completed Orders', value: filteredOrders.length },
                { label: 'Average Basket', value: `${activeCurrency}${metricsA.aov.toFixed(2)}` },
                { label: 'Refund Deductions', value: `${activeCurrency}${metricsA.totalRefundLiability.toFixed(2)}` }
              ],
              orders: filteredOrders
            });
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-850 dark:hover:bg-obsidian-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-750 transition-colors shadow-sm self-start sm:self-center"
        >
          <DollarSign className="w-3.5 h-3.5 text-role" />
          <span>Inspect Treasury Ledger ({filteredOrders.length})</span>
        </button>
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
          insightHint="The total gross sum of all completed orders paid into your store."
        />
        <KpiCard
          title="Average Order Value (AOV)"
          value={`${activeCurrency}${metricsA.aov.toFixed(2)}`}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${secondaryCurrency}${metricsB.aov.toFixed(2)}` : `${metricsA.totalOrders} total orders`}
          trend={isCompareEnabled && comparison ? comparison.aovDeltaPercent : undefined}
          trendLabel="AOV delta vs B"
          icon={<CreditCard className="w-4 h-4" />}
          insightHint="How much the typical customer spends per checkout (Total Sales ÷ Total Orders)."
        />
        <KpiCard
          title="Refund Liability"
          value={`${activeCurrency}${metricsA.totalRefundLiability.toFixed(2)}`}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${secondaryCurrency}${metricsB.totalRefundLiability.toFixed(2)}` : `${refundedOrders.length} chargebacks/refunds`}
          icon={<RotateCcw className="w-4 h-4" />}
          insightHint="The total money paid back or refunded to customers due to returns or cancellations."
          onClick={() => {
            openDrillDown({
              type: 'orders',
              title: 'Refund & Chargeback Liability Audit',
              subtitle: `${refundedOrders.length} orders flagged with full or partial refunds`,
              badge: `${activeCurrency}${metricsA.totalRefundLiability.toFixed(2)}`,
              summaryStats: [
                { label: 'Total Refund Value', value: `${activeCurrency}${metricsA.totalRefundLiability.toFixed(2)}` },
                { label: 'Refunded Orders', value: refundedOrders.length },
                { label: 'Refund Rate', value: `${metricsA.refundRate}%` },
                { label: 'Financial Impact', value: `-${((metricsA.totalRefundLiability / Math.max(1, metricsA.totalRevenue)) * 100).toFixed(1)}% of Revenue` }
              ],
              orders: refundedOrders
            });
          }}
        />
        <KpiCard
          title="Refund Rate"
          value={`${metricsA.refundRate}%`}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.refundRate}%` : "Share of total orders"}
          icon={<ShieldAlert className="w-4 h-4" />}
          insightHint="The percentage of orders that experienced a full or partial refund."
        />
      </div>

      {/* Charts Row */}
      {isCompareEnabled && comparison ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <Card
              className="h-full flex flex-col justify-between"
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

          <div className="lg:col-span-4 flex flex-col">
            <Card
              className="h-full flex flex-col justify-between"
              title={`Category Revenue (${activeDataset?.name})`}
              subtitle="Click slice to drill down"
            >
              <CategoryDonutChart
                data={metricsA.categoryBreakdown}
                centerLabel="Total"
                centerValue={`${activeCurrency}${Math.round(metricsA.totalRevenue / 1000)}k`}
                currencySymbol={activeCurrency}
                onSliceClick={handleCategoryClick}
              />
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <Card
              className="h-full flex flex-col justify-between"
              title="Monthly Revenue by Product Category (Stacked)"
              subtitle="Dynamically discovered product format yield per month"
            >
              <CategoryStackedBarChart
                data={metricsA.stackedMonthlyCategory}
                currencySymbol={activeCurrency}
              />
            </Card>
          </div>

          <div className="lg:col-span-4 flex flex-col">
            <Card
              className="h-full flex flex-col justify-between"
              title="Category Revenue Distribution"
              subtitle="Click format to view itemized orders"
              action={
                <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-obsidian-850">
                  {metricsA.categoryBreakdown.length} Categories
                </span>
              }
            >
              <div className="py-1">
                <CategoryDonutChart
                  data={metricsA.categoryBreakdown}
                  centerLabel="Net Total"
                  centerValue={`${activeCurrency}${Math.round(metricsA.totalRevenue / 1000)}k`}
                  currencySymbol={activeCurrency}
                  onSliceClick={handleCategoryClick}
                />
              </div>

              {/* Category Quick Yield Metric Strip */}
              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-obsidian-800/80 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-obsidian-850/70 border border-slate-100 dark:border-obsidian-750">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono block">Top Category</span>
                  <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs truncate block">
                    {metricsA.categoryBreakdown[0]?.name || 'N/A'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-obsidian-850/70 border border-slate-100 dark:border-obsidian-750">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono block">Top Yield Share</span>
                  <span className="font-bold font-mono text-role text-xs">
                    {metricsA.categoryBreakdown[0]?.percentage || 0}% of Total
                  </span>
                </div>
              </div>
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
                onSliceClick={handleCategoryClick}
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
          onRowClick={(row) => {
            openDrillDown({
              type: 'customer',
              title: `Refund Audit: Order ${row.orderNumber}`,
              subtitle: `Customer: ${row.customerName} (${row.email || 'No email'})`,
              badge: row.status,
              summaryStats: [
                { label: 'Refund Amount', value: `${activeCurrency}${row.orderValue.toFixed(2)}` },
                { label: 'Date Processed', value: row.date },
                { label: 'Status Flag', value: row.status }
              ],
              orders: [row]
            });
          }}
        />
      </Card>
    </div>
  );
};
