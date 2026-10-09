import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface FileDropzoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileDropzoneModal: React.FC<FileDropzoneModalProps> = ({ isOpen, onClose }) => {
  const { uploadFile, isLoading, loadingMessage, error } = useData();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
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
      uploadFile(files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-obsidian-900 border border-obsidian-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            <span>Upload Shopify Excel Export</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Accepts <code className="text-purple-300 font-mono">.xlsx</code> workbooks. Ledgerify will automatically ignore summary sheets, sanitize columns, and map all order line items locally.
          </p>
        </div>

        {/* Drop Target */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-purple-500 bg-purple-950/20 shadow-glow-subtle'
              : 'border-obsidian-700 hover:border-obsidian-600 bg-obsidian-850/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400 mb-3 shadow-glow-subtle">
            <Upload className="w-6 h-6" />
          </div>

          <span className="text-sm font-semibold text-zinc-200">
            Click to browse or drop file here
          </span>
          <span className="text-xs text-zinc-500 mt-1">
            Supports Shopify orders export (.xlsx)
          </span>
        </div>

        {/* Status / Feedback */}
        {isLoading && (
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-300 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <span>{loadingMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2 text-[11px] text-zinc-500 text-center">
          Data is parsed 100% in your browser using SheetJS. Zero data leaves your machine.
        </div>
      </div>
    </div>
  );
};
