import React from 'react';
import { Sparkles, Camera, Wand2, Star } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { Card } from '../ui/Card';
import { TagCloud } from '../ui/TagCloud';

export const CreativeView: React.FC = () => {
  const { creativeService } = useServices();
  const { filteredOrders, activeCurrency } = useFilters();

  const metrics = creativeService.calculateMetrics(filteredOrders);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
          Creative Direction &amp; Visual Asset Studio
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Identifies hero products for product photography, ad campaign hooks, and packaging design focus.
        </p>
      </div>

      {/* Hero Product Highlight Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-role/15 via-white dark:via-obsidian-900 to-slate-100 dark:to-obsidian-950 border border-role-subtle shadow-role-glow transition-all duration-300">
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
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {metrics.heroProduct.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
              Leading sales velocity with <span className="text-role font-bold font-mono">{metrics.heroProduct.unitsSold} units</span> sold ({metrics.heroProduct.sharePercentage}% market share). Feature this fragrance as the anchor bottle in 1080x1350 editorial ad placements and hero homepage carousels.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full md:w-auto justify-between sm:justify-start">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-obsidian-900/90 border border-slate-200 dark:border-obsidian-750 text-right min-w-[150px] shadow-sm">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Est. Revenue</span>
              <span className="text-xl font-bold font-mono text-role">
                {activeCurrency}{metrics.heroProduct.revenue.toLocaleString()}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-role-subtle text-role border border-role-subtle text-xs font-semibold">
              <Camera className="w-4 h-4" />
              <span>Studio Priority #1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Product Creative Showcase Cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-role" />
          <span>Top 3 Showcase — Creative Angles &amp; Visual Directives</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.showcaseProducts.map((p) => (
            <div
              key={p.name}
              className="bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 hover:border-role/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-role-subtle border border-role-subtle text-role">
                    {p.badge}
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
                  Solo Bottles ({metrics.trioVsBottleRatio.bottlePercent}%)
                </span>
                <span className="text-role font-medium">
                  Trio &amp; Discovery Sets ({metrics.trioVsBottleRatio.trioPercent}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-obsidian-800 overflow-hidden border border-slate-200 dark:border-obsidian-750 flex">
                <div
                  className="h-full bg-role"
                  style={{ width: `${metrics.trioVsBottleRatio.bottlePercent}%` }}
                />
                <div
                  className="h-full bg-pink-500"
                  style={{ width: `${metrics.trioVsBottleRatio.trioPercent}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/70 dark:border-obsidian-750 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-zinc-100 block mb-1 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-role" /> Creative Directive
              </span>
              {metrics.trioVsBottleRatio.note}
            </div>
          </div>
        </Card>

        {/* Word Cloud of Fragrances */}
        <Card
          title="Fragrance Trend Word Cloud"
          subtitle="Scaled pill weights representing real customer cart demand"
        >
          <TagCloud tags={metrics.fragranceWordCloud} />
        </Card>
      </div>
    </div>
  );
};
