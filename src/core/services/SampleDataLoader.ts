import { IFileParser } from '../parser/IFileParser';
import { Dataset } from '../../types/order';

export class SampleDataLoader {
  constructor(private parser: IFileParser) {}

  async loadSample(type: 'UK' | 'US'): Promise<Dataset> {
    const filename = type === 'UK' ? 'UK Orders.xlsx' : 'US Orders.xlsx';
    const response = await fetch(`./sample_files/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load sample file ${filename}: HTTP ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    return this.parser.parseWorkbook(buffer, filename);
  }

  async loadBothSamples(): Promise<{ uk: Dataset; us: Dataset }> {
    const [uk, us] = await Promise.all([
      this.loadSample('UK'),
      this.loadSample('US')
    ]);
    return { uk, us };
  }
}
