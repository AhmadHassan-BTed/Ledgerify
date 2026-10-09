import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Mail,
  MapPin,
  Tag,
  DollarSign,
  Layers,
  XCircle,
  GitCompare
} from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { Card } from '../ui/Card';
import { Table, Column } from '../ui/Table';
import { NormalizedOrder } from '../../types/order';
import { formatDatasetTitle } from '../../utils/datasetTitle';

export const AdminDataQualityView: React.FC = () => {
  const { adminDataQualityService } = useServices();
  const { filteredOrders, secondaryFilteredOrders } = useFilters();
  const { activeDataset, secondaryDataset, isCompareEnabled } = useData();

  const titleA = formatDatasetTitle(activeDataset?.name || '', activeDataset?.region);
  const titleB = secondaryDataset ? formatDatasetTitle(secondaryDataset.name, secondaryDataset.region) : '';

  const qualityA = adminDataQualityService.analyzeQuality(filteredOrders);
  const qualityB = isCompareEnabled && secondaryDataset
    ? adminDataQualityService.analyzeQuality(secondaryFilteredOrders)
    : null;

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800/60',
          text: 'text-emerald-700 dark:text-emerald-400',
          dot: 'bg-emerald-500',
          label: 'Clean & Verified Dataset'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800/60',
          text: 'text-amber-700 dark:text-amber-400',
          dot: 'bg-amber-500',
          label: 'Minor Anomalies Detected'
        };
      case 'critical':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800/60',
          text: 'text-rose-700 dark:text-rose-400',
          dot: 'bg-rose-500',
          label: 'Data Integrity At Risk'
        };
    }
  };

  const statusStyleA = getStatusColor(qualityA.status);

  const flaggedColumns: Column<NormalizedOrder>[] = [
    {
      header: 'Order #',
      accessorKey: 'orderNumber',
      sortable: true,
      className: 'font-mono text-role font-bold'
    },
    {
      header: 'Customer Name',
      accessorKey: 'customerName',
      sortable: true
    },
    {
      header: 'Email Address',
      accessorKey: 'email',
      cell: (row) => row.email ? (
        <span className="font-mono text-slate-700 dark:text-zinc-300">{row.email}</span>
      ) : (
        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
          <XCircle className="w-3 h-3" /> Missing Email
        </span>
      )
    },
    {
      header: 'City / Location',
      accessorKey: 'city',
      cell: (row) => row.city ? (
        <span>{row.city}</span>
      ) : (
        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-[11px]">
          <AlertTriangle className="w-3 h-3" /> Missing City
        </span>
      )
    },
    {
      header: 'Order Value',
      accessorKey: 'orderValue',
      sortable: true,
      className: 'font-mono',
      cell: (row) => row.orderValue === 0 ? (
        <span className="text-rose-600 dark:text-rose-400 font-bold">$0.00 Anomaly</span>
      ) : (
        <span>{activeDataset?.currency || '£'}{row.orderValue.toFixed(2)}</span>
      )
    },
    {
      header: 'Flagged Reasons',
      accessorKey: 'flags',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.flags || []).map((flag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-[10px] rounded-md font-medium bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300"
            >
              {flag}
            </span>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              Data Integrity &amp; Anomaly Triage
            </h2>
            {isCompareEnabled && secondaryDataset && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-role-subtle text-role border border-role-subtle">
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparing: {titleA} vs {titleB}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Automated export sanitization, missing field detection, and Shopify record troubleshooting for {activeDataset?.filename}.
          </p>
        </div>
      </div>

      {/* Traffic Light Health Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl ${statusStyleA.bg} ${statusStyleA.border} shadow-sm`}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${statusStyleA.border} ${statusStyleA.bg}`}>
              <ShieldCheck className={`w-6 h-6 ${statusStyleA.text}`} />
            </div>
            <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-obsidian-950 ${statusStyleA.dot} animate-pulse`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Data Health: {statusStyleA.label} ({activeDataset?.name})
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${statusStyleA.bg} ${statusStyleA.text} border ${statusStyleA.border}`}>
                {qualityA.healthScore}/100
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Active page <code className="text-role font-mono font-bold">[{activeDataset?.selectedSheet}]</code>. {qualityA.flaggedOrders.length} anomalies detected.
            </p>
          </div>
        </div>

        {isCompareEnabled && qualityB && (
          <div className="p-3 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 text-xs shadow-sm">
            <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">{secondaryDataset?.name} Score</span>
            <span className="font-mono font-bold text-cyan-600 dark:text-cyan-300 text-sm">
              {qualityB.healthScore}/100 ({qualityB.status})
            </span>
          </div>
        )}
      </div>

      {/* Anomaly Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Missing Emails</span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1 block">
              {qualityA.missingEmailCount}
              {isCompareEnabled && qualityB && (
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-normal ml-1">vs {qualityB.missingEmailCount}</span>
              )}
            </span>
          </div>
          <Mail className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Missing Cities</span>
            <span className={`text-xl font-bold font-mono mt-1 block ${qualityA.missingCityCount > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-900 dark:text-zinc-100'}`}>
              {qualityA.missingCityCount}
              {isCompareEnabled && qualityB && (
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-normal ml-1">vs {qualityB.missingCityCount}</span>
              )}
            </span>
          </div>
          <MapPin className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Missing Scents</span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1 block">
              {qualityA.missingFragranceCount}
              {isCompareEnabled && qualityB && (
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-normal ml-1">vs {qualityB.missingFragranceCount}</span>
              )}
            </span>
          </div>
          <Tag className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">$0.00 Test Orders</span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1 block">
              {qualityA.zeroValueCount}
              {isCompareEnabled && qualityB && (
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-normal ml-1">vs {qualityB.zeroValueCount}</span>
              )}
            </span>
          </div>
          <DollarSign className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">High Qty (&gt;=10)</span>
            <span className={`text-xl font-bold font-mono mt-1 block ${qualityA.highQuantityCount > 0 ? 'text-role font-bold' : 'text-slate-900 dark:text-zinc-100'}`}>
              {qualityA.highQuantityCount}
              {isCompareEnabled && qualityB && (
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-normal ml-1">vs {qualityB.highQuantityCount}</span>
              )}
            </span>
          </div>
          <Layers className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
        </div>
      </div>

      {/* Flagged Orders Table */}
      <Card
        title={`Flagged Orders Requiring Correction in Shopify (${activeDataset?.name})`}
        subtitle="Direct order reference IDs with identified anomalies"
      >
        <Table
          data={qualityA.flaggedOrders}
          columns={flaggedColumns}
          pageSize={10}
          searchPlaceholder="Search order number or customer name..."
          exportFilename="flagged_anomalies_to_fix.csv"
          emptyMessage="Zero anomalies detected! All orders in this ledger are completely clean."
        />
      </Card>
    </div>
  );
};
