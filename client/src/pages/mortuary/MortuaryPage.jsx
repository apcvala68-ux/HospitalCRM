import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Cross, Plus, Search } from 'lucide-react';

function useMortuaryRecords(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({ queryKey: ['mortuary', params], queryFn: () => api.get(`/mortuary?${qs.toString()}`) });
}

function useMortuaryStats() {
  return useQuery({ queryKey: ['mortuary-stats'], queryFn: () => api.get('/mortuary/stats') });
}

export function MortuaryPage() {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useMortuaryRecords({ limit: 50 });
  const { data: stats } = useMortuaryStats();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/mortuary', d),
    onSuccess: () => { toast.success('Record created'); qc.invalidateQueries({ queryKey: ['mortuary'] }); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ patient: '', declaredBy: '', declaredAt: new Date().toISOString(), causeOfDeath: '', mortuaryNo: '' });

  const handleCreate = () => {
    if (!form.patient || !form.causeOfDeath) { toast.error('Patient and cause of death required'); return; }
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mortuary</h1>
          <p className="text-muted-foreground">Death records and body management</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="outline"><Plus className="mr-2 h-4 w-4" /> New Record</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Total Records', value: stats.total, icon: Cross, color: 'text-gray-600' },
            { label: 'In Mortuary', value: stats.inMortuary, icon: Cross, color: 'text-red-600' },
            { label: 'Today', value: stats.todayEntries, icon: Cross, color: 'text-blue-600' },
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
          <CardHeader><CardTitle className="text-lg">New Mortuary Record</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient ID</label>
              <Input value={form.patient} onChange={e => setForm({...form, patient: e.target.value})} placeholder="Patient ObjectId" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Declared By (Doctor ID)</label>
              <Input value={form.declaredBy} onChange={e => setForm({...form, declaredBy: e.target.value})} placeholder="Doctor ObjectId" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cause of Death</label>
              <Input value={form.causeOfDeath} onChange={e => setForm({...form, causeOfDeath: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mortuary No</label>
              <Input value={form.mortuaryNo} onChange={e => setForm({...form, mortuaryNo: e.target.value})} placeholder="e.g. M-101" />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending} variant="outline">{createMutation.isPending ? 'Creating...' : 'Create Record'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Records ({data?.total || 0})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-2 font-medium">Entry No</th>
                    <th className="pb-2 font-medium">Patient</th>
                    <th className="pb-2 font-medium">Cause</th>
                    <th className="pb-2 font-medium">Mortuary No</th>
                    <th className="pb-2 font-medium">Handed Over</th>
                    <th className="pb-2 font-medium">Death Cert</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.records || []).map(r => (
                    <tr key={r._id} className="border-b last:border-0 text-sm">
                      <td className="py-2 font-mono text-xs">{r.entryNo}</td>
                      <td className="py-2">{r.patient?.firstName} {r.patient?.lastName}</td>
                      <td className="py-2">{r.causeOfDeath}</td>
                      <td className="py-2">{r.mortuaryNo || '--'}</td>
                      <td className="py-2">{r.handedOverAt ? new Date(r.handedOverAt).toLocaleDateString() : <Badge variant="warning">In Mortuary</Badge>}</td>
                      <td className="py-2">{r.deathCertificateIssued ? <Badge variant="success">Issued</Badge> : <Badge variant="secondary">Pending</Badge>}</td>
                      <td className="py-2 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
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
