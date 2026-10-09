import { IFileParser } from '../parser/IFileParser';
import { XlsxParser } from '../parser/xlsxParser';
import { IStorageService } from '../storage/IStorageService';
import { IndexedDbStorage } from '../storage/indexedDbStorage';
import { FinanceService } from '../services/FinanceService';
import { ExecutiveService } from '../services/ExecutiveService';
import { InventoryService } from '../services/InventoryService';
import { OperationsService } from '../services/OperationsService';
import { AdminDataQualityService } from '../services/AdminDataQualityService';
import { CreativeService } from '../services/CreativeService';
import { MarketingService } from '../services/MarketingService';
import { CompareService } from '../services/CompareService';
import { SampleDataLoader } from '../services/SampleDataLoader';

export interface IAppContainer {
  parser: IFileParser;
  storage: IStorageService;
  financeService: FinanceService;
  executiveService: ExecutiveService;
  inventoryService: InventoryService;
  operationsService: OperationsService;
  adminDataQualityService: AdminDataQualityService;
  creativeService: CreativeService;
  marketingService: MarketingService;
  compareService: CompareService;
  sampleDataLoader: SampleDataLoader;
}

export class ServiceContainer implements IAppContainer {
  public readonly parser: IFileParser;
  public readonly storage: IStorageService;
  public readonly financeService: FinanceService;
  public readonly executiveService: ExecutiveService;
  public readonly inventoryService: InventoryService;
  public readonly operationsService: OperationsService;
  public readonly adminDataQualityService: AdminDataQualityService;
  public readonly creativeService: CreativeService;
  public readonly marketingService: MarketingService;
  public readonly compareService: CompareService;
  public readonly sampleDataLoader: SampleDataLoader;

  constructor(
    customParser?: IFileParser,
    customStorage?: IStorageService
  ) {
    // Parser & Storage abstractions
    this.parser = customParser || new XlsxParser();
    this.storage = customStorage || new IndexedDbStorage();

    // Domain services
    this.financeService = new FinanceService();
    this.executiveService = new ExecutiveService();
    this.inventoryService = new InventoryService();
    this.operationsService = new OperationsService();
    this.adminDataQualityService = new AdminDataQualityService();
    this.creativeService = new CreativeService();
    this.marketingService = new MarketingService();

    // Services with injected dependencies
    this.compareService = new CompareService(this.financeService, this.executiveService);
    this.sampleDataLoader = new SampleDataLoader(this.parser);
  }
}

// Default application singleton container
export const appContainer = new ServiceContainer();
