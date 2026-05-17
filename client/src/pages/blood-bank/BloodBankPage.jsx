import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Droplets, Plus, Search } from 'lucide-react';

function useBloodEntries(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({ queryKey: ['blood-bank', params], queryFn: () => api.get(`/blood-bank?${qs.toString()}`) });
}

function useBloodInventory() {
  return useQuery({ queryKey: ['blood-inventory'], queryFn: () => api.get('/blood-bank/inventory') });
}

function useBloodStats() {
  return useQuery({ queryKey: ['blood-stats'], queryFn: () => api.get('/blood-bank/stats') });
}

export function BloodBankPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useBloodEntries({ status: statusFilter, limit: 50 });
  const { data: inventory } = useBloodInventory();
  const { data: stats } = useBloodStats();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/blood-bank', d),
    onSuccess: () => { toast.success('Entry created'); qc.invalidateQueries({ queryKey: ['blood-bank'] }); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ type: 'donation', bloodGroup: 'A+', quantity: 1, donorName: '', donorPhone: '', expiryDate: '' });

  const handleCreate = () => {
    if (!form.bloodGroup || !form.quantity) { toast.error('Fill required fields'); return; }
    createMutation.mutate(form);
  };

  const statusVariant = { collected: 'info', stored: 'success', issued: 'warning', returned: 'info', discarded: 'destructive', expired: 'destructive' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blood Bank</h1>
          <p className="text-muted-foreground">Blood inventory, donations, and issues</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> New Entry</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Entries', value: stats.total, icon: Droplets, color: 'text-red-600' },
            { label: 'In Stock', value: stats.stored, icon: Droplets, color: 'text-green-600' },
            { label: "Today's Donations", value: stats.todayDonations, icon: Droplets, color: 'text-blue-600' },
            { label: "Today's Issues", value: stats.todayIssues, icon: Droplets, color: 'text-purple-600' },
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

      {inventory && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Blood Inventory ({inventory.total} units) {inventory.expiring > 0 && <Badge variant="destructive">{inventory.expiring} expiring soon</Badge>}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              {inventory.inventory.map(inv => (
                <div key={inv.bloodGroup} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-2xl font-bold">{inv.bloodGroup}</p>
                    <p className="text-xs text-muted-foreground">{inv.units} units</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                    <Droplets className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">New Blood Entry</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {['donation','issue','return','discard'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Blood Group</label>
              <select value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: +e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Donor Name</label>
              <Input value={form.donorName} onChange={e => setForm({...form, donorName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Donor Phone</label>
              <Input value={form.donorPhone} onChange={e => setForm({...form, donorPhone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date</label>
              <Input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create Entry'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Entries ({data?.total || 0})</CardTitle>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All Status</option>
            {['collected','stored','issued','returned','discarded','expired'].map(s => <option key={s} value={s}>{s}</option>)}
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
                    <th className="pb-2 font-medium">Entry No</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Group</th>
                    <th className="pb-2 font-medium">Donor</th>
                    <th className="pb-2 font-medium">Qty</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.entries || []).map(e => (
                    <tr key={e._id} className="border-b last:border-0 text-sm">
                      <td className="py-2 font-mono text-xs">{e.entryNo}</td>
                      <td className="py-2 capitalize">{e.type}</td>
                      <td className="py-2 font-bold">{e.bloodGroup}</td>
                      <td className="py-2">{e.donorName || '--'}</td>
                      <td className="py-2">{e.quantity} {e.unit}</td>
                      <td className="py-2"><Badge variant={statusVariant[e.status]}>{e.status}</Badge></td>
                      <td className="py-2 text-muted-foreground">{new Date(e.createdAt).toLocaleDateString()}</td>
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
