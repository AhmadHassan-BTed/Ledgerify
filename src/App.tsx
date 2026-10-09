import React, { useState, useEffect } from 'react';
import { useData } from './context/DataContext';
import { useFilters } from './context/FilterContext';
import { useTheme } from './context/ThemeContext';
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
import { Sparkles, Loader2, AlertCircle, HelpCircle, ChevronDown, ChevronUp, Compass } from 'lucide-react';
import { ROLE_THEMES } from './styles/themes/roleThemes';

export const App: React.FC = () => {
  const { activeDataset, isLoading, loadingMessage, error, loadSampleDataset } = useData();
  const { filters } = useFilters();
  const { theme } = useTheme();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Synchronize dynamic role color onto document root whenever activeTab changes
  useEffect(() => {
    document.documentElement.setAttribute('data-role', filters.activeTab);
  }, [filters.activeTab]);

  const currentRole = ROLE_THEMES[filters.activeTab] || ROLE_THEMES.executive;

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
    <div
      data-role={filters.activeTab}
      className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0d0d11] dark:text-zinc-100 transition-colors duration-200"
    >
      {/* Header */}
      <Header onOpenUploadModal={() => setIsUploadModalOpen(true)} />

      {/* Main Expansive Content Container: Fluid and Breathing with generous padding */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <NavigationTabs />

        {/* Non-Technical Plain English Executive Guide Banner */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-obsidian-700/70 bg-white/90 dark:bg-obsidian-900/90 backdrop-blur-xl shadow-sm transition-all overflow-hidden">
          <button
            type="button"
            onClick={() => setIsGuideOpen(prev => !prev)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-obsidian-850/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{ backgroundColor: currentRole.primaryHex }}
              >
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    {currentRole.name} Guide:
                  </span>
                  <span className="text-xs text-slate-600 dark:text-zinc-400">
                    {currentRole.plainEnglishMission}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
              <span className="hidden sm:inline">
                {isGuideOpen ? 'Hide Glossary' : 'Plain-English Help'}
              </span>
              {isGuideOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {isGuideOpen && (
            <div className="px-5 pb-4 pt-1 border-t border-slate-100 dark:border-obsidian-800 text-xs text-slate-600 dark:text-zinc-300 animate-fade-in space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-obsidian-850/70 border border-slate-200/60 dark:border-obsidian-750">
                  <span className="font-bold text-slate-900 dark:text-zinc-100 block mb-1">
                    💰 Net Revenue vs Target
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400">
                    The total money paid into your store after refunds. Target Pace reveals whether current velocity meets your monthly goal.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-obsidian-850/70 border border-slate-200/60 dark:border-obsidian-750">
                  <span className="font-bold text-slate-900 dark:text-zinc-100 block mb-1">
                    👥 Customer Retention &amp; Repeat Buyers
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400">
                    The percentage of buyers who placed 2 or more orders. Higher retention means you don&apos;t have to keep spending ad dollars to acquire new customers.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-obsidian-850/70 border border-slate-200/60 dark:border-obsidian-750">
                  <span className="font-bold text-slate-900 dark:text-zinc-100 block mb-1">
                    📦 Average Order Value (AOV)
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400">
                    Total Revenue divided by order count. Boost AOV by offering bundle discovery sets or volume incentives.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                <HelpCircle className="w-3.5 h-3.5 text-role flex-shrink-0" />
                <span>
                  Tip: Hover or click on the <HelpCircle className="inline w-3 h-3 text-slate-400" /> icon beside any metric card for a simple 1-sentence breakdown!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Filters Toolbar (not shown in Compare mode if comparing distinct sets) */}
        {filters.activeTab !== 'compare' && <FilterBar />}

        {/* Global Loading Spinner / Status */}
        {isLoading && (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-obsidian-900/60 border border-slate-200 dark:border-obsidian-800 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-role animate-spin" />
            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{loadingMessage}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {error && !isLoading && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => loadSampleDataset('UK')}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium"
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
            <div className="w-16 h-16 rounded-3xl bg-role-subtle border border-role-subtle flex items-center justify-center text-role mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
              No Active Shopify Ledger Loaded
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Drop an Excel workbook or load the pre-bundled UK or US sample data to start exploring metrics.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => loadSampleDataset('UK')}
                className="px-4 py-2 rounded-xl bg-role text-white font-semibold text-xs shadow-role-glow hover:opacity-90 transition-opacity"
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
      <footer className="mt-auto border-t border-slate-200 dark:border-obsidian-850 py-4 px-6 text-center text-xs text-slate-500 dark:text-zinc-400 transition-colors">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-zinc-200">Ledgerify</span>
            <span>·</span>
            <span>Shopify Multi-Sheet Ledger Intelligence</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="capitalize">
              Active Role: <span className="font-bold text-role">{currentRole.name}</span>
            </span>
            <span>·</span>
            <span className="capitalize">Theme: {theme} Mode</span>
            <span>·</span>
            <span>100% In-Browser Client Side Processing</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
