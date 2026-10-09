import React from 'react';
import { Truck, MapPin, Box, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { ActivityHeatmap } from '../ui/ActivityHeatmap';
import { Table, Column } from '../ui/Table';
import { NormalizedOrder } from '../../types/order';
import { StatusPill } from '../ui/StatusPill';

export const OperationsView: React.FC = () => {
  const { operationsService } = useServices();
  const { filteredOrders, activeCurrency } = useFilters();

  const metrics = operationsService.calculateMetrics(filteredOrders);

  // Peak fulfillment day
  const sortedDays = [...metrics.dayOfWeekActivity].sort((a, b) => b.orderCount - a.orderCount);
  const peakDay = sortedDays[0]?.dayName || 'Monday';

  const triageColumns: Column<NormalizedOrder>[] = [
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
      header: 'Destination',
      accessorKey: 'city',
      sortable: true,
      cell: (row) => (
        <span>
          {row.city || 'Unspecified'}, <span className="text-zinc-500 font-mono text-[10px]">{row.provinceState || row.country}</span>
        </span>
      )
    },
    {
      header: 'Pack Items',
      accessorKey: 'orderQuantity',
      sortable: true,
      className: 'font-mono font-bold text-zinc-100',
      cell: (row) => `${row.orderQuantity} ${row.orderQuantity > 1 ? 'items' : 'item'}`
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
          {row.flags.length > 0 ? (
            row.flags.map((flag, idx) => (
              <span key={idx} className="px-1.5 py-0.5 text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-md">
                {flag}
              </span>
            ))
          ) : (
            <span className="text-zinc-500 text-[11px]">Normal Pack</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
          Operations, Logistics & Fulfillment Density
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Warehouse staffing distribution, weekday order spikes, packing complexity, and delivery destinations.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Fulfillment Volume"
          value={metrics.totalOrders}
          subValue="Total shipments processed"
          icon={<Truck className="w-4 h-4" />}
        />
        <KpiCard
          title="Peak Staffing Day"
          value={peakDay}
          subValue="Highest weekly volume load"
          icon={<Calendar className="w-4 h-4" />}
        />
        <KpiCard
          title="Avg Packing Complexity"
          value={`${metrics.averageComplexity} items`}
          subValue="Average units per box"
          icon={<Box className="w-4 h-4" />}
        />
        <KpiCard
          title="Triage Queue"
          value={metrics.triageOrders.length}
          subValue="Orders needing attention"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      {/* Day of Week Heatmap Grid */}
      <Card
        title="Fulfillment Volume by Day of Week"
        subtitle="Staff warehouse and packing stations according to historical density"
        action={
          <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded-lg">
            Weekly Cycle Matrix
          </span>
        }
      >
        <ActivityHeatmap
          activity={metrics.dayOfWeekActivity}
          currencySymbol={activeCurrency}
        />
      </Card>

      {/* Two columns: Order Complexity Distribution & Geographic Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Complexity Distribution */}
        <Card
          title="Order Packing Complexity Distribution"
          subtitle="Proportion of single-item envelopes vs multi-item heavy boxes"
        >
          <div className="space-y-3.5 pt-2">
            {metrics.complexityDistribution.map((b) => (
              <div key={b.itemsCount}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-zinc-300">{b.itemsCount}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400">{b.orderCount} orders</span>
                    <span className="font-mono font-bold text-purple-400 w-10 text-right">
                      {b.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-obsidian-800 overflow-hidden border border-obsidian-750">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                    style={{ width: `${b.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Geographic Hotspots */}
        <Card
          title="Top Destination Hubs (Cities)"
          subtitle="Top destination cities by delivery volume and revenue"
        >
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {metrics.geoHotspots.slice(0, 8).map((geo, idx) => (
              <div
                key={geo.city}
                className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-850 border border-obsidian-750 text-xs hover:border-purple-500/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 text-[10px] font-mono text-zinc-500 font-bold">
                    #{idx + 1}
                  </span>
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <div>
                    <span className="font-semibold text-zinc-200">{geo.city}</span>
                    <span className="text-zinc-500 text-[10px] ml-1.5 font-mono">({geo.provinceState})</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400 font-mono text-[11px]">{geo.orderCount} pkgs</span>
                  <span className="font-mono font-bold text-zinc-100">
                    {activeCurrency}{geo.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Logistics Triage Table */}
      <Card
        title="Logistics & Dispatch Triage Table"
        subtitle="Flagged shipments, complex multi-item orders, or cancelled/refunded parcels"
      >
        <Table
          data={metrics.triageOrders}
          columns={triageColumns}
          pageSize={10}
          searchPlaceholder="Search order number, customer, city..."
          exportFilename="logistics_triage.csv"
          emptyMessage="No orders require triage. All parcels are ready for dispatch!"
        />
      </Card>
    </div>
  );
};
