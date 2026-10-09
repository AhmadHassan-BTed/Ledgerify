import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Mail,
  MapPin,
  Tag,
  DollarSign,
  Layers,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useServices } from '../../context/ServiceContext';
import { useFilters } from '../../context/FilterContext';
import { useData } from '../../context/DataContext';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { Table, Column } from '../ui/Table';
import { NormalizedOrder } from '../../types/order';

export const AdminDataQualityView: React.FC = () => {
  const { adminDataQualityService } = useServices();
  const { filteredOrders } = useFilters();
  const { activeDataset } = useData();

  const quality = adminDataQualityService.analyzeQuality(filteredOrders);

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-800/60',
          text: 'text-emerald-400',
          dot: 'bg-emerald-400',
          label: 'Clean & Verified Dataset'
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/40',
          border: 'border-amber-800/60',
          text: 'text-amber-400',
          dot: 'bg-amber-400',
          label: 'Minor Anomalies Detected'
        };
      case 'critical':
        return {
          bg: 'bg-rose-950/40',
          border: 'border-rose-800/60',
          text: 'text-rose-400',
          dot: 'bg-rose-400',
          label: 'Data Integrity At Risk'
        };
    }
  };

  const statusStyle = getStatusColor(quality.status);

  const flaggedColumns: Column<NormalizedOrder>[] = [
    {
      header: 'Order #',
      accessorKey: 'orderNumber',
      sortable: true,
      className: 'font-mono text-purple-300 font-bold'
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
        <span className="font-mono text-zinc-300">{row.email}</span>
      ) : (
        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
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
        <span className="inline-flex items-center gap-1 text-amber-400 font-medium text-[11px]">
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
        <span className="text-rose-400 font-bold">$0.00 Anomaly</span>
      ) : (
        <span>{activeDataset?.currency || '£'}{row.orderValue.toFixed(2)}</span>
      )
    },
    {
      header: 'Flagged Reasons',
      accessorKey: 'flags',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.flags.map((flag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-[10px] rounded-md font-medium bg-rose-500/15 border border-rose-500/30 text-rose-300"
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
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
          Data Integrity & Anomaly Triage
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Automated export sanitization, missing field detection, and Shopify record troubleshooting for {activeDataset?.filename}.
        </p>
      </div>

      {/* Traffic Light Health Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl ${statusStyle.bg} ${statusStyle.border}`}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${statusStyle.border} ${statusStyle.bg}`}>
              <ShieldCheck className={`w-6 h-6 ${statusStyle.text}`} />
            </div>
            <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-obsidian-950 ${statusStyle.dot} animate-pulse`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100">
                Data Health Status: {statusStyle.label}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                {quality.healthScore}/100
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Parsed sheet <code className="text-purple-300 font-mono">[{activeDataset?.selectedSheet}]</code> without structural crashing. {quality.flaggedOrders.length} anomalies detected.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-zinc-400 block">Total Rows Analyzed</span>
            <span className="text-sm font-bold text-zinc-100 font-mono">
              {quality.totalRows.toLocaleString()} rows
            </span>
          </div>
        </div>
      </div>

      {/* Anomaly Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-obsidian-900 border border-obsidian-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 block">Missing Emails</span>
            <span className="text-xl font-bold font-mono text-zinc-100 mt-1 block">
              {quality.missingEmailCount}
            </span>
          </div>
          <Mail className="w-5 h-5 text-zinc-500" />
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900 border border-obsidian-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 block">Missing Cities</span>
            <span className={`text-xl font-bold font-mono mt-1 block ${quality.missingCityCount > 0 ? 'text-amber-400' : 'text-zinc-100'}`}>
              {quality.missingCityCount}
            </span>
          </div>
          <MapPin className="w-5 h-5 text-zinc-500" />
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900 border border-obsidian-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 block">Missing Scents</span>
            <span className="text-xl font-bold font-mono text-zinc-100 mt-1 block">
              {quality.missingFragranceCount}
            </span>
          </div>
          <Tag className="w-5 h-5 text-zinc-500" />
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900 border border-obsidian-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 block">$0.00 Test Orders</span>
            <span className="text-xl font-bold font-mono text-zinc-100 mt-1 block">
              {quality.zeroValueCount}
            </span>
          </div>
          <DollarSign className="w-5 h-5 text-zinc-500" />
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900 border border-obsidian-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 block">High Qty (&gt;=10)</span>
            <span className={`text-xl font-bold font-mono mt-1 block ${quality.highQuantityCount > 0 ? 'text-purple-400' : 'text-zinc-100'}`}>
              {quality.highQuantityCount}
            </span>
          </div>
          <Layers className="w-5 h-5 text-zinc-500" />
        </div>
      </div>

      {/* Flagged Orders Table */}
      <Card
        title="Flagged Orders Requiring Correction in Shopify"
        subtitle="Direct order reference IDs with identified anomalies"
      >
        <Table
          data={quality.flaggedOrders}
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
