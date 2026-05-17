import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { AlertTriangle, Plus, Search, ShieldAlert } from 'lucide-react';

function useAllergies(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({ queryKey: ['allergies', params], queryFn: () => api.get(`/allergies?${qs.toString()}`) });
}

function useAllergyStats() {
  return useQuery({ queryKey: ['allergy-stats'], queryFn: () => api.get('/allergies/stats') });
}

export function AllergyPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useAllergies({ type: typeFilter, limit: 50 });
  const { data: stats } = useAllergyStats();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/allergies', d),
    onSuccess: () => { toast.success('Allergy recorded'); qc.invalidateQueries({ queryKey: ['allergies'] }); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ patient: '', substance: '', type: 'drug', severity: 'moderate', reaction: '' });

  const handleCreate = () => {
    if (!form.patient || !form.substance || !form.reaction) { toast.error('Fill required fields'); return; }
    createMutation.mutate(form);
  };

  const severityColor = { mild: 'bg-green-500', moderate: 'bg-yellow-500', severe: 'bg-orange-500', 'life-threatening': 'bg-red-500' };
  const typeVariant = { drug: 'destructive', food: 'warning', environmental: 'info', latex: 'secondary', contrast: 'warning', other: 'secondary' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Allergy Management</h1>
          <p className="text-muted-foreground">Patient allergy tracking and drug interaction alerts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="destructive"><AlertTriangle className="mr-2 h-4 w-4" /> Record Allergy</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Allergies', value: stats.total, icon: ShieldAlert, color: 'text-red-600' },
            { label: 'Drug Allergies', value: stats.drug, icon: ShieldAlert, color: 'text-orange-600' },
            { label: 'Food Allergies', value: stats.food, icon: ShieldAlert, color: 'text-yellow-600' },
            { label: 'Severe/Critical', value: stats.severe, icon: ShieldAlert, color: 'text-red-600' },
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
          <CardHeader><CardTitle className="text-lg">Record New Allergy</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient ID</label>
              <Input value={form.patient} onChange={e => setForm({...form, patient: e.target.value})} placeholder="Patient ObjectId" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Substance</label>
              <Input value={form.substance} onChange={e => setForm({...form, substance: e.target.value})} placeholder="e.g. Penicillin, Peanuts" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {['drug','food','environmental','latex','contrast','other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="life-threatening">Life-Threatening</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Reaction</label>
              <Input value={form.reaction} onChange={e => setForm({...form, reaction: e.target.value})} placeholder="e.g. Rash, Anaphylaxis, Swelling" />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending} variant="destructive">{createMutation.isPending ? 'Recording...' : 'Record Allergy'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Allergies ({data?.total || 0})</CardTitle>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All Types</option>
            {['drug','food','environmental','latex','contrast','other'].map(t => <option key={t} value={t}>{t}</option>)}
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
                    <th className="pb-2 font-medium">Patient</th>
                    <th className="pb-2 font-medium">Substance</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Severity</th>
                    <th className="pb-2 font-medium">Reaction</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.allergies || []).map(a => (
                    <tr key={a._id} className="border-b last:border-0 text-sm">
                      <td className="py-2 font-medium">{a.patient?.firstName} {a.patient?.lastName}</td>
                      <td className="py-2">{a.substance}</td>
                      <td className="py-2"><Badge variant={typeVariant[a.type]}>{a.type}</Badge></td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-3 w-3 rounded-full ${severityColor[a.severity]}`} />
                          {a.severity}
                        </div>
                      </td>
                      <td className="py-2">{a.reaction}</td>
                      <td className="py-2 text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</td>
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
