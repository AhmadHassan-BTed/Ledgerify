import React, { useRef } from 'react';
import {
  Upload,
  GitCompare,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Sun,
  Moon
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFilters } from '../../context/FilterContext';
import { useTheme } from '../../context/ThemeContext';
import { Currency } from '../../types/order';

interface HeaderProps {
  onOpenUploadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenUploadModal }) => {
  const {
    datasets,
    activeDataset,
    activeDatasetId,
    setActiveDatasetId,
    secondaryDatasetId,
    setSecondaryDatasetId,
    isCompareEnabled,
    toggleCompare,
    loadSampleDataset,
    loadBothAndCompare,
    removeDataset,
    isLoading
  } = useData();

  const {
    activeCurrency,
    setCustomCurrency,
    setActiveTab
  } = useFilters();

  const { theme, toggleTheme } = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useData();

  const handleNativeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
      e.target.value = '';
    }
  };

  const health = activeDataset?.dataQuality;
  const isHealthy = health?.status === 'healthy';

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-obsidian-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-obsidian-800/80 px-4 sm:px-8 lg:px-10 py-3.5 transition-colors">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Dataset Switcher */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-role flex items-center justify-center text-white font-black shadow-role-glow transition-all duration-300">
              <span className="font-mono text-xl">L</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight font-sans">
                  Ledgerify
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-role-subtle text-role border border-role-subtle rounded-full transition-all duration-300">
                  v1.2
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Shopify Ledger Analytics &amp; Intelligence
              </p>
            </div>
          </div>

          {/* Dataset Switcher Tabs */}
          {datasets.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 rounded-xl">
              {datasets.map((d) => {
                const isSelected = d.id === activeDatasetId;
                return (
                  <div key={d.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => setActiveDatasetId(d.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                        isSelected
                          ? 'bg-role text-white font-semibold shadow-sm'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-obsidian-800/80'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span className="max-w-[120px] truncate">{d.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">({d.totalRows})</span>
                    </button>
                    {datasets.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDataset(d.id);
                        }}
                        title="Remove workbook"
                        className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-200 dark:bg-obsidian-800 border border-slate-300 dark:border-obsidian-700 text-slate-600 dark:text-zinc-400 hover:text-rose-500 flex items-center justify-center transition-all"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls & Compare Feature */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Light / Dark Mode Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-obsidian-700 bg-slate-100 dark:bg-obsidian-900 text-slate-700 dark:text-zinc-300 hover:border-role transition-all text-xs font-medium"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-role" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          {/* Compare Feature Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={toggleCompare}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                isCompareEnabled
                  ? 'bg-role text-white border-role shadow-role-glow'
                  : 'bg-slate-100 dark:bg-obsidian-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-obsidian-700/80 hover:border-role'
              }`}
              title="Toggle Comparative mode across all team dashboards"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare:</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isCompareEnabled ? 'bg-black/30 text-white' : 'bg-slate-200 dark:bg-obsidian-800 text-slate-600 dark:text-zinc-400'}`}>
                {isCompareEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Quick Dataset Selector when Compare is ON */}
            {isCompareEnabled && datasets.length >= 2 && (
              <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 rounded-xl text-xs">
                <select
                  value={activeDatasetId || ''}
                  onChange={(e) => setActiveDatasetId(e.target.value)}
                  className="bg-transparent text-role text-xs focus:outline-none cursor-pointer max-w-[100px] truncate font-medium"
                >
                  {datasets.map(d => (
                    <option key={d.id} value={d.id} className="bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-200">
                      A: {d.name}
                    </option>
                  ))}
                </select>
                <ArrowRightLeft className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                <select
                  value={secondaryDatasetId || ''}
                  onChange={(e) => setSecondaryDatasetId(e.target.value)}
                  className="bg-transparent text-cyan-600 dark:text-cyan-400 text-xs focus:outline-none cursor-pointer max-w-[100px] truncate font-medium"
                >
                  {datasets.map(d => (
                    <option key={d.id} value={d.id} className="bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-200">
                      B: {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Health Indicator */}
          {health && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs border transition-colors ${
                isHealthy
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-300'
              }`}
              title="Click to view Data Quality audit"
            >
              {isHealthy ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
              <span>Health: {health.healthScore}%</span>
            </button>
          )}

          {/* Currency Switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 rounded-xl text-xs">
            {(['£', '$', '€'] as Currency[]).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setCustomCurrency(curr)}
                className={`px-2.5 py-1 rounded-lg font-mono transition-all ${
                  activeCurrency === curr
                    ? 'bg-role text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Quick Demo Preloaders */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => loadSampleDataset('UK')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-obsidian-900 hover:bg-slate-200 dark:hover:bg-obsidian-850 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-700/80 transition-colors"
              title="Load sample UK Orders.xlsx"
            >
              <span>🇬🇧 UK Sample</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => loadSampleDataset('US')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-obsidian-900 hover:bg-slate-200 dark:hover:bg-obsidian-850 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-700/80 transition-colors"
              title="Load sample US Orders.xlsx"
            >
              <span>🇺🇸 US Sample</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => loadBothAndCompare()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-role-subtle hover:opacity-90 text-role border border-role-subtle transition-colors"
              title="Load both datasets and activate Compare Feature"
            >
              <span>⚡ Load Both</span>
            </button>
          </div>

          {/* File Upload Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleNativeFileUpload}
            accept=".xlsx,.xls"
            className="hidden"
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl bg-slate-800 dark:bg-obsidian-850 hover:bg-slate-700 dark:hover:bg-obsidian-800 text-white dark:text-zinc-200 border border-slate-700 dark:border-obsidian-700 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-role" />
            <span>Upload .xlsx</span>
          </button>
        </div>
      </div>
    </header>
  );
};
