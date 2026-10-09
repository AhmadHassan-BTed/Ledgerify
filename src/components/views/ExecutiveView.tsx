import React from 'react';
import { DollarSign, TrendingUp, Users, Target, Globe } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { RadialGauge } from '../ui/RadialGauge';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { RevenueLineChart } from '../charts/RevenueLineChart';

export const ExecutiveView: React.FC = () => {
  const { executiveService, financeService } = useServices();
  const { filteredOrders, activeCurrency } = useFilters();
  const { activeDataset } = useData();

  const metrics = executiveService.calculateMetrics(filteredOrders);
  const finMetrics = financeService.calculateMetrics(filteredOrders);

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
            Executive Growth Intelligence
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            High-level business health, customer retention, and MoM expansion vectors for {activeDataset?.name || 'Current Ledger'}.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-obsidian-800 text-xs">
          <Globe className="w-4 h-4 text-purple-400" />
          <span className="text-zinc-300 font-medium">Top Market:</span>
          <span className="font-bold text-zinc-100 font-mono">{metrics.topMarketName}</span>
          <span className="text-purple-400 text-[11px]">({metrics.topMarketShare}%)</span>
        </div>
      </div>

      {/* Top Level Big KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Net Revenue"
          value={metrics.totalRevenue}
          currencyPrefix={activeCurrency}
          trend={metrics.momRevenueGrowth}
          trendLabel="MoM revenue growth"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          title="Customer Retention"
          value={`${metrics.retentionRate}%`}
          trend={metrics.retentionRate > 15 ? 4.2 : -1.8}
          trendLabel="Returning customer share"
          subValue={`${metrics.returningCustomers} repeat buyers`}
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          title="Order Volume Growth"
          value={`${filteredOrders.length} orders`}
          trend={metrics.momVolumeGrowth}
          trendLabel="MoM volume change"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KpiCard
          title="Target Attainment"
          value={`${metrics.targetProgressPercent}%`}
          subValue={`Target: ${activeCurrency}${metrics.monthlyTarget.toLocaleString()}`}
          icon={<Target className="w-4 h-4" />}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart */}
        <div className="lg:col-span-2">
          <Card
            title="Revenue Trajectory & Daily Momentum"
            subtitle="Real-time order value progression over time"
            action={
              <span className="text-[11px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded-lg">
                Daily Ledger Plot
              </span>
            }
          >
            <RevenueLineChart
              data={finMetrics.dailyRevenueSeries}
              currencySymbol={activeCurrency}
            />
          </Card>
        </div>

        {/* Target Gauge & Executive Score */}
        <div>
          <Card
            title="Monthly Target Tracker"
            subtitle="Dynamic benchmark goal attainment"
            className="flex flex-col justify-between"
          >
            <div className="py-2">
              <RadialGauge
                percent={metrics.targetProgressPercent}
                title="Goal Paced"
                subtitle="Based on current monthly run-rate"
                currentValue={`${activeCurrency}${metrics.totalRevenue.toLocaleString()}`}
                targetValue={`${activeCurrency}${metrics.monthlyTarget.toLocaleString()}`}
                size={220}
              />
            </div>
            <div className="mt-4 p-3 rounded-xl bg-obsidian-850 border border-obsidian-750 text-xs text-zinc-400">
              <span className="text-zinc-200 font-semibold block mb-0.5">Executive Summary</span>
              {metrics.momRevenueGrowth >= 0
                ? `Revenue is up +${metrics.momRevenueGrowth}% MoM. Retention pace is healthy with ${metrics.returningCustomers} returning buyers.`
                : `Volume contracted by ${metrics.momVolumeGrowth}% MoM. Review ad spend and re-engagement campaigns.`}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Customer Acquisition vs Retention & Regional Penetration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Customer Acquisition vs. Retention"
          subtitle="Unique email address analysis for repeat cart conversions"
        >
          <CategoryDonutChart
            data={metrics.newVsReturningSplit}
            centerLabel="Total Buyers"
            centerValue={metrics.totalCustomers.toLocaleString()}
          />
        </Card>

        <Card
          title="Macro Market Penetration"
          subtitle="Geographic concentration and revenue contribution"
        >
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-zinc-300">
                  Primary Market ({metrics.topMarketName})
                </span>
                <span className="font-mono text-purple-400">
                  {activeCurrency}{metrics.topMarketRevenue.toLocaleString()} ({metrics.topMarketShare}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-obsidian-800 overflow-hidden border border-obsidian-700">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, metrics.topMarketShare)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="p-3 rounded-xl bg-obsidian-850 border border-obsidian-750">
                <span className="text-[11px] text-zinc-400 block">Total Customers</span>
                <span className="text-lg font-bold text-zinc-100 font-mono">{metrics.totalCustomers}</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-850 border border-obsidian-750">
                <span className="text-[11px] text-zinc-400 block">Repeat Rate</span>
                <span className="text-lg font-bold text-purple-400 font-mono">{metrics.retentionRate}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
