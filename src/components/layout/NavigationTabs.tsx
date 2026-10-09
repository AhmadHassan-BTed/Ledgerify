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

interface TabItem {
  id: ViewTab;
  label: string;
  badge?: string;
  icon: React.ReactNode;
}

export const NavigationTabs: React.FC = () => {
  const { filters, setActiveTab } = useFilters();
  const { activeDataset, datasets } = useData();

  const flaggedCount = activeDataset?.dataQuality.flaggedOrders.length || 0;
  const canCompare = datasets.length >= 2;

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
      label: 'Compare Datasets',
      badge: canCompare ? 'Ready' : undefined,
      icon: <GitCompare className="w-4 h-4" />
    }
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="inline-flex items-center gap-1.5 p-1.5 bg-obsidian-900/90 border border-obsidian-700/60 rounded-2xl backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = filters.activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 select-none whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-800/60'
              }`}
            >
              <span className={isActive ? 'text-zinc-950' : 'text-zinc-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>

              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-obsidian-800 text-purple-400 border border-purple-500/30'
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
