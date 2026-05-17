import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Brush, Plus, Search } from 'lucide-react';

function useHousekeeping(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({ queryKey: ['housekeeping', params], queryFn: () => api.get(`/housekeeping?${qs.toString()}`) });
}

function useHKStats() {
  return useQuery({ queryKey: ['hk-stats'], queryFn: () => api.get('/housekeeping/stats') });
}

export function HousekeepingPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useHousekeeping({ status: statusFilter, limit: 50 });
  const { data: stats } = useHKStats();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/housekeeping', d),
    onSuccess: () => { toast.success('Ticket created'); qc.invalidateQueries({ queryKey: ['housekeeping'] }); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ type: 'cleaning', location: '', priority: 'medium', description: '' });

  const handleCreate = () => {
    if (!form.location) { toast.error('Location required'); return; }
    createMutation.mutate(form);
  };

  const statusVariant = { open: 'warning', assigned: 'info', 'in-progress': 'info', completed: 'success', cancelled: 'destructive' };
  const priorityVariant = { low: 'secondary', medium: 'warning', high: 'destructive', urgent: 'destructive' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Housekeeping</h1>
          <p className="text-muted-foreground">Cleaning and maintenance tickets</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> New Ticket</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Tickets', value: stats.total, icon: Brush, color: 'text-blue-600' },
            { label: 'Open', value: stats.open, icon: Brush, color: 'text-yellow-600' },
            { label: 'Today', value: stats.todayTickets, icon: Brush, color: 'text-purple-600' },
            { label: 'Completed', value: stats.completed, icon: Brush, color: 'text-green-600' },
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
          <CardHeader><CardTitle className="text-lg">New Housekeeping Ticket</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {['cleaning','maintenance','pest-control','deep-clean','other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Ward A, Room 101" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create Ticket'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Tickets ({data?.total || 0})</CardTitle>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All Status</option>
            {['open','assigned','in-progress','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
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
                    <th className="pb-2 font-medium">Ticket No</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Location</th>
                    <th className="pb-2 font-medium">Priority</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Assigned To</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.tickets || []).map(t => (
                    <tr key={t._id} className="border-b last:border-0 text-sm">
                      <td className="py-2 font-mono text-xs">{t.ticketNo}</td>
                      <td className="py-2 capitalize">{t.type}</td>
                      <td className="py-2">{t.location}</td>
                      <td className="py-2"><Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge></td>
                      <td className="py-2"><Badge variant={statusVariant[t.status]}>{t.status}</Badge></td>
                      <td className="py-2">{t.assignedTo?.name || '--'}</td>
                      <td className="py-2 text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</td>
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
