import { Dataset } from '../../types/order';

export interface ParseOptions {
  customName?: string;
  region?: string;
  currency?: string;
}

export interface IFileParser {
  parseWorkbook(fileBuffer: ArrayBuffer, filename: string, options?: ParseOptions): Promise<Dataset>;
}
