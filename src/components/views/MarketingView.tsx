import React from 'react';
import { MapPin, Share2, Award, Repeat, GitCompare, Sparkles, Target, ArrowRight } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useData } from '../../context/DataContext';
import { useFilters } from '../../context/FilterContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { Table, Column } from '../ui/Table';
import { CityAdTarget, CohortMonthData } from '../../types/analytics';
import { formatDatasetTitle } from '../../utils/datasetTitle';

export const MarketingView: React.FC = () => {
  const { marketingService } = useServices();
  const { activeDataset, secondaryDataset, isCompareEnabled, openDrillDown } = useData();
  const { filteredOrders, secondaryFilteredOrders, activeCurrency, secondaryCurrency } = useFilters();

  const titleA = formatDatasetTitle(activeDataset?.name || '', activeDataset?.region);
  const titleB = secondaryDataset ? formatDatasetTitle(secondaryDataset.name, secondaryDataset.region) : '';

  const metricsA = marketingService.calculateMetrics(filteredOrders);
  const metricsB = isCompareEnabled && secondaryDataset
    ? marketingService.calculateMetrics(secondaryFilteredOrders.length > 0 ? secondaryFilteredOrders : secondaryDataset.orders)
    : null;

  const vipCountA = metricsA.customerFrequencyTiers.find(t => t.tier.includes('VIP'))?.customerCount || 0;
  const vipCountB = metricsB ? (metricsB.customerFrequencyTiers.find(t => t.tier.includes('VIP'))?.customerCount || 0) : 0;

  const cityColumnsA: Column<CityAdTarget>[] = [
    {
      header: 'City',
      accessorKey: 'city',
      sortable: true,
      className: 'font-semibold text-slate-900 dark:text-zinc-100'
    },
    {
      header: 'State/Region',
      accessorKey: 'province',
      className: 'font-mono text-slate-500 dark:text-zinc-400'
    },
    {
      header: 'Total Orders',
      accessorKey: 'orders',
      sortable: true,
      className: 'font-mono text-role font-bold'
    },
    {
      header: 'Ad Spend Revenue',
      accessorKey: 'revenue',
      sortable: true,
      className: 'font-mono font-semibold text-emerald-600 dark:text-emerald-400',
      cell: (row) => `${activeCurrency}${row.revenue.toLocaleString()}`
    },
    {
      header: 'Ad Priority',
      accessorKey: 'priority',
      sortable: true,
      cell: (row) => {
        const p = row.priority;
        const color = p === 'High'
          ? 'bg-role-subtle text-role border-role-subtle'
          : p === 'Medium'
          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30'
          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700';
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${color}`}>
            {p}
          </span>
        );
      }
    }
  ];

  const cohortColumns: Column<CohortMonthData>[] = [
    {
      header: 'Cohort Month',
      accessorKey: 'cohortMonth',
      sortable: true,
      className: 'font-mono text-role font-semibold'
    },
    {
      header: 'Acquired Buyers',
      accessorKey: 'initialSize',
      sortable: true,
      className: 'font-mono'
    },
    {
      header: 'Repeat Orders',
      accessorKey: 'subsequentReturnCount',
      sortable: true,
      className: 'font-mono text-emerald-600 dark:text-emerald-400'
    },
    {
      header: 'Retention Rate',
      accessorKey: 'retentionPercent',
      sortable: true,
      className: 'font-mono font-bold text-slate-900 dark:text-zinc-100',
      cell: (row) => `${row.retentionPercent}%`
    }
  ];

  const handleCityDrillDown = (city: string) => {
    const matchingOrders = filteredOrders.filter(o => o.city.toLowerCase() === city.toLowerCase());
    const totalRev = matchingOrders.reduce((sum, o) => sum + o.orderValue, 0);
    openDrillDown({
      type: 'orders',
      title: `Geo-Target Ad Intelligence: ${city}`,
      subtitle: `Transaction breakdown for ${matchingOrders.length} orders in ${city}`,
      badge: `${activeCurrency}${Math.round(totalRev).toLocaleString()}`,
      summaryStats: [
        { label: 'Target City', value: city },
        { label: 'Order Volume', value: matchingOrders.length },
        { label: 'Total Revenue', value: `${activeCurrency}${Math.round(totalRev).toLocaleString()}` },
        { label: 'Average Basket', value: `${activeCurrency}${Math.round(totalRev / Math.max(1, matchingOrders.length))}` }
      ],
      orders: matchingOrders
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Comparison Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              SEO &amp; Growth Marketing Intelligence
            </h2>
            {isCompareEnabled && secondaryDataset && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-role text-white shadow-sm">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparing: {titleA} vs {titleB}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Geo-targeted ad spend allocation, cross-selling bundle affinities, and multi-month cohort retention.
          </p>
        </div>

        {/* Explicit Container Action */}
        <button
          type="button"
          onClick={() => {
            openDrillDown({
              type: 'orders',
              title: 'SEO & Growth Marketing Campaign Register',
              subtitle: `Transaction breakdown across ${filteredOrders.length} customer carts in ${titleA}`,
              badge: `${filteredOrders.length} Orders`,
              summaryStats: [
                { label: 'Total Orders', value: filteredOrders.length },
                { label: 'Target Cities', value: metricsA.topCitiesForAds.length },
                { label: 'VIP Advocates', value: vipCountA },
                { label: 'Bundle Affinities', value: metricsA.crossSellAffinities.length }
              ],
              orders: filteredOrders
            });
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-850 dark:hover:bg-obsidian-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-750 transition-colors shadow-sm self-start sm:self-center"
        >
          <Target className="w-3.5 h-3.5 text-role" />
          <span>Inspect Growth &amp; SEO Roster ({filteredOrders.length})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Ad Spend Geo Targets"
          value={metricsA.topCitiesForAds.length}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.topCitiesForAds.length} cities` : "High-intent cities identified"}
          trend={isCompareEnabled && metricsB && metricsA.topCitiesForAds.length > 0 ? Math.round(((metricsB.topCitiesForAds.length - metricsA.topCitiesForAds.length) / metricsA.topCitiesForAds.length) * 100) : undefined}
          trendLabel="Geo targets delta vs B"
          icon={<MapPin className="w-4 h-4" />}
          insightHint="Cities generating the most revenue where digital ad campaigns have the highest return."
        />
        <KpiCard
          title="Top Bundle Pair"
          value={metricsA.crossSellAffinities[0]?.itemA || 'Single Items Only'}
          subValue={
            isCompareEnabled && metricsB
              ? `vs ${secondaryDataset?.name}: ${metricsB.crossSellAffinities[0]?.itemA || 'None'} + ${metricsB.crossSellAffinities[0]?.itemB || ''}`
              : (metricsA.crossSellAffinities[0] ? `+ ${metricsA.crossSellAffinities[0].itemB} (${metricsA.crossSellAffinities[0].coOccurrenceCount} carts)` : "No bundle combinations detected")
          }
          icon={<Share2 className="w-4 h-4" />}
          insightHint="The two products most frequently bought together in a single order."
          onClick={metricsA.crossSellAffinities[0] ? () => {
            const pair = metricsA.crossSellAffinities[0];
            const pairOrders = filteredOrders.filter(o =>
              o.fragrancesRaw.toLowerCase().includes(pair.itemA.toLowerCase()) &&
              o.fragrancesRaw.toLowerCase().includes(pair.itemB.toLowerCase())
            );
            openDrillDown({
              type: 'orders',
              title: `Top Cart Bundle Affinity: ${pair.itemA} & ${pair.itemB}`,
              subtitle: `${pair.coOccurrenceCount} customer carts purchased this combination (${pair.affinityPercent}% affinity)`,
              badge: `${pair.coOccurrenceCount} Co-Purchases`,
              summaryStats: [
                { label: 'Product A', value: pair.itemA },
                { label: 'Product B', value: pair.itemB },
                { label: 'Bundle Carts', value: pair.coOccurrenceCount },
                { label: 'Affinity Rate', value: `${pair.affinityPercent}%` }
              ],
              orders: pairOrders.length > 0 ? pairOrders : filteredOrders
            });
          } : undefined}
        />
        <KpiCard
          title="VIP Brand Advocates"
          value={vipCountA}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${vipCountB} VIPs` : "Customers with 3+ purchases"}
          trend={isCompareEnabled && metricsB && vipCountA > 0 ? Math.round(((vipCountB - vipCountA) / vipCountA) * 100) : undefined}
          trendLabel="VIP delta vs B"
          icon={<Award className="w-4 h-4" />}
          insightHint="Loyal top customers who placed 3 or more separate orders over time."
          onClick={() => {
            const customerCounts: Record<string, number> = {};
            filteredOrders.forEach(o => {
              const k = (o.email || o.customerName || 'anon').toLowerCase().trim();
              customerCounts[k] = (customerCounts[k] || 0) + 1;
            });
            const vipEmails = new Set(Object.keys(customerCounts).filter(k => customerCounts[k] >= 3));
            const vipOrders = filteredOrders.filter(o => vipEmails.has((o.email || o.customerName || 'anon').toLowerCase().trim()));
            openDrillDown({
              type: 'orders',
              title: 'VIP High-LTV Brand Advocates Dossier',
              subtitle: `${vipEmails.size} high-frequency customers who placed 3 or more orders`,
              badge: `${vipEmails.size} VIPs`,
              summaryStats: [
                { label: 'VIP Advocates', value: vipEmails.size },
                { label: 'VIP Orders', value: vipOrders.length },
                { label: 'VIP Revenue Share', value: `${activeCurrency}${Math.round(vipOrders.reduce((s,o)=>s+o.orderValue,0)).toLocaleString()}` }
              ],
              orders: vipOrders
            });
          }}
        />
        <KpiCard
          title="Co-Purchased Cart Pairs"
          value={metricsA.crossSellAffinities.length}
          subValue={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${metricsB.crossSellAffinities.length} pairs` : "Distinct cross-sell affinities"}
          icon={<Repeat className="w-4 h-4" />}
          insightHint="Unique product combinations that can be promoted as discounted gift sets."
        />
      </div>

      {/* Cross-Sell Bundle Affinity Matrix (Comparative vs Single) */}
      {isCompareEnabled && metricsB ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card
            title={`Cross-Sell Cart Bundles — ${activeDataset?.name}`}
            subtitle="Top product pairings co-purchased in checkout carts"
          >
            <div className="space-y-2.5 pt-2">
              {metricsA.crossSellAffinities.slice(0, 5).map((pair, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/70 dark:border-obsidian-750 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-[11px] font-mono text-slate-400 font-bold">#{idx + 1}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {pair.itemA} <span className="text-role font-normal">&amp;</span> {pair.itemB}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-role">{pair.coOccurrenceCount} carts</span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono block">({pair.affinityPercent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title={`Cross-Sell Cart Bundles — ${secondaryDataset?.name}`}
            subtitle="Top product pairings co-purchased in secondary dataset"
          >
            <div className="space-y-2.5 pt-2">
              {metricsB.crossSellAffinities.slice(0, 5).map((pair, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/70 dark:border-obsidian-750 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-[11px] font-mono text-slate-400 font-bold">#{idx + 1}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {pair.itemA} <span className="text-cyan-500 font-normal">&amp;</span> {pair.itemB}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-cyan-500">{pair.coOccurrenceCount} carts</span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono block">({pair.affinityPercent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <Card
          title="Cross-Sell &amp; Cart Bundle Affinity Matrix"
          subtitle="Fragrances most frequently purchased together in the same cart for email bundles &amp; popups"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {metricsA.crossSellAffinities.slice(0, 6).map((pair, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-obsidian-850/80 border border-slate-200/70 dark:border-obsidian-750 flex items-center justify-between hover:border-role transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-[11px] font-mono text-slate-400 dark:text-zinc-500 font-bold">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {pair.itemA} <span className="text-role font-normal">&amp;</span> {pair.itemB}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 pl-7 block">
                    Frequently bundled together
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-role block">
                    {pair.coOccurrenceCount} carts
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono">
                    Affinity {pair.affinityPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Two columns: Geo-Ad Cities & Customer Frequency Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geo Ad Cities Table */}
        <div className="lg:col-span-2">
          <Card
            title={`Geo-Targeted Ad Spending Allocation (${activeDataset?.name})`}
            subtitle="Prioritize Meta &amp; Google Local Ads to top revenue cities"
          >
            <Table
              data={metricsA.topCitiesForAds}
              columns={cityColumnsA}
              pageSize={7}
              searchPlaceholder="Filter city..."
              exportFilename="geo_ad_spend_priorities.csv"
              onRowClick={(row) => handleCityDrillDown(row.city)}
            />
          </Card>
        </div>

        {/* Customer Frequency Tiers */}
        <div>
          <Card
            title="Customer Lifetime Value Tiers"
            subtitle="Cart order frequency tiers"
          >
            <div className="space-y-3.5 pt-2">
              {metricsA.customerFrequencyTiers.map((tier) => (
                <div key={tier.tier} className="p-3 rounded-xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/70 dark:border-obsidian-750">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{tier.tier}</span>
                    <span className="font-mono text-role font-bold">
                      {tier.customerCount} users
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-obsidian-800 overflow-hidden border border-slate-200 dark:border-obsidian-750">
                    <div
                      className="h-full bg-role rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, tier.revenueShare)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1 block">
                    {tier.revenueShare}% of customer base
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Cohort Retention Table */}
      {metricsA.cohortRetention.length > 0 && (
        <Card
          title="Monthly Customer Cohort Repeat Retention"
          subtitle="Measures users who made their first order in Month M and subsequently ordered again"
        >
          <Table
            data={metricsA.cohortRetention}
            columns={cohortColumns}
            pageSize={5}
            exportFilename="cohort_retention.csv"
          />
        </Card>
      )}
    </div>
  );
};
