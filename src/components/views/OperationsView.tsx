import React from 'react';
import { Truck, Calendar, Box, AlertTriangle, MapPin, GitCompare, Globe } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { ActivityHeatmap } from '../ui/ActivityHeatmap';
import { GeoDistributionMap } from '../charts/GeoDistributionMap';
import { Table, Column } from '../ui/Table';
import { NormalizedOrder } from '../../types/order';
import { StatusPill } from '../ui/StatusPill';
import { formatDatasetTitle } from '../../utils/datasetTitle';

export const OperationsView: React.FC = () => {
  const { operationsService } = useServices();
  const { filteredOrders, secondaryFilteredOrders, activeCurrency, secondaryCurrency } = useFilters();
  const { activeDataset, secondaryDataset, isCompareEnabled, openDrillDown } = useData();

  const metricsA = operationsService.calculateMetrics(filteredOrders);
  const metricsB = isCompareEnabled && secondaryDataset
    ? operationsService.calculateMetrics(secondaryFilteredOrders)
    : null;

  const titleA = formatDatasetTitle(activeDataset?.name || '', activeDataset?.region);
  const titleB = secondaryDataset ? formatDatasetTitle(secondaryDataset.name, secondaryDataset.region) : '';

  const peakDayA = [...metricsA.dayOfWeekActivity].sort((a, b) => b.orderCount - a.orderCount)[0]?.dayName || 'N/A';

  const handleDayClick = (dayName: string, dayIndex: number) => {
    const dayOrders = filteredOrders.filter(o => o.dayOfWeek === dayIndex);
    const dayRevenue = dayOrders.reduce((sum, o) => sum + o.orderValue, 0);

    openDrillDown({
      type: 'day',
      title: `${dayName} Fulfillment Roster`,
      subtitle: `Dispatched orders historically placed on ${dayName}s in ${titleA}`,
      badge: `${dayOrders.length} shipments`,
      summaryStats: [
        { label: 'Orders Dispatched', value: dayOrders.length },
        { label: 'Day Revenue', value: `${activeCurrency}${Math.round(dayRevenue).toLocaleString()}` },
        { label: 'Avg Basket Size', value: `${activeCurrency}${Math.round(dayRevenue / Math.max(1, dayOrders.length))}` }
      ],
      orders: dayOrders
    });
  };

  const handleCityClick = (cityName: string) => {
    const cityOrders = filteredOrders.filter(o => (o.city || '').toLowerCase() === cityName.toLowerCase());
    const cityRevenue = cityOrders.reduce((sum, o) => sum + o.orderValue, 0);

    openDrillDown({
      type: 'orders',
      title: `Geographic Fulfillment Dossier: ${cityName}`,
      subtitle: `Shipment roster for ${cityOrders.length} orders dispatched to ${cityName} (${titleA})`,
      badge: `${cityOrders.length} Shipments`,
      summaryStats: [
        { label: 'Destination City', value: cityName },
        { label: 'Total Shipments', value: cityOrders.length },
        { label: 'Total Inflow', value: `${activeCurrency}${Math.round(cityRevenue).toLocaleString()}` },
        { label: 'Avg Parcel Value', value: `${activeCurrency}${Math.round(cityRevenue / Math.max(1, cityOrders.length))}` }
      ],
      orders: cityOrders
    });
  };

  const handleTriageClick = (order: NormalizedOrder) => {
    openDrillDown({
      type: 'customer',
      title: `Triage Item: Order ${order.orderNumber}`,
      subtitle: `Customer: ${order.customerName} (${order.city || 'No city'})`,
      badge: order.status,
      summaryStats: [
        { label: 'Order Value', value: `${activeCurrency}${order.orderValue.toFixed(2)}` },
        { label: 'Item Quantity', value: `${order.orderQuantity} units` },
        { label: 'Date Placed', value: order.date }
      ],
      orders: [order]
    });
  };

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
      {/* Title & Explicit Container Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              Operations, Logistics &amp; Fulfillment Density
            </h2>
            {isCompareEnabled && secondaryDataset && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-role-subtle text-role border border-role-subtle">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparing: {titleA} vs {titleB}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Warehouse staffing distribution, weekday order spikes, packing complexity, and delivery destinations.
          </p>
        </div>

        {/* Explicit Container Action */}
        <button
          type="button"
          onClick={() => {
            openDrillDown({
              type: 'orders',
              title: 'Warehouse Fulfillment Volume Manifest',
              subtitle: `Complete shipment roster of ${metricsA.totalOrders} packages in ${titleA}`,
              badge: `${metricsA.totalOrders} Shipments`,
              summaryStats: [
                { label: 'Total Shipments', value: metricsA.totalOrders },
                { label: 'Peak Staffing Day', value: peakDayA },
                { label: 'Avg Items / Parcel', value: `${metricsA.averageComplexity} items` },
                { label: 'Triage Alerts', value: metricsA.triageOrders.length }
              ],
              orders: filteredOrders
            });
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-850 dark:hover:bg-obsidian-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-750 transition-colors shadow-sm self-start sm:self-center"
        >
          <Truck className="w-3.5 h-3.5 text-role" />
          <span>Inspect Warehouse Manifest ({filteredOrders.length})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Fulfillment Volume"
          value={metricsA.totalOrders}
          subValue={isCompareEnabled && metricsB ? `vs ${titleB}: ${metricsB.totalOrders} shipments` : "Total shipments processed"}
          trend={isCompareEnabled && metricsB && metricsA.totalOrders > 0 ? Math.round(((metricsB.totalOrders - metricsA.totalOrders) / metricsA.totalOrders) * 100) : undefined}
          trendLabel="Volume delta vs B"
          icon={<Truck className="w-4 h-4" />}
          insightHint="How many individual parcel packages were fulfilled and dispatched by the warehouse."
        />
        <KpiCard
          title="Peak Staffing Day"
          value={peakDayA}
          subValue={isCompareEnabled && metricsB ? `B Peak: ${[...metricsB.dayOfWeekActivity].sort((a,b)=>b.orderCount-a.orderCount)[0]?.dayName}` : "Highest weekly load"}
          icon={<Calendar className="w-4 h-4" />}
          insightHint="The day of the week with the heaviest order volume where extra packers are needed."
          onClick={() => {
            const peakDayObj = [...metricsA.dayOfWeekActivity].sort((a, b) => b.orderCount - a.orderCount)[0];
            if (peakDayObj) {
              handleDayClick(peakDayObj.dayName, peakDayObj.dayIndex);
            }
          }}
        />
        <KpiCard
          title="Avg Packing Complexity"
          value={`${metricsA.averageComplexity} items`}
          subValue={isCompareEnabled && metricsB ? `vs ${titleB}: ${metricsB.averageComplexity} items` : "Average units per box"}
          icon={<Box className="w-4 h-4" />}
          insightHint="The average number of items packed into each shipping parcel."
        />
        <KpiCard
          title="Triage Queue"
          value={metricsA.triageOrders.length}
          subValue={isCompareEnabled && metricsB ? `vs ${titleB}: ${metricsB.triageOrders.length} alerts` : (metricsA.triageOrders.length > 0 ? `${metricsA.triageOrders.length} orders need inspection` : "All shipments normal")}
          trend={isCompareEnabled && metricsB && metricsA.triageOrders.length > 0 ? Math.round(((metricsB.triageOrders.length - metricsA.triageOrders.length) / metricsA.triageOrders.length) * 100) : undefined}
          trendLabel={isCompareEnabled && metricsB ? `vs ${titleB}` : undefined}
          icon={<AlertTriangle className="w-4 h-4" />}
          insightHint="Orders that may need warehouse attention (missing items, high quantities, or special requests)."
          onClick={() => {
            openDrillDown({
              type: 'orders',
              title: 'Warehouse Triage & Flagged Exception Manifest',
              subtitle: `${metricsA.triageOrders.length} high-priority or flagged packages needing manual inspection`,
              badge: `${metricsA.triageOrders.length} Exceptions`,
              summaryStats: [
                { label: 'Triage Count', value: metricsA.triageOrders.length },
                { label: 'Exception Rate', value: `${((metricsA.triageOrders.length / Math.max(1, filteredOrders.length)) * 100).toFixed(1)}%` },
                { label: 'Multi-Item Flags', value: metricsA.triageOrders.filter(o => o.orderQuantity >= 3).length },
                { label: 'High Value Flags', value: metricsA.triageOrders.filter(o => o.orderValue >= 100).length }
              ],
              orders: metricsA.triageOrders
            });
          }}
        />
      </div>

      {/* Visual Geographic Distribution Map Card */}
      {isCompareEnabled && metricsB ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            title={`Geographic Logistics & Delivery Network (${titleA})`}
            subtitle="Interactive delivery hub contours and hotspot density (click any hub to inspect orders)"
          >
            <GeoDistributionMap
              hotspots={metricsA.geoHotspots}
              currencySymbol={activeCurrency}
              datasetName={activeDataset?.name}
              regionCode={activeDataset?.region}
              onCityClick={handleCityClick}
            />
          </Card>

          <Card
            title={`Geographic Logistics & Delivery Network (${titleB})`}
            subtitle="Interactive delivery hub contours and hotspot density"
          >
            <GeoDistributionMap
              hotspots={metricsB.geoHotspots}
              currencySymbol={secondaryCurrency}
              datasetName={secondaryDataset?.name}
              regionCode={secondaryDataset?.region}
            />
          </Card>
        </div>
      ) : (
        <Card
          title="Geographic Logistics &amp; Delivery Destination Network"
          subtitle="Interactive vector delivery map showing fulfillment density and active flight arcs (click any hub to inspect)"
        >
          <GeoDistributionMap
            hotspots={metricsA.geoHotspots}
            currencySymbol={activeCurrency}
            datasetName={activeDataset?.name}
            regionCode={activeDataset?.region}
            onCityClick={handleCityClick}
          />
        </Card>
      )}

      {/* Two columns: Day of Week Heatmap & Packing Complexity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day of Week Heatmap */}
        {isCompareEnabled && metricsB ? (
          <div className="space-y-6">
            <Card
              title={`Fulfillment Volume by Day (${titleA})`}
              subtitle="Weekly cycle density matrix — click day block to inspect"
            >
              <ActivityHeatmap
                activity={metricsA.dayOfWeekActivity}
                currencySymbol={activeCurrency}
                onDayClick={handleDayClick}
              />
            </Card>
            <Card
              title={`Fulfillment Volume by Day (${titleB})`}
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
            subtitle="Staff warehouse and packing stations according to historical density (click any day to drill down)"
          >
            <ActivityHeatmap
              activity={metricsA.dayOfWeekActivity}
              currencySymbol={activeCurrency}
              onDayClick={handleDayClick}
            />
          </Card>
        )}

        {/* Packing Complexity Distribution */}
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
      </div>

      {/* Operations Triage Exception Queue */}
      <Card
        title="Fulfillment Attention &amp; Exception Queue"
        subtitle="Orders requiring special care — click row to open order inspection"
      >
        <Table
          data={metricsA.triageOrders}
          columns={triageColumns}
          pageSize={8}
          searchPlaceholder="Search order number or customer..."
          exportFilename="fulfillment_exceptions_queue.csv"
          emptyMessage="No shipments require manual intervention."
          onRowClick={handleTriageClick}
        />
      </Card>
    </div>
  );
};
