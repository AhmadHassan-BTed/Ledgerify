import React from 'react';
import { Package, Sparkles, AlertCircle, ShoppingBag, GitCompare } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { Table, Column } from '../ui/Table';
import { FragranceStockItem } from '../../types/analytics';
import { StatusPill } from '../ui/StatusPill';

export const InventoryView: React.FC = () => {
  const { inventoryService } = useServices();
  const { filteredOrders, secondaryFilteredOrders, activeCurrency } = useFilters();
  const { activeDataset, secondaryDataset, isCompareEnabled } = useData();

  const metricsA = inventoryService.calculateMetrics(filteredOrders);
  const metricsB = isCompareEnabled && secondaryDataset
    ? inventoryService.calculateMetrics(secondaryFilteredOrders)
    : null;

  const inventoryColumns: Column<FragranceStockItem>[] = [
    {
      header: 'Fragrance Name',
      accessorKey: 'name',
      sortable: true,
      className: 'font-semibold text-slate-900 dark:text-zinc-100'
    },
    {
      header: 'Total Units Sold',
      accessorKey: 'unitsSold',
      sortable: true,
      className: 'font-mono font-bold text-role',
      cell: (row) => `${row.unitsSold} units`
    },
    {
      header: 'Dynamic Variant Breakdown',
      accessorKey: 'variantsBreakdown',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {Object.entries(row.variantsBreakdown).map(([varName, count]) => (
            <span
              key={varName}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-obsidian-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-700"
            >
              {varName}: {count}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Est. Revenue',
      accessorKey: 'estimatedRevenue',
      sortable: true,
      className: 'font-mono font-medium text-emerald-600 dark:text-emerald-400',
      cell: (row) => `${activeCurrency}${row.estimatedRevenue.toLocaleString()}`
    },
    {
      header: 'Last Sold Date',
      accessorKey: 'lastSaleDate',
      sortable: true,
      className: 'font-mono text-slate-500 dark:text-zinc-400'
    },
    {
      header: 'Restock Status',
      accessorKey: 'reorderStatus',
      sortable: true,
      cell: (row) => <StatusPill status={row.reorderStatus} />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              Inventory Forecasting &amp; Scent Velocity
            </h2>
            {isCompareEnabled && secondaryDataset && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-role-subtle text-role border border-role-subtle">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparing: {activeDataset?.name} vs {secondaryDataset.name}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Stock velocity, dynamically parsed format consumption rates, and real-time scent demand.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Units Sold"
          value={metricsA.totalUnitsSold}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.totalUnitsSold} units` : "Aggregate physical units"}
          icon={<Package className="w-4 h-4" />}
          plainEnglishHint="The raw physical count of fragrance bottles and sets dispatched."
        />
        <KpiCard
          title="Active Scent Catalog"
          value={metricsA.uniqueFragranceCount}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.uniqueFragranceCount} scents` : "Unique fragrance SKUs parsed"}
          icon={<Sparkles className="w-4 h-4" />}
          plainEnglishHint="Number of distinct fragrance varieties detected across your customer line items."
        />
        <KpiCard
          title="Top Scent"
          value={metricsA.topFragrances[0]?.name || 'N/A'}
          subValue={isCompareEnabled && metricsB ? `B: ${metricsB.topFragrances[0]?.name || 'N/A'}` : `${metricsA.topFragrances[0]?.unitsSold || 0} bottles sold`}
          icon={<ShoppingBag className="w-4 h-4" />}
          plainEnglishHint="Your highest-volume bestseller based on bottle unit counts."
        />
        <KpiCard
          title="Urgent Reorders"
          value={metricsA.allFragrances.filter(f => f.reorderStatus === 'urgent').length}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.allFragrances.filter(f => f.reorderStatus === 'urgent').length}` : "High velocity restock items"}
          icon={<AlertCircle className="w-4 h-4" />}
          plainEnglishHint="Fragrances selling at peak velocity that need immediate manufacturing reorders."
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 10 Horizontal Velocity */}
        <div className="lg:col-span-2">
          <Card
            title={`Top Selling Fragrances (${activeDataset?.name})`}
            subtitle="Parsed dynamically from fragrance line items"
          >
            <div className="space-y-3 pt-2">
              {metricsA.topFragrances.map((f, idx) => {
                const maxSold = metricsA.topFragrances[0]?.unitsSold || 1;
                const percent = Math.round((f.unitsSold / maxSold) * 100);
                return (
                  <div key={f.name} className="group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 font-mono text-[11px] text-slate-400 dark:text-zinc-500 font-bold">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-role transition-colors">
                          {f.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-role w-16 text-right">
                          {f.unitsSold} units
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-obsidian-800 overflow-hidden border border-slate-200 dark:border-obsidian-750">
                      <div
                        className="h-full bg-role rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Volume Share by Size Donut */}
        <div>
          <Card
            title="Volume Share by Size / Format"
            subtitle="Proportion of total physical units packed"
          >
            <CategoryDonutChart
              data={metricsA.unitsBySize}
              centerLabel="Total Units"
              centerValue={metricsA.totalUnitsSold.toLocaleString()}
            />
          </Card>
        </div>
      </div>

      {/* Comparison Top Fragrances when compare is ON */}
      {isCompareEnabled && metricsB && (
        <Card
          title={`Top Selling Fragrances in Benchmark Market (${secondaryDataset?.name})`}
          subtitle="Compare fragrance velocity across different geographical markets"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <h4 className="text-xs font-bold text-role uppercase tracking-wider mb-2">Top 5 in {activeDataset?.name}</h4>
              <div className="space-y-2">
                {metricsA.topFragrances.slice(0, 5).map((f, i) => (
                  <div key={f.name} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 text-xs">
                    <span className="font-medium text-slate-800 dark:text-zinc-200">#{i+1} {f.name}</span>
                    <span className="font-mono text-role font-bold">{f.unitsSold} units</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-300 uppercase tracking-wider mb-2">Top 5 in {secondaryDataset?.name}</h4>
              <div className="space-y-2">
                {metricsB.topFragrances.slice(0, 5).map((f, i) => (
                  <div key={f.name} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 text-xs">
                    <span className="font-medium text-slate-800 dark:text-zinc-200">#{i+1} {f.name}</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{f.unitsSold} units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Fragrance Velocity Data Table */}
      <Card
        title="Comprehensive Fragrance Catalog &amp; Reorder Velocity Table"
        subtitle="Sortable inventory table with dynamic variant breakdowns and production prioritization"
      >
        <Table
          data={metricsA.allFragrances}
          columns={inventoryColumns}
          pageSize={10}
          searchPlaceholder="Search scent name..."
          exportFilename="fragrance_inventory_velocity.csv"
        />
      </Card>
    </div>
  );
};
