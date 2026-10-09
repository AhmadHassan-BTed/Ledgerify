import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  Target,
  Sparkles,
  ShieldCheck,
  GitCompare
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
}

export const NavigationTabs: React.FC = () => {
  const { filters, setActiveTab } = useFilters();
  const { activeDataset, isCompareEnabled } = useData();

  const flaggedCount = activeDataset?.dataQuality.flaggedOrders.length || 0;

  const tabs: TabItem[] = [
    {
      id: 'executive',
      label: 'Executive (CEO)',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-4 h-4" />
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: <Truck className="w-4 h-4" />
    },
    {
      id: 'marketing',
      label: 'Marketing & SEO',
      icon: <Target className="w-4 h-4" />
    },
    {
      id: 'creative',
      label: 'Creative & Visuals',
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 'admin',
      label: 'Data Quality',
      badge: flaggedCount > 0 ? `${flaggedCount}` : undefined,
      icon: <ShieldCheck className="w-4 h-4" />
    },
    {
      id: 'compare',
      label: 'Comparison Matrix',
      badge: isCompareEnabled ? 'Active' : undefined,
      icon: <GitCompare className="w-4 h-4" />
    }
  ];

  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none">
      <div className="inline-flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-obsidian-900/90 border border-slate-200/90 dark:border-obsidian-700/60 rounded-2xl backdrop-blur-xl shadow-sm">
        {tabs.map((tab) => {
          const isActive = filters.activeTab === tab.id;
          const roleTheme = ROLE_THEMES[tab.id];

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
                      boxShadow: `0 0 20px -3px rgba(${roleTheme.rgb}, 0.5)`
                    }
                  : undefined
              }
              className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 select-none whitespace-nowrap ${
                isActive
                  ? 'font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-obsidian-800/60'
              }`}
            >
              {/* Subtle role color indicator dot on inactive tab */}
              {!isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125"
                  style={{ backgroundColor: roleTheme.accentHex }}
                />
              )}

              <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-zinc-400'}>
                {tab.icon}
              </span>

              <span>{tab.label}</span>

              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-black/25 text-white border border-white/20'
                      : 'bg-slate-100 dark:bg-obsidian-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-700'
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
  );
};
