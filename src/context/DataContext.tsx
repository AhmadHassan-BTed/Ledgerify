import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Dataset, NormalizedOrder, SheetData, REGIONS } from '../types/order';
import { DrillDownData } from '../types/analytics';
import { useServices } from './ServiceContext';

interface UploadOptions {
  customName?: string;
  region?: string;
  currency?: string;
}

interface DataContextType {
  datasets: Dataset[];
  activeDatasetId: string | null;
  activeDataset: Dataset | null;
  activeOrders: NormalizedOrder[];
  selectedSheet: string;
  setSelectedSheet: (sheetName: string) => void;
  availableSheets: string[];

  // Compare Feature (Flexible Multi-Dataset Comparison)
  isCompareEnabled: boolean;
  setIsCompareEnabled: (enabled: boolean) => void;
  toggleCompare: () => void;
  comparedDatasetIds: string[];
  setComparedDatasetIds: (ids: string[]) => void;
  addComparedDatasetId: (id: string) => void;
  removeComparedDatasetId: (id: string) => void;
  comparedDatasets: Dataset[];

  // Backwards compatibility for dual-dataset views
  secondaryDatasetId: string | null;
  secondaryDataset: Dataset | null;
  secondaryOrders: NormalizedOrder[];
  secondarySelectedSheet: string;
  setSecondarySelectedSheet: (sheetName: string) => void;
  setSecondaryDatasetId: (id: string | null) => void;

  // Developer & Data Quality Mode
  isDevMode: boolean;
  setIsDevMode: (enabled: boolean) => void;

  // Global Drill Down State
  drillDownData: DrillDownData | null;
  openDrillDown: (data: DrillDownData) => void;
  closeDrillDown: () => void;

  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  uploadFile: (file: File, options?: UploadOptions) => Promise<void>;
  updateDataset: (id: string, updates: Partial<Dataset>) => Promise<void>;
  replaceDatasetFile: (id: string, file: File, options?: UploadOptions) => Promise<void>;
  exportDatasetCsv: (id: string) => void;
  loadSampleDataset: (type: 'UK' | 'US') => Promise<void>;
  loadBothAndCompare: () => Promise<void>;
  setActiveDatasetId: (id: string) => void;
  removeDataset: (id: string) => Promise<void>;
  clearAllDatasets: () => Promise<void>;
}

const getDefaultSheetForDataset = (d: Dataset | null | undefined): string => {
  if (!d || !d.sheets) return d?.selectedSheet || 'default';
  const keys = Object.keys(d.sheets);
  if (keys.length > 1) {
    return 'All Sheets (Combined)';
  }
  return keys[0] || d.selectedSheet || 'default';
};

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { parser, storage, sampleDataLoader } = useServices();

  // Initialize state with localStorage fallbacks
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ledgerify_active_dataset_id');
    } catch {
      return null;
    }
  });
  const [selectedSheet, setSelectedSheetState] = useState<string>(() => {
    try {
      return localStorage.getItem('ledgerify_selected_sheet') || 'All Sheets (Combined)';
    } catch {
      return 'All Sheets (Combined)';
    }
  });

  // Compare Feature State
  const [isCompareEnabled, setIsCompareEnabledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ledgerify_is_compare_enabled') === 'true';
    } catch {
      return false;
    }
  });
  const [comparedDatasetIds, setComparedDatasetIdsState] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ledgerify_compared_dataset_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [secondarySelectedSheet, setSecondarySelectedSheetState] = useState<string>(() => {
    try {
      return localStorage.getItem('ledgerify_secondary_selected_sheet') || 'All Sheets (Combined)';
    } catch {
      return 'All Sheets (Combined)';
    }
  });

  const setActiveDatasetId = (id: string | null) => {
    setActiveDatasetIdState(id);
    try {
      if (id) {
        localStorage.setItem('ledgerify_active_dataset_id', id);
        const target = datasets.find(d => d.id === id);
        if (target) {
          const nextSheet = getDefaultSheetForDataset(target);
          setSelectedSheetState(nextSheet);
          localStorage.setItem('ledgerify_selected_sheet', nextSheet);
        }
      } else {
        localStorage.removeItem('ledgerify_active_dataset_id');
      }
    } catch {}
  };

  const setSelectedSheet = (sheet: string) => {
    setSelectedSheetState(sheet);
    try {
      localStorage.setItem('ledgerify_selected_sheet', sheet);
    } catch {}
  };

  const setIsCompareEnabled = (action: boolean | ((prev: boolean) => boolean)) => {
    setIsCompareEnabledState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      try {
        localStorage.setItem('ledgerify_is_compare_enabled', String(next));
      } catch {}
      return next;
    });
  };

  const setSecondarySelectedSheet = (sheet: string) => {
    setSecondarySelectedSheetState(sheet);
    try {
      localStorage.setItem('ledgerify_secondary_selected_sheet', sheet);
    } catch {}
  };

  // Dev Mode State (Default: false)
  const [isDevMode, setIsDevModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ledgerify_dev_mode') === 'true';
    } catch {
      return false;
    }
  });

  const setIsDevMode = (enabled: boolean) => {
    setIsDevModeState(enabled);
    try {
      localStorage.setItem('ledgerify_dev_mode', String(enabled));
    } catch {
      // ignore
    }
  };

  // Drill-Down Modal State
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const openDrillDown = (data: DrillDownData) => setDrillDownData(data);
  const closeDrillDown = () => setDrillDownData(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing Ledgerify...');
  const [error, setError] = useState<string | null>(null);

  // Initialize from storage or pre-load UK sample
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setLoadingMessage('Restoring saved ledger sessions...');
        const stored = await storage.getAllDatasets();

        const validStored = stored.filter(d => d && d.id && Array.isArray(d.orders));

        if (validStored.length > 0 && mounted) {
          const sanitized = validStored.map(d => {
            if (!d.sheets) {
              const defSheetName = d.selectedSheet || 'Ledger';
              d.sheets = {
                [defSheetName]: {
                  name: defSheetName,
                  rowCount: d.orders?.length || 0,
                  headers: [],
                  orders: d.orders || [],
                  isLedger: true
                }
              };
            }
            if (!d.region) {
              const r = d.sourceType === 'UK' ? REGIONS[0] : REGIONS[1];
              d.region = r.code;
            }
            return d;
          });

          setDatasets(sanitized);

          // Restore saved active dataset or fallback to first
          const savedActiveId = localStorage.getItem('ledgerify_active_dataset_id');
          const targetActive = sanitized.find(d => d.id === savedActiveId) || sanitized[0];
          setActiveDatasetIdState(targetActive.id);
          
          const savedSheet = localStorage.getItem('ledgerify_selected_sheet');
          setSelectedSheetState(savedSheet && (savedSheet === 'All Sheets (Combined)' || targetActive.sheets?.[savedSheet]) ? savedSheet : getDefaultSheetForDataset(targetActive));

          // Restore saved compared dataset IDs
          let savedCompared: string[] = [];
          try {
            const raw = localStorage.getItem('ledgerify_compared_dataset_ids');
            if (raw) savedCompared = JSON.parse(raw);
          } catch {}

          const validCompared = savedCompared.filter(id => sanitized.some(d => d.id === id));
          if (validCompared.length >= 2) {
            setComparedDatasetIdsState(validCompared);
          } else if (sanitized.length > 1) {
            setComparedDatasetIdsState(sanitized.slice(0, 2).map(d => d.id));
          }

          setIsLoading(false);
          return;
        }

        // If no stored datasets, automatically preload the UK sample
        if (mounted) {
          setLoadingMessage('Loading sample UK Orders ledger...');
          const ukSample = await sampleDataLoader.loadSample('UK');
          ukSample.region = 'UK';
          ukSample.currency = '£';
          await storage.saveDataset(ukSample);
          if (mounted) {
            setDatasets([ukSample]);
            setActiveDatasetId(ukSample.id);
            setSelectedSheet(getDefaultSheetForDataset(ukSample));
            setIsLoading(false);
          }
        }
      } catch (err: any) {
        console.error('Initialization error:', err);
        if (mounted) {
          setError(err.message || 'Failed to initialize datasets');
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [storage, sampleDataLoader]);

  const activeDataset = datasets.find(d => d.id === activeDatasetId) || datasets[0] || null;

  // Multi-dataset comparison resolution
  const comparedDatasets = useMemo(() => {
    if (comparedDatasetIds.length > 0) {
      const resolved = comparedDatasetIds
        .map(id => datasets.find(d => d.id === id))
        .filter(Boolean) as Dataset[];
      if (resolved.length > 0) return resolved;
    }
    return datasets.length >= 2 ? datasets.slice(0, 2) : datasets;
  }, [comparedDatasetIds, datasets]);

  const secondaryDataset = useMemo(() => {
    if (comparedDatasets.length >= 2) {
      return comparedDatasets[1];
    }
    const other = datasets.find(d => d.id !== activeDatasetId);
    return other || null;
  }, [comparedDatasets, datasets, activeDatasetId]);

  const secondaryDatasetId = secondaryDataset?.id || null;

  const setSecondaryDatasetId = (id: string | null) => {
    if (!id) return;
    setComparedDatasetIdsState(prev => {
      const first = prev[0] || activeDatasetId || datasets[0]?.id;
      return [first, id, ...prev.slice(2).filter(x => x !== id && x !== first)];
    });
  };

  const setComparedDatasetIds = (ids: string[]) => {
    const valid = ids.filter(id => datasets.some(d => d.id === id));
    setComparedDatasetIdsState(valid);
    try {
      localStorage.setItem('ledgerify_compared_dataset_ids', JSON.stringify(valid));
    } catch {}
  };

  const addComparedDatasetId = (id: string) => {
    setComparedDatasetIdsState(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('ledgerify_compared_dataset_ids', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const removeComparedDatasetId = (id: string) => {
    setComparedDatasetIdsState(prev => {
      let next = prev.filter(x => x !== id);
      if (next.length < 2 && isCompareEnabled) {
        // keep at least 2 if available
        const remaining = datasets.filter(d => !next.includes(d.id));
        if (remaining.length > 0 && next.length === 1) {
          next = [...next, remaining[0].id];
        }
      }
      try {
        localStorage.setItem('ledgerify_compared_dataset_ids', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Available sheets for active dataset with robust null safety
  const availableSheets = useMemo(() => {
    if (!activeDataset) return [];
    if (!activeDataset.sheets) {
      return (activeDataset as any).availableSheets || [activeDataset.selectedSheet || 'Ledger'];
    }
    const list = Object.keys(activeDataset.sheets);
    if (list.length > 1 && !list.includes('All Sheets (Combined)')) {
      return ['All Sheets (Combined)', ...list];
    }
    return list;
  }, [activeDataset]);

  // Compute active orders based on selectedSheet with robust null safety
  const activeOrders = useMemo(() => {
    if (!activeDataset) return [];
    if (!activeDataset.sheets) {
      return activeDataset.orders || [];
    }

    if (selectedSheet === 'All Sheets (Combined)') {
      const seen = new Set<string>();
      const combined: NormalizedOrder[] = [];
      for (const s of Object.values(activeDataset.sheets) as SheetData[]) {
        if (s && Array.isArray(s.orders)) {
          for (const o of s.orders) {
            if (o && o.orderNumber && !seen.has(o.orderNumber)) {
              seen.add(o.orderNumber);
              combined.push(o);
            }
          }
        }
      }
      return combined.length > 0 ? combined : activeDataset.orders || [];
    }

    const sheet = activeDataset.sheets[selectedSheet];
    if (sheet && Array.isArray(sheet.orders) && sheet.orders.length > 0) {
      return sheet.orders;
    }

    return activeDataset.orders || [];
  }, [activeDataset, selectedSheet]);

  // Compute secondary orders based on secondarySelectedSheet with robust null safety
  const secondaryOrders = useMemo(() => {
    if (!secondaryDataset) return [];
    if (!secondaryDataset.sheets) {
      return secondaryDataset.orders || [];
    }

    if (secondarySelectedSheet === 'All Sheets (Combined)') {
      const seen = new Set<string>();
      const combined: NormalizedOrder[] = [];
      for (const s of Object.values(secondaryDataset.sheets) as SheetData[]) {
        if (s && Array.isArray(s.orders)) {
          for (const o of s.orders) {
            if (o && o.orderNumber && !seen.has(o.orderNumber)) {
              seen.add(o.orderNumber);
              combined.push(o);
            }
          }
        }
      }
      return combined.length > 0 ? combined : secondaryDataset.orders || [];
    }

    const sheet = secondaryDataset.sheets[secondarySelectedSheet];
    if (sheet && Array.isArray(sheet.orders) && sheet.orders.length > 0) {
      return sheet.orders;
    }

    return secondaryDataset.orders || [];
  }, [secondaryDataset, secondarySelectedSheet]);

  const uploadFile = async (file: File, options?: UploadOptions) => {
    try {
      setIsLoading(true);
      setLoadingMessage(`Parsing workbook "${file.name}"...`);
      setError(null);

      const buffer = await file.arrayBuffer();
      const parsed = await parser.parseWorkbook(buffer, file.name, options);
      await storage.saveDataset(parsed);

      setDatasets(prev => {
        const next = [parsed, ...prev.filter(d => d.id !== parsed.id)];
        return next;
      });

      setActiveDatasetId(parsed.id);
      setSelectedSheet(getDefaultSheetForDataset(parsed));

      // Add to compared list if compare is enabled
      setComparedDatasetIdsState(prev => {
        if (prev.length < 2) {
          return [parsed.id, ...(prev.filter(id => id !== parsed.id))];
        }
        return prev;
      });
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err.message || 'Failed to parse and store file');
    } finally {
      setIsLoading(false);
    }
  };

  const updateDataset = async (id: string, updates: Partial<Dataset>) => {
    try {
      const dataset = datasets.find(d => d.id === id);
      if (!dataset) return;

      const updated = { ...dataset, ...updates };
      await storage.saveDataset(updated);

      setDatasets(prev => prev.map(d => d.id === id ? updated : d));
    } catch (err: any) {
      console.error('Dataset update error:', err);
      setError(err.message || 'Failed to update dataset');
    }
  };

  const replaceDatasetFile = async (id: string, file: File, options?: UploadOptions) => {
    try {
      setIsLoading(true);
      setLoadingMessage(`Renewing dataset with "${file.name}"...`);
      setError(null);

      const existing = datasets.find(d => d.id === id);
      const buffer = await file.arrayBuffer();
      const parsed = await parser.parseWorkbook(buffer, file.name, {
        customName: options?.customName || existing?.name || file.name,
        region: options?.region || existing?.region,
        currency: options?.currency || existing?.currency
      });

      parsed.id = id; // Preserve ID
      await storage.saveDataset(parsed);

      setDatasets(prev => prev.map(d => d.id === id ? parsed : d));

      if (activeDatasetId === id) {
        setSelectedSheet(getDefaultSheetForDataset(parsed));
      }
    } catch (err: any) {
      console.error('Dataset renewal error:', err);
      setError(err.message || 'Failed to renew dataset file');
    } finally {
      setIsLoading(false);
    }
  };

  const exportDatasetCsv = (id: string) => {
    const target = datasets.find(d => d.id === id);
    if (!target || !target.orders || target.orders.length === 0) return;

    const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'City', 'Province/State', 'Country', 'Fragrances', 'Order Value', 'Status'];
    const rows = target.orders.map(o => [
      `"${o.orderNumber}"`,
      `"${o.date}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${(o.email || '').replace(/"/g, '""')}"`,
      `"${(o.city || '').replace(/"/g, '""')}"`,
      `"${(o.provinceState || '').replace(/"/g, '""')}"`,
      `"${(o.country || '').replace(/"/g, '""')}"`,
      `"${(o.fragrancesRaw || '').replace(/"/g, '""')}"`,
      o.orderValue.toFixed(2),
      `"${o.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(target.name || 'ledger').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSampleDataset = async (type: 'UK' | 'US') => {
    try {
      setIsLoading(true);
      setLoadingMessage(`Fetching ${type} sample orders workbook...`);
      setError(null);

      const dataset = await sampleDataLoader.loadSample(type);
      dataset.region = type === 'UK' ? 'UK' : 'USA';
      dataset.currency = type === 'UK' ? '£' : '$';
      await storage.saveDataset(dataset);

      setDatasets(prev => {
        const exists = prev.find(d => d.filename === dataset.filename);
        if (exists) {
          return prev.map(d => d.filename === dataset.filename ? dataset : d);
        }
        return [dataset, ...prev];
      });

      setActiveDatasetId(dataset.id);
      setSelectedSheet(getDefaultSheetForDataset(dataset));
    } catch (err: any) {
      console.error('Sample loading error:', err);
      setError(err.message || 'Failed to load sample dataset');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBothAndCompare = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Loading UK & US datasets for side-by-side comparison...');
      setError(null);

      const { uk, us } = await sampleDataLoader.loadBothSamples();
      uk.region = 'UK';
      uk.currency = '£';
      us.region = 'USA';
      us.currency = '$';

      await storage.saveDataset(uk);
      await storage.saveDataset(us);

      setDatasets([uk, us]);
      setActiveDatasetId(uk.id);
      setSelectedSheet(getDefaultSheetForDataset(uk));
      setComparedDatasetIdsState([uk.id, us.id]);
      setSecondarySelectedSheet(getDefaultSheetForDataset(us));
      setIsCompareEnabled(true);
    } catch (err: any) {
      console.error('Comparative loading error:', err);
      setError(err.message || 'Failed to load comparative datasets');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompare = () => {
    if (datasets.length < 2) return;
    setIsCompareEnabled(prev => {
      const next = !prev;
      if (next && comparedDatasetIds.length < 2) {
        setComparedDatasetIdsState(datasets.slice(0, 2).map(d => d.id));
      }
      return next;
    });
  };

  const removeDataset = async (id: string) => {
    await storage.deleteDataset(id);
    setDatasets(prev => {
      const remaining = prev.filter(d => d.id !== id);
      if (activeDatasetId === id) {
        setActiveDatasetId(remaining[0]?.id || null);
        setSelectedSheet(remaining[0]?.selectedSheet || 'default');
      }
      setComparedDatasetIdsState(current => current.filter(x => x !== id));
      if (remaining.length < 2) {
        setIsCompareEnabled(false);
      }
      return remaining;
    });
  };

  const clearAllDatasets = async () => {
    await storage.clearAll();
    setDatasets([]);
    setActiveDatasetId(null);
    setComparedDatasetIdsState([]);
    setIsCompareEnabled(false);
  };

  return (
    <DataContext.Provider
      value={{
        datasets,
        activeDatasetId,
        activeDataset,
        activeOrders,
        selectedSheet,
        setSelectedSheet,
        availableSheets,

        isCompareEnabled,
        setIsCompareEnabled,
        toggleCompare,
        comparedDatasetIds,
        setComparedDatasetIds,
        addComparedDatasetId,
        removeComparedDatasetId,
        comparedDatasets,
        secondaryDatasetId,
        secondaryDataset,
        secondaryOrders,
        secondarySelectedSheet,
        setSecondarySelectedSheet,
        setSecondaryDatasetId,

        isDevMode,
        setIsDevMode,

        drillDownData,
        openDrillDown,
        closeDrillDown,

        isLoading,
        loadingMessage,
        error,
        uploadFile,
        updateDataset,
        replaceDatasetFile,
        exportDatasetCsv,
        loadSampleDataset,
        loadBothAndCompare,
        setActiveDatasetId,
        removeDataset,
        clearAllDatasets,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
