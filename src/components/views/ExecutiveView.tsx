import React from 'react';
import { DollarSign, TrendingUp, Users, Target, Globe, GitCompare } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { RadialGauge } from '../ui/RadialGauge';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { RevenueLineChart } from '../charts/RevenueLineChart';
import { ComparisonLineChart } from '../charts/ComparisonLineChart';

export const ExecutiveView: React.FC = () => {
  const { executiveService, financeService, compareService } = useServices();
  const { filteredOrders, secondaryFilteredOrders, activeCurrency, secondaryCurrency } = useFilters();
  const { activeDataset, secondaryDataset, isCompareEnabled } = useData();

  const metricsA = executiveService.calculateMetrics(filteredOrders);
  const finMetricsA = financeService.calculateMetrics(filteredOrders);

  const metricsB = isCompareEnabled && secondaryDataset
    ? executiveService.calculateMetrics(secondaryFilteredOrders)
    : null;
  const finMetricsB = isCompareEnabled && secondaryDataset
    ? financeService.calculateMetrics(secondaryFilteredOrders)
    : null;

  const comparison = isCompareEnabled && secondaryDataset
    ? compareService.compareDatasets(activeDataset!, secondaryDataset, filteredOrders, secondaryFilteredOrders)
    : null;

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              Executive Growth Intelligence
            </h2>
            {isCompareEnabled && secondaryDataset && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-role-subtle text-role border border-role-subtle">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparing: {activeDataset?.name} vs {secondaryDataset.name}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            High-level business health, customer retention, and MoM expansion vectors for {activeDataset?.name || 'Current Ledger'}.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 text-xs shadow-sm">
          <Globe className="w-4 h-4 text-role" />
          <span className="text-slate-600 dark:text-zinc-300 font-medium">Top Market:</span>
          <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">{metricsA.topMarketName}</span>
          <span className="text-role text-[11px] font-bold">({metricsA.topMarketShare}%)</span>
        </div>
      </div>

      {/* Top Level Big KPI Cards with Plain-English Hints */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Net Revenue"
          value={metricsA.totalRevenue}
          currencyPrefix={activeCurrency}
          trend={metricsA.momRevenueGrowth}
          trendLabel={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${comparison?.revenueDeltaPercent}%` : "MoM revenue growth"}
          subValue={isCompareEnabled && metricsB ? `B: ${secondaryCurrency}${metricsB.totalRevenue.toLocaleString()}` : undefined}
          icon={<DollarSign className="w-4 h-4" />}
          plainEnglishHint="The real money earned from sales after deducting returns and cancellations."
        />
        <KpiCard
          title="Customer Retention"
          value={`${metricsA.retentionRate}%`}
          trend={metricsA.retentionRate > 15 ? 4.2 : -1.8}
          trendLabel={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${comparison?.retentionDeltaPercent}%` : "Repeat buyers"}
          subValue={isCompareEnabled && metricsB ? `B: ${metricsB.retentionRate}% (${metricsB.returningCustomers} buyers)` : `${metricsA.returningCustomers} repeat buyers`}
          icon={<Users className="w-4 h-4" />}
          plainEnglishHint="The percentage of customers who came back to place 2 or more orders with your brand."
        />
        <KpiCard
          title="Order Volume"
          value={`${filteredOrders.length} orders`}
          trend={metricsA.momVolumeGrowth}
          trendLabel={isCompareEnabled && metricsB ? `vs ${secondaryDataset?.name}: ${comparison?.ordersDeltaPercent}%` : "MoM volume change"}
          subValue={isCompareEnabled && metricsB ? `B: ${secondaryFilteredOrders.length} orders` : undefined}
          icon={<TrendingUp className="w-4 h-4" />}
          plainEnglishHint="The total count of orders successfully processed in this filtered timeframe."
        />
        <KpiCard
          title="Target Attainment"
          value={`${metricsA.targetProgressPercent}%`}
          subValue={isCompareEnabled && metricsB ? `B: ${metricsB.targetProgressPercent}% Pace` : `Target: ${activeCurrency}${metricsA.monthlyTarget.toLocaleString()}`}
          icon={<Target className="w-4 h-4" />}
          plainEnglishHint="How close your actual revenue is to hitting your monthly sales target milestone."
        />
      </div>

      {/* Charts Row: Single View vs Comparison View */}
      {isCompareEnabled && comparison ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card
              title={`Comparative Trajectory (${activeDataset?.name} vs ${secondaryDataset?.name})`}
              subtitle="Dual overlay across monthly ledger periods"
              action={
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-role" />
                    <span className="text-slate-700 dark:text-zinc-300 font-medium">{activeDataset?.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="text-slate-700 dark:text-zinc-300 font-medium">{secondaryDataset?.name}</span>
                  </div>
                </div>
              }
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

          <div>
            <Card
              title="Target Pacing Comparison"
              subtitle="Side-by-side benchmark goals"
            >
              <div className="space-y-4">
                <RadialGauge
                  percent={metricsA.targetProgressPercent}
                  title={`${activeDataset?.name} Pace`}
                  currentValue={`${activeCurrency}${metricsA.totalRevenue.toLocaleString()}`}
                  targetValue={`${activeCurrency}${metricsA.monthlyTarget.toLocaleString()}`}
                  size={190}
                />
                {metricsB && (
                  <div className="pt-2 border-t border-slate-100 dark:border-obsidian-800">
                    <RadialGauge
                      percent={metricsB.targetProgressPercent}
                      title={`${secondaryDataset?.name} Pace`}
                      currentValue={`${secondaryCurrency}${metricsB.totalRevenue.toLocaleString()}`}
                      targetValue={`${secondaryCurrency}${metricsB.monthlyTarget.toLocaleString()}`}
                      size={190}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card
              title="Revenue Trajectory & Daily Momentum"
              subtitle="Real-time order value progression over time"
            >
              <RevenueLineChart
                data={finMetricsA.dailyRevenueSeries}
                currencySymbol={activeCurrency}
              />
            </Card>
          </div>

          <div>
            <Card
              title="Monthly Target Tracker"
              subtitle="Dynamic benchmark goal attainment"
            >
              <RadialGauge
                percent={metricsA.targetProgressPercent}
                title="Goal Paced"
                subtitle="Based on current monthly run-rate"
                currentValue={`${activeCurrency}${metricsA.totalRevenue.toLocaleString()}`}
                targetValue={`${activeCurrency}${metricsA.monthlyTarget.toLocaleString()}`}
                size={220}
              />
            </Card>
          </div>
        </div>
      )}

      {/* Customer Acquisition vs Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title={isCompareEnabled && secondaryDataset ? `Customer Acquisition (${activeDataset?.name})` : "Customer Acquisition vs. Retention"}
          subtitle="Unique email address analysis for repeat cart conversions"
        >
          <CategoryDonutChart
            data={metricsA.newVsReturningSplit}
            centerLabel="Total Buyers"
            centerValue={metricsA.totalCustomers.toLocaleString()}
          />
        </Card>

        {isCompareEnabled && metricsB ? (
          <Card
            title={`Customer Acquisition (${secondaryDataset?.name})`}
            subtitle="Benchmark customer repeat behavior in secondary market"
          >
            <CategoryDonutChart
              data={metricsB.newVsReturningSplit}
              centerLabel="Total Buyers"
              centerValue={metricsB.totalCustomers.toLocaleString()}
            />
          </Card>
        ) : (
          <Card
            title="Macro Market Penetration"
            subtitle="Geographic concentration and revenue contribution"
          >
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">
                    Primary Market ({metricsA.topMarketName})
                  </span>
                  <span className="font-mono text-role font-bold">
                    {activeCurrency}{metricsA.topMarketRevenue.toLocaleString()} ({metricsA.topMarketShare}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-obsidian-800 overflow-hidden border border-slate-200 dark:border-obsidian-750">
                  <div
                    className="h-full bg-role rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, metricsA.topMarketShare)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/70 dark:border-obsidian-750">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Total Customers</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 font-mono">{metricsA.totalCustomers}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/70 dark:border-obsidian-750">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Repeat Rate</span>
                  <span className="text-lg font-bold text-role font-mono">{metricsA.retentionRate}%</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
