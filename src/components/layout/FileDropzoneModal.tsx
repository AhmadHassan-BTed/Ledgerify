import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle, Globe, ChevronRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { REGIONS } from '../../types/order';
import { Logo } from '../ui/Logo';

interface FileDropzoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileDropzoneModal: React.FC<FileDropzoneModalProps> = ({ isOpen, onClose }) => {
  const { uploadFile, isLoading, loadingMessage, error } = useData();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('UK');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectedFile = (file: File) => {
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
      handleSelectedFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleSelectedFile(files[0]);
      e.target.value = '';
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
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCustomName('');
  };

  const currentRegion = REGIONS.find(r => r.code === selectedRegion) || REGIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            handleReset();
            onClose();
          }}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-obsidian-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <Logo size={40} glow={true} />
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Ingest Shopify Excel Export</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              100% In-Browser. Dynamic column normalization &amp; entity mapping.
            </p>
          </div>
        </div>

        {!selectedFile ? (
          /* Step 1: Dropzone */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-role bg-role-subtle shadow-role-glow'
                : 'border-slate-200 dark:border-obsidian-700 hover:border-role/70 bg-slate-50/50 dark:bg-obsidian-850/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            <div className="w-12 h-12 rounded-2xl bg-role-subtle border border-role-subtle flex items-center justify-center text-role mb-3 shadow-role-glow">
              <Upload className="w-6 h-6" />
            </div>

            <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
              Click to browse or drop file here
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
              Supports Shopify orders export (<code className="font-mono text-role">.xlsx</code> or <code className="font-mono text-role">.csv</code>)
            </span>
          </div>
        ) : (
          /* Step 2: Configure Name & Region Tagging */
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-obsidian-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-role" />
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate max-w-[240px]">
                  {selectedFile.name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 underline"
              >
                Change file
              </button>
            </div>

            {/* Dataset Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">
                Dataset Display Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. UK Store Q1 Orders"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-role"
              />
            </div>

            {/* Region Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Store Region &amp; Currency</span>
                <span className="text-[11px] text-role font-mono font-bold">
                  Currency: {currentRegion.currency}
                </span>
              </label>
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-role appearance-none cursor-pointer"
                >
                  {REGIONS.map((r) => (
                    <option key={r.code} value={r.code} className="bg-white dark:bg-obsidian-900 text-slate-900 dark:text-zinc-100">
                      [{r.regionCode}] {r.name} — {r.currency}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
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
                <span>Import &amp; Analyze</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner / Error */}
        {isLoading && (
          <div className="p-3 rounded-xl bg-role-subtle border border-role-subtle text-xs text-role flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-role border-t-transparent rounded-full animate-spin" />
            <span>{loadingMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="text-[11px] text-slate-400 dark:text-zinc-500 text-center">
          Zero network transit. Your sensitive Shopify customers and financial numbers stay local.
        </div>
      </div>
    </div>
  );
};
