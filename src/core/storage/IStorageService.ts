import { Dataset } from '../../types/order';

export interface IStorageService {
  saveDataset(dataset: Dataset): Promise<void>;
  getDataset(id: string): Promise<Dataset | null>;
  getAllDatasets(): Promise<Dataset[]>;
  deleteDataset(id: string): Promise<void>;
  clearAll(): Promise<void>;
}
