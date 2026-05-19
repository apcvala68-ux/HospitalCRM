import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMedicines, useInventory, useAddStock, useDispense, useLowStockAlerts, useCreateMedicine } from '../../hooks/usePharmacy';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/useToast';
import {
  Pill, Plus, AlertTriangle, Package, Search, MinusCircle,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal, X,
  DollarSign, Clock, AlertOctagon,
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

export function PharmacyPage() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get('page')) || 1;
  const limit = Number(sp.get('limit')) || 15;
  const search = sp.get('search') || '';
  const sortBy = sp.get('sortBy') || '';
  const sortOrder = sp.get('sortOrder') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tab, setTab] = useState('inventory');
  const [medForm, setMedForm] = useState({ medicine: '', batchNo: '', expiryDate: '', quantity: 0, mrp: 0, supplier: '' });
  const [dispenseQty, setDispenseQty] = useState({});
  const [newMed, setNewMed] = useState({ name: '', genericName: '', category: '', unit: 'tablet', reorderLevel: 10 });

  const { data: medicinesData } = useMedicines(tab === 'add' || tab === 'new' ? '' : search);
  const { data: inventoryData, isLoading } = useInventory({ page, limit, search, sortBy, sortOrder });
  const { data: alertsData } = useLowStockAlerts();
  const addStock = useAddStock();
  const dispense = useDispense();
  const createMedicine = useCreateMedicine();
  const toast = useToast();

  const medicines = medicinesData?.medicines || [];
  const inventory = inventoryData?.inventory || [];
  const alerts = alertsData?.alerts || [];
  const total = inventoryData?.total || 0;
  const totalPages = inventoryData?.totalPages || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const up = useCallback((u) => {
    setSp(p => { const n = new URLSearchParams(p); Object.entries(u).forEach(([k, v]) => { if (v) n.set(k, v); else n.delete(k); }); return n; });
  }, [setSp]);
  const hs = (k) => { if (sortBy === k) up({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc', page: '1' }); else up({ sortBy: k, sortOrder: 'asc', page: '1' }); };
  const cl = (n) => { up({ limit: String(n), page: '1' }); };
  useEffect(() => { const h = setTimeout(() => { up({ search: searchInput, page: '1' }); }, 350); return () => clearTimeout(h); }, [searchInput, up]);
  const haf = !!search;
  const hcf = () => { setSearchInput(''); up({ search: '', page: '1' }); };
  const gp = (p) => { if (p < 1 || p > totalPages) return; up({ page: String(p) }); };

  const getStock = (medId) => inventory.filter(i => i.medicine?._id === medId).reduce((s, i) => s + i.quantity, 0);

  const handleAddStock = async () => {
    if (!medForm.medicine || !medForm.batchNo) { toast.error('Select medicine and enter batch'); return; }
    await addStock.mutateAsync(medForm);
    setMedForm({ medicine: '', batchNo: '', expiryDate: '', quantity: 0, mrp: 0, supplier: '' });
  };

  const handleDispense = async (id) => {
    const qty = dispenseQty[id];
    if (!qty || qty <= 0) return;
    await dispense.mutateAsync({ id, data: { quantity: qty } });
    setDispenseQty({ ...dispenseQty, [id]: 0 });
  };

  const handleCreateMedicine = async () => {
    if (!newMed.name) { toast.error('Medicine name required'); return; }
    await createMedicine.mutateAsync(newMed);
    setNewMed({ name: '', genericName: '', category: '', unit: 'tablet', reorderLevel: 10 });
  };

  const expiringSoon = inventory.filter(i => {
    if (!i.expiryDate) return false;
    const d = new Date(i.expiryDate); const now = new Date();
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  const totalValue = inventory.reduce((s, i) => s + (i.quantity * (i.mrp || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pharmacy</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Medicine inventory, dispensing, and stock management.</p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-destructive font-semibold">
            <AlertTriangle className="h-4 w-4" /> {alerts.length} low stock alert{alerts.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={tab === 'inventory' ? 'default' : 'outline'} size="sm" onClick={() => setTab('inventory')}><Package className="mr-1 h-4 w-4" /> Inventory</Button>
        <Button variant={tab === 'add' ? 'default' : 'outline'} size="sm" onClick={() => setTab('add')}><Plus className="h-4 w-4 sm:mr-1" /><Pill className="h-4 w-4 sm:hidden" /><span className="hidden sm:inline">Add Stock</span></Button>
        <Button variant={tab === 'new' ? 'default' : 'outline'} size="sm" onClick={() => setTab('new')}><Pill className="mr-1 h-4 w-4" /> New Medicine</Button>
        <Button variant={tab === 'alerts' ? 'default' : 'outline'} size="sm" onClick={() => setTab('alerts')}><AlertTriangle className="mr-1 h-4 w-4" /> Alerts ({alerts.length})</Button>
      </div>

      {tab === 'inventory' && (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Items" value={total} icon={Package} color="#6366f1" bg="bg-indigo-50 dark:bg-indigo-950/30" changeText={`${from}–${to} shown`} isIncrease />
            <StatCard label="Total Value" value={`₹${totalValue.toLocaleString()}`} icon={DollarSign} color="#0d9488" bg="bg-teal-50 dark:bg-teal-950/30" changeText="Stock value" isIncrease />
            <StatCard label="Expiring ≤30d" value={expiringSoon} icon={Clock} color="#f59e0b" bg="bg-amber-50 dark:bg-amber-950/30" changeText={expiringSoon > 0 ? 'Needs attention' : 'All good'} isIncrease={false} />
            <StatCard label="Low Stock Alerts" value={alerts.length} icon={AlertOctagon} color="#ef4444" bg="bg-red-50 dark:bg-red-950/30" changeText={alerts.length > 0 ? 'Reorder soon' : 'Stock healthy'} isIncrease={false} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 w-full bg-card p-3 rounded-xl border border-border/50 shadow-sm">
              <form onSubmit={e => e.preventDefault()} className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by medicine name..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-10 pr-4 rounded-xl border-border/20 bg-muted/15 focus-visible:bg-background focus:ring-1 focus:ring-primary h-9 text-xs" />
              </form>
              <div className="flex items-center gap-2">
                {haf && <button onClick={hcf} className="h-9 px-3.5 rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-sm"><X className="h-3.5 w-3.5" /> Clear Filters</button>}
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={cn("h-9 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none", isFilterOpen ? "bg-muted text-foreground border-zinc-300 dark:bg-[#18181b] dark:text-zinc-100 dark:border-zinc-700 shadow-md" : "border-border/60 dark:border-border/20 bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 text-muted-foreground hover:text-foreground")}>
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
                </button>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
              ) : inventory.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">{search ? 'No items match your search' : 'No inventory items yet. Add stock to get started.'}</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="pb-3 pr-2 w-10 text-center font-semibold">#</th>
                          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('createdAt')}><span className="inline-flex items-center gap-1">Medicine <SortIcon active={sortBy === 'createdAt'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold">Batch</th>
                          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('expiryDate')}><span className="inline-flex items-center gap-1">Expiry <SortIcon active={sortBy === 'expiryDate'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold cursor-pointer select-none text-right" onClick={() => hs('quantity')}><span className="inline-flex items-center gap-1 justify-end">Qty <SortIcon active={sortBy === 'quantity'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold cursor-pointer select-none text-right" onClick={() => hs('mrp')}><span className="inline-flex items-center gap-1 justify-end">MRP <SortIcon active={sortBy === 'mrp'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold w-44 text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((item, idx) => {
                          const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
                          return (
                            <tr key={item._id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                              <td className="py-3.5 pr-2 text-center text-xs text-muted-foreground font-mono">{from + idx}</td>
                              <td className="py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white font-black text-xs shadow-md border border-white/10" style={{ background: getGradient(item.medicine?._id || item._id) }}>
                                    {item.medicine?.name?.charAt(0) || '?'}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-sm">{item.medicine?.name || <span className="text-muted-foreground">Unknown</span>}</span>
                                    <span className="text-[10px] text-muted-foreground">{item.medicine?.genericName} · {item.medicine?.unit}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 font-mono text-[11px] text-muted-foreground">{item.batchNo}</td>
                              <td className="py-3.5">{isExpired ? <Badge variant="destructive">Expired</Badge> : <span className="text-xs text-muted-foreground font-medium">{new Date(item.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}</td>
                              <td className="py-3.5 text-right"><span className="text-sm font-bold tabular-nums">{item.quantity}</span></td>
                              <td className="py-3.5 text-right"><span className="text-sm font-medium">₹{item.mrp?.toFixed(2)}</span></td>
                              <td className="py-3.5 text-right pr-4">
                                <div className="flex items-center justify-end gap-2">
                                  <Input type="number" placeholder="Qty" className="h-9 w-20 rounded-xl border-border/20 bg-muted/15 text-xs" value={dispenseQty[item._id] || ''} onChange={e => setDispenseQty({ ...dispenseQty, [item._id]: Number(e.target.value) })} />
                                  <button onClick={() => handleDispense(item._id)} disabled={!dispenseQty[item._id]} className="h-9 px-3.5 rounded-xl border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed gap-1.5"><MinusCircle className="h-3.5 w-3.5" /> Dispense</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 border-t border-border/10 mt-2">
                    <div className="flex flex-wrap items-center gap-4">
                      <p className="text-xs text-muted-foreground font-semibold">Showing {from}–{to} of {total} items</p>
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
        </>
      )}

      {tab === 'add' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Add Stock</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Medicine</label>
                <select value={medForm.medicine} onChange={e => setMedForm({ ...medForm, medicine: e.target.value })} className="flex h-9 w-full rounded-xl border border-border/20 bg-muted/15 px-3 text-xs outline-none cursor-pointer">
                  <option value="">Select</option>
                  {medicines.map(m => <option key={m._id} value={m._id}>{m.name} ({m.genericName})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Batch No" value={medForm.batchNo} onChange={e => setMedForm({ ...medForm, batchNo: e.target.value })} className="h-9 rounded-xl" />
                <Input type="date" placeholder="Expiry" value={medForm.expiryDate} onChange={e => setMedForm({ ...medForm, expiryDate: e.target.value })} className="h-9 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Quantity" value={medForm.quantity} onChange={e => setMedForm({ ...medForm, quantity: Number(e.target.value) })} className="h-9 rounded-xl" />
                <Input type="number" placeholder="MRP" value={medForm.mrp} onChange={e => setMedForm({ ...medForm, mrp: Number(e.target.value) })} className="h-9 rounded-xl" />
              </div>
              <Input placeholder="Supplier" value={medForm.supplier} onChange={e => setMedForm({ ...medForm, supplier: e.target.value })} className="h-9 rounded-xl" />
              <Button onClick={handleAddStock} disabled={addStock.isPending} className="w-full rounded-xl">Add to Inventory</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Current Stock Levels</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
              {medicines.slice(0, 30).map(m => (
                <div key={m._id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-[10px] text-muted-foreground">{m.genericName} · {m.unit}</span>
                  </div>
                  <span className={`font-mono font-bold tabular-nums ${getStock(m._id) <= m.reorderLevel ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {getStock(m._id)} {m.unit}s
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'new' && (
        <Card className="max-w-md">
          <CardHeader><CardTitle className="text-sm font-semibold">Add New Medicine</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Medicine name *" value={newMed.name} onChange={e => setNewMed({ ...newMed, name: e.target.value })} className="h-9 rounded-xl" />
            <Input placeholder="Generic name" value={newMed.genericName} onChange={e => setNewMed({ ...newMed, genericName: e.target.value })} className="h-9 rounded-xl" />
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Category" value={newMed.category} onChange={e => setNewMed({ ...newMed, category: e.target.value })} className="h-9 rounded-xl" />
              <select value={newMed.unit} onChange={e => setNewMed({ ...newMed, unit: e.target.value })} className="h-9 rounded-xl border border-border/20 bg-muted/15 px-3 text-xs outline-none cursor-pointer">
                {['tablet', 'capsule', 'ml', 'mg', 'injection', 'syrup', 'cream'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <Input type="number" placeholder="Reorder at" value={newMed.reorderLevel} onChange={e => setNewMed({ ...newMed, reorderLevel: Number(e.target.value) })} className="h-9 rounded-xl" />
            </div>
            <Button onClick={handleCreateMedicine} disabled={createMedicine.isPending} className="w-full rounded-xl">Add Medicine</Button>
          </CardContent>
        </Card>
      )}

      {tab === 'alerts' && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">Low Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            {alerts.length === 0 ? <p className="text-sm text-muted-foreground">No low stock alerts — all medications have sufficient inventory.</p> : (
              <div className="space-y-2">
                {alerts.map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
                    <div><p className="font-semibold text-sm">{a.medicine?.name}</p><p className="text-xs text-muted-foreground">{a.medicine?.genericName}</p></div>
                    <div className="text-right"><p className="text-sm font-bold text-destructive">{a.currentStock} in stock</p><p className="text-[10px] text-muted-foreground">Reorder at: {a.reorderLevel}</p></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
