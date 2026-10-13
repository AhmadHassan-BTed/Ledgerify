import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Users,
  Download,
  ArrowUpRight,
  Crown,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Mail,
  ShoppingBag,
  CreditCard,
  Calendar
} from 'lucide-react';
import { TopCustomerItem } from '../../types/analytics';

interface CustomerDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: TopCustomerItem[];
  currencySymbol: string;
  datasetName?: string;
  onSelectCustomer: (customer: TopCustomerItem) => void;
  onFilterByEmail?: (email: string) => void;
  onFilterByMinOrders?: (minOrders: number) => void;
}

export const CustomerDirectoryModal: React.FC<CustomerDirectoryModalProps> = ({
  isOpen,
  onClose,
  customers,
  currencySymbol,
  datasetName = 'Ledger',
  onSelectCustomer,
  onFilterByEmail,
  onFilterByMinOrders,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | '2plus' | '3plus' | '5plus' | '1only'>('all');
  const [sortField, setSortField] = useState<'totalSpend' | 'orderCount' | 'name' | 'lastOrderDate'>('totalSpend');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const stats = useMemo(() => {
    let repeat = 0;
    let loyal = 0;
    let vip = 0;
    let single = 0;
    let totalSpend = 0;

    for (const c of customers) {
      totalSpend += c.totalSpend;
      if (c.orderCount === 1) single++;
      if (c.orderCount >= 2) repeat++;
      if (c.orderCount >= 3) loyal++;
      if (c.orderCount >= 5) vip++;
    }

    return {
      total: customers.length,
      repeat,
      loyal,
      vip,
      single,
      totalSpend
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    let list = customers;

    if (orderFilter === '2plus') {
      list = list.filter(c => c.orderCount >= 2);
    } else if (orderFilter === '3plus') {
      list = list.filter(c => c.orderCount >= 3);
    } else if (orderFilter === '5plus') {
      list = list.filter(c => c.orderCount >= 5);
    } else if (orderFilter === '1only') {
      list = list.filter(c => c.orderCount === 1);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(c =>
        c.email.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === valB) return 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return sortDir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [customers, orderFilter, searchTerm, sortField, sortDir]);

  if (!isOpen) return null;

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: 'totalSpend' | 'orderCount' | 'name' | 'lastOrderDate') => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) return;
    const headers = ['Customer Name', 'Email', 'Order Count', 'Total Spend', 'Avg Order Value', 'First Order Date', 'Last Order Date', 'Status Tier'];
    const rows = filteredCustomers.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      c.orderCount,
      c.totalSpend.toFixed(2),
      (c.totalSpend / Math.max(1, c.orderCount)).toFixed(2),
      `"${c.firstOrderDate}"`,
      `"${c.lastOrderDate}"`,
      `"${c.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers_directory_${datasetName.toLowerCase().replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-obsidian-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-obsidian-850/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-role text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 truncate">
                Customer Intelligence & Lifetime Order Register
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                {stats.total} unique buyers identified across {datasetName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-800 dark:hover:bg-obsidian-750 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-700 transition-colors shadow-sm"
              title="Export filtered customer list as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-obsidian-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-obsidian-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/30 dark:bg-obsidian-900">
          {/* Search by email or name */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by customer email (e.g. user@gmail.com) or name..."
              className="w-full pl-9 pr-7 py-2 text-xs bg-white dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-xl text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-role transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Frequency Tabs (All, 2+ Orders, 3+ Orders, 5+ Orders, 1 Order) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-obsidian-850 rounded-xl border border-slate-200/80 dark:border-obsidian-750 text-xs">
            <button
              type="button"
              onClick={() => { setOrderFilter('all'); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                orderFilter === 'all'
                  ? 'bg-white dark:bg-obsidian-750 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => { setOrderFilter('2plus'); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                orderFilter === '2plus'
                  ? 'bg-role text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              2+ Orders ({stats.repeat})
            </button>
            <button
              type="button"
              onClick={() => { setOrderFilter('3plus'); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                orderFilter === '3plus'
                  ? 'bg-role text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              3+ Orders ({stats.loyal})
            </button>
            <button
              type="button"
              onClick={() => { setOrderFilter('5plus'); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                orderFilter === '5plus'
                  ? 'bg-role text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              5+ Orders ({stats.vip})
            </button>
            <button
              type="button"
              onClick={() => { setOrderFilter('1only'); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                orderFilter === '1only'
                  ? 'bg-white dark:bg-obsidian-750 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              1 Order ({stats.single})
            </button>
          </div>
        </div>

        {/* Summary Pill Bar */}
        <div className="px-4 py-2 bg-slate-100/50 dark:bg-obsidian-850/30 border-b border-slate-200/60 dark:border-obsidian-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span>Showing <strong className="text-slate-900 dark:text-zinc-200 font-mono">{filteredCustomers.length}</strong> matching customers</span>
            {orderFilter === '2plus' && onFilterByMinOrders && (
              <button
                type="button"
                onClick={() => {
                  onFilterByMinOrders(2);
                  onClose();
                }}
                className="text-[11px] font-bold text-role hover:underline inline-flex items-center gap-1"
              >
                Apply 2+ Orders Filter to Entire Dashboard →
              </button>
            )}
          </div>
          <span className="font-mono text-[11px]">
            Cohort Spend: <strong className="text-role font-extrabold">{currencySymbol}{Math.round(filteredCustomers.reduce((s, c) => s + c.totalSpend, 0)).toLocaleString()}</strong>
          </span>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-obsidian-850/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 sticky top-0 z-10 border-b border-slate-200 dark:border-obsidian-750 backdrop-blur-sm">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 font-bold cursor-pointer hover:text-role transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Customer & Email</span>
                    {sortField === 'name' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('orderCount')}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-role transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Orders Placed</span>
                    {sortField === 'orderCount' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalSpend')}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-role transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Lifetime Spend</span>
                    {sortField === 'totalSpend' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 font-bold text-right hidden sm:table-cell">
                  Avg Basket
                </th>
                <th
                  onClick={() => handleSort('lastOrderDate')}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-role transition-colors hidden md:table-cell"
                >
                  <div className="flex items-center gap-1">
                    <span>Last Order</span>
                    {sortField === 'lastOrderDate' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 font-bold text-center">Tier</th>
                <th className="py-3 px-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-obsidian-800">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                    No customers match the current search & frequency filters.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c, idx) => {
                  const avgSpend = Math.round(c.totalSpend / Math.max(1, c.orderCount));
                  return (
                    <tr
                      key={c.email || idx}
                      className="hover:bg-slate-50 dark:hover:bg-obsidian-850/60 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.avatarColor} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            {c.avatarInitials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-zinc-100 truncate">
                              <span>{c.name}</span>
                              {c.orderCount >= 5 && <Crown className="w-3 h-3 text-role flex-shrink-0" />}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">
                              <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="select-all">{c.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                          c.orderCount >= 3
                            ? 'bg-role-subtle text-role border border-role-subtle'
                            : c.orderCount >= 2
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-obsidian-800 dark:text-zinc-400'
                        }`}>
                          {c.orderCount} {c.orderCount === 1 ? 'order' : 'orders'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-zinc-100">
                        {currencySymbol}{c.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-zinc-400 hidden sm:table-cell">
                        {currencySymbol}{avgSpend.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 dark:text-zinc-400 hidden md:table-cell">
                        {c.lastOrderDate || 'N/A'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.statusBadge === 'VIP'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : c.statusBadge === 'Achieved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {c.statusBadge}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onFilterByEmail && (
                            <button
                              type="button"
                              onClick={() => {
                                onFilterByEmail(c.email);
                                onClose();
                              }}
                              className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-800 dark:hover:bg-obsidian-750 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-700 transition-colors"
                              title={`Filter dashboard to ${c.email}`}
                            >
                              Filter
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectCustomer(c);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-role hover:bg-role-hover text-white transition-colors shadow-sm"
                          >
                            <span>Dossier</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3.5 border-t border-slate-200 dark:border-obsidian-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-obsidian-850/40 text-xs">
          <span className="text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-obsidian-750 bg-white dark:bg-obsidian-850 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-obsidian-800 transition-colors font-semibold"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-obsidian-750 bg-white dark:bg-obsidian-850 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-obsidian-800 transition-colors font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
