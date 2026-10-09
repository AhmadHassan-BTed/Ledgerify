import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Dataset, NormalizedOrder, SheetData } from '../types/order';
import { useServices } from './ServiceContext';

interface DataContextType {
  datasets: Dataset[];
  activeDatasetId: string | null;
  activeDataset: Dataset | null;
  activeOrders: NormalizedOrder[];
  selectedSheet: string;
  setSelectedSheet: (sheetName: string) => void;
  availableSheets: string[];

  // Compare Feature (Global toggleable capability)
  isCompareEnabled: boolean;
  setIsCompareEnabled: (enabled: boolean) => void;
  toggleCompare: () => void;
  secondaryDatasetId: string | null;
  secondaryDataset: Dataset | null;
  secondaryOrders: NormalizedOrder[];
  secondarySelectedSheet: string;
  setSecondarySelectedSheet: (sheetName: string) => void;
  setSecondaryDatasetId: (id: string | null) => void;

  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  uploadFile: (file: File) => Promise<void>;
  loadSampleDataset: (type: 'UK' | 'US') => Promise<void>;
  loadBothAndCompare: () => Promise<void>;
  setActiveDatasetId: (id: string) => void;
  removeDataset: (id: string) => Promise<void>;
  clearAllDatasets: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { parser, storage, sampleDataLoader } = useServices();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('default');

  // Compare Feature State
  const [isCompareEnabled, setIsCompareEnabled] = useState<boolean>(false);
  const [secondaryDatasetId, setSecondaryDatasetId] = useState<string | null>(null);
  const [secondarySelectedSheet, setSecondarySelectedSheet] = useState<string>('default');

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

        // Check if stored datasets have sheets property, otherwise refresh
        const validStored = stored.filter(d => d && d.id && Array.isArray(d.orders));

        if (validStored.length > 0 && mounted) {
          // Ensure every dataset has sheets structure
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
            return d;
          });

          setDatasets(sanitized);
          setActiveDatasetId(sanitized[0].id);
          setSelectedSheet(sanitized[0].selectedSheet || Object.keys(sanitized[0].sheets)[0] || 'default');
          if (sanitized.length > 1) {
            setSecondaryDatasetId(sanitized[1].id);
            setSecondarySelectedSheet(sanitized[1].selectedSheet || Object.keys(sanitized[1].sheets)[0] || 'default');
          }
          setIsLoading(false);
          return;
        }

        // If no stored datasets, automatically preload the UK sample
        if (mounted) {
          setLoadingMessage('Loading sample UK Orders ledger...');
          const ukSample = await sampleDataLoader.loadSample('UK');
          await storage.saveDataset(ukSample);
          if (mounted) {
            setDatasets([ukSample]);
            setActiveDatasetId(ukSample.id);
            setSelectedSheet(ukSample.selectedSheet);
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
  const secondaryDataset = datasets.find(d => d.id === secondaryDatasetId) || (datasets.length > 1 ? datasets[1] : null);

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

  const uploadFile = async (file: File) => {
    try {
      setIsLoading(true);
      setLoadingMessage(`Ingesting & sanitizing ${file.name}...`);
      setError(null);

      const buffer = await file.arrayBuffer();
      const dataset = await parser.parseWorkbook(buffer, file.name);

      await storage.saveDataset(dataset);
      setDatasets(prev => {
        const filtered = prev.filter(d => d.id !== dataset.id);
        return [dataset, ...filtered];
      });
      setActiveDatasetId(dataset.id);
      setSelectedSheet(dataset.selectedSheet);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setError(err.message || `Failed to parse ${file.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleDataset = async (type: 'UK' | 'US') => {
    try {
      setIsLoading(true);
      setLoadingMessage(`Fetching ${type} sample orders workbook...`);
      setError(null);

      const dataset = await sampleDataLoader.loadSample(type);
      await storage.saveDataset(dataset);

      setDatasets(prev => {
        const exists = prev.find(d => d.filename === dataset.filename);
        if (exists) {
          return prev.map(d => d.filename === dataset.filename ? dataset : d);
        }
        return [dataset, ...prev];
      });

      setActiveDatasetId(dataset.id);
      setSelectedSheet(dataset.selectedSheet);
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
      await storage.saveDataset(uk);
      await storage.saveDataset(us);

      setDatasets([uk, us]);
      setActiveDatasetId(uk.id);
      setSelectedSheet(uk.selectedSheet);
      setSecondaryDatasetId(us.id);
      setSecondarySelectedSheet(us.selectedSheet);
      setIsCompareEnabled(true);
    } catch (err: any) {
      console.error('Comparative loading error:', err);
      setError(err.message || 'Failed to load comparative datasets');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompare = () => {
    setIsCompareEnabled(prev => !prev);
  };

  const removeDataset = async (id: string) => {
    await storage.deleteDataset(id);
    setDatasets(prev => {
      const remaining = prev.filter(d => d.id !== id);
      if (activeDatasetId === id) {
        setActiveDatasetId(remaining[0]?.id || null);
        setSelectedSheet(remaining[0]?.selectedSheet || 'default');
      }
      if (secondaryDatasetId === id) {
        setSecondaryDatasetId(remaining[1]?.id || null);
      }
      return remaining;
    });
  };

  const clearAllDatasets = async () => {
    await storage.clearAll();
    setDatasets([]);
    setActiveDatasetId(null);
    setSecondaryDatasetId(null);
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
        secondaryDatasetId,
        secondaryDataset,
        secondaryOrders,
        secondarySelectedSheet,
        setSecondarySelectedSheet,
        setSecondaryDatasetId,

        isLoading,
        loadingMessage,
        error,
        uploadFile,
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
