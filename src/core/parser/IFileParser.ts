import { Dataset } from '../../types/order';

export interface IFileParser {
  parseWorkbook(fileBuffer: ArrayBuffer, filename: string): Promise<Dataset>;
}
