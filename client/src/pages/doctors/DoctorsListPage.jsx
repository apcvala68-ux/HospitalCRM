import { useState, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDoctors, useDeleteDoctor } from '../../hooks/useDoctor';
import { ConfirmDelete } from '../../components/ui/ConfirmDelete';
import { useDepartments } from '../../hooks/useDepartments';
import { Select, ListBox } from '@heroui/react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Search, Plus, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown, Eye,
  Stethoscope, Award, DollarSign,
  Pencil, Trash2, SlidersHorizontal, X, Users,
} from 'lucide-react';
import { cn } from '../../lib/utils';

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

export function DoctorsListPage() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get('page')) || 1;
  const limit = Number(sp.get('limit')) || 15;
  const search = sp.get('search') || '';
  const sortBy = sp.get('sortBy') || '';
  const sortOrder = sp.get('sortOrder') || '';
  const deptFilter = sp.get('department') || '';
  const availabilityFilter = sp.get('isAvailable') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [delTarget, setDelTarget] = useState(null);

  const { data: deptData } = useDepartments();
  const departments = deptData?.departments || [];

  const { data, isLoading } = useDoctors({ page, limit, search, sortBy, sortOrder, department: deptFilter, isAvailable: availabilityFilter });
  const deleteMut = useDeleteDoctor();

  const up = useCallback((u) => {
    setSp(p => { const n = new URLSearchParams(p); Object.entries(u).forEach(([k, v]) => { if (v) n.set(k, v); else n.delete(k); }); return n; });
  }, [setSp]);
  const hs = (k) => { if (sortBy === k) up({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc', page: '1' }); else up({ sortBy: k, sortOrder: 'asc', page: '1' }); };
  const cl = (n) => { up({ limit: String(n), page: '1' }); };
  useEffect(() => { const h = setTimeout(() => { up({ search: searchInput, page: '1' }); }, 350); return () => clearTimeout(h); }, [searchInput, up]);
  const haf = !!(deptFilter || availabilityFilter || search);
  const hcf = () => { setSearchInput(''); up({ department: '', isAvailable: '', search: '', page: '1' }); };
  const gp = (p) => { if (p < 1 || p > (data?.totalPages || 1)) return; up({ page: String(p) }); };

  const doctors = data?.doctors || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const handleDelete = (id) => setDelTarget(id);

  const avgFee = doctors.length ? Math.round(doctors.reduce((s, d) => s + (d.consultationFee || 0), 0) / doctors.length) : 0;
  const availableCount = doctors.filter(d => d.isAvailable).length;
  const avgExp = doctors.length ? Math.round(doctors.reduce((s, d) => s + (d.yearsOfExperience || 0), 0) / doctors.length) : 0;
  const deptSet = new Set(doctors.map(d => d.department?.name).filter(Boolean));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Doctors</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage hospital medical staff and their profiles.</p>
        </div>
        <Link to="/doctors/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Doctor</Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Doctors" value={total} icon={Users} color="#6366f1" bg="bg-indigo-50 dark:bg-indigo-950/30" changeText={`${deptSet.size} departments`} isIncrease />
        <StatCard label="Available" value={availableCount} icon={Stethoscope} color="#0d9488" bg="bg-teal-50 dark:bg-teal-950/30" changeText={total ? `${Math.round(availableCount / total * 100)}% on duty` : ''} isIncrease />
        <StatCard label="Avg Fee" value={`₹${avgFee}`} icon={DollarSign} color="#f59e0b" bg="bg-amber-50 dark:bg-amber-950/30" changeText="Consultation" isIncrease />
        <StatCard label="Avg Experience" value={`${avgExp} yrs`} icon={Award} color="#f43f5e" bg="bg-rose-50 dark:bg-rose-950/30" changeText="Across all doctors" isIncrease />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 w-full bg-card p-3 rounded-xl border border-border/50 shadow-sm">
          <form onSubmit={e => e.preventDefault()} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, specialization, license..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-10 pr-4 rounded-xl border-border/20 bg-muted/15 focus-visible:bg-background focus:ring-1 focus:ring-primary h-9 text-xs" />
          </form>
          <div className="flex items-center gap-2">
            {haf && <button onClick={hcf} className="h-9 px-3.5 rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-sm"><X className="h-3.5 w-3.5" /> Clear Filters</button>}
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={cn("h-9 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none", isFilterOpen ? "bg-muted text-foreground border-zinc-300 dark:bg-[#18181b] dark:text-zinc-100 dark:border-zinc-700 shadow-md" : "border-border/60 dark:border-border/20 bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 text-muted-foreground hover:text-foreground")}>
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter{(deptFilter || availabilityFilter) && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          </div>
        </div>
      </div>

        {isFilterOpen && (
          <div className="p-4 bg-card rounded-xl border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <Select
              className="w-full"
              placeholder="All Departments"
              selectedKey={deptFilter || 'all'}
              onSelectionChange={k => up({ department: k === 'all' ? '' : String(k), page: '1' })}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="all" textValue="All Departments">
                    All Departments
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  {departments.map(d => (
                    <ListBox.Item key={d._id} id={d._id} textValue={d.name}>
                      {d.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            <Select
              className="w-full"
              placeholder="All"
              selectedKey={availabilityFilter || 'all'}
              onSelectionChange={k => up({ isAvailable: k === 'all' ? '' : String(k), page: '1' })}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {[['all', 'All'], ['true', 'Available'], ['false', 'Away']].map(([val, label]) => (
                    <ListBox.Item key={val} id={val} textValue={label}>
                      {label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : doctors.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">{search || deptFilter ? 'No doctors match your filters' : 'No doctors registered yet'}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3 pr-2 w-10 text-center font-semibold">#</th>
                      <th className="pb-3 font-semibold">Doctor</th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('specialization')}><span className="inline-flex items-center gap-1">Specialization <SortIcon active={sortBy === 'specialization'} direction={sortOrder} /></span></th>
                      <th className="pb-3 font-semibold">Department</th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('consultationFee')}><span className="inline-flex items-center gap-1">Fee <SortIcon active={sortBy === 'consultationFee'} direction={sortOrder} /></span></th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('yearsOfExperience')}><span className="inline-flex items-center gap-1">Experience <SortIcon active={sortBy === 'yearsOfExperience'} direction={sortOrder} /></span></th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('isAvailable')}><span className="inline-flex items-center gap-1">Status <SortIcon active={sortBy === 'isAvailable'} direction={sortOrder} /></span></th>
                      <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('createdAt')}><span className="inline-flex items-center gap-1">Joined <SortIcon active={sortBy === 'createdAt'} direction={sortOrder} /></span></th>
                      <th className="pb-3 font-semibold w-32 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doc, idx) => (
                      <tr key={doc._id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 pr-2 text-center text-xs text-muted-foreground font-mono">{from + idx}</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white font-black text-xs shadow-md border border-white/10" style={{ background: getGradient(doc._id) }}>
                              {doc.user?.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex flex-col">
                              <Link to={`/doctors/${doc._id}`} className="font-semibold text-sm hover:text-primary transition-colors">{doc.user?.name}</Link>
                              <span className="text-xs text-muted-foreground">{doc.user?.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5"><Badge variant="outline" className="font-medium text-[11px] bg-muted/20 text-muted-foreground border-border/10">{doc.specialization}</Badge></td>
                        <td className="py-3.5 text-sm text-muted-foreground">{doc.department?.name || <span className="text-muted-foreground/50">—</span>}</td>
                        <td className="py-3.5 text-sm font-semibold">₹{doc.consultationFee || 0}</td>
                        <td className="py-3.5 text-sm">{doc.yearsOfExperience ? <span className="font-medium">{doc.yearsOfExperience} yrs</span> : <span className="text-muted-foreground">—</span>}</td>
                        <td className="py-3.5"><Badge variant={doc.isAvailable ? 'success' : 'secondary'}>{doc.isAvailable ? 'Available' : 'Away'}</Badge></td>
                        <td className="py-3.5 text-xs text-muted-foreground whitespace-nowrap font-medium">{new Date(doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="py-3.5 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/doctors/${doc._id}`} className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer" title="View Details"><Eye className="h-[18px] w-[18px]" /></Link>
                            <Link to={`/doctors/${doc._id}/edit`} className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer" title="Edit Doctor"><Pencil className="h-4 w-4" /></Link>
                            <button onClick={() => handleDelete(doc._id)} className="w-9 h-9 rounded-full border border-red-200 dark:border-red-950/60 flex items-center justify-center bg-red-50/50 hover:bg-red-100 dark:bg-[#2a1415] dark:hover:bg-[#3f1a1c] text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 shadow-sm transition-all duration-200 cursor-pointer" title="Deactivate Doctor"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 border-t border-border/10 mt-2">
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-xs text-muted-foreground font-semibold">Showing {from}–{to} of {total} doctors</p>
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
      <ConfirmDelete isOpen={delTarget!==null} onClose={()=>setDelTarget(null)} onConfirm={()=>{deleteMut.mutate(delTarget);setDelTarget(null);}} title="Deactivate Doctor" message="Deactivate this doctor? They will no longer appear in listings." confirmLabel="Deactivate" />
    </div>
  );
}
