import React from 'react';
import {
  GitCompare,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  ArrowRightLeft,
  Building2,
  DollarSign,
  Package,
  Users,
  Award,
  Check
} from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useData } from '../../context/DataContext';
import { useFilters } from '../../context/FilterContext';
import { Card } from '../ui/Card';
import { ComparisonLineChart, ComparisonSeriesConfig } from '../charts/ComparisonLineChart';
import { formatDatasetTitle, formatDatasetOptionLabel } from '../../utils/datasetTitle';

export const CompareView: React.FC = () => {
  const { compareService } = useServices();
  const {
    datasets,
    comparedDatasetIds,
    setComparedDatasetIds,
    addComparedDatasetId,
    removeComparedDatasetId,
    comparedDatasets,
    loadBothAndCompare,
    isLoading
  } = useData();

  const { filteredOrders, activeCurrency } = useFilters();

  // If less than 2 datasets uploaded, show onboarding to load samples or upload
  if (datasets.length < 2) {
    return (
      <div className="py-16 px-4 text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-role-subtle border border-role-subtle flex items-center justify-center text-role mx-auto shadow-role-glow">
          <GitCompare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
          Multi-Dataset Comparison Requires at Least 2 Workbooks
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
          Upload multiple Shopify Excel workbooks (e.g. UK Orders, US Orders, UAE Orders, EU Orders), or instantly load sample workbooks to compare unlimited ledgers side-by-side.
        </p>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => loadBothAndCompare()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-role text-white font-bold text-xs shadow-role-glow hover:opacity-90 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Load Sample Workbooks Now</span>
        </button>
      </div>
    );
  }

  // Active compared datasets list (ensuring at least 2 datasets are selected)
  const activeComparedList = comparedDatasets.length >= 2
    ? comparedDatasets
    : datasets.slice(0, Math.min(datasets.length, 2));

  // Compute multi-dataset metrics across all selected datasets
  const comparison = compareService.compareMultiDatasets(activeComparedList);

  const handleSlotDatasetChange = (index: number, newDatasetId: string) => {
    const currentIds = activeComparedList.map(d => d.id);
    currentIds[index] = newDatasetId;
    // Deduplicate while preserving slot position
    const uniqueIds = Array.from(new Set(currentIds));
    setComparedDatasetIds(uniqueIds);
  };

  const handleSetBaseline = (index: number) => {
    if (index === 0) return;
    const currentIds = [...activeComparedList.map(d => d.id)];
    const [selected] = currentIds.splice(index, 1);
    currentIds.unshift(selected); // Put at index 0
    setComparedDatasetIds(currentIds);
  };

  const handleSetCompareCount = (count: number) => {
    const clampedCount = Math.max(2, Math.min(count, datasets.length));
    const currentIds = activeComparedList.map(d => d.id);
    
    if (clampedCount > currentIds.length) {
      const needed = clampedCount - currentIds.length;
      const unselected = datasets.filter(d => !currentIds.includes(d.id));
      const newIds = [...currentIds, ...unselected.slice(0, needed).map(d => d.id)];
      setComparedDatasetIds(newIds);
    } else if (clampedCount < currentIds.length) {
      setComparedDatasetIds(currentIds.slice(0, clampedCount));
    }
  };

  const handleAddSlot = () => {
    const currentIds = activeComparedList.map(d => d.id);
    const available = datasets.find(d => !currentIds.includes(d.id));
    if (available) {
      addComparedDatasetId(available.id);
    }
  };

  const handleCompareAll = () => {
    setComparedDatasetIds(datasets.map(d => d.id));
  };

  const chartSeries: ComparisonSeriesConfig[] = comparison.summaries.map((s) => ({
    key: `revenue_${s.dataset.id}`,
    name: formatDatasetTitle(s.dataset.name, s.dataset.region),
    color: s.color,
    currency: s.currency
  }));

  const getGridColsClass = (count: number) => {
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  };

  return (
    <div className="space-y-6">
      {/* Title & Multi-Dataset Comparison Selector Bar */}
      <div className="p-5 rounded-3xl bg-white/95 dark:bg-obsidian-900/90 border border-slate-200 dark:border-obsidian-750 backdrop-blur-xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-role text-white flex items-center justify-center font-bold text-xs shadow-role-glow">
                <GitCompare className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                Multi-Dataset Comparison Matrix
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-role-subtle text-role border border-role-subtle">
                {activeComparedList.length} Datasets Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Set how many files to compare ({datasets.length} available), assign workbooks to slots, and designate any dataset as the reference Baseline.
            </p>
          </div>

          {/* Quick Count Selector & Add Slot Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-obsidian-850 rounded-2xl border border-slate-200 dark:border-obsidian-750 text-xs">
              <span className="px-2 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                Compare Count:
              </span>
              {[2, 3, 4].map(num => {
                const isPossible = datasets.length >= num;
                const isSelected = activeComparedList.length === num;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={!isPossible}
                    onClick={() => handleSetCompareCount(num)}
                    className={`px-2.5 py-1 rounded-xl font-bold font-mono transition-all ${
                      isSelected
                        ? 'bg-role text-white shadow-role-glow'
                        : isPossible
                        ? 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-obsidian-750'
                        : 'text-slate-300 dark:text-zinc-700 cursor-not-allowed'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}

              {datasets.length > 4 && (
                <button
                  type="button"
                  onClick={handleCompareAll}
                  className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all ${
                    activeComparedList.length === datasets.length
                      ? 'bg-role text-white shadow-role-glow'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-obsidian-750'
                  }`}
                >
                  All ({datasets.length})
                </button>
              )}
            </div>

            {activeComparedList.length < datasets.length && (
              <button
                type="button"
                onClick={handleAddSlot}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-role-subtle hover:opacity-90 text-role border border-role-subtle text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slot</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Slots Grid */}
        <div className="pt-2 border-t border-slate-100 dark:border-obsidian-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeComparedList.map((d, idx) => {
              const isBaseline = idx === 0;
              const color = comparison.summaries[idx]?.color || '#3b82f6';
              const formattedName = formatDatasetTitle(d.name, d.region);

              return (
                <div
                  key={d.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                    isBaseline
                      ? 'bg-role-subtle/20 border-role shadow-sm'
                      : 'bg-slate-50/80 dark:bg-obsidian-850/70 border-slate-200/80 dark:border-obsidian-750'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-bold font-mono text-slate-800 dark:text-zinc-200">
                        {isBaseline ? 'Baseline (Slot 1)' : `Slot ${idx + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isBaseline && (
                        <button
                          type="button"
                          onClick={() => handleSetBaseline(idx)}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-obsidian-750 hover:bg-role hover:text-white text-slate-700 dark:text-zinc-300 transition-colors"
                          title="Designate this slot as the reference baseline"
                        >
                          Make Baseline
                        </button>
                      )}
                      {activeComparedList.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeComparedDatasetId(d.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                          title="Remove slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dataset Selector for this slot */}
                  <select
                    value={d.id}
                    onChange={(e) => handleSlotDatasetChange(idx, e.target.value)}
                    className="w-full bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl px-2.5 py-1.5 font-semibold text-xs text-slate-900 dark:text-zinc-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-role truncate"
                  >
                    {datasets.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {formatDatasetOptionLabel(opt.name, opt.region, opt.currency)}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multi-Dataset Scorecards Grid */}
      <div className={`grid ${getGridColsClass(activeComparedList.length)} gap-4`}>
        {comparison.summaries.map((sum, i) => {
          const formattedTitle = formatDatasetTitle(sum.dataset.name, sum.dataset.region);
          return (
            <div
              key={sum.dataset.id}
              className="p-5 rounded-3xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-slate-300 dark:hover:border-obsidian-600 transition-all"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: sum.color }}
              />

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-100 dark:bg-obsidian-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-700">
                    {i === 0 ? 'Baseline (Slot 1)' : `Slot ${i + 1}`}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-zinc-500">
                    {sum.currency}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 truncate">
                  {formattedTitle}
                </h3>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-900 dark:text-white">
                    {sum.currency}{Math.round(sum.totalRevenue).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-obsidian-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase block">Orders</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                    {sum.totalOrders}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase block">AOV</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                    {sum.currency}{sum.aov.toFixed(0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase block">Retention</span>
                  <span className="font-mono font-bold text-role">
                    {sum.retentionRate}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Line Revenue Trajectory Overlay Chart */}
      <Card
        title={`Multi-Ledger Comparative Trajectory (${activeComparedList.map(d => formatDatasetTitle(d.name, d.region)).join(' vs ')})`}
        subtitle="Dynamic multi-series revenue overlay across concurrent monthly periods"
      >
        <ComparisonLineChart
          data={comparison.monthlyOverlay}
          series={chartSeries}
        />
      </Card>

      {/* Multi-Dataset Side-by-Side Variance Table */}
      <Card
        title="Multi-Dataset Metric Matrix &amp; Variance Table"
        subtitle="Side-by-side metric comparison calculating variance against Slot 1 Baseline"
      >
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-obsidian-750">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-obsidian-750 bg-slate-50 dark:bg-obsidian-850/80 text-slate-600 dark:text-zinc-400">
                <th className="py-3 px-4 font-semibold">Benchmark Dimension</th>
                {activeComparedList.map((d, idx) => (
                  <th
                    key={d.id}
                    className="py-3 px-4 font-semibold font-mono"
                    style={{ color: comparison.summaries[idx]?.color }}
                  >
                    {formatDatasetTitle(d.name, d.region)} {idx === 0 ? '(Baseline)' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-obsidian-800 text-slate-800 dark:text-zinc-300">
              {comparison.sideBySideRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-obsidian-850/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-zinc-200">
                    {row.metric}
                  </td>
                  {row.values.map((v) => (
                    <td key={v.datasetId} className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-zinc-100">
                          {v.formattedValue}
                        </span>
                        {v.deltaVsBaseline && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              v.isPositive
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                            }`}
                          >
                            {v.deltaVsBaseline}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cross-Market Category Performance Breakdown */}
      {comparison.categoryComparison.length > 0 && (
        <Card
          title="Cross-Market Product Category Breakdown"
          subtitle="Revenue distribution by category across all compared ledgers"
        >
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-obsidian-750">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-obsidian-750 bg-slate-50 dark:bg-obsidian-850/80 text-slate-600 dark:text-zinc-400">
                  <th className="py-3 px-4 font-semibold">Product Category</th>
                  {activeComparedList.map((d, idx) => (
                    <th
                      key={d.id}
                      className="py-3 px-4 font-semibold font-mono"
                      style={{ color: comparison.summaries[idx]?.color }}
                    >
                      {formatDatasetTitle(d.name, d.region)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-obsidian-800 text-slate-800 dark:text-zinc-300">
                {comparison.categoryComparison.map((catRow) => (
                  <tr key={catRow.category} className="hover:bg-slate-50/80 dark:hover:bg-obsidian-850/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-zinc-200">
                      {catRow.category}
                    </td>
                    {activeComparedList.map((d) => (
                      <td key={d.id} className="py-3 px-4 font-mono font-semibold">
                        {d.currency}{Math.round(catRow[d.id] || 0).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Cross-Region Bestsellers Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparison.summaries.map((sum) => (
          <div
            key={sum.dataset.id}
            className="p-4 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
                Top Scent · {formatDatasetTitle(sum.dataset.name, sum.dataset.region)}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {sum.topFragrance}
              </h4>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold text-role block">
                {sum.topFragranceUnits} units
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Bestseller</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
