import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchPlaceholder?: string;
  searchField?: (row: T) => string;
  exportFilename?: string;
  emptyMessage?: string;
  headerAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  searchPlaceholder = 'Search records...',
  searchField,
  exportFilename = 'ledger_export.csv',
  emptyMessage = 'No records match your criteria',
  headerAction,
  onRowClick
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row => {
      if (searchField) {
        return searchField(row).toLowerCase().includes(term);
      }
      return Object.values(row).some(v =>
        String(v).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchField]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return sortDir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key?: string) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = columns.map(c => c.header);
    const rows = sortedData.map(row => {
      return columns.map(c => {
        const val = c.accessorKey ? row[c.accessorKey] : '';
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-700/80 rounded-xl text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-role transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {headerAction}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-obsidian-800 dark:hover:bg-obsidian-750 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-700 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-role" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-obsidian-700/60 bg-white dark:bg-obsidian-900/60 shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-obsidian-750 bg-slate-50 dark:bg-obsidian-850/70 text-slate-600 dark:text-zinc-400">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-4 font-semibold select-none ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/50 dark:hover:bg-obsidian-800/50' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.accessorKey as string)}
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400 dark:text-zinc-500 font-mono">
                        {sortKey === col.accessorKey ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-role" /> : <ChevronDown className="w-3.5 h-3.5 text-role" />
                        ) : (
                          <span className="text-[10px] opacity-40">⇅</span>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-obsidian-800/60 text-slate-800 dark:text-zinc-300">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-slate-400 dark:text-zinc-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-slate-100/80 dark:hover:bg-obsidian-800/70'
                      : 'hover:bg-slate-50/80 dark:hover:bg-obsidian-800/40'
                  }`}
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={`py-3 px-4 ${col.className || ''}`}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? '')
                        : ''}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-zinc-400 px-1">
        <div>
          Showing {sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-obsidian-700 bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-850 dark:hover:bg-obsidian-800 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-obsidian-700 bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-850 dark:hover:bg-obsidian-800 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
