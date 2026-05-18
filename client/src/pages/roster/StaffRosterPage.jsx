import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { CalendarDays, Plus, Search } from 'lucide-react';

function useRoster(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({ queryKey: ['roster', params], queryFn: () => api.get(`/roster?${qs.toString()}`) });
}

function useRosterStats() {
  return useQuery({ queryKey: ['roster-stats'], queryFn: () => api.get('/roster/stats') });
}

export function StaffRosterPage() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [shiftFilter, setShiftFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useRoster({ date: dateFilter, shift: shiftFilter, limit: 100 });
  const { data: stats } = useRosterStats();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/roster', d),
    onSuccess: () => { toast.success('Roster entry created'); qc.invalidateQueries({ queryKey: ['roster'] }); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ staff: '', date: new Date().toISOString().split('T')[0], shift: 'morning', role: '' });

  const handleCreate = () => {
    if (!form.staff || !form.date) { toast.error('Staff and date required'); return; }
    createMutation.mutate(form);
  };

  const statusVariant = { scheduled: 'warning', 'checked-in': 'success', completed: 'info', absent: 'destructive', 'on-leave': 'secondary', swapped: 'info' };
  const shiftIcon = { morning: '🌅', afternoon: '☀️', night: '🌙', general: '🏢' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Roster</h1>
          <p className="text-muted-foreground">Shift scheduling and attendance</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> Add Entry</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          {[
            { label: 'Total Today', value: stats.total },
            { label: 'Scheduled', value: stats.scheduled },
            { label: 'Checked In', value: stats.checkedIn },
            { label: 'Absent', value: stats.absent },
            { label: 'On Leave', value: stats.onLeave },
          ].map(s => (
            <Card key={s.label}>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Add Roster Entry</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Staff ID</label>
              <Input value={form.staff} onChange={e => setForm({...form, staff: e.target.value})} placeholder="User ObjectId" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Shift</label>
              <select value={form.shift} onChange={e => setForm({...form, shift: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {['morning','afternoon','night','general'].map(s => <option key={s} value={s}>{shiftIcon[s]} {s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="e.g. Nurse, Doctor" />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Add Entry'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Roster - {new Date(dateFilter).toLocaleDateString()}</CardTitle>
          <div className="flex gap-2">
            <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-40" />
            <select value={shiftFilter} onChange={e => setShiftFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Shifts</option>
              {['morning','afternoon','night','general'].map(s => <option key={s} value={s}>{s}</option>)}
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
                    <th className="pb-2 font-medium">Staff</th>
                    <th className="pb-2 font-medium">Shift</th>
                    <th className="pb-2 font-medium">Role</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.roster || []).map(r => (
                    <tr key={r._id} className="border-b last:border-0 text-sm">
                      <td className="py-2 font-medium">{r.staff?.name || '--'}</td>
                      <td className="py-2">{shiftIcon[r.shift]} {r.shift}</td>
                      <td className="py-2">{r.role || '--'}</td>
                      <td className="py-2"><Badge variant={statusVariant[r.status]}>{r.status}</Badge></td>
                      <td className="py-2 text-muted-foreground">{r.notes || '--'}</td>
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
