import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Scissors, Plus, Search } from 'lucide-react';

function useSurgeries(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({ queryKey: ['ot-surgery', params], queryFn: () => api.get(`/ot-surgery?${qs.toString()}`) });
}

function useOTStats() {
  return useQuery({ queryKey: ['ot-stats'], queryFn: () => api.get('/ot-surgery/stats') });
}

export function OTSurgeryPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useSurgeries({ status: statusFilter, limit: 50 });
  const { data: stats } = useOTStats();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/ot-surgery', d),
    onSuccess: () => { toast.success('Surgery scheduled'); qc.invalidateQueries({ queryKey: ['ot-surgery'] }); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ patient: '', surgeon: '', otRoom: '', surgeryType: 'elective', procedure: '', scheduledDate: '', scheduledTime: '' });

  const handleCreate = () => {
    if (!form.patient || !form.surgeon || !form.otRoom || !form.procedure || !form.scheduledDate) { toast.error('Fill required fields'); return; }
    createMutation.mutate(form);
  };

  const statusVariant = { scheduled: 'warning', 'pre-op': 'info', 'in-progress': 'destructive', completed: 'success', cancelled: 'destructive', postponed: 'secondary' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OT & Surgery</h1>
          <p className="text-muted-foreground">Operation theatre scheduling and management</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> Schedule Surgery</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Surgeries', value: stats.total, icon: Scissors, color: 'text-blue-600' },
            { label: 'Scheduled', value: stats.scheduled, icon: Scissors, color: 'text-yellow-600' },
            { label: 'Today', value: stats.todaySurgeries, icon: Scissors, color: 'text-purple-600' },
            { label: 'Completed', value: stats.completed, icon: Scissors, color: 'text-green-600' },
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
          <CardHeader><CardTitle className="text-lg">Schedule Surgery</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient ID</label>
              <Input value={form.patient} onChange={e => setForm({...form, patient: e.target.value})} placeholder="Patient ObjectId" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Surgeon ID</label>
              <Input value={form.surgeon} onChange={e => setForm({...form, surgeon: e.target.value})} placeholder="Doctor ObjectId" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">OT Room</label>
              <select value={form.otRoom} onChange={e => setForm({...form, otRoom: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {['OT-1','OT-2','OT-3','OT-4','OT-5'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Surgery Type</label>
              <select value={form.surgeryType} onChange={e => setForm({...form, surgeryType: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {['elective','emergency','day-care'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Procedure</label>
              <Input value={form.procedure} onChange={e => setForm({...form, procedure: e.target.value})} placeholder="e.g. Appendectomy" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Scheduled Date</label>
              <Input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Scheduled Time</label>
              <Input type="time" value={form.scheduledTime} onChange={e => setForm({...form, scheduledTime: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? 'Scheduling...' : 'Schedule Surgery'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Surgeries ({data?.total || 0})</CardTitle>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All Status</option>
            {['scheduled','pre-op','in-progress','completed','cancelled','postponed'].map(s => <option key={s} value={s}>{s}</option>)}
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
                    <th className="pb-2 font-medium">Surgery No</th>
                    <th className="pb-2 font-medium">Patient</th>
                    <th className="pb-2 font-medium">Surgeon</th>
                    <th className="pb-2 font-medium">OT Room</th>
                    <th className="pb-2 font-medium">Procedure</th>
                    <th className="pb-2 font-medium">Date/Time</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.surgeries || []).map(s => (
                    <tr key={s._id} className="border-b last:border-0 text-sm">
                      <td className="py-2 font-mono text-xs">{s.surgeryNo}</td>
                      <td className="py-2">{s.patient?.firstName} {s.patient?.lastName}</td>
                      <td className="py-2">{s.surgeon?.user?.name || '--'}</td>
                      <td className="py-2 font-medium">{s.otRoom}</td>
                      <td className="py-2">{s.procedure}</td>
                      <td className="py-2 text-muted-foreground">{s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString() : '--'} {s.scheduledTime || ''}</td>
                      <td className="py-2"><Badge variant={statusVariant[s.status]}>{s.status}</Badge></td>
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
