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
import { formatDatasetTitle } from '../../utils/datasetTitle';

export const InventoryView: React.FC = () => {
  const { inventoryService } = useServices();
  const { filteredOrders, secondaryFilteredOrders, activeCurrency } = useFilters();
  const { activeDataset, secondaryDataset, isCompareEnabled, openDrillDown } = useData();

  const titleA = formatDatasetTitle(activeDataset?.name || '', activeDataset?.region);
  const titleB = secondaryDataset ? formatDatasetTitle(secondaryDataset.name, secondaryDataset.region) : '';

  const metricsA = inventoryService.calculateMetrics(filteredOrders);
  const metricsB = isCompareEnabled && secondaryDataset
    ? inventoryService.calculateMetrics(secondaryFilteredOrders)
    : null;

  const handleFragranceClick = (fragrance: FragranceStockItem) => {
    const matchingOrders = filteredOrders.filter(o =>
      o.fragrancesParsed?.some(f => f.name.toLowerCase() === fragrance.name.toLowerCase()) ||
      o.fragrancesRaw.toLowerCase().includes(fragrance.name.toLowerCase())
    );

    openDrillDown({
      type: 'fragrance',
      title: `${fragrance.name} (Stock & Demand Dossier)`,
      subtitle: `Dispatched across ${matchingOrders.length} customer carts`,
      badge: `${fragrance.unitsSold} units`,
      summaryStats: [
        { label: 'Total Units Sold', value: fragrance.unitsSold },
        { label: 'Est. Total Revenue', value: `${activeCurrency}${fragrance.estimatedRevenue.toLocaleString()}` },
        { label: 'Restock Status', value: fragrance.reorderStatus.toUpperCase() },
        { label: 'Last Sold', value: fragrance.lastSaleDate }
      ],
      orders: matchingOrders
    });
  };

  const handleSizeSliceClick = (sizeName: string) => {
    const matchingOrders = filteredOrders.filter(o =>
      o.fragrancesParsed?.some(f => f.size.toLowerCase() === sizeName.toLowerCase()) ||
      o.fragrancesRaw.toLowerCase().includes(sizeName.toLowerCase())
    );

    openDrillDown({
      type: 'category',
      title: `${sizeName} Packaging Format Orders`,
      subtitle: `Filtered list of customer shipments containing ${sizeName} bottles`,
      badge: `${matchingOrders.length} orders`,
      summaryStats: [
        { label: 'Associated Orders', value: matchingOrders.length },
        { label: 'Total Format Yield', value: `${activeCurrency}${Math.round(matchingOrders.reduce((s,o)=>s+o.orderValue,0)).toLocaleString()}` }
      ],
      orders: matchingOrders
    });
  };

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
      {/* Title & Explicit Container Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              Inventory Forecasting &amp; Scent Velocity
            </h2>
            {isCompareEnabled && secondaryDataset && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-role-subtle text-role border border-role-subtle">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparing: {titleA} vs {titleB}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Stock velocity, dynamically parsed format consumption rates, and real-time scent demand.
          </p>
        </div>

        {/* Explicit Container Action */}
        <button
          type="button"
          onClick={() => {
            openDrillDown({
              type: 'orders',
              title: 'Total Physical Units Dispatched Register',
              subtitle: `Fulfillment analysis across ${metricsA.totalUnitsSold} bottles in ${titleA}`,
              badge: `${metricsA.totalUnitsSold} Units`,
              summaryStats: [
                { label: 'Total Units Sold', value: metricsA.totalUnitsSold },
                { label: 'Associated Orders', value: filteredOrders.length },
                { label: 'Unique Fragrances', value: metricsA.uniqueFragranceCount },
                { label: 'Total Volume Sales', value: `${activeCurrency}${Math.round(filteredOrders.reduce((s,o)=>s+o.orderValue,0)).toLocaleString()}` }
              ],
              orders: filteredOrders
            });
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-850 dark:hover:bg-obsidian-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-750 transition-colors shadow-sm self-start sm:self-center"
        >
          <Package className="w-3.5 h-3.5 text-role" />
          <span>Inspect Catalog Register ({filteredOrders.length})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Units Sold"
          value={metricsA.totalUnitsSold}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.totalUnitsSold} units` : "Aggregate physical units"}
          trend={isCompareEnabled && metricsB && metricsA.totalUnitsSold > 0 ? Math.round(((metricsB.totalUnitsSold - metricsA.totalUnitsSold) / metricsA.totalUnitsSold) * 100) : undefined}
          trendLabel="Units delta vs B"
          icon={<Package className="w-4 h-4" />}
          insightHint="The raw physical count of fragrance bottles and sets dispatched."
        />
        <KpiCard
          title="Active Scent Catalog"
          value={metricsA.uniqueFragranceCount}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.uniqueFragranceCount} scents` : "Unique fragrance SKUs parsed"}
          trend={isCompareEnabled && metricsB && metricsA.uniqueFragranceCount > 0 ? Math.round(((metricsB.uniqueFragranceCount - metricsA.uniqueFragranceCount) / metricsA.uniqueFragranceCount) * 100) : undefined}
          trendLabel="SKU delta vs B"
          icon={<Sparkles className="w-4 h-4" />}
          insightHint="Number of distinct fragrance varieties detected across your customer line items."
        />
        <KpiCard
          title="Top Scent"
          value={metricsA.topFragrances[0]?.name || 'N/A'}
          subValue={isCompareEnabled && metricsB ? `B: ${metricsB.topFragrances[0]?.name || 'N/A'}` : `${metricsA.topFragrances[0]?.unitsSold || 0} bottles sold`}
          icon={<ShoppingBag className="w-4 h-4" />}
          insightHint="Your highest-volume bestseller based on bottle unit counts."
          onClick={() => {
            if (metricsA.topFragrances[0]) {
              handleFragranceClick(metricsA.topFragrances[0]);
            }
          }}
        />
        <KpiCard
          title="Urgent Reorders"
          value={metricsA.allFragrances.filter(f => f.reorderStatus === 'urgent').length}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.allFragrances.filter(f => f.reorderStatus === 'urgent').length}` : "High velocity restock items"}
          icon={<AlertCircle className="w-4 h-4" />}
          insightHint="Fragrances selling at peak velocity that need immediate manufacturing reorders."
          onClick={() => {
            const urgentScents = new Set(metricsA.allFragrances.filter(f => f.reorderStatus === 'urgent').map(f => f.name.toLowerCase()));
            const urgentOrders = filteredOrders.filter(o =>
              o.fragrancesParsed?.some(f => urgentScents.has(f.name.toLowerCase())) ||
              urgentScents.has(o.fragrancesRaw.toLowerCase())
            );
            openDrillDown({
              type: 'orders',
              title: 'Urgent Restock & Inventory Replenishment Queue',
              subtitle: `Orders containing peak velocity scents needing immediate factory batches`,
              badge: `${urgentScents.size} Urgent SKUs`,
              summaryStats: [
                { label: 'Urgent Scents', value: urgentScents.size },
                { label: 'Pending Demand Orders', value: urgentOrders.length },
                { label: 'Stock Demand Value', value: `${activeCurrency}${Math.round(urgentOrders.reduce((s,o)=>s+o.orderValue,0)).toLocaleString()}` }
              ],
              orders: urgentOrders
            });
          }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Top 10 Horizontal Velocity */}
        <div className="lg:col-span-8 flex flex-col">
          <Card
            className="h-full flex flex-col justify-between"
            title={`Top Selling Fragrances (${activeDataset?.name})`}
            subtitle="Click any scent bar to view order history"
            action={
              <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-obsidian-850">
                Top {metricsA.topFragrances.length} Velocity SKUs
              </span>
            }
          >
            <div className="space-y-3 pt-2 flex-1">
              {metricsA.topFragrances.map((f, idx) => {
                const maxSold = metricsA.topFragrances[0]?.unitsSold || 1;
                const percent = Math.round((f.unitsSold / maxSold) * 100);
                return (
                  <div
                    key={f.name}
                    onClick={() => handleFragranceClick(f)}
                    className="group cursor-pointer p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-obsidian-850 transition-colors"
                  >
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

            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-obsidian-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span className="text-[11px]">Ranked by total dispatched bottle units</span>
              <span className="text-[11px] font-mono font-semibold text-role">
                Top 10 Units: {metricsA.topFragrances.reduce((s, f) => s + f.unitsSold, 0).toLocaleString()}
              </span>
            </div>
          </Card>
        </div>

        {/* Volume Share by Size Donut */}
        <div className="lg:col-span-4 flex flex-col">
          <Card
            className="h-full flex flex-col justify-between"
            title="Volume Share by Size / Format"
            subtitle="Click format to view orders"
            action={
              <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-obsidian-850">
                {metricsA.unitsBySize.length} Formats
              </span>
            }
          >
            <div className="py-1">
              <CategoryDonutChart
                data={metricsA.unitsBySize}
                centerLabel="Total Units"
                centerValue={metricsA.totalUnitsSold.toLocaleString()}
                onSliceClick={handleSizeSliceClick}
              />
            </div>

            {/* Packaging Format Quick Insight Strip */}
            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-obsidian-800/80 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-obsidian-850/70 border border-slate-100 dark:border-obsidian-750">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono block">Primary Format</span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs truncate block">
                  {metricsA.unitsBySize[0]?.name || 'N/A'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-obsidian-850/70 border border-slate-100 dark:border-obsidian-750">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono block">Format Share</span>
                <span className="font-bold font-mono text-role text-xs">
                  {metricsA.unitsBySize[0]?.percentage || 0}% of Units
                </span>
              </div>
            </div>
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
                  <div
                    key={f.name}
                    onClick={() => handleFragranceClick(f)}
                    className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 text-xs hover:border-role transition-all cursor-pointer"
                  >
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
                  <div key={f.name} className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 text-xs">
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
        subtitle="Click any row to open full order history and cart items"
      >
        <Table
          data={metricsA.allFragrances}
          columns={inventoryColumns}
          pageSize={10}
          searchPlaceholder="Search scent name..."
          exportFilename="fragrance_inventory_velocity.csv"
          onRowClick={handleFragranceClick}
        />
      </Card>
    </div>
  );
};
