import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dataset } from '../types/order';
import { useServices } from './ServiceContext';

interface DataContextType {
  datasets: Dataset[];
  activeDatasetId: string | null;
  activeDataset: Dataset | null;
  secondaryDatasetId: string | null;
  secondaryDataset: Dataset | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  uploadFile: (file: File) => Promise<void>;
  loadSampleDataset: (type: 'UK' | 'US') => Promise<void>;
  loadBothAndCompare: () => Promise<void>;
  setActiveDatasetId: (id: string) => void;
  setSecondaryDatasetId: (id: string | null) => void;
  removeDataset: (id: string) => Promise<void>;
  clearAllDatasets: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { parser, storage, sampleDataLoader } = useServices();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [secondaryDatasetId, setSecondaryDatasetId] = useState<string | null>(null);
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

        if (stored.length > 0 && mounted) {
          setDatasets(stored);
          setActiveDatasetId(stored[0].id);
          if (stored.length > 1) {
            setSecondaryDatasetId(stored[1].id);
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
      setSecondaryDatasetId(us.id);
    } catch (err: any) {
      console.error('Comparative loading error:', err);
      setError(err.message || 'Failed to load comparative datasets');
    } finally {
      setIsLoading(false);
    }
  };

  const removeDataset = async (id: string) => {
    await storage.deleteDataset(id);
    setDatasets(prev => {
      const remaining = prev.filter(d => d.id !== id);
      if (activeDatasetId === id) {
        setActiveDatasetId(remaining[0]?.id || null);
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
  };

  const activeDataset = datasets.find(d => d.id === activeDatasetId) || datasets[0] || null;
  const secondaryDataset = datasets.find(d => d.id === secondaryDatasetId) || (datasets.length > 1 ? datasets[1] : null);

  return (
    <DataContext.Provider
      value={{
        datasets,
        activeDatasetId,
        activeDataset,
        secondaryDatasetId,
        secondaryDataset,
        isLoading,
        loadingMessage,
        error,
        uploadFile,
        loadSampleDataset,
        loadBothAndCompare,
        setActiveDatasetId,
        setSecondaryDatasetId,
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
