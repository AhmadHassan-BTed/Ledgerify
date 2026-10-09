import React from 'react';
import {
  X,
  GitCompare,
  Plus,
  Trash2,
  Crown,
  Layers,
  ArrowRight,
  Check,
  Building2,
  Sparkles
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFilters } from '../../context/FilterContext';

import { formatDatasetOptionLabel } from '../../utils/datasetTitle';

interface CompareConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAndOpenMatrix?: () => void;
}

export const CompareConfigModal: React.FC<CompareConfigModalProps> = ({
  isOpen,
  onClose,
  onApplyAndOpenMatrix
}) => {
  const {
    datasets,
    comparedDatasetIds,
    setComparedDatasetIds,
    addComparedDatasetId,
    removeComparedDatasetId,
    comparedDatasets,
    isCompareEnabled,
    setIsCompareEnabled,
    loadBothAndCompare,
    isLoading
  } = useData();

  const { setActiveTab } = useFilters();

  if (!isOpen) return null;

  const activeComparedList = comparedDatasets.length >= 2
    ? comparedDatasets
    : datasets.slice(0, Math.min(datasets.length, 2));

  const handleSlotDatasetChange = (index: number, newDatasetId: string) => {
    const currentIds = activeComparedList.map(d => d.id);
    currentIds[index] = newDatasetId;
    const uniqueIds = Array.from(new Set(currentIds));
    setComparedDatasetIds(uniqueIds);
  };

  const handleSetBaseline = (index: number) => {
    if (index === 0) return;
    const currentIds = [...activeComparedList.map(d => d.id)];
    const [selected] = currentIds.splice(index, 1);
    currentIds.unshift(selected);
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

  const handleApply = () => {
    setIsCompareEnabled(true);
    if (onApplyAndOpenMatrix) {
      onApplyAndOpenMatrix();
    } else {
      setActiveTab('compare');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-obsidian-800 flex items-center justify-between bg-slate-50/70 dark:bg-obsidian-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-role-subtle border border-role-subtle flex items-center justify-center text-role shadow-role-glow">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Multi-Dataset Comparison Setup
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Configure how many workbooks to compare and assign each slot.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {datasets.length < 2 ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-role-subtle text-role flex items-center justify-center mx-auto">
                <GitCompare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                At Least 2 Workbooks Required to Compare
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                Upload a 2nd Excel workbook or instantly load both sample workbooks (UK &amp; US) to unlock multi-file comparisons.
              </p>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => loadBothAndCompare()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-role text-white text-xs font-semibold shadow-role-glow hover:opacity-90 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Workbooks</span>
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Set Number of Files to Compare */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-obsidian-750 bg-slate-50/60 dark:bg-obsidian-850/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-role text-white text-[10px] font-black flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Set Number of Files to Compare
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-role">
                    {activeComparedList.length} of {datasets.length} Files Selected
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {[2, 3, 4, 5, 6].filter(num => num <= datasets.length).map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSetCompareCount(num)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeComparedList.length === num
                          ? 'bg-role text-white shadow-role-glow border border-role'
                          : 'bg-white dark:bg-obsidian-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-700 hover:border-role'
                      }`}
                    >
                      {num} Files
                    </button>
                  ))}

                  {datasets.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setComparedDatasetIds(datasets.map(d => d.id))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeComparedList.length === datasets.length
                          ? 'bg-role text-white shadow-role-glow border border-role'
                          : 'bg-white dark:bg-obsidian-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-700 hover:border-role'
                      }`}
                    >
                      All ({datasets.length} Files)
                    </button>
                  )}

                  {activeComparedList.length < datasets.length && (
                    <button
                      type="button"
                      onClick={handleAddSlot}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-role-subtle text-role border border-role-subtle hover:bg-role hover:text-white transition-all ml-auto"
                    >
                      <Plus className="w-3.5 h-3.5 inline mr-1" />
                      Add Slot
                    </button>
                  )}
                </div>
              </div>

              {/* Step 2: Select Files for Each Slot */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-role text-white text-[10px] font-black flex items-center justify-center">
                      2
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Assign File to Each Comparison Slot
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                    Slot 1 is the baseline reference
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeComparedList.map((d, idx) => {
                    const isBaseline = idx === 0;

                    return (
                      <div
                        key={d.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isBaseline
                            ? 'border-role bg-role-subtle/30 ring-1 ring-role/30'
                            : 'border-slate-200 dark:border-obsidian-750 bg-slate-50 dark:bg-obsidian-850'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono ${
                            isBaseline
                              ? 'bg-role text-white'
                              : 'bg-slate-200 dark:bg-obsidian-750 text-slate-700 dark:text-zinc-300'
                          }`}>
                            {isBaseline ? 'Slot 1 (Baseline)' : `Slot ${idx + 1}`}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-obsidian-800 text-slate-600 dark:text-zinc-400">
                            {d.region || 'UK'}
                          </span>
                        </div>

                        {/* File Dropdown Selector */}
                        <div className="flex-1 w-full sm:w-auto">
                          <select
                            value={d.id}
                            onChange={(e) => handleSlotDatasetChange(idx, e.target.value)}
                            className="w-full bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl px-3 py-1.5 font-semibold text-xs text-slate-900 dark:text-zinc-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-role"
                          >
                            {datasets.map(opt => (
                              <option key={opt.id} value={opt.id}>
                                {formatDatasetOptionLabel(opt.name, opt.region, opt.currency, opt.totalRows)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Slot Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          {!isBaseline && (
                            <button
                              type="button"
                              onClick={() => handleSetBaseline(idx)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-200 dark:bg-obsidian-750 hover:bg-role hover:text-white text-slate-700 dark:text-zinc-300 transition-colors"
                              title="Designate as the reference baseline"
                            >
                              Make Baseline
                            </button>
                          )}
                          {activeComparedList.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeComparedDatasetId(d.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Remove slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-obsidian-800 bg-slate-50/70 dark:bg-obsidian-950/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-obsidian-800 transition-colors"
          >
            Cancel
          </button>

          {datasets.length >= 2 && (
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-role text-white font-semibold text-xs shadow-role-glow hover:opacity-90 transition-opacity"
            >
              <span>Apply &amp; Open Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
