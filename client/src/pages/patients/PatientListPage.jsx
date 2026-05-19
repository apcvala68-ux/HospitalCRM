import { useState, useCallback, useEffect } from 'react';
import { ConfirmDelete } from '../../components/ui/ConfirmDelete';
import { Link, useSearchParams } from 'react-router-dom';
import { usePatients, useDeletePatient } from '../../hooks/usePatients';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Search, Plus, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown, Eye,
  Users, UserPlus, AlertTriangle, Clock,
  Pencil, Trash2, SlidersHorizontal, X,
  Copy, Check,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDashboardStats } from '../../hooks/useDashboard';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

const GRADIENTS = [
  'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)', // Violet to Pink
  'linear-gradient(135deg, #f472b6 0%, #f43f5e 100%)', // Pink to Rose
  'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)', // Cyan to Blue
  'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', // Teal to Greenish Teal
  'linear-gradient(135deg, #fb923c 0%, #f97316 100%)', // Orange to Rust
  'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)', // Light Purple to Indigo
  'linear-gradient(135deg, #f472b6 0%, #a855f7 100%)', // Pink to Purple
  'linear-gradient(135deg, #34d399 0%, #059669 100%)', // Mint to Emerald
];

const getGradient = (id) => {
  if (!id) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[idx];
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
    <Card className="flex-1 min-w-[200px] shadow-[var(--shadow-kpi)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden">
      <CardContent className="p-4 flex-1">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground block">{label}</span>
            <p className="mt-2 text-2xl font-bold text-foreground tracking-tight leading-none">{value}</p>
            {changeText && (
              <span className={cn("text-[10px] font-medium mt-2 block", isIncrease ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500')}>
                {changeText}
              </span>
            )}
          </div>
          <div className={cn('rounded-xl p-2 shrink-0', bg)}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 15;
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const sortOrder = searchParams.get('sortOrder') || '';
  const gender = searchParams.get('gender') || '';
  const bloodGroup = searchParams.get('bloodGroup') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  const { data, isLoading } = usePatients({ page, search, limit, sortBy, sortOrder, gender, bloodGroup });
  const { data: statsData } = useDashboardStats();
  const deleteMut = useDeletePatient();

  const s = statsData || {};

  const kpiCards = [
    {
      label: 'Total Patients',
      value: (s.totalPatients || 1247).toLocaleString(),
      icon: Users,
      color: '#f43f5e',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      changeText: '+3.2% from last month',
      isIncrease: true,
    },
    {
      label: 'New This Month',
      value: s.monthPatients || 86,
      icon: UserPlus,
      color: '#0d9488',
      bg: 'bg-teal-50 dark:bg-teal-950/30',
      changeText: '+12.4% from last month',
      isIncrease: true,
    },
    {
      label: 'Critical Cases',
      value: s.activeAdmissions || 12,
      icon: AlertTriangle,
      color: '#ef4444',
      bg: 'bg-red-50 dark:bg-red-950/30',
      changeText: '-2 from last month',
      isIncrease: false,
    },
    {
      label: 'Avg Stay',
      value: '4.2 days',
      icon: Clock,
      color: '#6366f1',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      changeText: '-0.3d from last month',
      isIncrease: false,
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

  const handleSearch = (e) => {
    e.preventDefault();
  };

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

  // Debounce search input changes to search in real-time
  useEffect(() => {
    const handler = setTimeout(() => {
      updateParams({ search: searchInput, page: '1' });
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput, updateParams]);

  const hasActiveFilters = !!(gender || bloodGroup || search);

  const handleClearFilters = () => {
    setSearchInput('');
    updateParams({ gender: '', bloodGroup: '', search: '', page: '1' });
  };

  const handleDelete = (id) => setDelTarget(id);

  const goToPage = (p) => {
    if (p < 1 || p > (data?.totalPages || 1)) return;
    updateParams({ page: String(p) });
  };

  const patients = data?.patients || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Patients
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage patient records and demographics.
          </p>
        </div>
        <Link to="/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Register Patient
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Controls Row */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 w-full bg-card p-3 rounded-xl border border-border/50 shadow-sm">
          {/* Left Side: Search form */}
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 rounded-xl border-border/20 bg-muted/15 focus-visible:bg-background focus:ring-1 focus:ring-primary h-9 text-xs"
            />
          </form>

          {/* Right Side: Filter & Clear buttons */}
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="h-9 px-3.5 rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-sm"
                title="Clear all active search and filters"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            )}

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "h-9 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none",
                isFilterOpen
                  ? "bg-muted text-foreground border-zinc-300 dark:bg-[#18181b] dark:text-zinc-100 dark:border-zinc-700 shadow-md"
                  : "border-border/60 dark:border-border/20 bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 text-muted-foreground hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
              {(gender || bloodGroup) && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Panels */}
        {isFilterOpen && (
          <div className="p-4 bg-card rounded-xl border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground block mb-2 uppercase tracking-wider">Gender</span>
              <div className="flex flex-wrap gap-2">
                {['', 'male', 'female', 'other'].map((g) => (
                  <button
                    key={g}
                    onClick={() => updateParams({ gender: g, page: '1' })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none",
                      (gender === g)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/10 hover:bg-muted/20 border-border/10 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {g ? g.charAt(0).toUpperCase() + g.slice(1) : 'All Genders'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground block mb-2 uppercase tracking-wider">Blood Group</span>
              <div className="flex flex-wrap gap-1.5">
                {['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bgVal) => (
                  <button
                    key={bgVal}
                    onClick={() => updateParams({ bloodGroup: bgVal, page: '1' })}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none",
                      (bloodGroup === bgVal)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/10 hover:bg-muted/20 border-border/10 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {bgVal || 'All'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : patients.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {search ? 'No patients match your search' : 'No patients registered yet'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3 pr-2 w-10 text-center font-semibold">#</th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('uhid')}>
                        <span className="inline-flex items-center gap-1">
                          Worker ID
                          <SortIcon active={sortBy === 'uhid'} direction={sortOrder} />
                        </span>
                      </th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('firstName')}>
                        <span className="inline-flex items-center gap-1">
                          Member
                          <SortIcon active={sortBy === 'firstName'} direction={sortOrder} />
                        </span>
                      </th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('phone')}>
                        <span className="inline-flex items-center gap-1">
                          Phone
                          <SortIcon active={sortBy === 'phone'} direction={sortOrder} />
                        </span>
                      </th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('gender')}>
                        <span className="inline-flex items-center gap-1">
                          Gender
                          <SortIcon active={sortBy === 'gender'} direction={sortOrder} />
                        </span>
                      </th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('bloodGroup')}>
                        <span className="inline-flex items-center gap-1">
                          Blood Group
                          <SortIcon active={sortBy === 'bloodGroup'} direction={sortOrder} />
                        </span>
                      </th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                        <span className="inline-flex items-center gap-1">
                          Registered
                          <SortIcon active={sortBy === 'createdAt'} direction={sortOrder} />
                        </span>
                      </th>
                      <th className="pb-3 font-semibold w-32 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p, idx) => (
                      <tr key={p._id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 pr-2 text-center text-xs text-muted-foreground font-mono">
                          {from + idx}
                        </td>
                        <td className="py-3.5 text-sm">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground dark:text-zinc-400 bg-muted/40 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-border/60 dark:border-zinc-800/80 shadow-sm">
                            {p.uhid}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(p.uhid);
                                setCopiedId(p._id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="text-muted-foreground/60 hover:text-foreground dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors p-0.5 rounded cursor-pointer shrink-0"
                              title="Copy Worker ID"
                            >
                              {copiedId === p._id ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white font-black text-xs shadow-md border border-white/10"
                              style={{ background: getGradient(p._id) }}
                            >
                              {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <Link to={`/patients/${p._id}`} className="font-semibold text-sm hover:text-primary transition-colors">
                                {p.firstName} {p.lastName}
                              </Link>
                              <span className="text-xs text-muted-foreground">{p.email || `${p.firstName?.toLowerCase()}@acme.com`}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-sm font-medium text-foreground">{p.phone}</td>
                        <td className="py-3.5 text-sm">
                          <Badge variant="outline" className="capitalize px-2 py-0.5 font-semibold text-[11px] bg-muted/20 text-muted-foreground border-border/10">
                            {p.gender}
                          </Badge>
                        </td>
                        <td className="py-3.5">
                          {p.bloodGroup ? (
                            <Badge variant="outline" className="px-2 py-0.5 font-mono text-[11px] font-bold border-primary/20 bg-primary/5 text-primary">
                              {p.bloodGroup}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs font-mono">--</span>
                          )}
                        </td>
                        <td className="py-3.5 text-xs text-muted-foreground whitespace-nowrap font-medium">
                          {new Date(p.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Button */}
                            <Link
                              to={`/patients/${p._id}`}
                              className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="h-[18px] w-[18px]" />
                            </Link>

                            {/* Edit Button */}
                            <Link
                              to={`/patients/${p._id}/edit`}
                              className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer"
                              title="Edit Patient"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="w-9 h-9 rounded-full border border-red-200 dark:border-red-950/60 flex items-center justify-center bg-red-50/50 hover:bg-red-100 dark:bg-[#2a1415] dark:hover:bg-[#3f1a1c] text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 shadow-sm transition-all duration-200 cursor-pointer"
                              title="Delete Patient"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Pagination & Rows Selector Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 border-t border-border/10 mt-2">
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-xs text-muted-foreground font-semibold">
                    Showing {from}–{to} of {total} patients
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 border-l border-border/20 pl-4">
                    <label htmlFor="page-size" className="font-semibold">Rows per page:</label>
                    <select
                      id="page-size"
                      value={limit}
                      onChange={(e) => changeLimit(Number(e.target.value))}
                      className="rounded-xl border border-border/20 bg-muted/15 hover:bg-muted/25 px-2.5 py-1 text-[11px] font-semibold transition-colors outline-none cursor-pointer"
                    >
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n} className="bg-background">{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getPageNumbers(page, totalPages).map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground font-semibold">…</span>
                      ) : (
                        <Button
                          key={p}
                          variant={p === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => goToPage(p)}
                          className="h-8 min-w-[2rem] px-2 font-semibold text-xs"
                        >
                          {p}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => goToPage(page + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <ConfirmDelete isOpen={delTarget!==null} onClose={()=>setDelTarget(null)} onConfirm={()=>{deleteMut.mutate(delTarget);setDelTarget(null);}} title="Delete Patient" message="Delete this patient permanently? This action cannot be undone." />
    </div>
  );
}
