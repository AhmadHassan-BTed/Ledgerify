import React, { useRef } from 'react';
import {
  Upload,
  Database,
  Sparkles,
  GitCompare,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFilters } from '../../context/FilterContext';
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
    <header className="sticky top-0 z-30 w-full bg-obsidian-950/80 backdrop-blur-xl border-b border-obsidian-800/80 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Dataset Selector */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-glow-purple">
              <span className="font-mono text-lg">L</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-zinc-100 tracking-tight font-sans">
                  Ledgerify
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800/60 rounded-full">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Shopify Ledger Analytics & Intelligence
              </p>
            </div>
          </div>

          {/* Dataset Switcher Tabs */}
          {datasets.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 p-1 bg-obsidian-900 border border-obsidian-800 rounded-xl">
              {datasets.map((d) => {
                const isSelected = d.id === activeDatasetId;
                return (
                  <div key={d.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => setActiveDatasetId(d.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition-all ${
                        isSelected
                          ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 font-medium'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-800/80'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span className="max-w-[110px] truncate">{d.name}</span>
                      <span className="text-[10px] opacity-60 font-mono">({d.totalRows})</span>
                    </button>
                    {datasets.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDataset(d.id);
                        }}
                        title="Remove workbook"
                        className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 w-4 h-4 rounded-full bg-obsidian-800 border border-obsidian-700 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-all"
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

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Health Indicator */}
          {health && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-colors ${
                isHealthy
                  ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-800/50 text-amber-300'
              }`}
              title="Click to view Data Quality audit"
            >
              {isHealthy ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              <span>Health: {health.healthScore}%</span>
            </button>
          )}

          {/* Currency Switcher */}
          <div className="flex items-center p-0.5 bg-obsidian-900 border border-obsidian-800 rounded-xl text-xs">
            {(['£', '$', '€'] as Currency[]).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setCustomCurrency(curr)}
                className={`px-2 py-1 rounded-lg font-mono transition-all ${
                  activeCurrency === curr
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
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
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-obsidian-900 hover:bg-obsidian-850 text-zinc-300 border border-obsidian-700/80 transition-colors"
              title="Load sample UK Orders.xlsx"
            >
              <span>🇬🇧 UK Sample</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => loadSampleDataset('US')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-obsidian-900 hover:bg-obsidian-850 text-zinc-300 border border-obsidian-700/80 transition-colors"
              title="Load sample US Orders.xlsx"
            >
              <span>🇺🇸 US Sample</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                loadBothAndCompare();
                setActiveTab('compare');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-glow-purple transition-all"
              title="Load both datasets and trigger Compare View"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare UK vs US</span>
              <span className="sm:hidden">Compare</span>
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-obsidian-850 hover:bg-obsidian-800 text-zinc-200 border border-obsidian-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Upload .xlsx</span>
          </button>
        </div>
      </div>
    </header>
  );
};
