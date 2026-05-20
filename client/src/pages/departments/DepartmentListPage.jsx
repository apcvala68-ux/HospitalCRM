import { useState, useCallback, useEffect } from 'react';
import { ConfirmDelete } from '../../components/ui/ConfirmDelete';
import { Link, useSearchParams } from 'react-router-dom';
import { useDepartments, useDeleteDepartment } from '../../hooks/useDepartments';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Search, Plus, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown, Eye,
  Building2, Stethoscope, Users,
  Pencil, Trash2, SlidersHorizontal, X, DollarSign,
} from 'lucide-react';
import { cn, displayPhone } from '../../lib/utils';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];
const GRADIENTS = ['linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)','linear-gradient(135deg, #f472b6 0%, #f43f5e 100%)','linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)','linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)','linear-gradient(135deg, #fb923c 0%, #f97316 100%)','linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)','linear-gradient(135deg, #f472b6 0%, #a855f7 100%)','linear-gradient(135deg, #34d399 0%, #059669 100%)'];
const getGradient = (id) => { if (!id) return GRADIENTS[0]; let h=0; for(let i=0;i<id.length;i++) h=id.charCodeAt(i)+((h<<5)-h); return GRADIENTS[Math.abs(h)%GRADIENTS.length]; };
function SortIcon({ active, direction }) { if(!active) return <ArrowUpDown className="h-3 w-3 opacity-30 shrink-0" />; return direction==='asc' ? <ArrowUp className="h-3 w-3 shrink-0" /> : <ArrowDown className="h-3 w-3 shrink-0" />; }
function getPageNumbers(c,t){if(t<=7)return Array.from({length:t},(_,i)=>i+1);const p=[1];let s=Math.max(2,c-2),e=Math.min(t-1,c+2);if(c<=3)e=Math.min(5,t-1);if(c>=t-2)s=Math.max(t-4,2);if(s>2)p.push('...');for(let i=s;i<=e;i++)p.push(i);if(e<t-1)p.push('...');p.push(t);return p;}
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

export function DepartmentListPage() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get('page')) || 1;
  const limit = Number(sp.get('limit')) || 15;
  const search = sp.get('search') || '';
  const sortBy = sp.get('sortBy') || '';
  const sortOrder = sp.get('sortOrder') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [delTarget, setDelTarget] = useState(null);

  const { data, isLoading, error } = useDepartments({ page, search, limit, sortBy, sortOrder });
  const deleteMut = useDeleteDepartment();
  const departments = data?.departments || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  useEffect(() => { const t = setTimeout(() => { const p = new URLSearchParams(sp); if (searchInput) p.set('search', searchInput); else p.delete('search'); p.set('page', '1'); setSp(p, { replace: true }); }, 400); return () => clearTimeout(t); }, [searchInput, sp, setSp]);

  const gp = useCallback((p) => { const n = new URLSearchParams(sp); n.set('page', String(p)); setSp(n, { replace: true }); }, [sp, setSp]);
  const cl = useCallback((l) => { const n = new URLSearchParams(sp); n.set('limit', String(l)); n.set('page', '1'); setSp(n, { replace: true }); }, [sp, setSp]);
  const hs = useCallback((f) => { const n = new URLSearchParams(sp); if (n.get('sortBy') === f && n.get('sortOrder') === 'asc') { n.set('sortOrder', 'desc'); } else { n.set('sortBy', f); n.set('sortOrder', 'asc'); } n.set('page', '1'); setSp(n, { replace: true }); }, [sp, setSp]);

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const stats = { total: total, doctors: departments.reduce((s, d) => s + (d.doctorCount || 0), 0), heads: departments.filter(d => d.headDoctor).length, avgRevenue: departments.length ? Math.round(departments.reduce((s, d) => s + (d.revenue || 0), 0) / departments.length) : 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight text-foreground">Departments</h1><p className="text-sm text-muted-foreground">Hospital departments and specialties</p></div>
        <Link to="/departments/new"><Button><Plus className="h-4 w-4 sm:mr-2" /><Building2 className="h-4 w-4 sm:hidden" /><span className="hidden sm:inline">Add Department</span></Button></Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatCard label="Total Departments" value={stats.total} icon={Building2} color="#a78bfa" bg="bg-purple-100 dark:bg-purple-950/40" />
        <StatCard label="Total Doctors" value={stats.doctors} icon={Users} color="#3b82f6" bg="bg-blue-100 dark:bg-blue-950/40" />
        <StatCard label="With Head Doctor" value={stats.heads} icon={Stethoscope} color="#10b981" bg="bg-emerald-100 dark:bg-emerald-950/40" />
        <StatCard label="Avg Revenue" value={`₹${stats.avgRevenue.toLocaleString('en-IN')}`} icon={DollarSign} color="#f59e0b" bg="bg-amber-100 dark:bg-amber-950/40" />
      </div>

      <Card className="shadow-[var(--shadow-card)] rounded-2xl bg-card border border-border/50 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search departments..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-9 h-9 text-sm rounded-xl bg-muted/20 border-border/30" />
              {searchInput && <button onClick={() => { setSearchInput(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"><X className="h-4 w-4" /></button>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={cn("h-9 px-3 rounded-xl border border-border/30 flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer", isFilterOpen ? "bg-primary text-primary-foreground border-primary" : "bg-muted/20 hover:bg-muted/30 text-muted-foreground")}><SlidersHorizontal className="h-4 w-4" /> Filters</button>
            </div>
          </div>

          {error ? (
            <div className="py-12 text-center"><p className="text-destructive font-medium">Failed to load departments</p><p className="text-xs text-muted-foreground mt-1">{error.message || 'Check your connection and try again'}</p></div>
          ) : isLoading ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : departments.length === 0 ? (
            <div className="text-center py-12"><Building2 className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" /><p className="text-muted-foreground font-medium">No departments found</p><p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search or filters</p></div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/10 text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="py-3.5 font-semibold text-center w-10">#</th>
                      <th className="py-3.5 font-semibold cursor-pointer select-none text-left" onClick={() => hs('name')}><span className="inline-flex items-center gap-1">Name <SortIcon active={sortBy === 'name'} direction={sortOrder} /></span></th>
                      <th className="py-3.5 font-semibold cursor-pointer select-none text-left" onClick={() => hs('doctorCount')}><span className="inline-flex items-center gap-1">Doctors <SortIcon active={sortBy === 'doctorCount'} direction={sortOrder} /></span></th>
                      <th className="py-3.5 font-semibold text-left">Head Doctor</th>
                      <th className="py-3.5 font-semibold text-left">Phone</th>
                      <th className="py-3.5 font-semibold cursor-pointer select-none text-left" onClick={() => hs('revenue')}><span className="inline-flex items-center gap-1">Revenue <SortIcon active={sortBy === 'revenue'} direction={sortOrder} /></span></th>
                      <th className="py-3.5 font-semibold cursor-pointer select-none text-left" onClick={() => hs('isActive')}><span className="inline-flex items-center gap-1">Status <SortIcon active={sortBy === 'isActive'} direction={sortOrder} /></span></th>
                      <th className="py-3.5 font-semibold w-32 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((d, idx) => (
                      <tr key={d._id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 pr-2 text-center text-xs text-muted-foreground font-mono">{from + idx}</td>
                        <td className="py-3.5">
                          <Link to={`/departments/${d._id}`} className="font-semibold text-sm hover:text-primary transition-colors inline-flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-[10px] shadow-sm" style={{ background: getGradient(d._id) }}><Building2 className="h-3.5 w-3.5" /></div>
                            {d.name}
                          </Link>
                        </td>
                        <td className="py-3.5"><Badge variant="outline" className="font-medium text-[11px] bg-muted/20 text-muted-foreground border-border/10">{d.doctorCount || 0}</Badge></td>
                        <td className="py-3.5 text-sm text-muted-foreground">{d.headDoctor?.user?.name || <span className="text-muted-foreground/50">—</span>}</td>
                        <td className="py-3.5 text-sm text-muted-foreground">{displayPhone(d.phone)}</td>
                        <td className="py-3.5 text-sm font-semibold">₹{(d.revenue || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3.5"><Badge variant={d.isActive !== false ? 'success' : 'secondary'}>{d.isActive !== false ? 'Active' : 'Inactive'}</Badge></td>
                        <td className="py-3.5 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/departments/${d._id}`} className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer" title="View Details"><Eye className="h-[18px] w-[18px]" /></Link>
                            <Link to={`/departments/${d._id}/edit`} className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer" title="Edit Department"><Pencil className="h-4 w-4" /></Link>
                            <button onClick={() => setDelTarget(d)} className="w-9 h-9 rounded-full border border-red-200 dark:border-red-950/60 flex items-center justify-center bg-red-50/50 hover:bg-red-100 dark:bg-[#2a1415] dark:hover:bg-[#3f1a1c] text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 shadow-sm transition-all duration-200 cursor-pointer" title="Delete Department"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 border-t border-border/10 mt-2">
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-xs text-muted-foreground font-semibold">Showing {from}–{to} of {total} departments</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 border-l border-border/20 pl-4">
                    <label htmlFor="page-size" className="font-semibold">Rows per page:</label>
                    <select id="page-size" value={limit} onChange={e => cl(Number(e.target.value))} className="rounded-xl border border-border/20 bg-muted/15 hover:bg-muted/25 px-2.5 py-1 text-[11px] font-semibold transition-colors outline-none cursor-pointer">{PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n} className="bg-background">{n}</option>)}</select>
                  </div>
                </div>
                {totalPages > 1 && <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => gp(page - 1)} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                  {getPageNumbers(page, totalPages).map((p, i) => p === '...' ? <span key={`e-${i}`} className="px-1 text-muted-foreground font-semibold">…</span> : <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => gp(p)} className="h-8 min-w-[2rem] px-2 font-semibold text-xs">{p}</Button>)}
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => gp(page + 1)} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
                </div>}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <ConfirmDelete isOpen={delTarget !== null} onClose={() => setDelTarget(null)} onConfirm={() => { deleteMut.mutate(delTarget._id); setDelTarget(null); }} title="Delete Department" message={`Delete "${delTarget?.name}"? This will unlink all doctors in this department but will not delete them.`} />
    </div>
  );
}
