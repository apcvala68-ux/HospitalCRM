import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTodayAttendance, useAttendanceList, useCheckIn, useCheckOut } from '../../hooks/useAttendance';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Clock, LogIn, LogOut, Users, Calendar,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Eye, Search,
  SlidersHorizontal, X, UserCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

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
const statusVariant = { present:'success', absent:'destructive', late:'warning', 'half-day':'info', onLeave:'secondary' };

export function AttendancePage() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get('page')) || 1;
  const limit = Number(sp.get('limit')) || 15;
  const search = sp.get('search') || '';
  const sortBy = sp.get('sortBy') || '';
  const sortOrder = sp.get('sortOrder') || '';
  const dateFilter = sp.get('date') || new Date().toISOString().split('T')[0];
  const statusFilter = sp.get('status') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { user } = useAuth();
  const { data: todayData } = useTodayAttendance();
  const { data: historyData, isLoading } = useAttendanceList({ date: dateFilter, status: statusFilter, page, limit, search, sortBy, sortOrder });
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const todayRecords = todayData?.records || [];
  const myRecord = todayRecords.find(r => r.user?._id === user?._id);

  const up = useCallback((u) => {
    setSp(p => { const n = new URLSearchParams(p); Object.entries(u).forEach(([k, v]) => { if (v) n.set(k, v); else n.delete(k); }); return n; });
  }, [setSp]);
  const hs = (k) => { if (sortBy === k) up({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc', page: '1' }); else up({ sortBy: k, sortOrder: 'asc', page: '1' }); };
  const cl = (n) => { up({ limit: String(n), page: '1' }); };
  useEffect(() => { const h = setTimeout(() => { up({ search: searchInput, page: '1' }); }, 350); return () => clearTimeout(h); }, [searchInput, up]);
  const haf = !!(statusFilter || search); const hcf = () => { setSearchInput(''); up({ status: '', search: '', page: '1' }); };
  const gp = (p) => { if (p < 1 || p > (historyData?.totalPages || 1)) return; up({ page: String(p) }); };
  const history = historyData?.records || []; const total = historyData?.total || 0; const tp = historyData?.totalPages || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1; const to = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Staff Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track check-in, check-out, and attendance history.</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{todayData?.presentToday}/{todayData?.totalStaff} present today</span>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Present Today" value={todayData?.presentToday || 0} icon={UserCheck} color="#0d9488" bg="bg-teal-50 dark:bg-teal-950/30" changeText={`of ${todayData?.totalStaff || 0} staff`} isIncrease />
        <StatCard label="Total Staff" value={todayData?.totalStaff || 0} icon={Users} color="#6366f1" bg="bg-indigo-50 dark:bg-indigo-950/30" changeText="" isIncrease={false} />
        <StatCard label="Check-ins Today" value={todayRecords.length} icon={LogIn} color="#3b82f6" bg="bg-blue-50 dark:bg-blue-950/30" changeText={myRecord ? 'You are checked in' : 'You are not checked in'} isIncrease={!myRecord ? false : undefined} />
        <StatCard label="Attendance Rate" value={todayData?.totalStaff ? `${Math.round((todayData?.presentToday / todayData?.totalStaff) * 100)}%` : '0%'} icon={Calendar} color="#f59e0b" bg="bg-amber-50 dark:bg-amber-950/30" changeText="" isIncrease={false} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">My Attendance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {myRecord ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">{myRecord.checkOut ? 'Completed' : 'Checked In'}</p>
                <p className="text-xs text-muted-foreground">In: {new Date(myRecord.checkIn).toLocaleTimeString()}{myRecord.checkOut && ` | Out: ${new Date(myRecord.checkOut).toLocaleTimeString()}`}</p>
                <Badge className="mt-1 capitalize" variant="success">{myRecord.shift} shift</Badge>
              </div>
            ) : <p className="text-sm text-muted-foreground">Not checked in today</p>}
            <div className="flex gap-2">
              {!myRecord && <Button onClick={() => checkIn.mutate({})} disabled={checkIn.isPending} className="flex-1"><LogIn className="mr-2 h-4 w-4" /> Check In</Button>}
              {myRecord && !myRecord.checkOut && <Button onClick={() => checkOut.mutate()} disabled={checkOut.isPending} variant="outline" className="flex-1"><LogOut className="mr-2 h-4 w-4" /> Check Out</Button>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Today's Attendance ({todayRecords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {todayRecords.length === 0 ? <p className="text-sm text-muted-foreground">No one checked in yet</p> : (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {todayRecords.map(r => (
                  <div key={r._id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div><p className="font-medium">{r.user?.name}</p><p className="text-xs text-muted-foreground capitalize">{r.user?.role} · {r.shift}</p></div>
                    </div>
                    <div className="text-right text-xs">
                      <p>{new Date(r.checkIn).toLocaleTimeString()}</p>
                      {r.checkOut && <p className="text-muted-foreground">{new Date(r.checkOut).toLocaleTimeString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {user?.role === 'admin' && (
        <>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 w-full bg-card p-3 rounded-xl border border-border/50 shadow-sm">
              <form onSubmit={e => e.preventDefault()} className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by staff, shift..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-10 pr-4 rounded-xl border-border/20 bg-muted/15 focus-visible:bg-background focus:ring-1 focus:ring-primary h-9 text-xs" />
              </form>
              <div className="flex items-center gap-2">
                {haf && <button onClick={hcf} className="h-9 px-3.5 rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-sm"><X className="h-3.5 w-3.5" /> Clear Filters</button>}
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={cn("h-9 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none", isFilterOpen ? "bg-muted text-foreground border-zinc-300 dark:bg-[#18181b] dark:text-zinc-100 dark:border-zinc-700 shadow-md" : "border-border/60 dark:border-border/20 bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 text-muted-foreground hover:text-foreground")}>
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filter{(dateFilter !== new Date().toISOString().split('T')[0] || statusFilter) && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              </div>
            </div>
            {isFilterOpen && (
              <div className="p-4 bg-card rounded-xl border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div><span className="text-[10px] font-bold text-muted-foreground block mb-2 uppercase tracking-wider">Date</span><Input type="date" value={dateFilter} onChange={e => up({ date: e.target.value, page: '1' })} className="h-9 rounded-xl" /></div>
                <div><span className="text-[10px] font-bold text-muted-foreground block mb-2 uppercase tracking-wider">Status</span><div className="flex flex-wrap gap-2">{['', 'present', 'absent', 'late', 'half-day', 'on-leave'].map(s => <button key={s} onClick={() => up({ status: s, page: '1' })} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none", (statusFilter === s) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/10 hover:bg-muted/20 border-border/10 text-muted-foreground hover:text-foreground")}>{s ? s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ') : 'All'}</button>)}</div></div>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Attendance History ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No records for this date</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="pb-3 pr-2 w-10 text-center font-semibold">#</th>
                          <th className="pb-3 font-semibold">Staff</th>
                          <th className="pb-3 font-semibold">Role</th>
                          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('shift')}><span className="inline-flex items-center gap-1">Shift <SortIcon active={sortBy === 'shift'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('checkIn')}><span className="inline-flex items-center gap-1">In <SortIcon active={sortBy === 'checkIn'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('checkOut')}><span className="inline-flex items-center gap-1">Out <SortIcon active={sortBy === 'checkOut'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('status')}><span className="inline-flex items-center gap-1">Status <SortIcon active={sortBy === 'status'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('date')}><span className="inline-flex items-center gap-1">Date <SortIcon active={sortBy === 'date'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold w-32 text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((r, idx) => (
                          <tr key={r._id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                            <td className="py-3.5 pr-2 text-center text-xs text-muted-foreground font-mono">{from + idx}</td>
                            <td className="py-3.5 text-sm font-medium">{r.user?.name || <span className="text-muted-foreground">—</span>}</td>
                            <td className="py-3.5 text-sm capitalize text-muted-foreground">{r.user?.role || <span>—</span>}</td>
                            <td className="py-3.5 text-sm capitalize">{r.shift || <span className="text-muted-foreground">—</span>}</td>
                            <td className="py-3.5 text-sm">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : <span className="text-muted-foreground">—</span>}</td>
                            <td className="py-3.5 text-sm">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : <span className="text-muted-foreground">—</span>}</td>
                            <td className="py-3.5"><Badge variant={statusVariant[r.status] || 'default'}>{r.status}</Badge></td>
                            <td className="py-3.5 text-xs text-muted-foreground whitespace-nowrap font-medium">{r.date ? new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                            <td className="py-3.5 text-right pr-4">
                              <div className="flex items-center justify-end gap-2">
                                <button className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer" title="View"><Eye className="h-[18px] w-[18px]" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 border-t border-border/10 mt-2">
                    <div className="flex flex-wrap items-center gap-4">
                      <p className="text-xs text-muted-foreground font-semibold">Showing {from}–{to} of {total} records</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 border-l border-border/20 pl-4">
                        <label htmlFor="page-size" className="font-semibold">Rows per page:</label>
                        <select id="page-size" value={limit} onChange={e => cl(Number(e.target.value))} className="rounded-xl border border-border/20 bg-muted/15 hover:bg-muted/25 px-2.5 py-1 text-[11px] font-semibold transition-colors outline-none cursor-pointer">{PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n} className="bg-background">{n}</option>)}</select>
                      </div>
                    </div>
                    {tp > 1 && <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => gp(page - 1)} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                      {getPageNumbers(page, tp).map((p, i) => p === '...' ? <span key={`e-${i}`} className="px-1 text-muted-foreground font-semibold">…</span> : <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => gp(p)} className="h-8 min-w-[2rem] px-2 font-semibold text-xs">{p}</Button>)}
                      <Button variant="outline" size="sm" disabled={page >= tp} onClick={() => gp(page + 1)} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
                    </div>}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
