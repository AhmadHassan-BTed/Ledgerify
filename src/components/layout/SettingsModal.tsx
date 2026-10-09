import {
  X,
  Settings,
  Code2,
  DollarSign,
  Sun,
  Moon,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Globe,
  Database,
  Building2,
  Coins
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useFilters } from '../../context/FilterContext';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../ui/Logo';
import { REGIONS } from '../../types/order';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDevMode: boolean;
  setIsDevMode: (val: boolean) => void;
  onOpenFileManager?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDevMode,
  setIsDevMode,
  onOpenFileManager
}) => {
  const { datasets } = useData();
  const { activeCurrency, setCustomCurrency } = useFilters();
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-obsidian-800 flex items-center justify-between bg-slate-50/70 dark:bg-obsidian-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-role-subtle border border-role-subtle flex items-center justify-center text-role shadow-role-glow">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Ledgerify Settings &amp; Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Customize your executive workspace, developer controls, and currency rules.
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Developer & Data Quality Mode Toggle */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-obsidian-750 bg-slate-50/50 dark:bg-obsidian-850/60 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-role" />
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Developer &amp; Data Quality Mode
                </span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${isDevMode ? 'bg-role text-white' : 'bg-slate-200 dark:bg-obsidian-800 text-slate-600 dark:text-zinc-400'}`}>
                  {isDevMode ? 'ENABLED' : 'OFF (EXECUTIVE)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                When <strong className="text-slate-700 dark:text-zinc-300">OFF (Default)</strong>: Experience an uncluttered executive view focused 100% on business KPIs and top customers.<br />
                When <strong className="text-slate-700 dark:text-zinc-300">ON</strong>: Unlocks the Data Quality audit tab, sheet inspection diagnostics, and raw column mappings.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDevMode(!isDevMode)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDevMode ? 'bg-role' : 'bg-slate-300 dark:bg-obsidian-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDevMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Theme & Aesthetics */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
              Theme &amp; Interface Appearance
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => theme === 'light' && toggleTheme()}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                  theme === 'dark'
                    ? 'border-role bg-role-subtle/40 text-slate-900 dark:text-white shadow-role-glow'
                    : 'border-slate-200 dark:border-obsidian-750 bg-slate-50 dark:bg-obsidian-850 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <Moon className="w-5 h-5 text-role" />
                <div className="text-left">
                  <span className="text-xs font-bold block">Obsidian Dark (Recommended)</span>
                  <span className="text-[11px] opacity-75">Deep midnight OLED palette</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                  theme === 'light'
                    ? 'border-role bg-role-subtle/40 text-slate-900 shadow-sm'
                    : 'border-slate-200 dark:border-obsidian-750 bg-slate-50 dark:bg-obsidian-850 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                  <span className="text-xs font-bold block">Daylight Mode</span>
                  <span className="text-[11px] opacity-75">Clean crisp white contrast</span>
                </div>
              </button>
            </div>
          </div>

          {/* Currency Override */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-role" />
                <span>Currency Symbol Override</span>
              </label>
              <button
                type="button"
                onClick={() => setCustomCurrency(null)}
                className="text-[11px] text-role hover:underline font-medium"
              >
                Reset to Auto-Detect
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { code: '£', label: '£ GBP', region: 'UK' },
                { code: '$', label: '$ USD', region: 'US' },
                { code: 'AED', label: 'AED UAE', region: 'UAE' },
                { code: '€', label: '€ EUR', region: 'EU' },
                { code: 'C$', label: 'C$ CAD', region: 'CA' },
                { code: 'A$', label: 'A$ AUD', region: 'AU' },
              ].map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCustomCurrency(c.code as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    activeCurrency === c.code
                      ? 'border-role bg-role text-white font-bold shadow-sm'
                      : 'border-slate-200 dark:border-obsidian-750 bg-slate-50 dark:bg-obsidian-850 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-obsidian-600'
                  }`}
                >
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold block mb-1 ${
                    activeCurrency === c.code ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-obsidian-800 text-slate-600 dark:text-zinc-400'
                  }`}>
                    {c.region}
                  </span>
                  <span className="text-xs font-mono font-bold">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* System Storage & Database Summary */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-obsidian-750 bg-slate-50/50 dark:bg-obsidian-850/60 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-role" />
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Local Browser Storage
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-role/10 text-role border border-role/20">
                  {datasets.length} Workbooks Saved
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                All ledger files, sheets, and normalized orders are saved locally in your browser's IndexedDB.
              </p>
            </div>

            {onOpenFileManager && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFileManager();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-role text-white hover:opacity-90 transition-opacity shadow-sm flex-shrink-0"
              >
                Open File Manager
              </button>
            )}
          </div>

          {/* About Ledgerify Section */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-obsidian-750 bg-slate-50 dark:bg-obsidian-950 flex items-center gap-4">
            <Logo size={42} glow={false} />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                  Ledgerify Analytics
                </span>
                <span className="px-1.5 py-0.2 rounded bg-role text-white text-[10px] font-bold">
                  v1.2 Obsidian
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                100% In-Browser Shopify Multi-Department Intelligence. Zero data is sent to external servers.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-obsidian-800 bg-slate-50/70 dark:bg-obsidian-950/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-role text-white font-semibold text-xs shadow-role-glow hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
