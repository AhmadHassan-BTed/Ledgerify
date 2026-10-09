import React, { useState } from 'react';
import { useData } from './context/DataContext';
import { useFilters } from './context/FilterContext';
import { Header } from './components/layout/Header';
import { NavigationTabs } from './components/layout/NavigationTabs';
import { FilterBar } from './components/layout/FilterBar';
import { FileDropzoneModal } from './components/layout/FileDropzoneModal';
import { ExecutiveView } from './components/views/ExecutiveView';
import { FinanceView } from './components/views/FinanceView';
import { InventoryView } from './components/views/InventoryView';
import { OperationsView } from './components/views/OperationsView';
import { MarketingView } from './components/views/MarketingView';
import { CreativeView } from './components/views/CreativeView';
import { AdminDataQualityView } from './components/views/AdminDataQualityView';
import { CompareView } from './components/views/CompareView';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const { activeDataset, isLoading, loadingMessage, error, loadSampleDataset } = useData();
  const { filters } = useFilters();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const renderActiveView = () => {
    switch (filters.activeTab) {
      case 'executive':
        return <ExecutiveView />;
      case 'finance':
        return <FinanceView />;
      case 'inventory':
        return <InventoryView />;
      case 'operations':
        return <OperationsView />;
      case 'marketing':
        return <MarketingView />;
      case 'creative':
        return <CreativeView />;
      case 'admin':
        return <AdminDataQualityView />;
      case 'compare':
        return <CompareView />;
      default:
        return <ExecutiveView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d11] text-zinc-100">
      {/* Header */}
      <Header onOpenUploadModal={() => setIsUploadModalOpen(true)} />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <NavigationTabs />

        {/* Filters Toolbar (not shown in Compare mode if comparing distinct sets) */}
        {filters.activeTab !== 'compare' && <FilterBar />}

        {/* Global Loading Spinner / Status */}
        {isLoading && (
          <div className="p-12 text-center rounded-3xl bg-obsidian-900/60 border border-obsidian-800 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="text-sm font-medium text-zinc-300">{loadingMessage}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {error && !isLoading && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => loadSampleDataset('UK')}
              className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-850 text-white font-medium"
            >
              Reset to UK Sample
            </button>
          </div>
        )}

        {/* View Switcher Container */}
        {!isLoading && activeDataset && (
          <div className="animate-fade-in">
            {renderActiveView()}
          </div>
        )}

        {/* Fallback Empty State */}
        {!isLoading && !activeDataset && (
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100">
              No Active Shopify Ledger Loaded
            </h3>
            <p className="text-xs text-zinc-400">
              Drop an Excel workbook or load the pre-bundled UK or US sample data to start exploring metrics.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => loadSampleDataset('UK')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-glow-purple"
              >
                Load Sample UK Orders
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <FileDropzoneModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-obsidian-850 py-4 px-6 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Ledgerify · Shopify Excel Ledger Analytics</span>
          <span className="font-mono text-[11px] text-zinc-400">
            Obsidian Dark Theme · 100% In-Browser Client Side Processing
          </span>
        </div>
      </footer>
    </div>
  );
};
