import React, { useState, useMemo } from 'react';
import {
  X,
  Layers,
  User,
  Calendar,
  Sparkles,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ShoppingBag,
  Target,
  RotateCcw,
  Truck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Box,
  TrendingUp,
  CreditCard,
  PieChart,
  BarChart2,
  ArrowUpRight,
  Clock,
  Award,
  Share2,
  Flame,
  Zap,
  Tag,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { DrillDownData } from '../../types/analytics';
import { NormalizedOrder } from '../../types/order';
import { StatusPill } from './StatusPill';

interface DrillDownModalProps {
  data: DrillDownData | null;
  currencySymbol: string;
  onClose: () => void;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  data,
  currencySymbol,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'paid' | 'refunded' | 'high_value'>('all');
  const [sortKey, setSortKey] = useState<keyof NormalizedOrder>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Unconditional computation of orders and filtered subsets
  const { filteredOrders, basketTiers, statusCounts, totalOrderValue, avgBasketValue, customerProfile, fragranceProfile, categoryProfile, dayProfile, geoCityProfile } = useMemo(() => {
    if (!data || !data.orders) {
      return {
        filteredOrders: [],
        basketTiers: { micro: 0, standard: 0, premium: 0, vip: 0 },
        statusCounts: { paid: 0, refunded: 0, cancelled: 0 },
        totalOrderValue: 0,
        avgBasketValue: 0,
        customerProfile: null,
        fragranceProfile: null,
        categoryProfile: null,
        dayProfile: null,
        geoCityProfile: null
      };
    }

    const all = data.orders;
    let tiers = { micro: 0, standard: 0, premium: 0, vip: 0 };
    let statuses = { paid: 0, refunded: 0, cancelled: 0 };
    let sumVal = 0;

    // Data profile extractors
    const scentFrequency: Record<string, number> = {};
    const variantFrequency: Record<string, number> = {};
    const buyerFrequency: Record<string, { name: string; email: string; totalSpend: number; count: number }> = {};
    const cityCounts: Record<string, number> = {};

    for (const o of all) {
      sumVal += o.orderValue;
      if (o.orderValue < 30) tiers.micro++;
      else if (o.orderValue < 75) tiers.standard++;
      else if (o.orderValue < 150) tiers.premium++;
      else tiers.vip++;

      const s = o.status.toLowerCase();
      if (s.includes('refund')) statuses.refunded++;
      else if (s.includes('cancel')) statuses.cancelled++;
      else statuses.paid++;

      if (o.city) {
        cityCounts[o.city] = (cityCounts[o.city] || 0) + 1;
      }

      // Track scents
      if (o.fragrancesParsed && o.fragrancesParsed.length > 0) {
        o.fragrancesParsed.forEach(f => {
          scentFrequency[f.name] = (scentFrequency[f.name] || 0) + 1;
          if (f.size) {
            variantFrequency[f.size] = (variantFrequency[f.size] || 0) + 1;
          }
        });
      } else if (o.fragrancesRaw) {
        o.fragrancesRaw.split(',').forEach(raw => {
          const clean = raw.trim();
          if (clean) scentFrequency[clean] = (scentFrequency[clean] || 0) + 1;
        });
      }

      // Track buyers
      const buyerKey = (o.email || o.customerName || 'Anonymous').toLowerCase().trim();
      if (!buyerFrequency[buyerKey]) {
        buyerFrequency[buyerKey] = {
          name: o.customerName || 'Anonymous Customer',
          email: o.email || 'No email provided',
          totalSpend: 0,
          count: 0
        };
      }
      buyerFrequency[buyerKey].totalSpend += o.orderValue;
      buyerFrequency[buyerKey].count += 1;
    }

    // Extract profiles
    const topScentsList = Object.entries(scentFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const topVariantsList = Object.entries(variantFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([size, count]) => ({ size, count }));

    const topBuyersList = Object.values(buyerFrequency)
      .sort((a, b) => b.totalSpend - a.totalSpend);

    // Apply modal search & quick status filter
    let list = all;

    if (statusTab === 'paid') {
      list = list.filter(o => !o.isRefunded && !o.isPartiallyRefunded && !o.isCancelled);
    } else if (statusTab === 'refunded') {
      list = list.filter(o => o.isRefunded || o.isPartiallyRefunded || o.isCancelled);
    } else if (statusTab === 'high_value') {
      list = list.filter(o => o.orderValue >= 75);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.fragrancesRaw.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        (o.provinceState || '').toLowerCase().includes(q)
      );
    }

    const sorted = [...list].sort((a, b) => {
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

    // Customer profile info if single customer or cohort
    const firstOrder = all[0];
    const customerInfo = firstOrder ? {
      name: firstOrder.customerName,
      email: firstOrder.email,
      city: firstOrder.city,
      province: firstOrder.provinceState || firstOrder.country,
      firstSeen: all[all.length - 1]?.date || firstOrder.date,
      lastSeen: firstOrder.date,
      orderCount: all.length,
      lifetimeSpend: sumVal,
      avgSpend: all.length > 0 ? sumVal / all.length : 0,
      favoriteScents: topScentsList.slice(0, 5)
    } : null;

    return {
      filteredOrders: sorted,
      basketTiers: tiers,
      statusCounts: statuses,
      totalOrderValue: sumVal,
      avgBasketValue: all.length > 0 ? sumVal / all.length : 0,
      customerProfile: customerInfo,
      fragranceProfile: {
        topScents: topScentsList,
        variants: topVariantsList,
        topBuyers: topBuyersList.slice(0, 6)
      },
      categoryProfile: {
        topScents: topScentsList.slice(0, 6),
        variants: topVariantsList
      },
      dayProfile: {
        totalOrders: all.length,
        totalRevenue: sumVal,
        singleItems: all.filter(o => o.orderQuantity === 1).length,
        multiItems: all.filter(o => o.orderQuantity > 1).length,
        triageCount: all.filter(o => o.isRefunded || o.orderQuantity >= 3).length
      },
      geoCityProfile: {
        cities: Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
        topScents: topScentsList.slice(0, 4)
      }
    };
  }, [data, searchTerm, statusTab, sortKey, sortDir]);

  if (!data) return null;

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const getDomainIcon = () => {
    switch (data.type) {
      case 'customer':
        return <User className="w-5 h-5 text-role" />;
      case 'category':
        return <Layers className="w-5 h-5 text-cyan-400" />;
      case 'day':
        return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'fragrance':
        return <Sparkles className="w-5 h-5 text-pink-400" />;
      case 'revenue':
        return <DollarSign className="w-5 h-5 text-emerald-400" />;
      case 'orders':
        return <ShoppingBag className="w-5 h-5 text-role" />;
      case 'target':
        return <Target className="w-5 h-5 text-indigo-400" />;
      default:
        return <Layers className="w-5 h-5 text-role" />;
    }
  };

  const handleSort = (key: keyof NormalizedOrder) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ['Order Number', 'Date', 'Customer', 'Email', 'City', 'State/Province', 'Items', 'Quantity', 'Total', 'Status'];
    const rows = filteredOrders.map(o => [
      `"${o.orderNumber}"`,
      `"${o.date}"`,
      `"${o.customerName}"`,
      `"${o.email}"`,
      `"${o.city}"`,
      `"${o.provinceState || ''}"`,
      `"${o.fragrancesRaw.replace(/"/g, '""')}"`,
      o.orderQuantity,
      o.orderValue,
      `"${o.status}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_dossier.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRawCount = data.orders?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-obsidian-800 flex items-start justify-between gap-4 bg-slate-50/80 dark:bg-obsidian-950/80">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-role-subtle border border-role-subtle flex items-center justify-center shadow-role-glow flex-shrink-0">
              {getDomainIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 truncate">
                  {data.title}
                </h3>
                {data.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-role text-white shadow-sm flex-shrink-0">
                    {data.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                {data.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-obsidian-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable with Bespoke Layouts per Domain */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Summary Stats Grid */}
          {data.summaryStats && data.summaryStats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.summaryStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-obsidian-850/80 border border-slate-200/80 dark:border-obsidian-750 shadow-sm"
                >
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-medium">
                    {stat.label}
                  </span>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 font-mono mt-0.5 block truncate">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. BESPOKE CUSTOMER & VIP PROFILE INTELLIGENCE (type === 'customer') */}
          {/* ========================================================================= */}
          {data.type === 'customer' && customerProfile && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border border-role/40 text-white shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-role flex items-center justify-center text-white font-mono font-black text-xl shadow-lg flex-shrink-0">
                      {(customerProfile.name || 'VIP').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-white tracking-tight">{customerProfile.name}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-role/30 border border-role text-role-light">
                          {customerProfile.orderCount >= 3 ? 'VIP Advocate' : customerProfile.orderCount === 2 ? 'Repeat Buyer' : 'New Acquisition'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">{customerProfile.email} · {customerProfile.city || 'Direct Customer'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">LIFETIME VALUE</span>
                      <span className="text-emerald-400 font-bold text-base">{currencySymbol}{Math.round(customerProfile.lifetimeSpend).toLocaleString()}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                      <span className="text-zinc-400 block text-[10px]">AVG BASKET</span>
                      <span className="text-white font-bold text-base">{currencySymbol}{Math.round(customerProfile.avgSpend).toLocaleString()}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                      <span className="text-zinc-400 block text-[10px]">TOTAL ORDERS</span>
                      <span className="text-role-light font-bold text-base">{customerProfile.orderCount} carts</span>
                    </div>
                  </div>
                </div>

                {/* Scent Preferences Tags */}
                <div>
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-role" />
                    Preferred Fragrances &amp; Product Affinities
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {customerProfile.favoriteScents.length > 0 ? (
                      customerProfile.favoriteScents.map(s => (
                        <span
                          key={s.name}
                          className="px-3 py-1 rounded-xl text-xs font-mono bg-white/10 border border-white/15 text-zinc-100 flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="font-bold text-role-light">{s.name}</span>
                          <span className="text-[10px] text-zinc-400">({s.count}x)</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400 italic">No specific fragrance parsed</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Purchase Journey Timeline */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-role" />
                  Chronological Order History ({data.orders.length} transactions)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {data.orders.map(o => (
                    <div
                      key={o.orderNumber}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/80 dark:border-obsidian-750 flex flex-col justify-between space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-role">{o.orderNumber}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{o.date}</span>
                        </div>
                        <StatusPill status={o.status} />
                      </div>
                      <p className="text-xs text-slate-700 dark:text-zinc-300 line-clamp-2">
                        {o.fragrancesRaw || `${o.orderQuantity} physical items`}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-obsidian-750 text-xs font-mono">
                        <span className="text-slate-400 dark:text-zinc-500">{o.orderQuantity} items</span>
                        <span className="font-bold text-slate-900 dark:text-emerald-400">{currencySymbol}{o.orderValue.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. BESPOKE PRODUCT & SCENT STOCK VELOCITY (type === 'fragrance') */}
          {/* ========================================================================= */}
          {data.type === 'fragrance' && fragranceProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Variant & Packaging Breakdown */}
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/80 dark:border-obsidian-750 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-pink-400" />
                      Dynamic Packaging Format &amp; Size Breakdown
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {fragranceProfile.variants.length} formats detected
                    </span>
                  </div>
                  <div className="space-y-2">
                    {fragranceProfile.variants.length > 0 ? (
                      fragranceProfile.variants.map(v => (
                        <div key={v.size} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700 dark:text-zinc-300">{v.size}</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{v.count} units</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-obsidian-750 overflow-hidden">
                            <div
                              className="h-full bg-pink-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.round((v.count / Math.max(1, totalRawCount)) * 100))}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400 italic">Standard retail bottle edition</div>
                    )}
                  </div>
                </div>

                {/* Top Buyers of this Fragrance */}
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/80 dark:border-obsidian-750 space-y-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-role" />
                    Top Verified Buyers of this Fragrance
                  </span>
                  <div className="space-y-2">
                    {fragranceProfile.topBuyers.map(b => (
                      <div
                        key={b.email}
                        className="p-2.5 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200/70 dark:border-obsidian-750 flex items-center justify-between"
                      >
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block truncate">{b.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">{b.email}</span>
                        </div>
                        <div className="text-right flex-shrink-0 font-mono">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">{currencySymbol}{Math.round(b.totalSpend).toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400">{b.count} orders</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. BESPOKE CATEGORY & PRODUCT FORMAT YIELD (type === 'category') */}
          {/* ========================================================================= */}
          {data.type === 'category' && categoryProfile && (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/80 dark:border-obsidian-750 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Top Moving Fragrances in this Product Format
                </span>
                <span className="text-[10px] font-mono text-slate-400">Yield Breakdown</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {categoryProfile.topScents.map((s, idx) => (
                  <div
                    key={s.name}
                    className="p-3 rounded-2xl bg-white dark:bg-obsidian-900 border border-slate-200/80 dark:border-obsidian-750 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">{s.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-black bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 flex-shrink-0">
                      {s.count} units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. BESPOKE WAREHOUSE STAFFING & FULFILLMENT DENSITY (type === 'day') */}
          {/* ========================================================================= */}
          {data.type === 'day' && dayProfile && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <Zap className="w-4 h-4" />
                <span>Warehouse Logistics &amp; Packing Station Recommendation</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                Orders historically dispatched on this weekday represent a significant portion of warehouse throughput.
                Ensure packing stations are pre-stocked with boxes, thermal labels, and protective bubble wrap before the morning dispatch wave.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-white/80 dark:bg-obsidian-900/80 border border-slate-200/80 dark:border-obsidian-750">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-mono">SINGLE-ITEM ENVELOPES</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono">{dayProfile.singleItems} parcels</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 dark:bg-obsidian-900/80 border border-slate-200/80 dark:border-obsidian-750">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-mono">MULTI-ITEM BOXES</span>
                  <span className="text-sm sm:text-base font-extrabold text-role font-mono">{dayProfile.multiItems} boxes</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/80 dark:bg-obsidian-900/80 border border-slate-200/80 dark:border-obsidian-750">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-mono">PACKING ALERTS</span>
                  <span className="text-sm sm:text-base font-extrabold text-amber-500 font-mono">{dayProfile.triageCount} flagged</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. BESPOKE CASH FLOW & REVENUE TRAJECTORY (type === 'revenue' || 'target') */}
          {/* ========================================================================= */}
          {(data.type === 'revenue' || data.type === 'target') && (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/80 dark:border-obsidian-750 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Cash Flow Inflow Health &amp; Chargeback Deductions
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  Net Ledger Yield: {currencySymbol}{Math.round(totalOrderValue - (statusCounts.refunded * avgBasketValue)).toLocaleString()}
                </span>
              </div>

              {/* Cash Inflow vs Refunds Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-zinc-400">
                  <span>Gross Inflow: {currencySymbol}{Math.round(totalOrderValue).toLocaleString()} ({statusCounts.paid} paid)</span>
                  <span className="text-rose-500 font-bold">Refunds: {statusCounts.refunded} orders</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-obsidian-750 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.round((statusCounts.paid / Math.max(1, totalRawCount)) * 100)}%` }}
                  />
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${Math.round((statusCounts.refunded / Math.max(1, totalRawCount)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. BESPOKE GEOGRAPHIC DESTINATIONS SPREAD (for Geo City drilldowns) */}
          {/* ========================================================================= */}
          {geoCityProfile && geoCityProfile.cities.length > 0 && data.type === 'orders' && (
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-obsidian-850 border border-slate-200/80 dark:border-obsidian-750 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-role" />
                  Key Geographic Delivery Destination Spread
                </span>
                <span className="text-[10px] font-mono text-slate-400">Regional Distribution</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {geoCityProfile.cities.map(([cName, cCount]) => (
                  <div
                    key={cName}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-obsidian-900 border border-slate-200/80 dark:border-obsidian-750 flex items-center gap-2 shadow-sm text-xs font-mono"
                  >
                    <span className="font-bold text-slate-900 dark:text-zinc-100">{cName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-role/15 text-role font-black">{cCount} parcels</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extra Custom Content if supplied */}
          {data.extraContent}

          {/* ========================================================================= */}
          {/* INTERACTIVE ORDERS & TRANSACTIONS TABLE */}
          {/* ========================================================================= */}
          <div className="space-y-3 pt-1">
            {/* Filter Bar Inside Modal */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search order #, customer, city..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-700/80 rounded-xl text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-role transition-colors"
                  />
                </div>

                {/* Quick Status Tabs */}
                <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-obsidian-850 rounded-xl border border-slate-200 dark:border-obsidian-750 text-[11px]">
                  <button
                    type="button"
                    onClick={() => { setStatusTab('all'); setPage(1); }}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      statusTab === 'all'
                        ? 'bg-white dark:bg-obsidian-750 font-bold text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    All ({totalRawCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStatusTab('paid'); setPage(1); }}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      statusTab === 'paid'
                        ? 'bg-white dark:bg-obsidian-750 font-bold text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    Paid ({statusCounts.paid})
                  </button>
                  {statusCounts.refunded > 0 && (
                    <button
                      type="button"
                      onClick={() => { setStatusTab('refunded'); setPage(1); }}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        statusTab === 'refunded'
                          ? 'bg-white dark:bg-obsidian-750 font-bold text-rose-600 dark:text-rose-400 shadow-sm'
                          : 'text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      Refunds ({statusCounts.refunded})
                    </button>
                  )}
                  {basketTiers.vip + basketTiers.premium > 0 && (
                    <button
                      type="button"
                      onClick={() => { setStatusTab('high_value'); setPage(1); }}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        statusTab === 'high_value'
                          ? 'bg-white dark:bg-obsidian-750 font-bold text-role shadow-sm'
                          : 'text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      High-Value ({basketTiers.vip + basketTiers.premium})
                    </button>
                  )}
                </div>
              </div>

              {/* Export & Count */}
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                  {filteredOrders.length} records
                </span>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-800 dark:hover:bg-obsidian-750 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-obsidian-700 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-role" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Interactive Orders Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-obsidian-750 bg-white dark:bg-obsidian-900/60 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-obsidian-750 bg-slate-50 dark:bg-obsidian-850/80 text-slate-600 dark:text-zinc-400">
                    <th
                      className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-role"
                      onClick={() => handleSort('orderNumber')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Order #</span>
                        {sortKey === 'orderNumber' && (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-role" /> : <ChevronDown className="w-3.5 h-3.5 text-role" />
                        )}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-role"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        {sortKey === 'date' && (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-role" /> : <ChevronDown className="w-3.5 h-3.5 text-role" />
                        )}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-role"
                      onClick={() => handleSort('customerName')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Customer</span>
                        {sortKey === 'customerName' && (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-role" /> : <ChevronDown className="w-3.5 h-3.5 text-role" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold">Line Items &amp; Formats</th>
                    <th
                      className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-role"
                      onClick={() => handleSort('orderQuantity')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Qty</span>
                        {sortKey === 'orderQuantity' && (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-role" /> : <ChevronDown className="w-3.5 h-3.5 text-role" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th
                      className="py-3 px-4 font-semibold text-right cursor-pointer select-none hover:text-role"
                      onClick={() => handleSort('orderValue')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Total</span>
                        {sortKey === 'orderValue' && (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-role" /> : <ChevronDown className="w-3.5 h-3.5 text-role" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-obsidian-800">
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((o) => (
                      <tr key={o.orderNumber} className="hover:bg-slate-50 dark:hover:bg-obsidian-800/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-role">
                          {o.orderNumber}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                          {o.date}
                        </td>
                        <td className="py-3 px-4">
                          <div className="truncate max-w-[160px]">
                            <span className="font-semibold text-slate-900 dark:text-zinc-100 block truncate">
                              {o.customerName || 'Anonymous'}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono block truncate">
                              {o.email || o.city || 'Direct Customer'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs truncate text-slate-700 dark:text-zinc-300" title={o.fragrancesRaw}>
                            {o.fragrancesRaw || `${o.orderQuantity} physical items`}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">
                          {o.orderQuantity}
                        </td>
                        <td className="py-3 px-4">
                          <StatusPill status={o.status} />
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-right text-slate-900 dark:text-zinc-100">
                          {currencySymbol}{o.orderValue.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-zinc-500">
                        No orders match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-slate-500 dark:text-zinc-400 font-mono">
                  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-obsidian-750 text-slate-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-obsidian-800 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 font-mono text-slate-600 dark:text-zinc-300">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-obsidian-750 text-slate-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-obsidian-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
