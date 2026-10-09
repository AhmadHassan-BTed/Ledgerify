import React from 'react';
import { MapPin, Share2, Award, Repeat } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { Table, Column } from '../ui/Table';
import { CityAdTarget, CohortMonthData } from '../../types/analytics';

export const MarketingView: React.FC = () => {
  const { marketingService } = useServices();
  const { filteredOrders, activeCurrency } = useFilters();

  const metrics = marketingService.calculateMetrics(filteredOrders);

  const cityColumns: Column<CityAdTarget>[] = [
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

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
          SEO &amp; Growth Marketing Intelligence
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Geo-targeted ad spend allocation, cross-selling bundle affinities, and multi-month cohort retention.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Ad Spend Geo Targets"
          value={metrics.topCitiesForAds.length}
          subValue="High-intent cities identified"
          icon={<MapPin className="w-4 h-4" />}
          plainEnglishHint="Cities generating the most revenue where digital ad campaigns have the highest return."
        />
        <KpiCard
          title="Top Bundle Pair"
          value={metrics.crossSellAffinities[0]?.itemA || 'Silk Odyssey'}
          subValue={`+ ${metrics.crossSellAffinities[0]?.itemB || 'Visionary'}`}
          icon={<Share2 className="w-4 h-4" />}
          plainEnglishHint="The two products most frequently bought together in a single order."
        />
        <KpiCard
          title="VIP Brand Advocates"
          value={metrics.customerFrequencyTiers.find(t => t.tier.includes('VIP'))?.customerCount || 0}
          subValue="Customers with 3+ purchases"
          icon={<Award className="w-4 h-4" />}
          plainEnglishHint="Loyal top customers who placed 3 or more separate orders over time."
        />
        <KpiCard
          title="Co-Purchased Cart Pairs"
          value={metrics.crossSellAffinities.length}
          subValue="Distinct cross-sell affinities"
          icon={<Repeat className="w-4 h-4" />}
          plainEnglishHint="Unique product combinations that can be promoted as discounted gift sets."
        />
      </div>

      {/* Cross-Sell Bundle Affinity Matrix */}
      <Card
        title="Cross-Sell &amp; Cart Bundle Affinity Matrix"
        subtitle="Fragrances most frequently purchased together in the same cart for email bundles &amp; popups"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {metrics.crossSellAffinities.slice(0, 6).map((pair, idx) => (
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

      {/* Two columns: Geo-Ad Cities & Customer Frequency Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geo Ad Cities Table */}
        <div className="lg:col-span-2">
          <Card
            title="Geo-Targeted Ad Spending Allocation (Top Cities)"
            subtitle="Prioritize Meta &amp; Google Local Ads to top revenue cities"
          >
            <Table
              data={metrics.topCitiesForAds}
              columns={cityColumns}
              pageSize={7}
              searchPlaceholder="Filter city..."
              exportFilename="geo_ad_spend_priorities.csv"
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
              {metrics.customerFrequencyTiers.map((tier) => (
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
      {metrics.cohortRetention.length > 0 && (
        <Card
          title="Monthly Customer Cohort Repeat Retention"
          subtitle="Measures users who made their first order in Month M and subsequently ordered again"
        >
          <Table
            data={metrics.cohortRetention}
            columns={cohortColumns}
            pageSize={5}
            exportFilename="cohort_retention.csv"
          />
        </Card>
      )}
    </div>
  );
};
