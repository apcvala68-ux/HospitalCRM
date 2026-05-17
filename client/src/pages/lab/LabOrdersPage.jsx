import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { FlaskConical, Plus, Search, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';

function useLabOrders(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({ queryKey: ['lab-orders', params], queryFn: () => api.get(`/lab-orders?${qs.toString()}`) });
}

function useLabStats() {
  return useQuery({ queryKey: ['lab-stats'], queryFn: () => api.get('/lab-orders/stats') });
}

export function LabOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useLabOrders({ status: statusFilter, limit: 50 });
  const { data: stats } = useLabStats();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/lab-orders', d),
    onSuccess: () => { toast.success('Lab order created'); qc.invalidateQueries({ queryKey: ['lab-orders'] }); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const statusVariant = { pending: 'warning', collected: 'info', processing: 'info', completed: 'success', cancelled: 'destructive' };

  const [form, setForm] = useState({ patient: '', doctor: '', tests: [{ testName: '', category: 'hematology', priority: 'routine' }], notes: '' });

  const handleCreate = () => {
    if (!form.patient) { toast.error('Select patient'); return; }
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laboratory</h1>
          <p className="text-muted-foreground">Lab test orders and results</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> New Order</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Orders', value: stats.total, icon: FlaskConical, color: 'text-blue-600' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600' },
            { label: 'Today', value: stats.todayOrders, icon: AlertCircle, color: 'text-purple-600' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600' },
          ].map(s => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">New Lab Order</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient ID</label>
              <Input value={form.patient} onChange={e => setForm({...form, patient: e.target.value})} placeholder="Patient ObjectId" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Doctor ID</label>
              <Input value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})} placeholder="Doctor ObjectId" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Tests</label>
              {form.tests.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={t.testName} onChange={e => { const tests = [...form.tests]; tests[i].testName = e.target.value; setForm({...form, tests}); }} placeholder="Test name (e.g. CBC, LFT)" className="flex-1" />
                  <select value={t.category} onChange={e => { const tests = [...form.tests]; tests[i].category = e.target.value; setForm({...form, tests}); }} className="flex h-10 w-32 rounded-md border border-input bg-background px-3 text-sm">
                    {['hematology','biochemistry','microbiology','serology','urinalysis','radiology','pathology','other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={t.priority} onChange={e => { const tests = [...form.tests]; tests[i].priority = e.target.value; setForm({...form, tests}); }} className="flex h-10 w-24 rounded-md border border-input bg-background px-3 text-sm">
                    {['routine','urgent','stat'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setForm({...form, tests: [...form.tests, { testName: '', category: 'hematology', priority: 'routine' }]})}>+ Add Test</Button>
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create Order'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Orders ({data?.total || 0})</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 w-64" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Status</option>
              {['pending','collected','processing','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-2 font-medium">Order No</th>
                    <th className="pb-2 font-medium">Patient</th>
                    <th className="pb-2 font-medium">Tests</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.orders || []).filter(o => !search || o.orderNo?.toLowerCase().includes(search.toLowerCase()) || o.patient?.firstName?.toLowerCase().includes(search.toLowerCase())).map(o => (
                    <tr key={o._id} className="border-b last:border-0 text-sm">
                      <td className="py-2 font-mono text-xs">{o.orderNo}</td>
                      <td className="py-2">{o.patient?.firstName} {o.patient?.lastName}</td>
                      <td className="py-2">{o.tests?.length || 0} tests</td>
                      <td className="py-2"><Badge variant={statusVariant[o.status]}>{o.status}</Badge></td>
                      <td className="py-2 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(selectedOrder === o._id ? null : o._id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
