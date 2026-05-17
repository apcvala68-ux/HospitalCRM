import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Pill, Plus, Search, CheckCircle, XCircle } from 'lucide-react';

function useMARRecords(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({ queryKey: ['nursing-mar', params], queryFn: () => api.get(`/nursing-mar?${qs.toString()}`) });
}

function useMARStats() {
  return useQuery({ queryKey: ['mar-stats'], queryFn: () => api.get('/nursing-mar/stats') });
}

export function NursingMARPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [administerForm, setAdministerForm] = useState(null);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useMARRecords({ status: statusFilter, limit: 50 });
  const { data: stats } = useMARStats();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/nursing-mar', d),
    onSuccess: () => { toast.success('MAR record created'); qc.invalidateQueries({ queryKey: ['nursing-mar'] }); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const administerMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/nursing-mar/${id}/administer`, data),
    onSuccess: () => { toast.success('Medication administered'); qc.invalidateQueries({ queryKey: ['nursing-mar'] }); setAdministerForm(null); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ patient: '', medication: '', dosage: '', route: 'oral', frequency: '', scheduledTimes: ['08:00', '14:00', '20:00'] });

  const handleCreate = () => {
    if (!form.patient || !form.medication) { toast.error('Patient and medication required'); return; }
    createMutation.mutate(form);
  };

  const statusVariant = { active: 'success', completed: 'info', discontinued: 'destructive', 'on-hold': 'warning' };
  const adminStatusVariant = { given: 'success', held: 'warning', refused: 'destructive', missed: 'destructive', delayed: 'warning' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nursing MAR</h1>
          <p className="text-muted-foreground">Medication Administration Record</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> New MAR</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total MARs', value: stats.total, icon: Pill, color: 'text-blue-600' },
            { label: 'Active', value: stats.active, icon: Pill, color: 'text-green-600' },
            { label: 'Today Given', value: stats.todayAdministered, icon: CheckCircle, color: 'text-purple-600' },
            { label: 'Missed', value: stats.missed, icon: XCircle, color: 'text-red-600' },
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
          <CardHeader><CardTitle className="text-lg">New MAR Entry</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient ID</label>
              <Input value={form.patient} onChange={e => setForm({...form, patient: e.target.value})} placeholder="Patient ObjectId" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Medication</label>
              <Input value={form.medication} onChange={e => setForm({...form, medication: e.target.value})} placeholder="e.g. Paracetamol 500mg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dosage</label>
              <Input value={form.dosage} onChange={e => setForm({...form, dosage: e.target.value})} placeholder="e.g. 1 tablet" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Route</label>
              <select value={form.route} onChange={e => setForm({...form, route: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {['oral','iv','im','sc','topical','inhalation','rectal','sublingual','other'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Frequency</label>
              <Input value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} placeholder="e.g. TDS, BD, OD" />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create MAR'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">MAR Records ({data?.total || 0})</CardTitle>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All Status</option>
            {['active','completed','discontinued','on-hold'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <div className="space-y-3">
              {(data?.records || []).map(r => (
                <div key={r._id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{r.medication} — {r.dosage}</p>
                        <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.patient?.firstName} {r.patient?.lastName} · {r.route} · {r.frequency}</p>
                      {r.administrations?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {r.administrations.slice(-5).map((a, i) => (
                            <Badge key={i} variant={adminStatusVariant[a.status]} className="text-xs">
                              {a.scheduledTime}: {a.status}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {r.status === 'active' && (
                      <Button size="sm" onClick={() => setAdministerForm(administerForm === r._id ? null : r._id)}>
                        <CheckCircle className="mr-1 h-4 w-4" /> Administer
                      </Button>
                    )}
                  </div>
                  {administerForm === r._id && (
                    <div className="mt-3 grid gap-2 md:grid-cols-2 border-t pt-3">
                      <Input placeholder="Scheduled time (e.g. 08:00)" id={`mar-time-${r._id}`} />
                      <Input placeholder="Dose given" id={`mar-dose-${r._id}`} />
                      <select id={`mar-status-${r._id}`} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
                        {['given','held','refused','missed','delayed'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <Input placeholder="Remarks" id={`mar-remarks-${r._id}`} />
                      <div className="md:col-span-2">
                        <Button size="sm" onClick={() => {
                          const scheduledTime = document.getElementById(`mar-time-${r._id}`).value;
                          const dose = document.getElementById(`mar-dose-${r._id}`).value;
                          const status = document.getElementById(`mar-status-${r._id}`).value;
                          const remarks = document.getElementById(`mar-remarks-${r._id}`).value;
                          administerMutation.mutate({ id: r._id, data: { scheduledTime, dose, status, remarks } });
                        }}>Record Administration</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
