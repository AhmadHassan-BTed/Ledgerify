import React from 'react';
import { GitCompare, ArrowRightLeft, TrendingUp, TrendingDown, Layers, FileSpreadsheet } from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useData } from '../../context/DataContext';
import { useFilters } from '../../context/FilterContext';
import { Card } from '../ui/Card';
import { ComparisonLineChart } from '../charts/ComparisonLineChart';

export const CompareView: React.FC = () => {
  const { compareService } = useServices();
  const {
    datasets,
    activeDatasetId,
    setActiveDatasetId,
    secondaryDatasetId,
    setSecondaryDatasetId,
    loadBothAndCompare
  } = useData();

  const { filteredOrders, secondaryFilteredOrders, activeCurrency, secondaryCurrency } = useFilters();

  const datasetA = datasets.find(d => d.id === activeDatasetId) || datasets[0];
  const datasetB = datasets.find(d => d.id === secondaryDatasetId) || datasets[1] || datasets[0];

  if (datasets.length < 2) {
    return (
      <div className="py-16 px-4 text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 mx-auto">
          <GitCompare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-zinc-100">
          Comparative Analysis Requires 2 Datasets
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Upload another Shopify Excel workbook (e.g. US Orders vs UK Orders), or instantly load both sample workbooks to activate side-by-side benchmark comparison.
        </p>
        <button
          type="button"
          onClick={() => loadBothAndCompare()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-glow-purple transition-all"
        >
          <GitCompare className="w-4 h-4" />
          <span>Load Both UK &amp; US Samples Now</span>
        </button>
      </div>
    );
  }

  const comparison = compareService.compareDatasets(
    datasetA,
    datasetB,
    filteredOrders.length > 0 ? filteredOrders : datasetA.orders,
    secondaryFilteredOrders.length > 0 ? secondaryFilteredOrders : datasetB.orders
  );

  return (
    <div className="space-y-6">
      {/* Title & Selectors */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
            Multi-Dataset Comparative Benchmarks
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Side-by-side metric variances, delta calculations, and overlay trajectories between two workbooks.
          </p>
        </div>

        {/* Dataset Choosers */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-obsidian-900 border border-obsidian-800 rounded-2xl">
          <div className="flex items-center gap-1.5 px-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-[11px] text-zinc-400">Dataset A:</span>
            <select
              value={datasetA.id}
              onChange={(e) => setActiveDatasetId(e.target.value)}
              className="bg-obsidian-850 text-xs text-zinc-200 border border-obsidian-700 rounded-lg px-2 py-1 focus:outline-none"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.currency})</option>
              ))}
            </select>
          </div>

          <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500 hidden sm:block" />

          <div className="flex items-center gap-1.5 px-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-[11px] text-zinc-400">Dataset B:</span>
            <select
              value={datasetB.id}
              onChange={(e) => setSecondaryDatasetId(e.target.value)}
              className="bg-obsidian-850 text-xs text-zinc-200 border border-obsidian-700 rounded-lg px-2 py-1 focus:outline-none"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.currency})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Delta Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-obsidian-900 border border-obsidian-750 flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-medium">Revenue Delta</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-100">
              {comparison.revenueDeltaPercent >= 0 ? '+' : ''}{comparison.revenueDeltaPercent}%
            </span>
            <span className={`text-xs font-semibold ${comparison.revenueDeltaPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              vs {datasetA.name}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-2 truncate">
            {activeCurrency}{comparison.sideBySideRows[0]?.valueA} vs {secondaryCurrency}{comparison.sideBySideRows[0]?.valueB}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-obsidian-900 border border-obsidian-750 flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-medium">AOV Delta</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-100">
              {comparison.aovDeltaPercent >= 0 ? '+' : ''}{comparison.aovDeltaPercent}%
            </span>
            <span className={`text-xs font-semibold ${comparison.aovDeltaPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              per cart
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-2">
            Basket size shift
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-obsidian-900 border border-obsidian-750 flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-medium">Order Volume Shift</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-100">
              {comparison.ordersDeltaPercent >= 0 ? '+' : ''}{comparison.ordersDeltaPercent}%
            </span>
            <span className="text-xs text-purple-400 font-semibold">
              shipments
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-2">
            Volume variance
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-obsidian-900 border border-obsidian-750 flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-medium">Retention Delta</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-100">
              {comparison.retentionDeltaPercent >= 0 ? '+' : ''}{comparison.retentionDeltaPercent}%
            </span>
            <span className="text-xs text-cyan-400 font-semibold">
              repeat rate
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-2">
            Loyalty differential
          </span>
        </div>
      </div>

      {/* Multi-Series Overlay Chart */}
      <Card
        title={`Comparative Revenue Trajectory (${datasetA.name} vs ${datasetB.name})`}
        subtitle="Plotted across concurrent monthly periods"
        action={
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-zinc-300">{datasetA.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-zinc-300">{datasetB.name}</span>
            </div>
          </div>
        }
      >
        <ComparisonLineChart
          data={comparison.monthlyOverlay}
          nameA={datasetA.name}
          nameB={datasetB.name}
          currA={activeCurrency}
          currB={secondaryCurrency}
        />
      </Card>

      {/* Side-by-Side Metrics Table */}
      <Card
        title="Side-by-Side Metric Matrix & Variance Table"
        subtitle="Line-item benchmark comparison between the two selected datasets"
      >
        <div className="overflow-x-auto rounded-xl border border-obsidian-750">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-obsidian-750 bg-obsidian-850/80 text-zinc-400">
                <th className="py-3 px-4 font-semibold">Benchmark Dimension</th>
                <th className="py-3 px-4 font-semibold text-purple-300">{datasetA.name}</th>
                <th className="py-3 px-4 font-semibold text-cyan-300">{datasetB.name}</th>
                <th className="py-3 px-4 font-semibold text-right">Variance / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800 text-zinc-300">
              {comparison.sideBySideRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-obsidian-850/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-zinc-200">{row.metric}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-zinc-300">{row.valueA}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-zinc-300">{row.valueB}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono font-bold text-xs ${
                        row.isPositive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {row.diff}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
