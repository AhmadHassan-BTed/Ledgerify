import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  Target,
  Sparkles,
  ShieldCheck,
  GitCompare,
  Lock
} from 'lucide-react';
import { ViewTab } from '../../types/filter';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { ROLE_THEMES } from '../../styles/themes/roleThemes';

interface TabItem {
  id: ViewTab;
  label: string;
  badge?: string;
  icon: React.ReactNode;
  disabled?: boolean;
  disabledTooltip?: string;
  isDevOnly?: boolean;
}

export const NavigationTabs: React.FC = () => {
  const { filters, setActiveTab } = useFilters();
  const { datasets, activeDataset, isCompareEnabled, isDevMode } = useData();

  const flaggedCount = activeDataset?.dataQuality.flaggedOrders.length || 0;
  const currentRole = ROLE_THEMES[filters.activeTab] || ROLE_THEMES.executive;

  const allTabs: TabItem[] = [
    {
      id: 'executive',
      label: 'Executive (CEO)',
      icon: <TrendingUp className="w-3.5 h-3.5" />
    },
    {
      id: 'finance',
      label: 'Finance & P&L',
      icon: <DollarSign className="w-3.5 h-3.5" />
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: <Package className="w-3.5 h-3.5" />
    },
    {
      id: 'operations',
      label: 'Operations & Logistics',
      icon: <Truck className="w-3.5 h-3.5" />
    },
    {
      id: 'marketing',
      label: 'Marketing & SEO',
      icon: <Target className="w-3.5 h-3.5" />
    },
    {
      id: 'creative',
      label: 'Creative Studio',
      icon: <Sparkles className="w-3.5 h-3.5" />
    },
    // Comparison Matrix tab is strictly visible only when Compare is enabled or active
    ...((isCompareEnabled || filters.activeTab === 'compare')
      ? [
          {
            id: 'compare' as ViewTab,
            label: 'Comparison Matrix',
            badge: 'Active',
            icon: <GitCompare className="w-3.5 h-3.5" />
          }
        ]
      : []),
    {
      id: 'admin',
      label: 'Data Quality & Audit',
      badge: flaggedCount > 0 ? `${flaggedCount} flags` : 'Dev Mode',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      isDevOnly: true
    }
  ];

  // Filter out dev-only tab if Dev Mode is OFF
  const tabs = allTabs.filter(t => !t.isDevOnly || isDevMode);

  return (
    <div className="w-full flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 bg-white/95 dark:bg-obsidian-900/90 border border-slate-200/90 dark:border-obsidian-750 p-2.5 sm:p-3 rounded-2xl backdrop-blur-xl shadow-sm transition-colors">
      {/* Left Portion: Active Role Focus & Tagline */}
      <div className="flex items-center gap-3 px-2 min-w-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 transition-all duration-300"
          style={{ backgroundColor: currentRole.primaryHex }}
        >
          {tabs.find(t => t.id === filters.activeTab)?.icon || <TrendingUp className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              {currentRole.name} Focus
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-xl">
            {currentRole.missionDescription}
          </p>
        </div>
      </div>

      {/* Right Portion: Right-Aligned Role Navigation Tabs */}
      <div className="overflow-x-auto pb-1 xl:pb-0 scrollbar-none flex-shrink-0">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-obsidian-850/80 border border-slate-200/80 dark:border-obsidian-750 rounded-xl">
          {tabs.map((tab) => {
            const isActive = filters.activeTab === tab.id;
            const roleTheme = ROLE_THEMES[tab.id] || ROLE_THEMES.executive;

            if (tab.disabled) {
              return (
                <button
                  key={tab.id}
                  type="button"
                  disabled
                  title={tab.disabledTooltip}
                  className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 dark:text-zinc-600 bg-slate-50/50 dark:bg-obsidian-950/40 cursor-not-allowed select-none whitespace-nowrap opacity-60 border border-dashed border-slate-200 dark:border-obsidian-800"
                >
                  <Lock className="w-3 h-3" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] rounded-full font-mono bg-slate-200 dark:bg-obsidian-800 text-slate-500 dark:text-zinc-500">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={
                  isActive
                    ? {
                        backgroundColor: roleTheme.primaryHex,
                        color: '#ffffff',
                        boxShadow: `0 0 15px -2px rgba(${roleTheme.rgb}, 0.4)`
                      }
                    : undefined
                }
                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none whitespace-nowrap ${
                  isActive
                    ? 'font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-obsidian-750/70'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-zinc-400'}>
                  {tab.icon}
                </span>

                <span>{tab.label}</span>

                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 text-[9px] rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-black/25 text-white border border-white/20'
                        : 'bg-slate-200 dark:bg-obsidian-750 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-obsidian-650'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
