import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Globe,
  Crown,
  Sparkles,
  ArrowUpRight,
  ShoppingBag,
  CheckCircle2,
  Clock,
  UserCheck,
  UserPlus,
  BarChart3,
  GitCompare
} from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { RadialGauge } from '../ui/RadialGauge';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { RevenueLineChart } from '../charts/RevenueLineChart';
import { ComparisonLineChart } from '../charts/ComparisonLineChart';
import { TopCustomerItem } from '../../types/analytics';
import { formatDatasetTitle } from '../../utils/datasetTitle';
import { StatisticalEngine } from '../../core/math/statisticalEngine';

export const ExecutiveView: React.FC = () => {
  const { executiveService, financeService, compareService } = useServices();
  const {
    filteredOrders,
    secondaryFilteredOrders,
    activeCurrency,
    secondaryCurrency,
    filters,
    setSelectedMonth,
    availableMonths
  } = useFilters();
  const {
    activeDataset,
    secondaryDataset,
    isCompareEnabled,
    openDrillDown
  } = useData();

  const titleA = formatDatasetTitle(activeDataset?.name || '', activeDataset?.region);
  const titleB = secondaryDataset ? formatDatasetTitle(secondaryDataset.name, secondaryDataset.region) : '';

  const metricsA = executiveService.calculateMetrics(filteredOrders);
  const finMetricsA = financeService.calculateMetrics(filteredOrders);

  const metricsB = isCompareEnabled && secondaryDataset
    ? executiveService.calculateMetrics(secondaryFilteredOrders)
    : null;

  const comparison = isCompareEnabled && secondaryDataset
    ? compareService.compareDatasets(activeDataset!, secondaryDataset, filteredOrders, secondaryFilteredOrders)
    : null;

  // Cohort economics calculation for balanced right-card height
  const repeatCustomerEmails = new Set(
    metricsA.topCustomers.filter(c => c.orderCount > 1).map(c => c.email.toLowerCase())
  );
  const repeatOrders = filteredOrders.filter(o => repeatCustomerEmails.has((o.email || '').toLowerCase()));
  const firstTimeOrders = filteredOrders.filter(o => !repeatCustomerEmails.has((o.email || '').toLowerCase()));

  const repeatRevenue = repeatOrders.reduce((sum, o) => sum + o.orderValue, 0);
  const firstTimeRevenue = firstTimeOrders.reduce((sum, o) => sum + o.orderValue, 0);

  const repeatAov = repeatOrders.length > 0 ? Math.round(repeatRevenue / repeatOrders.length) : 0;
  const firstTimeAov = firstTimeOrders.length > 0 ? Math.round(firstTimeRevenue / firstTimeOrders.length) : 0;
  const aovLiftPercent = firstTimeAov > 0 ? Math.round(((repeatAov - firstTimeAov) / firstTimeAov) * 100) : 0;
  // Statistical Pacing & Regression Run-Rate
  const dailyTotals = React.useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach(o => {
      map.set(o.date, (map.get(o.date) || 0) + o.orderValue);
    });
    return Array.from(map.values());
  }, [filteredOrders]);

  const pacing = React.useMemo(() => {
    return StatisticalEngine.projectMonthEndPacing(
      dailyTotals,
      filters.selectedMonth !== 'all' ? filters.selectedMonth : undefined
    );
  }, [dailyTotals, filters.selectedMonth]);

  const dailyRunRate = pacing.runRate;
  const projectedMonthEnd = pacing.projectedTotal;
  const remainingGap = Math.max(0, metricsA.monthlyTarget - metricsA.totalRevenue);

  const handleCustomerClick = (customer: TopCustomerItem) => {
    openDrillDown({
      type: 'customer',
      title: `${customer.name} (VIP Dossier)`,
      subtitle: `${customer.email} · Customer since ${customer.firstOrderDate}`,
      badge: customer.statusBadge,
      summaryStats: [
        { label: 'Lifetime Spend', value: `${activeCurrency}${customer.totalSpend.toLocaleString()}` },
        { label: 'Total Orders', value: customer.orderCount },
        { label: 'Avg Basket Value', value: `${activeCurrency}${Math.round(customer.totalSpend / customer.orderCount).toLocaleString()}` },
        { label: 'Loyalty Tier', value: customer.status }
      ],
      orders: customer.orders
    });
  };

  const handleCategoryClick = (categoryName: string) => {
    const categoryOrders = filteredOrders.filter(o =>
      (o.categoryQuantities && o.categoryQuantities[categoryName] > 0) ||
      (o.categoryAmounts && o.categoryAmounts[categoryName] > 0) ||
      (o.fragrancesRaw && o.fragrancesRaw.toLowerCase().includes(categoryName.toLowerCase()))
    );

    const totalCatRevenue = categoryOrders.reduce((sum, o) => sum + (o.categoryAmounts?.[categoryName] || o.orderValue), 0);
    const totalCatUnits = categoryOrders.reduce((sum, o) => sum + (o.categoryQuantities?.[categoryName] || 1), 0);

    openDrillDown({
      type: 'category',
      title: `${categoryName} Product Format Breakdown`,
      subtitle: `Analyzed across ${categoryOrders.length} orders in ${activeDataset?.name}`,
      badge: `${activeCurrency}${Math.round(totalCatRevenue).toLocaleString()}`,
      summaryStats: [
        { label: 'Category Revenue', value: `${activeCurrency}${Math.round(totalCatRevenue).toLocaleString()}` },
        { label: 'Physical Units Sold', value: totalCatUnits.toLocaleString() },
        { label: 'Associated Orders', value: categoryOrders.length.toLocaleString() },
        { label: 'Avg Item Yield', value: `${activeCurrency}${Math.round(totalCatRevenue / Math.max(1, totalCatUnits))}` }
      ],
      orders: categoryOrders
    });
  };

  const handleCohortDrillDown = (cohortType: 'new' | 'repeat') => {
    const isRepeat = cohortType === 'repeat';
    const orders = isRepeat ? repeatOrders : firstTimeOrders;
    const title = isRepeat ? 'Repeat & Loyal Customer Cohort' : 'First-Time Customer Acquisition Cohort';
    const subtitle = `${orders.length} orders from ${isRepeat ? metricsA.returningCustomers : (metricsA.totalCustomers - metricsA.returningCustomers)} buyers`;

    openDrillDown({
      type: 'customer',
      title,
      subtitle,
      badge: `${orders.length} orders`,
      summaryStats: [
        { label: 'Cohort Orders', value: orders.length },
        { label: 'Total Cohort Sales', value: `${activeCurrency}${Math.round(isRepeat ? repeatRevenue : firstTimeRevenue).toLocaleString()}` },
        { label: 'Average Order Value', value: `${activeCurrency}${isRepeat ? repeatAov : firstTimeAov}` },
        { label: 'Revenue Contribution', value: `${isRepeat ? Math.round((repeatRevenue / Math.max(1, metricsA.totalRevenue)) * 100) : Math.round((firstTimeRevenue / Math.max(1, metricsA.totalRevenue)) * 100)}%` }
      ],
      orders
    });
  };

  const handleRevenueTrajectoryClick = () => {
    openDrillDown({
      type: 'revenue',
      title: 'Revenue Trajectory & Daily Cash Flow Ledger',
      subtitle: `Analyzed over ${finMetricsA.dailyRevenueSeries.length} active sales days in ${activeDataset?.name}`,
      badge: `${activeCurrency}${Math.round(metricsA.totalRevenue).toLocaleString()}`,
      summaryStats: [
        { label: 'Total Period Inflow', value: `${activeCurrency}${Math.round(metricsA.totalRevenue).toLocaleString()}` },
        { label: 'Active Trading Days', value: finMetricsA.dailyRevenueSeries.length },
        { label: 'Average Daily Inflow', value: `${activeCurrency}${dailyRunRate.toLocaleString()}` },
        { label: 'MoM Growth', value: `+${metricsA.momRevenueGrowth}%` }
      ],
      orders: filteredOrders
    });
  };

  const handleTargetTrackerClick = () => {
    openDrillDown({
      type: 'target',
      title: 'Monthly Benchmark Target & Pacing Analysis',
      subtitle: `Target progress: ${metricsA.targetProgressPercent}% of ${activeCurrency}${metricsA.monthlyTarget.toLocaleString()}`,
      badge: `${metricsA.targetProgressPercent}% Achieved`,
      summaryStats: [
        { label: 'Benchmark Target', value: `${activeCurrency}${metricsA.monthlyTarget.toLocaleString()}` },
        { label: 'Achieved Sales', value: `${activeCurrency}${Math.round(metricsA.totalRevenue).toLocaleString()}` },
        { label: 'Remaining Gap', value: remainingGap > 0 ? `${activeCurrency}${remainingGap.toLocaleString()}` : 'Achieved' },
        { label: 'Forecasted Finish', value: `${activeCurrency}${projectedMonthEnd.toLocaleString()}` }
      ],
      orders: filteredOrders
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Comparison Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              Executive Overview
            </h2>
            {isCompareEnabled && secondaryDataset && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-role text-white shadow-sm">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparing: {titleA} vs {titleB}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Real-time business performance, customer lifetime value leaderboards, and target pacing.
          </p>
        </div>

        {/* Explicit Container Action */}
        <button
          type="button"
          onClick={() => {
            openDrillDown({
              type: 'orders',
              title: 'Full Ledger Transaction Register',
              subtitle: `Audited record across all ${filteredOrders.length} transactions in ${titleA}`,
              badge: `${filteredOrders.length} Transactions`,
              summaryStats: [
                { label: 'Total Sales', value: `${activeCurrency}${Math.round(metricsA.totalRevenue).toLocaleString()}` },
                { label: 'Orders Sampled', value: filteredOrders.length },
                { label: 'Unique Buyers', value: metricsA.totalCustomers },
                { label: 'Average Basket', value: `${activeCurrency}${Math.round(metricsA.totalRevenue / Math.max(1, filteredOrders.length))}` }
              ],
              orders: filteredOrders
            });
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-850 dark:hover:bg-obsidian-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-750 transition-colors shadow-sm self-start sm:self-center"
        >
          <BarChart3 className="w-3.5 h-3.5 text-role" />
          <span>Inspect Full Ledger Register ({filteredOrders.length})</span>
        </button>
      </div>

      {/* Top Level Big KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Net Revenue"
          value={metricsA.totalRevenue}
          currencyPrefix={activeCurrency}
          trend={isCompareEnabled && comparison ? comparison.revenueDeltaPercent : (metricsA.hasMomComparison ? metricsA.momRevenueGrowth : undefined)}
          trendLabel={isCompareEnabled && metricsB ? `vs ${titleB}` : (metricsA.hasMomComparison ? `vs ${metricsA.prevMonthLabel}` : "Gross ledger revenue")}
          subValue={isCompareEnabled && metricsB ? `vs ${titleB}: ${secondaryCurrency}${metricsB.totalRevenue.toLocaleString()}` : (metricsA.hasMomComparison ? undefined : `${filteredOrders.length} transactions`)}
          icon={<DollarSign className="w-4 h-4" />}
          insightHint="The real money earned from sales after deducting returns and cancellations."
        />
        <KpiCard
          title="Customer Retention Rate"
          value={`${metricsA.retentionRate}%`}
          trend={isCompareEnabled && comparison ? comparison.retentionDeltaPercent : undefined}
          trendLabel={isCompareEnabled && metricsB ? `vs ${titleB}` : undefined}
          subValue={isCompareEnabled && metricsB ? `vs ${titleB}: ${metricsB.retentionRate}% (${metricsB.returningCustomers} buyers)` : `${metricsA.returningCustomers} repeat buyers of ${metricsA.totalCustomers}`}
          icon={<Users className="w-4 h-4" />}
          insightHint="The percentage of customers who came back to place 2 or more orders with your brand."
          onClick={() => handleCohortDrillDown('repeat')}
        />
        <KpiCard
          title="Order Volume"
          value={`${filteredOrders.length} orders`}
          trend={isCompareEnabled && comparison ? comparison.ordersDeltaPercent : (metricsA.hasMomComparison ? metricsA.momVolumeGrowth : undefined)}
          trendLabel={isCompareEnabled && metricsB ? `vs ${titleB}` : (metricsA.hasMomComparison ? `vs ${metricsA.prevMonthLabel}` : "Total shipments")}
          subValue={isCompareEnabled && metricsB ? `vs ${titleB}: ${secondaryFilteredOrders.length} orders` : (metricsA.hasMomComparison ? undefined : "All processed parcels")}
          icon={<TrendingUp className="w-4 h-4" />}
          insightHint="The total count of orders successfully processed in this filtered timeframe."
        />
        <KpiCard
          title="Target Attainment"
          value={`${metricsA.targetProgressPercent}%`}
          subValue={isCompareEnabled && metricsB ? `vs ${titleB}: ${metricsB.targetProgressPercent}% pace` : `Target: ${activeCurrency}${metricsA.monthlyTarget.toLocaleString()}`}
          icon={<Target className="w-4 h-4" />}
          insightHint="How close your actual revenue is to hitting your monthly sales target milestone."
          onClick={handleTargetTrackerClick}
        />
      </div>

      {/* Main Analytical Section: Revenue Trajectory & Monthly Tracker */}
      {isCompareEnabled && comparison ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <Card
              className="h-full flex flex-col justify-between"
              title={`Comparative Trajectory (${activeDataset?.name} vs ${secondaryDataset?.name})`}
              subtitle="Dual overlay across monthly ledger periods"
              onClick={handleRevenueTrajectoryClick}
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

          <div className="lg:col-span-4 flex flex-col">
            <Card
              className="h-full flex flex-col justify-between"
              title="Target Pacing Comparison"
              subtitle="Side-by-side benchmark goals"
              onClick={handleTargetTrackerClick}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Revenue Trajectory Line Chart */}
          <div className="lg:col-span-8 flex flex-col">
            <Card
              className="h-full flex flex-col justify-between"
              title="Revenue Trajectory & Daily Momentum"
              subtitle="Real-time order value progression over time (click to inspect ledger)"
              onClick={handleRevenueTrajectoryClick}
              action={
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-obsidian-850 font-mono text-[11px] text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-obsidian-750">
                    Daily Avg: <strong className="text-slate-900 dark:text-zinc-100 font-bold">{activeCurrency}{dailyRunRate.toLocaleString()}</strong>
                  </span>
                </div>
              }
            >
              <div className="flex-1 min-h-[290px] flex flex-col justify-center">
                <RevenueLineChart
                  data={finMetricsA.dailyRevenueSeries}
                  currencySymbol={activeCurrency}
                />
              </div>

              {/* Trajectory Key Performance Strip */}
              <div className="grid grid-cols-3 gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-obsidian-800/80 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-850/60 border border-slate-100 dark:border-obsidian-750">
                  <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-zinc-500 block">Total Inflow</span>
                  <span className="font-extrabold font-mono text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
                    {activeCurrency}{metricsA.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-850/60 border border-slate-100 dark:border-obsidian-750">
                  <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-zinc-500 block">Active Days</span>
                  <span className="font-extrabold font-mono text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
                    {finMetricsA.dailyRevenueSeries.length} Days
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-850/60 border border-slate-100 dark:border-obsidian-750">
                  <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-zinc-500 block">Run-Rate Momentum</span>
                  <span className="font-extrabold font-mono text-role text-xs sm:text-sm">
                    +{metricsA.momRevenueGrowth}% MoM
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Monthly Target Tracker with Pacing Grid */}
          <div className="lg:col-span-4 flex flex-col">
            <Card
              className="h-full flex flex-col justify-between"
              title="Monthly Target Tracker"
              subtitle="Dynamic benchmark goal attainment (click to inspect)"
              onClick={handleTargetTrackerClick}
              action={
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  metricsA.targetProgressPercent >= 80
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : metricsA.targetProgressPercent >= 50
                    ? 'bg-role-subtle text-role border border-role-subtle'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {metricsA.targetProgressPercent >= 100 ? 'Target Hit' : 'In Progress'}
                </span>
              }
            >
              {/* Radial Pacing Gauge */}
              <div className="py-1">
                <RadialGauge
                  percent={metricsA.targetProgressPercent}
                  title="Goal Paced"
                  subtitle="Based on current monthly run-rate"
                  currentValue={`${activeCurrency}${metricsA.totalRevenue.toLocaleString()}`}
                  targetValue={`${activeCurrency}${metricsA.monthlyTarget.toLocaleString()}`}
                  size={195}
                />
              </div>

              {/* Target Milestone Breakdown & Run-Rate Stats */}
              <div className="space-y-3 pt-2">
                {/* 2x2 Pacing Metric Strip */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-850/70 border border-slate-100 dark:border-obsidian-750">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono block">Target Gap</span>
                    <span className="font-extrabold font-mono text-slate-900 dark:text-zinc-100 text-xs">
                      {remainingGap > 0 ? `${activeCurrency}${remainingGap.toLocaleString()}` : 'Achieved!'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-850/70 border border-slate-100 dark:border-obsidian-750">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono block">Forecasted Finish</span>
                    <span className="font-extrabold font-mono text-role text-xs">
                      {activeCurrency}{projectedMonthEnd.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Milestone Progress Bar */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-850/50 border border-slate-100 dark:border-obsidian-750/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500 dark:text-zinc-400 font-medium">Attainment Progress</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">{metricsA.targetProgressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-obsidian-800 overflow-hidden">
                    <div
                      className="h-full bg-role rounded-full transition-all duration-500"
                      style={{ width: `${metricsA.targetProgressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 dark:text-zinc-500 pt-0.5">
                    <span>$0</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>{activeCurrency}{Math.round(metricsA.monthlyTarget / 1000)}k</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Top Stuff Showcase Row: Top VIP Customers Leaderboard & Acquisition vs Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Top VIP Customers Leaderboard */}
        <div className="lg:col-span-8 flex flex-col">
          <Card
            className="h-full flex flex-col justify-between"
            title="Top VIP Customers & Lifetime Spenders"
            subtitle="Click any customer to open their full order dossier and purchase history"
            action={
              <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-obsidian-850 border border-slate-200/80 dark:border-obsidian-750">
                {metricsA.totalCustomers} total buyers
              </span>
            }
          >
            <div className="divide-y divide-slate-100 dark:divide-obsidian-800/80 flex-1">
              {metricsA.topCustomers.slice(0, 6).map((c, idx) => (
                <div
                  key={c.email || idx}
                  onClick={() => handleCustomerClick(c)}
                  className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-obsidian-850/60 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Circular Avatar with Gradient & Initials */}
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${c.avatarColor} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                      {c.avatarInitials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-role transition-colors truncate">
                          {c.name}
                        </span>
                        {idx === 0 && (
                          <Crown className="w-3.5 h-3.5 text-role flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate block font-mono">
                        {c.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-extrabold font-mono text-slate-900 dark:text-zinc-100 block">
                        {activeCurrency}{c.totalSpend.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                        {c.orderCount} {c.orderCount === 1 ? 'order' : 'orders'}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.statusBadge === 'Achieved'
                        ? 'bg-role-subtle text-role border border-role-subtle'
                        : c.statusBadge === 'VIP'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800/80 dark:border-zinc-700 dark:text-zinc-400'
                    }`}>
                      {c.statusBadge}
                    </span>

                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-role group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom VIP summary bar */}
            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-obsidian-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span className="text-[11px]">
                Showing top 6 lifetime value accounts
              </span>
              <span className="text-[11px] font-mono font-semibold text-role">
                Top 6 Spend: {activeCurrency}{Math.round(metricsA.topCustomers.slice(0, 6).reduce((s, c) => s + c.totalSpend, 0)).toLocaleString()}
              </span>
            </div>
          </Card>
        </div>

        {/* Customer Acquisition vs Retention with Cohort Economics & Actions */}
        <div className="lg:col-span-4 flex flex-col">
          <Card
            className="h-full flex flex-col justify-between"
            title={isCompareEnabled && secondaryDataset ? `Customer Split (${activeDataset?.name})` : "Acquisition vs. Retention"}
            subtitle="Click slice or quick-buttons to view cohort dossier"
            action={
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-role-subtle text-role border border-role-subtle font-mono">
                {metricsA.retentionRate}% Repeat
              </span>
            }
          >
            {/* Donut Chart */}
            <div className="py-1">
              <CategoryDonutChart
                data={metricsA.newVsReturningSplit}
                centerLabel="Total Buyers"
                centerValue={metricsA.totalCustomers.toLocaleString()}
                onSliceClick={(name) => {
                  const isRepeat = name.includes('Repeat') || name.includes('Loyal');
                  handleCohortDrillDown(isRepeat ? 'repeat' : 'new');
                }}
              />
            </div>

            {/* Cohort Economic Insight Grid */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* First-Time Buyers */}
                <div
                  onClick={() => handleCohortDrillDown('new')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-850/70 border border-slate-100 dark:border-obsidian-750 hover:border-role/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 mb-0.5">
                    <UserPlus className="w-3.5 h-3.5 text-role" />
                    <span className="text-[10px] uppercase font-mono font-semibold">New AOV</span>
                  </div>
                  <span className="font-extrabold font-mono text-slate-900 dark:text-zinc-100 text-xs">
                    {activeCurrency}{firstTimeAov}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-mono">
                    {metricsA.totalCustomers - metricsA.returningCustomers} buyers
                  </span>
                </div>

                {/* Repeat Buyers */}
                <div
                  onClick={() => handleCohortDrillDown('repeat')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-850/70 border border-slate-100 dark:border-obsidian-750 hover:border-role/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 mb-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] uppercase font-mono font-semibold">Repeat AOV</span>
                  </div>
                  <span className="font-extrabold font-mono text-role text-xs">
                    {activeCurrency}{repeatAov}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-mono font-semibold">
                    +{aovLiftPercent}% higher yield
                  </span>
                </div>
              </div>

              {/* Quick Cohort Drilldown Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCohortDrillDown('new')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-800 dark:hover:bg-obsidian-750 border border-slate-200 dark:border-obsidian-700 text-[11px] font-semibold text-slate-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-role" />
                  <span>New ({metricsA.totalCustomers - metricsA.returningCustomers})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCohortDrillDown('repeat')}
                  className="px-2.5 py-1.5 rounded-xl bg-role/10 hover:bg-role/20 text-role border border-role/30 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-role" />
                  <span>Repeat ({metricsA.returningCustomers})</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Top Fragrances Summary Showcase */}
      {metricsA.topFragrancesSummary.length > 0 && (
        <Card
          title="Top Revenue Fragrances & Product Velocity"
          subtitle="Click format slice to explore line-item order details and customer carts"
          action={
            <span className="text-xs font-mono text-slate-400 dark:text-zinc-500 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-obsidian-850 border border-slate-200/80 dark:border-obsidian-750">
              {metricsA.topFragrancesSummary.length} Bestsellers
            </span>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
            {metricsA.topFragrancesSummary.map((f, i) => (
              <div
                key={f.name}
                onClick={() => handleCategoryClick(f.name)}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-obsidian-850/80 border border-slate-200/80 dark:border-obsidian-750 hover:border-role/70 transition-all cursor-pointer group flex flex-col justify-between h-full hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-slate-400 dark:text-zinc-500 font-bold">#{i + 1}</span>
                    <ShoppingBag className="w-3.5 h-3.5 text-role group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-role transition-colors truncate">
                    {f.name}
                  </h4>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-obsidian-800 flex items-baseline justify-between text-xs font-mono">
                  <span className="text-role font-bold">{f.unitsSold} units</span>
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">
                    {activeCurrency}{Math.round(f.revenue).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

