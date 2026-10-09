import React from 'react';
import { Truck, Calendar, Box, AlertTriangle, MapPin, GitCompare } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { ActivityHeatmap } from '../ui/ActivityHeatmap';
import { Table, Column } from '../ui/Table';
import { NormalizedOrder } from '../../types/order';
import { StatusPill } from '../ui/StatusPill';

export const OperationsView: React.FC = () => {
  const { operationsService } = useServices();
  const { filteredOrders, secondaryFilteredOrders, activeCurrency, secondaryCurrency } = useFilters();
  const { activeDataset, secondaryDataset, isCompareEnabled } = useData();

  const metricsA = operationsService.calculateMetrics(filteredOrders);
  const metricsB = isCompareEnabled && secondaryDataset
    ? operationsService.calculateMetrics(secondaryFilteredOrders)
    : null;

  const peakDayA = [...metricsA.dayOfWeekActivity].sort((a, b) => b.orderCount - a.orderCount)[0]?.dayName || 'N/A';

  const triageColumns: Column<NormalizedOrder>[] = [
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
      header: 'Destination',
      accessorKey: 'city',
      cell: (row) => `${row.city || 'N/A'}, ${row.provinceState || row.country || ''}`
    },
    {
      header: 'Items',
      accessorKey: 'orderQuantity',
      sortable: true,
      className: 'font-mono font-bold'
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusPill status={row.status} />
    },
    {
      header: 'Flags & Alerts',
      accessorKey: 'flags',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.flags || []).length > 0 ? (
            row.flags.map((flag, idx) => (
              <span key={idx} className="px-1.5 py-0.5 text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-md">
                {flag}
              </span>
            ))
          ) : (
            <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Normal Pack</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              Operations, Logistics &amp; Fulfillment Density
            </h2>
            {isCompareEnabled && secondaryDataset && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-role-subtle text-role border border-role-subtle">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparing: {activeDataset?.name} vs {secondaryDataset.name}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Warehouse staffing distribution, weekday order spikes, packing complexity, and delivery destinations.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Fulfillment Volume"
          value={metricsA.totalOrders}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.totalOrders} shipments` : "Total shipments processed"}
          icon={<Truck className="w-4 h-4" />}
          plainEnglishHint="How many individual parcel packages were fulfilled and dispatched by the warehouse."
        />
        <KpiCard
          title="Peak Staffing Day"
          value={peakDayA}
          subValue={isCompareEnabled && metricsB ? `B Peak: ${[...metricsB.dayOfWeekActivity].sort((a,b)=>b.orderCount-a.orderCount)[0]?.dayName}` : "Highest weekly load"}
          icon={<Calendar className="w-4 h-4" />}
          plainEnglishHint="The day of the week with the heaviest order volume where extra packers are needed."
        />
        <KpiCard
          title="Avg Packing Complexity"
          value={`${metricsA.averageComplexity} items`}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.averageComplexity} items` : "Average units per box"}
          icon={<Box className="w-4 h-4" />}
          plainEnglishHint="The average number of items packed into each shipping parcel."
        />
        <KpiCard
          title="Triage Queue"
          value={metricsA.triageOrders.length}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.triageOrders.length} orders` : "Shipments needing attention"}
          icon={<AlertTriangle className="w-4 h-4" />}
          plainEnglishHint="Orders flagged with high item counts, partial refunds, or shipping alerts needing attention."
        />
      </div>

      {/* Day of Week Heatmap */}
      {isCompareEnabled && metricsB ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            title={`Fulfillment Volume by Day (${activeDataset?.name})`}
            subtitle="Weekly cycle density matrix"
          >
            <ActivityHeatmap
              activity={metricsA.dayOfWeekActivity}
              currencySymbol={activeCurrency}
            />
          </Card>
          <Card
            title={`Fulfillment Volume by Day (${secondaryDataset?.name})`}
            subtitle="Weekly cycle density matrix"
          >
            <ActivityHeatmap
              activity={metricsB.dayOfWeekActivity}
              currencySymbol={secondaryCurrency}
            />
          </Card>
        </div>
      ) : (
        <Card
          title="Fulfillment Volume by Day of Week"
          subtitle="Staff warehouse and packing stations according to historical density"
        >
          <ActivityHeatmap
            activity={metricsA.dayOfWeekActivity}
            currencySymbol={activeCurrency}
          />
        </Card>
      )}

      {/* Two columns: Order Complexity & Geographic Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Order Packing Complexity Distribution"
          subtitle="Proportion of single-item envelopes vs multi-item heavy boxes"
        >
          <div className="space-y-3.5 pt-2">
            {metricsA.complexityDistribution.map((b) => (
              <div key={b.itemsCount}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-zinc-300">{b.itemsCount}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 dark:text-zinc-400">{b.orderCount} orders</span>
                    <span className="font-mono font-bold text-role w-10 text-right">
                      {b.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-obsidian-800 overflow-hidden border border-slate-200 dark:border-obsidian-750">
                  <div
                    className="h-full bg-role rounded-full transition-all duration-300"
                    style={{ width: `${b.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Top Delivery Destination Hotspots"
          subtitle="Leading geographic cities receiving shipments"
        >
          <div className="space-y-2.5 pt-1">
            {metricsA.geoHotspots.slice(0, 5).map((c, i) => (
              <div
                key={c.city}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-850/80 border border-slate-200/70 dark:border-obsidian-750 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 font-mono text-[11px] text-slate-400 dark:text-zinc-500 font-bold">
                    #{i + 1}
                  </span>
                  <MapPin className="w-3.5 h-3.5 text-role flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{c.city}</span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 ml-1.5">({c.provinceState})</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">{c.orderCount} shipments</span>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 block font-mono">
                    {activeCurrency}{c.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Operations Triage Exception Queue */}
      <Card
        title="Fulfillment Attention &amp; Exception Queue"
        subtitle="Orders requiring special care (returns, high quantity bulk, or anomalies)"
      >
        <Table
          data={metricsA.triageOrders}
          columns={triageColumns}
          pageSize={8}
          searchPlaceholder="Search order number or customer..."
          exportFilename="fulfillment_exceptions_queue.csv"
          emptyMessage="No shipments require manual intervention."
        />
      </Card>
    </div>
  );
};
