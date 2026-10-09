import React from 'react';
import { Package, Layers, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { Table, Column } from '../ui/Table';
import { FragranceStockItem } from '../../types/analytics';
import { StatusPill } from '../ui/StatusPill';

export const InventoryView: React.FC = () => {
  const { inventoryService } = useServices();
  const { filteredOrders, activeCurrency } = useFilters();

  const metrics = inventoryService.calculateMetrics(filteredOrders);

  const inventoryColumns: Column<FragranceStockItem>[] = [
    {
      header: 'Fragrance Name',
      accessorKey: 'name',
      sortable: true,
      className: 'font-semibold text-zinc-100'
    },
    {
      header: 'Total Units Sold',
      accessorKey: 'unitsSold',
      sortable: true,
      className: 'font-mono text-purple-300 font-bold',
      cell: (row) => `${row.unitsSold} units`
    },
    {
      header: '50ml Sold',
      accessorKey: 'size50Count',
      sortable: true,
      className: 'font-mono text-zinc-400'
    },
    {
      header: '100ml Sold',
      accessorKey: 'size100Count',
      sortable: true,
      className: 'font-mono text-zinc-400'
    },
    {
      header: 'Est. Revenue',
      accessorKey: 'estimatedRevenue',
      sortable: true,
      className: 'font-mono font-medium text-emerald-400',
      cell: (row) => `${activeCurrency}${row.estimatedRevenue.toLocaleString()}`
    },
    {
      header: 'Last Sold Date',
      accessorKey: 'lastSaleDate',
      sortable: true,
      className: 'font-mono text-zinc-400'
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
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
          Inventory Forecasting & Scent Velocity
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Stock velocity, bottle size consumption rates, and parsed fragrance demand for production planning.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Bottles & Sets Sold"
          value={metrics.totalUnitsSold}
          subValue="Aggregate across all sizes"
          icon={<Package className="w-4 h-4" />}
        />
        <KpiCard
          title="Active Scent Catalog"
          value={metrics.uniqueFragranceCount}
          subValue="Unique fragrance SKUs parsed"
          icon={<Sparkles className="w-4 h-4" />}
        />
        <KpiCard
          title="Top Velocity Scent"
          value={metrics.topFragrances[0]?.name || 'N/A'}
          subValue={`${metrics.topFragrances[0]?.unitsSold || 0} bottles sold`}
          icon={<ShoppingBag className="w-4 h-4" />}
        />
        <KpiCard
          title="Urgent Reorders"
          value={metrics.allFragrances.filter(f => f.reorderStatus === 'urgent').length}
          subValue="Scents with highest velocity"
          icon={<AlertCircle className="w-4 h-4" />}
        />
      </div>

      {/* Charts Row: Top 10 Horizontal Velocity & Volume Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 10 Fragrances Horizontal Bar List */}
        <div className="lg:col-span-2">
          <Card
            title="Top 10 Selling Fragrances (Velocity)"
            subtitle="Parsed from composite fragrance line items in Ledger"
          >
            <div className="space-y-3 pt-2">
              {metrics.topFragrances.map((f, idx) => {
                const maxSold = metrics.topFragrances[0]?.unitsSold || 1;
                const percent = Math.round((f.unitsSold / maxSold) * 100);
                return (
                  <div key={f.name} className="group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 font-mono text-[11px] text-zinc-500 font-bold">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-zinc-200 group-hover:text-purple-300 transition-colors">
                          {f.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-zinc-400 text-[11px]">
                          {f.size50Count}x 50ml · {f.size100Count}x 100ml
                        </span>
                        <span className="font-mono font-bold text-purple-400 w-16 text-right">
                          {f.unitsSold} units
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-obsidian-800 overflow-hidden border border-obsidian-750">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-300 group-hover:from-purple-500 group-hover:to-purple-300"
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
              data={metrics.unitsBySize}
              centerLabel="Total Units"
              centerValue={metrics.totalUnitsSold.toLocaleString()}
            />
          </Card>
        </div>
      </div>

      {/* Fragrance Velocity Data Table */}
      <Card
        title="Comprehensive Fragrance Catalog & Reorder Velocity Table"
        subtitle="Sortable inventory table with last recorded sale date and production prioritization"
      >
        <Table
          data={metrics.allFragrances}
          columns={inventoryColumns}
          pageSize={10}
          searchPlaceholder="Search scent name..."
          exportFilename="fragrance_inventory_velocity.csv"
        />
      </Card>
    </div>
  );
};
