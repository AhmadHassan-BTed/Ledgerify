import React from 'react';
import { DollarSign, CreditCard, RotateCcw, PieChart as PieIcon, ShieldAlert } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { RevenueLineChart } from '../charts/RevenueLineChart';
import { CategoryStackedBarChart } from '../charts/CategoryStackedBarChart';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { Table, Column } from '../ui/Table';
import { NormalizedOrder } from '../../types/order';
import { StatusPill } from '../ui/StatusPill';

export const FinanceView: React.FC = () => {
  const { financeService } = useServices();
  const { filteredOrders, activeCurrency } = useFilters();

  const metrics = financeService.calculateMetrics(filteredOrders);

  // Filter refunded orders for liability audit table
  const refundedOrders = filteredOrders.filter(o => o.isRefunded || o.isPartiallyRefunded);

  const refundColumns: Column<NormalizedOrder>[] = [
    {
      header: 'Order #',
      accessorKey: 'orderNumber',
      sortable: true,
      className: 'font-mono text-purple-300 font-semibold'
    },
    {
      header: 'Date',
      accessorKey: 'date',
      sortable: true,
      className: 'font-mono text-zinc-400'
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      sortable: true
    },
    {
      header: 'Items Ordered',
      accessorKey: 'fragrancesRaw',
      className: 'max-w-xs truncate text-zinc-400'
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
      className: 'font-mono font-bold text-rose-400',
      cell: (row) => `${activeCurrency}${row.orderValue.toFixed(2)}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
          Financial Treasury & Revenue Breakdown
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Detailed cash flow accounting, category product yield, average order value, and refund liabilities.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Gross Ledger Revenue"
          value={metrics.totalRevenue}
          currencyPrefix={activeCurrency}
          subValue="Sum of Order Value column"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          title="Average Order Value (AOV)"
          value={`${activeCurrency}${metrics.aov.toFixed(2)}`}
          subValue={`${metrics.totalOrders} total orders counted`}
          icon={<CreditCard className="w-4 h-4" />}
        />
        <KpiCard
          title="Refund Liability"
          value={`${activeCurrency}${metrics.totalRefundLiability.toFixed(2)}`}
          subValue={`${refundedOrders.length} chargebacks/refunds`}
          icon={<RotateCcw className="w-4 h-4" />}
        />
        <KpiCard
          title="Refund Rate"
          value={`${metrics.refundRate}%`}
          subValue="Share of total orders"
          icon={<ShieldAlert className="w-4 h-4" />}
        />
      </div>

      {/* Charts Row: Stacked Monthly Category & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Monthly Revenue by Product Category (Stacked)"
            subtitle="Comparing 100ml, 50ml, and Set product sales per month"
            action={
              <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded-lg">
                Stacked Monthly
              </span>
            }
          >
            <CategoryStackedBarChart
              data={metrics.stackedMonthlyCategory}
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
              data={metrics.categoryBreakdown}
              centerLabel="Net Total"
              centerValue={`${activeCurrency}${Math.round(metrics.totalRevenue / 1000)}k`}
              currencySymbol={activeCurrency}
            />
          </Card>
        </div>
      </div>

      {/* Daily Revenue Time Series */}
      <Card
        title="Cash Inflow Timeline"
        subtitle="Daily aggregate order values"
      >
        <RevenueLineChart
          data={metrics.dailyRevenueSeries}
          currencySymbol={activeCurrency}
        />
      </Card>

      {/* Refund Liability Audit Table */}
      <Card
        title="Refund & Cancellation Liabilities Audit"
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
