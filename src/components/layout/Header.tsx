import React from 'react';
import {
  GitCompare,
  ArrowRightLeft,
  Settings,
  Building2,
  FolderKanban
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFilters } from '../../context/FilterContext';
import { Logo } from '../ui/Logo';
import { formatDatasetTitle, formatDatasetOptionLabel } from '../../utils/datasetTitle';

interface HeaderProps {
  onOpenUploadModal: (initialTab?: 'list' | 'upload') => void;
  onOpenSettingsModal: () => void;
  onOpenCompareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUploadModal,
  onOpenSettingsModal,
  onOpenCompareModal
}) => {
  const {
    datasets,
    activeDataset,
    activeDatasetId,
    setActiveDatasetId,
    comparedDatasets,
    isCompareEnabled,
    toggleCompare,
    isLoading
  } = useData();

  const {
    setActiveTab
  } = useFilters();

  const hasTwoOrMore = datasets.length >= 2;
  const activeTitle = activeDataset ? formatDatasetTitle(activeDataset.name, activeDataset.region) : '';

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#0c0c12]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-obsidian-800/80 px-4 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Active Dataset Status */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <Logo size={34} glow={true} animate={true} />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-slate-900 dark:text-zinc-100 tracking-tight font-sans">
                  Ledgerify
                </h1>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-role-subtle text-role border border-role-subtle rounded-full">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Shopify Ledger Analytics &amp; Intelligence
              </p>
            </div>
          </div>

          {/* Active Ledger Button (Clickable to open File Manager) */}
          {activeDataset && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 rounded-xl text-xs shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-role" />
              {datasets.length > 1 ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Ledger:</span>
                  <select
                    value={activeDatasetId || ''}
                    onChange={(e) => setActiveDatasetId(e.target.value)}
                    className="bg-transparent font-semibold text-slate-900 dark:text-zinc-100 cursor-pointer focus:outline-none max-w-[180px] truncate"
                  >
                    {datasets.map(d => (
                      <option key={d.id} value={d.id} className="bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-100">
                        {formatDatasetOptionLabel(d.name, d.region, undefined, d.totalRows)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenUploadModal('list')}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity text-left"
                  title="Click to open Ledger Manager"
                >
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[160px]">
                    {activeTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                    ({activeDataset.totalRows} rows)
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Global Level Controls: Compare Mode, Files Hub, Settings */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Compare Feature Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                if (!hasTwoOrMore) {
                  onOpenUploadModal('upload');
                } else {
                  toggleCompare();
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-sm ${
                !hasTwoOrMore
                  ? 'bg-slate-100 dark:bg-obsidian-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-obsidian-700 hover:border-role'
                  : isCompareEnabled
                  ? 'bg-role text-white border-role shadow-role-glow'
                  : 'bg-slate-100 dark:bg-obsidian-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-obsidian-700 hover:border-role'
              }`}
              title={
                !hasTwoOrMore
                  ? 'Upload a 2nd Excel workbook or load samples to enable comparison mode'
                  : 'Toggle Comparative mode across all dashboards'
              }
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare:</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                !hasTwoOrMore
                  ? 'bg-slate-200 dark:bg-obsidian-800 text-slate-600 dark:text-zinc-400 font-bold'
                  : isCompareEnabled
                  ? 'bg-black/30 text-white font-bold'
                  : 'bg-slate-200 dark:bg-obsidian-800 text-slate-600 dark:text-zinc-400'
              }`}>
                {!hasTwoOrMore ? '+ 2nd Req' : isCompareEnabled ? `ON (${comparedDatasets.length || 2})` : 'OFF'}
              </span>
            </button>

            {/* Configure Compare Slots Button */}
            {hasTwoOrMore && (
              <button
                type="button"
                onClick={onOpenCompareModal}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-obsidian-850 hover:bg-slate-200 dark:hover:bg-obsidian-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-750 transition-colors shadow-sm"
                title="Configure comparison slots and select workbooks"
              >
                <Settings className="w-3 h-3 text-role" />
                <span className="hidden sm:inline">Slots ({comparedDatasets.length || 2})</span>
              </button>
            )}

            {/* Direct Open Comparison Matrix Button when Compare is ON */}
            {isCompareEnabled && (
              <button
                type="button"
                onClick={() => setActiveTab('compare')}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-role/10 text-role border border-role/20 hover:bg-role hover:text-white transition-all shadow-sm"
                title="View the dedicated Multi-Dataset Comparison Matrix"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Open Matrix</span>
              </button>
            )}
          </div>

          {/* Dedicated File & Ledger Hub Button */}
          <button
            type="button"
            onClick={() => onOpenUploadModal('list')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-obsidian-850 hover:bg-slate-200 dark:hover:bg-obsidian-800 text-slate-800 dark:text-zinc-200 border border-slate-200/90 dark:border-obsidian-700 transition-colors shadow-sm"
            title="Open File Manager (Upload, switch sheets, renew, rename, assign regions, or delete)"
          >
            <FolderKanban className="w-3.5 h-3.5 text-role" />
            <span>Files ({datasets.length})</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettingsModal}
            className="p-2 rounded-xl border border-slate-200 dark:border-obsidian-700 bg-slate-100 dark:bg-obsidian-900 text-slate-700 dark:text-zinc-300 hover:border-role transition-all text-xs shadow-sm"
            title="Open Settings &amp; Preferences"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
