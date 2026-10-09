import React from 'react';
import { Sparkles, Camera, Wand2, Star, Crown, Zap, GitCompare } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useData } from '../../context/DataContext';
import { useFilters } from '../../context/FilterContext';
import { Card } from '../ui/Card';
import { TagCloud } from '../ui/TagCloud';

import { formatDatasetTitle } from '../../utils/datasetTitle';

export const CreativeView: React.FC = () => {
  const { creativeService } = useServices();
  const { activeDataset, secondaryDataset, isCompareEnabled, openDrillDown } = useData();
  const { filteredOrders, secondaryFilteredOrders, activeCurrency, secondaryCurrency } = useFilters();

  const metricsA = creativeService.calculateMetrics(filteredOrders);
  const metricsB = isCompareEnabled && secondaryDataset
    ? creativeService.calculateMetrics(secondaryFilteredOrders.length > 0 ? secondaryFilteredOrders : secondaryDataset.orders)
    : null;

  const getBadgeIcon = (badge: string) => {
    if (badge.includes('Flagship') || badge.includes('Bestseller')) {
      return <Crown className="w-3.5 h-3.5 text-amber-500" />;
    }
    if (badge.includes('Momentum')) {
      return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
  };

  const handleHeroDrillDown = (productName: string, units: number, revenue: number, datasetName?: string, curr = activeCurrency) => {
    const matchingOrders = filteredOrders.filter(o =>
      o.fragrancesParsed?.some(f => f.name.toLowerCase().includes(productName.toLowerCase())) ||
      o.fragrancesRaw.toLowerCase().includes(productName.toLowerCase())
    );
    openDrillDown({
      type: 'fragrance',
      title: `Hero Product Shoot Focus: ${productName}`,
      subtitle: `Commercial asset priority based on ${units} units sold (${datasetName || activeDataset?.name})`,
      badge: `${curr}${Math.round(revenue).toLocaleString()}`,
      summaryStats: [
        { label: 'Hero Fragrance', value: productName },
        { label: 'Units Sold', value: units },
        { label: 'Estimated Revenue', value: `${curr}${Math.round(revenue).toLocaleString()}` },
        { label: 'Associated Orders', value: matchingOrders.length }
      ],
      orders: matchingOrders.length > 0 ? matchingOrders : filteredOrders
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Compare Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              Creative Direction &amp; Visual Asset Studio
            </h2>
            {isCompareEnabled && secondaryDataset && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-role text-white shadow-sm">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparing: {activeDataset?.name} vs {secondaryDataset.name}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Identifies hero products for product photography, ad campaign hooks, and packaging design focus.
          </p>
        </div>
      </div>

      {/* Hero Product Highlight Banner(s) */}
      {isCompareEnabled && metricsB ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Dataset A Hero Banner */}
          <div
            onClick={() => handleHeroDrillDown(metricsA.heroProduct.name, metricsA.heroProduct.unitsSold, metricsA.heroProduct.revenue, activeDataset?.name, activeCurrency)}
            className="cursor-pointer relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-role/15 via-white dark:via-obsidian-900 to-slate-100 dark:to-obsidian-950 border border-role-subtle shadow-role-glow hover:border-role transition-all duration-300 group"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-role text-white">
                {formatDatasetTitle(activeDataset?.name || '', activeDataset?.region)}
              </span>
              <span className="text-xs font-semibold text-role inline-flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Studio Focus #1
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-role transition-colors">
              {metricsA.heroProduct.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">
              <span className="text-role font-bold font-mono">{metricsA.heroProduct.unitsSold} units</span> ({metricsA.heroProduct.sharePercentage}% share) · Est. {activeCurrency}{metricsA.heroProduct.revenue.toLocaleString()}
            </p>
          </div>

          {/* Dataset B Hero Banner */}
          <div
            onClick={() => handleHeroDrillDown(metricsB.heroProduct.name, metricsB.heroProduct.unitsSold, metricsB.heroProduct.revenue, secondaryDataset?.name, secondaryCurrency)}
            className="cursor-pointer relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-cyan-500/15 via-white dark:via-obsidian-900 to-slate-100 dark:to-obsidian-950 border border-cyan-500/30 shadow-sm hover:border-cyan-500 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500 text-white">
                {formatDatasetTitle(secondaryDataset?.name || '', secondaryDataset?.region)}
              </span>
              <span className="text-xs font-semibold text-cyan-500 inline-flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Studio Focus #1
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-cyan-400 transition-colors">
              {metricsB.heroProduct.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">
              <span className="text-cyan-500 font-bold font-mono">{metricsB.heroProduct.unitsSold} units</span> ({metricsB.heroProduct.sharePercentage}% share) · Est. {secondaryCurrency}{metricsB.heroProduct.revenue.toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div
          onClick={() => handleHeroDrillDown(metricsA.heroProduct.name, metricsA.heroProduct.unitsSold, metricsA.heroProduct.revenue, activeDataset?.name, activeCurrency)}
          className="cursor-pointer relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-role/15 via-white dark:via-obsidian-900 to-slate-100 dark:to-obsidian-950 border border-role-subtle shadow-role-glow hover:border-role transition-all duration-300 group"
        >
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{ backgroundColor: 'rgba(var(--role-rgb), 0.2)' }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-role-subtle text-role border border-role-subtle">
                <Sparkles className="w-3.5 h-3.5 text-role" />
                <span>Recommended Hero Shoot Subject</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-role transition-colors">
                {metricsA.heroProduct.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                Leading sales velocity with <span className="text-role font-bold font-mono">{metricsA.heroProduct.unitsSold} units</span> sold ({metricsA.heroProduct.sharePercentage}% market share). Feature this fragrance as the anchor bottle in 1080x1350 editorial ad placements and hero homepage carousels. Click to view order register.
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full md:w-auto justify-between sm:justify-start">
              <div className="p-4 rounded-2xl bg-white/90 dark:bg-obsidian-900/90 border border-slate-200 dark:border-obsidian-750 text-right min-w-[150px] shadow-sm">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Est. Revenue</span>
                <span className="text-xl font-bold font-mono text-role">
                  {activeCurrency}{metricsA.heroProduct.revenue.toLocaleString()}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-role-subtle text-role border border-role-subtle text-xs font-semibold">
                <Camera className="w-4 h-4" />
                <span>Studio Priority #1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Product Creative Showcase Cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-role" />
          <span>Top 3 Showcase — Creative Angles &amp; Visual Directives</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metricsA.showcaseProducts.map((p) => (
            <div
              key={p.name}
              onClick={() => handleHeroDrillDown(p.name, p.unitsSold, p.revenue, activeDataset?.name, activeCurrency)}
              className="cursor-pointer bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 hover:border-role/50 hover:-translate-y-0.5 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-role-subtle border border-role-subtle text-role">
                    {getBadgeIcon(p.badge)}
                    <span>{p.badge}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400">
                    Rank #{p.rank}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-slate-900 dark:text-zinc-100 group-hover:text-role transition-colors">
                  {p.name}
                </h4>

                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="font-mono text-role font-semibold">{p.unitsSold} units sold</span>
                  <span>·</span>
                  <span className="font-mono">{activeCurrency}{p.revenue.toLocaleString()}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-obsidian-800 space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider block mb-0.5">
                      Lighting &amp; Atmosphere Hook
                    </span>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-snug">
                      {p.visualHook}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider block mb-0.5">
                      Recommended Asset Format
                    </span>
                    <p className="text-xs text-role leading-snug font-mono">
                      {p.recommendedAsset}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns: Aesthetic Trends & Scent Word Cloud */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aesthetic Trends: Sets vs Bottles */}
        <Card
          title="Packaging Focus: Trio Gift Sets vs. Solo Bottles"
          subtitle="Determines whether ad creatives should focus on multi-bottle sets or individual bottles"
        >
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-700 dark:text-zinc-300 font-medium">
                  Solo Bottles ({metricsA.trioVsBottleRatio.bottlePercent}%)
                </span>
                <span className="text-role font-medium">
                  Trio &amp; Discovery Sets ({metricsA.trioVsBottleRatio.trioPercent}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-obsidian-800 overflow-hidden border border-slate-200 dark:border-obsidian-750 flex">
                <div
                  className="h-full bg-role"
                  style={{ width: `${metricsA.trioVsBottleRatio.bottlePercent}%` }}
                />
                <div
                  className="h-full bg-pink-500"
                  style={{ width: `${metricsA.trioVsBottleRatio.trioPercent}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/70 dark:border-obsidian-750 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-zinc-100 block mb-1 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-role" /> Creative Directive
              </span>
              {metricsA.trioVsBottleRatio.note}
            </div>
          </div>
        </Card>

        {/* Word Cloud of Fragrances */}
        <Card
          title="Fragrance Trend Word Cloud"
          subtitle="Scaled pill weights representing real customer cart demand"
        >
          <TagCloud tags={metricsA.fragranceWordCloud} />
        </Card>
      </div>
    </div>
  );
};
