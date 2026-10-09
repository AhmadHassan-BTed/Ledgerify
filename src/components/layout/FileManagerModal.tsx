import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Globe,
  Trash2,
  RefreshCw,
  Edit3,
  Check,
  Download,
  Building2,
  Layers,
  ArrowRightLeft,
  Calendar,
  DollarSign,
  Package,
  Plus
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { REGIONS, Dataset } from '../../types/order';
import { Logo } from '../ui/Logo';

interface FileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'list' | 'upload';
}

export const FileManagerModal: React.FC<FileManagerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'list'
}) => {
  const {
    datasets,
    activeDatasetId,
    setActiveDatasetId,
    uploadFile,
    updateDataset,
    replaceDatasetFile,
    removeDataset,
    clearAllDatasets,
    exportDatasetCsv,
    loadSampleDataset,
    loadBothAndCompare,
    isLoading,
    loadingMessage,
    error
  } = useData();

  const [activeTab, setActiveTab] = useState<'list' | 'upload'>(
    datasets.length === 0 ? 'upload' : initialTab
  );

  // Upload Tab Form State
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('UK');
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  // Inline Editing State for Datasets List
  const [editingDatasetId, setEditingDatasetId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  // Replace / Renew File State
  const [replacingDatasetId, setReplacingDatasetId] = useState<string | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectedUploadFile = (file: File) => {
    setSelectedFile(file);
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    setCustomName(baseName);

    const lower = file.name.toLowerCase();
    if (lower.includes('uk') || lower.includes('gb')) {
      setSelectedRegion('UK');
    } else if (lower.includes('us')) {
      setSelectedRegion('USA');
    } else if (lower.includes('uae') || lower.includes('dubai')) {
      setSelectedRegion('UAE');
    } else if (lower.includes('eu') || lower.includes('europe')) {
      setSelectedRegion('EU');
    } else if (lower.includes('ca') || lower.includes('canada')) {
      setSelectedRegion('CA');
    } else if (lower.includes('au') || lower.includes('australia')) {
      setSelectedRegion('AU');
    } else {
      setSelectedRegion('GLOBAL');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleSelectedUploadFile(files[0]);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    const regionObj = REGIONS.find(r => r.code === selectedRegion) || REGIONS[0];
    await uploadFile(selectedFile, {
      customName: customName.trim() || selectedFile.name,
      region: selectedRegion,
      currency: regionObj.currency
    });
    setSelectedFile(null);
    setCustomName('');
    setActiveTab('list');
  };

  const handleStartRename = (dataset: Dataset) => {
    setEditingDatasetId(dataset.id);
    setEditNameValue(dataset.name);
  };

  const handleSaveRename = async (id: string) => {
    if (editNameValue.trim()) {
      await updateDataset(id, { name: editNameValue.trim() });
    }
    setEditingDatasetId(null);
  };

  const handleRegionChange = async (id: string, newRegionCode: string) => {
    const regionObj = REGIONS.find(r => r.code === newRegionCode) || REGIONS[0];
    await updateDataset(id, {
      region: newRegionCode,
      currency: regionObj.currency
    });
  };

  const handleTriggerReplace = (id: string) => {
    setReplacingDatasetId(id);
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && replacingDatasetId) {
      const file = files[0];
      await replaceDatasetFile(replacingDatasetId, file);
      setReplacingDatasetId(null);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Hidden file input for file replacement */}
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleReplaceFileSelected}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      <div className="relative w-full max-w-4xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-obsidian-800/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Logo size={36} glow={true} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                  Ledger &amp; File Manager
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-role-subtle text-role border border-role-subtle">
                  {datasets.length} {datasets.length === 1 ? 'Workbook' : 'Workbooks'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Upload, rename, assign regional currencies, renew sheets, or compare ledgers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Workbooks List vs. Upload New) */}
        <div className="flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-100 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-role" />
              <span>My Workbooks ({datasets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-100 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Plus className="w-4 h-4 text-role" />
              <span>Upload New File</span>
            </button>
          </div>

          {/* Quick Demo Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => loadSampleDataset('UK')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-obsidian-850 hover:bg-slate-100 dark:hover:bg-obsidian-800 border border-slate-200 dark:border-obsidian-750 text-slate-700 dark:text-zinc-300 transition-colors"
            >
              + UK Demo
            </button>
            <button
              type="button"
              onClick={() => loadSampleDataset('US')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-obsidian-850 hover:bg-slate-100 dark:hover:bg-obsidian-800 border border-slate-200 dark:border-obsidian-750 text-slate-700 dark:text-zinc-300 transition-colors"
            >
              + US Demo
            </button>
            <button
              type="button"
              onClick={() => loadBothAndCompare()}
              className="px-2.5 py-1.5 rounded-xl bg-role-subtle hover:opacity-90 text-role border border-role-subtle font-semibold transition-colors"
            >
              + Load Both Demos
            </button>
          </div>
        </div>

        {/* Global Loading or Error Banner */}
        {isLoading && (
          <div className="p-3 rounded-2xl bg-role-subtle border border-role-subtle text-xs text-role flex items-center gap-2 flex-shrink-0 animate-pulse">
            <div className="w-4 h-4 border-2 border-role border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold">{loadingMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* TAB 1: WORKBOOKS LIST */}
          {activeTab === 'list' && (
            <div className="space-y-3.5">
              {datasets.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-obsidian-750 p-6 space-y-3">
                  <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                    No Shopify Ledgers Loaded
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Upload an Excel export from your Shopify store or load sample datasets to start analyzing.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-role text-white text-xs font-bold shadow-role-glow"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Your First File</span>
                  </button>
                </div>
              ) : (
                datasets.map((d) => {
                  const isActive = d.id === activeDatasetId;
                  const isEditing = editingDatasetId === d.id;
                  const totalRevenue = (d.orders || []).reduce((sum, o) => sum + o.orderValue, 0);

                  return (
                    <div
                      key={d.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-role-subtle/30 border-role shadow-sm'
                          : 'bg-slate-50/70 dark:bg-obsidian-850/60 border-slate-200/80 dark:border-obsidian-750 hover:border-slate-300 dark:hover:border-obsidian-600'
                      }`}
                    >
                      {/* Top Row: Name, Badges, and Region Selector */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-obsidian-800/80">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isActive
                              ? 'bg-role text-white shadow-role-glow'
                              : 'bg-slate-200 dark:bg-obsidian-750 text-slate-700 dark:text-zinc-300'
                          }`}>
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editNameValue}
                                  onChange={(e) => setEditNameValue(e.target.value)}
                                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-role bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveRename(d.id)}
                                  className="p-1 rounded-md bg-role text-white text-xs"
                                  title="Save Name"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingDatasetId(null)}
                                  className="p-1 rounded-md bg-slate-200 dark:bg-obsidian-750 text-xs text-slate-600 dark:text-zinc-400"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 truncate">
                                  {d.name}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => handleStartRename(d)}
                                  className="text-slate-400 hover:text-role p-0.5 rounded transition-colors"
                                  title="Rename Dataset"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 truncate max-w-[200px]">
                                {d.filename}
                              </span>
                              <span>·</span>
                              <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                                {d.totalRows} rows
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badges & Region Assignment */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Role Status Tag */}
                          {isActive && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-role text-white shadow-role-glow uppercase tracking-wider">
                              Active Primary
                            </span>
                          )}

                          {/* Region & Currency Selector */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 text-xs">
                            <Globe className="w-3.5 h-3.5 text-role" />
                            <select
                              value={d.region || 'UK'}
                              onChange={(e) => handleRegionChange(d.id, e.target.value)}
                              className="bg-transparent text-slate-800 dark:text-zinc-200 font-semibold text-xs focus:outline-none cursor-pointer"
                              title="Assign Region & Currency"
                            >
                              {REGIONS.map((r) => (
                                <option
                                  key={r.code}
                                  value={r.code}
                                  className="bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-100"
                                >
                                  [{r.regionCode}] {r.name} ({r.currency})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Middle Metadata Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
                        <div className="p-2 rounded-xl bg-white/70 dark:bg-obsidian-900/70 border border-slate-100 dark:border-obsidian-750">
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono block">Gross Sales</span>
                          <span className="font-extrabold font-mono text-slate-900 dark:text-zinc-100">
                            {d.currency}{Math.round(totalRevenue).toLocaleString()}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/70 dark:bg-obsidian-900/70 border border-slate-100 dark:border-obsidian-750">
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono block">Sheet Name</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">
                            {d.selectedSheet || 'Default Ledger'}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/70 dark:bg-obsidian-900/70 border border-slate-100 dark:border-obsidian-750">
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono block">Health Audit</span>
                          <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                            {d.dataQuality?.healthScore || 100}% Score
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/70 dark:bg-obsidian-900/70 border border-slate-100 dark:border-obsidian-750">
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono block">Imported</span>
                          <span className="font-medium text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
                            {new Date(d.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-obsidian-800/80 text-xs">
                        <div className="flex items-center gap-2">
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => setActiveDatasetId(d.id)}
                              className="px-3 py-1.5 rounded-xl bg-role text-white font-semibold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Set as Active Primary</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Renew / Replace File */}
                          <button
                            type="button"
                            onClick={() => handleTriggerReplace(d.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-obsidian-800 hover:bg-slate-200 dark:hover:bg-obsidian-750 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-700 transition-colors flex items-center gap-1.5"
                            title="Upload an updated .xlsx file to replace this dataset"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-role" />
                            <span>Renew / Replace</span>
                          </button>

                          {/* Export CSV */}
                          <button
                            type="button"
                            onClick={() => exportDatasetCsv(d.id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-obsidian-800 transition-colors"
                            title="Export Sanitized CSV"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Delete Dataset */}
                          <button
                            type="button"
                            onClick={() => removeDataset(d.id)}
                            className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Dataset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD NEW FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onClick={() => uploadFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-role bg-role-subtle shadow-role-glow'
                      : 'border-slate-200 dark:border-obsidian-750 hover:border-role/70 bg-slate-50/50 dark:bg-obsidian-850/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={uploadFileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleSelectedUploadFile(e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                  />

                  <div className="w-14 h-14 rounded-2xl bg-role-subtle border border-role-subtle flex items-center justify-center text-role mb-3 shadow-role-glow">
                    <Upload className="w-7 h-7" />
                  </div>

                  <span className="text-base font-bold text-slate-800 dark:text-zinc-200">
                    Click to browse or drop Shopify export file here
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm">
                    Supports multi-sheet workbooks (<code className="font-mono text-role">.xlsx</code>, <code className="font-mono text-role">.xls</code>) or raw ledger (<code className="font-mono text-role">.csv</code>).
                  </span>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-obsidian-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-role-subtle flex items-center justify-center text-role">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                          {selectedFile.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 underline"
                    >
                      Choose different file
                    </button>
                  </div>

                  {/* Custom Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                      Assign Dataset Display Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. UK Store Q3 Ledger"
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-role font-medium"
                    />
                  </div>

                  {/* Region & Currency */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                      <span>Store Region &amp; Currency Format</span>
                      <span className="text-[11px] text-role font-mono font-bold">
                        Currency: {REGIONS.find(r => r.code === selectedRegion)?.currency || '$'}
                      </span>
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-role cursor-pointer font-medium"
                    >
                      {REGIONS.map((r) => (
                        <option
                          key={r.code}
                          value={r.code}
                          className="bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-100"
                        >
                          [{r.regionCode}] {r.name} — Currency: {r.currency}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-obsidian-750 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-obsidian-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleConfirmUpload}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-role text-white text-xs font-bold shadow-role-glow hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Import &amp; Analyze Ledger</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Clear All and Privacy Note */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-obsidian-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            {datasets.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all loaded datasets?')) {
                    clearAllDatasets();
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all"
              >
                Clear All Ledgers
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 dark:text-zinc-500 text-center sm:text-right">
            100% In-Browser Privacy. Data is processed locally in IndexedDB.
          </div>
        </div>
      </div>
    </div>
  );
};
