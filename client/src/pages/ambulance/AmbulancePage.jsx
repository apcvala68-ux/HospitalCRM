import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Siren, Plus, Search } from 'lucide-react';

function useAmbulanceRecords(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({ queryKey: ['ambulance', params], queryFn: () => api.get(`/ambulance?${qs.toString()}`) });
}

function useAmbulanceStats() {
  return useQuery({ queryKey: ['ambulance-stats'], queryFn: () => api.get('/ambulance/stats') });
}

export function AmbulancePage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useAmbulanceRecords({ status: statusFilter, limit: 50 });
  const { data: stats } = useAmbulanceStats();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/ambulance', d),
    onSuccess: () => { toast.success('Dispatch created'); qc.invalidateQueries({ queryKey: ['ambulance'] }); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ vehicleNo: '', callerName: '', callerPhone: '', pickupLocation: '', emergencyType: 'other', triageLevel: 'green' });

  const handleCreate = () => {
    if (!form.vehicleNo || !form.callerPhone || !form.pickupLocation) { toast.error('Fill required fields'); return; }
    createMutation.mutate(form);
  };

  const statusVariant = { dispatched: 'warning', 'en-route': 'info', 'at-scene': 'warning', transporting: 'info', arrived: 'success', returned: 'success', cancelled: 'destructive' };
  const triageColor = { red: 'bg-red-500', yellow: 'bg-yellow-500', green: 'bg-green-500', black: 'bg-gray-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ambulance & Emergency</h1>
          <p className="text-muted-foreground">Dispatch tracking and ER triage</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="destructive"><Siren className="mr-2 h-4 w-4" /> New Dispatch</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Total Dispatches', value: stats.total, icon: Siren, color: 'text-red-600' },
            { label: 'Active', value: stats.active, icon: Siren, color: 'text-yellow-600' },
            { label: 'Today', value: stats.todayDispatches, icon: Siren, color: 'text-blue-600' },
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
          <CardHeader><CardTitle className="text-lg">New Ambulance Dispatch</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle No</label>
              <Input value={form.vehicleNo} onChange={e => setForm({...form, vehicleNo: e.target.value})} placeholder="MH-01-AB-1234" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Caller Phone</label>
              <Input value={form.callerPhone} onChange={e => setForm({...form, callerPhone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Caller Name</label>
              <Input value={form.callerName} onChange={e => setForm({...form, callerName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pickup Location</label>
              <Input value={form.pickupLocation} onChange={e => setForm({...form, pickupLocation: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Emergency Type</label>
              <select value={form.emergencyType} onChange={e => setForm({...form, emergencyType: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {['accident','cardiac','respiratory','trauma','stroke','obstetric','pediatric','other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Triage Level</label>
              <select value={form.triageLevel} onChange={e => setForm({...form, triageLevel: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="red">Red (Immediate)</option>
                <option value="yellow">Yellow (Urgent)</option>
                <option value="green">Green (Minor)</option>
                <option value="black">Black (Deceased)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending} variant="destructive">{createMutation.isPending ? 'Dispatching...' : 'Dispatch Ambulance'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Dispatches ({data?.total || 0})</CardTitle>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All Status</option>
            {['dispatched','en-route','at-scene','transporting','arrived','returned','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-2 font-medium">Dispatch No</th>
                    <th className="pb-2 font-medium">Vehicle</th>
                    <th className="pb-2 font-medium">Caller</th>
                    <th className="pb-2 font-medium">Location</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Triage</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.records || []).map(r => (
                    <tr key={r._id} className="border-b last:border-0 text-sm">
                      <td className="py-2 font-mono text-xs">{r.dispatchNo}</td>
                      <td className="py-2 font-medium">{r.vehicleNo}</td>
                      <td className="py-2">{r.callerName || r.callerPhone}</td>
                      <td className="py-2 text-muted-foreground">{r.pickupLocation}</td>
                      <td className="py-2 capitalize">{r.emergencyType}</td>
                      <td className="py-2"><span className={`inline-block h-3 w-3 rounded-full ${triageColor[r.triageLevel]}`} /></td>
                      <td className="py-2"><Badge variant={statusVariant[r.status]}>{r.status}</Badge></td>
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
