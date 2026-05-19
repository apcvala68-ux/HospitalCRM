import { useState, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBillingList } from '../../hooks/useBilling';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Search, Plus, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown, Eye,
  CreditCard, Clock, CheckCircle, TrendingUp,
  SlidersHorizontal, X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

const GRADIENTS = [
  'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
  'linear-gradient(135deg, #f472b6 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
  'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
  'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
  'linear-gradient(135deg, #f472b6 0%, #a855f7 100%)',
  'linear-gradient(135deg, #34d399 0%, #059669 100%)',
];

const getGradient = (id) => {
  if (!id) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
};

function SortIcon({ active, direction }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 opacity-30 shrink-0" />;
  return direction === 'asc'
    ? <ArrowUp className="h-3 w-3 shrink-0" />
    : <ArrowDown className="h-3 w-3 shrink-0" />;
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  let start = Math.max(2, current - 2);
  let end = Math.min(total - 1, current + 2);
  if (current <= 3) end = Math.min(5, total - 1);
  if (current >= total - 2) start = Math.max(total - 4, 2);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('...');
  pages.push(total);
  return pages;
}

function StatCard({ label, value, icon: Icon, color, bg, changeText, isIncrease }) {
  return (
    <Card className="flex-1 min-w-[220px] shadow-[var(--shadow-kpi)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden">
      <CardContent className="py-4 px-5 flex-1">
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase block">{label}</span>
            <p className="text-3xl font-extrabold text-foreground tracking-tight leading-none">{value}</p>
            {changeText && (
              <span className={cn("text-xs font-semibold block mt-1", isIncrease ? 'text-emerald-500' : 'text-rose-500')}>
                {changeText}
              </span>
            )}
          </div>
          <div className={cn('rounded-xl p-3 shrink-0 flex items-center justify-center', bg)}>
            <Icon className="h-5.5 w-5.5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const statusVariant = {
  pending: 'warning', partial: 'info', paid: 'success', cancelled: 'destructive', refunded: 'destructive',
};

export function BillingListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 15;
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const sortOrder = searchParams.get('sortOrder') || '';
  const statusFilter = searchParams.get('status') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data, isLoading } = useBillingList({ page, search, limit, sortBy, sortOrder, status: statusFilter });

  const kpiCards = [
    {
      label: 'Total Revenue', value: `₹${(data?.bills?.reduce((s, b) => s + (b.amountPaid || 0), 0) || 0).toLocaleString()}`, icon: CreditCard,
      color: '#0d9488', bg: 'bg-teal-50 dark:bg-teal-950/30', changeText: '+9.8% from last month', isIncrease: true,
    },
    {
      label: 'Total Invoices', value: (data?.total || 0).toLocaleString(), icon: TrendingUp,
      color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950/30', changeText: '', isIncrease: false,
    },
    {
      label: 'Pending', value: data?.bills?.filter(b => b.status === 'pending' || b.status === 'partial').length || 0, icon: Clock,
      color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/30', changeText: 'awaiting payment', isIncrease: false,
    },
    {
      label: 'Paid', value: data?.bills?.filter(b => b.status === 'paid').length || 0, icon: CheckCircle,
      color: '#0d9488', bg: 'bg-teal-50 dark:bg-teal-950/30', changeText: 'settled', isIncrease: true,
    },
  ];

  const updateParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      return next;
    });
  }, [setSearchParams]);

  const handleSort = (key) => {
    if (sortBy === key) {
      updateParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc', page: '1' });
    } else {
      updateParams({ sortBy: key, sortOrder: 'asc', page: '1' });
    }
  };

  const changeLimit = (newLimit) => {
    updateParams({ limit: String(newLimit), page: '1' });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      updateParams({ search: searchInput, page: '1' });
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput, updateParams]);

  const hasActiveFilters = !!(statusFilter || search);

  const handleClearFilters = () => {
    setSearchInput('');
    updateParams({ status: '', search: '', page: '1' });
  };

  const goToPage = (p) => {
    if (p < 1 || p > (data?.totalPages || 1)) return;
    updateParams({ page: String(p) });
  };

  const bills = data?.bills || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage invoices, payments, and revenue.</p>
        </div>
        <Link to="/billing/new">
          <Button><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 w-full bg-card p-3 rounded-xl border border-border/50 shadow-sm">
          <form onSubmit={(e) => e.preventDefault()} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by invoice no..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 rounded-xl border-border/20 bg-muted/15 focus-visible:bg-background focus:ring-1 focus:ring-primary h-9 text-xs"
            />
          </form>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button onClick={handleClearFilters}
                className="h-9 px-3.5 rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-sm"
              ><X className="h-3.5 w-3.5" /> Clear Filters</button>
            )}
            <button onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn("h-9 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none",
                isFilterOpen
                  ? "bg-muted text-foreground border-zinc-300 dark:bg-[#18181b] dark:text-zinc-100 dark:border-zinc-700 shadow-md"
                  : "border-border/60 dark:border-border/20 bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 text-muted-foreground hover:text-foreground"
              )}
            ><SlidersHorizontal className="h-3.5 w-3.5" /> Filter{statusFilter && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}</button>
          </div>
        </div>
        {isFilterOpen && (
          <div className="p-4 bg-card rounded-xl border border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-[10px] font-bold text-muted-foreground block mb-2 uppercase tracking-wider">Status</span>
            <div className="flex flex-wrap gap-2">
              {['', 'pending', 'partial', 'paid', 'cancelled', 'refunded'].map((s) => (
                <button key={s} onClick={() => updateParams({ status: s, page: '1' })}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none",
                    (statusFilter === s) ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/10 hover:bg-muted/20 border-border/10 text-muted-foreground hover:text-foreground"
                  )}
                >{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Status'}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : bills.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">{search ? 'No invoices match your search' : 'No invoices yet'}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3 pr-2 w-10 text-center font-semibold">#</th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('invoiceNo')}>
                        <span className="inline-flex items-center gap-1">Invoice <SortIcon active={sortBy === 'invoiceNo'} direction={sortOrder} /></span>
                      </th>
                      <th className="pb-3 font-semibold">Patient</th>
                      <th className="pb-3 font-semibold">Items</th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('total')}>
                        <span className="inline-flex items-center gap-1">Total <SortIcon active={sortBy === 'total'} direction={sortOrder} /></span>
                      </th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('amountPaid')}>
                        <span className="inline-flex items-center gap-1">Paid <SortIcon active={sortBy === 'amountPaid'} direction={sortOrder} /></span>
                      </th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('status')}>
                        <span className="inline-flex items-center gap-1">Status <SortIcon active={sortBy === 'status'} direction={sortOrder} /></span>
                      </th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                        <span className="inline-flex items-center gap-1">Date <SortIcon active={sortBy === 'createdAt'} direction={sortOrder} /></span>
                      </th>
                      <th className="pb-3 font-semibold w-32 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((b, idx) => (
                      <tr key={b._id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 pr-2 text-center text-xs text-muted-foreground font-mono">{from + idx}</td>
                        <td className="py-3.5 text-sm font-mono text-xs">{b.invoiceNo}</td>
                        <td className="py-3.5 text-sm font-medium">{b.patient?.firstName ? `${b.patient.firstName} ${b.patient.lastName}` : <span className="text-muted-foreground">—</span>}</td>
                        <td className="py-3.5 text-sm">{b.items?.length}</td>
                        <td className="py-3.5 text-sm font-medium">₹{b.total?.toLocaleString()}</td>
                        <td className="py-3.5 text-sm">₹{b.amountPaid?.toLocaleString()}</td>
                        <td className="py-3.5"><Badge variant={statusVariant[b.status]}>{b.status}</Badge></td>
                        <td className="py-3.5 text-xs text-muted-foreground whitespace-nowrap font-medium">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="py-3.5 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/billing/${b._id}`}
                              className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer"
                              title="View Invoice"
                            ><Eye className="h-[18px] w-[18px]" /></Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 border-t border-border/10 mt-2">
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-xs text-muted-foreground font-semibold">Showing {from}–{to} of {total} invoices</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 border-l border-border/20 pl-4">
                    <label htmlFor="page-size" className="font-semibold">Rows per page:</label>
                    <select id="page-size" value={limit} onChange={(e) => changeLimit(Number(e.target.value))}
                      className="rounded-xl border border-border/20 bg-muted/15 hover:bg-muted/25 px-2.5 py-1 text-[11px] font-semibold transition-colors outline-none cursor-pointer"
                    >{PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n} className="bg-background">{n}</option>)}</select>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                    {getPageNumbers(page, totalPages).map((p, i) => p === '...' ? (
                      <span key={`e-${i}`} className="px-1 text-muted-foreground font-semibold">…</span>
                    ) : (
                      <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => goToPage(p)} className="h-8 min-w-[2rem] px-2 font-semibold text-xs">{p}</Button>
                    ))}
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
