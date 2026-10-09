import React, { useState, useEffect } from 'react';
import { useData } from './context/DataContext';
import { useFilters } from './context/FilterContext';
import { useTheme } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { NavigationTabs } from './components/layout/NavigationTabs';
import { FilterBar } from './components/layout/FilterBar';
import { FileManagerModal } from './components/layout/FileManagerModal';
import { SettingsModal } from './components/layout/SettingsModal';
import { CompareConfigModal } from './components/layout/CompareConfigModal';
import { DrillDownModal } from './components/ui/DrillDownModal';
import { ExecutiveView } from './components/views/ExecutiveView';
import { FinanceView } from './components/views/FinanceView';
import { InventoryView } from './components/views/InventoryView';
import { OperationsView } from './components/views/OperationsView';
import { MarketingView } from './components/views/MarketingView';
import { CreativeView } from './components/views/CreativeView';
import { AdminDataQualityView } from './components/views/AdminDataQualityView';
import { CompareView } from './components/views/CompareView';
import { Logo } from './components/ui/Logo';
import { Loader2, AlertCircle } from 'lucide-react';
import { ROLE_THEMES } from './styles/themes/roleThemes';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export const App: React.FC = () => {
  const {
    activeDataset,
    isLoading,
    loadingMessage,
    error,
    loadSampleDataset,
    drillDownData,
    closeDrillDown,
    isDevMode,
    setIsDevMode,
    isCompareEnabled
  } = useData();
  const { filters, activeCurrency, setActiveTab } = useFilters();
  const { theme } = useTheme();

  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [fileManagerInitialTab, setFileManagerInitialTab] = useState<'list' | 'upload'>('list');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCompareConfigOpen, setIsCompareConfigOpen] = useState(false);

  const handleOpenFileManager = (initialTab: 'list' | 'upload' = 'list') => {
    setFileManagerInitialTab(initialTab);
    setIsFileManagerOpen(true);
  };

  // Synchronize dynamic role color onto document root whenever activeTab changes
  useEffect(() => {
    document.documentElement.setAttribute('data-role', filters.activeTab);
  }, [filters.activeTab]);

  // Gracefully return to Executive dashboard if compare mode is turned off while on the Comparison Matrix
  useEffect(() => {
    if (!isCompareEnabled && filters.activeTab === 'compare') {
      setActiveTab('executive');
    }
  }, [isCompareEnabled, filters.activeTab, setActiveTab]);

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
      className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#09090e] dark:text-zinc-100 transition-colors duration-200"
    >
      {/* Header with Logo, Compare Gating, Ledger Manager & Settings */}
      <Header
        onOpenUploadModal={(tab) => handleOpenFileManager(tab || 'list')}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenCompareModal={() => setIsCompareConfigOpen(true)}
      />

      {/* Main Expansive Content Container: Clean & Balanced */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Level 2: Unified Role Header & Navigation Tabs */}
        <NavigationTabs />

        {/* Level 3: Unified Filtering Toolbar (Search, Sheets, Timeframe, Status) */}
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

        {/* View Switcher Container with Error Boundary */}
        {!isLoading && activeDataset && (
          <ErrorBoundary fallbackTitle="Dashboard View Encountered an Error">
            <div className="animate-fade-in">
              {renderActiveView()}
            </div>
          </ErrorBoundary>
        )}

        {/* Fallback Empty State with Logo */}
        {!isLoading && !activeDataset && (
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <Logo size={64} glow={true} className="mx-auto" />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-zinc-100">
              No Active Shopify Ledger Loaded
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Drop an Excel workbook or load the pre-bundled UK or US sample data to start exploring metrics.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleOpenFileManager('upload')}
                className="px-5 py-2.5 rounded-xl bg-role text-white font-semibold text-xs shadow-role-glow hover:opacity-90 transition-opacity"
              >
                Upload Excel Ledger
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Ledger & File Manager Modal */}
      <FileManagerModal
        isOpen={isFileManagerOpen}
        initialTab={fileManagerInitialTab}
        onClose={() => setIsFileManagerOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDevMode={isDevMode}
        setIsDevMode={setIsDevMode}
        onOpenFileManager={() => handleOpenFileManager('list')}
      />

      {/* Compare Configuration Modal */}
      <CompareConfigModal
        isOpen={isCompareConfigOpen}
        onClose={() => setIsCompareConfigOpen(false)}
        onApplyAndOpenMatrix={() => {
          setIsCompareConfigOpen(false);
          setActiveTab('compare');
        }}
      />

      {/* Drill-Down Dossier Modal */}
      {drillDownData && (
        <ErrorBoundary fallbackTitle="Drill-Down Dossier Modal Encountered an Error">
          <DrillDownModal
            data={drillDownData}
            currencySymbol={activeCurrency}
            onClose={closeDrillDown}
          />
        </ErrorBoundary>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-obsidian-850 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-zinc-400 transition-colors">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Logo size={18} glow={false} />
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
            <span>100% In-Browser Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
