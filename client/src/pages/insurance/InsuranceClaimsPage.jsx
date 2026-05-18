import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Shield, Plus, Search } from 'lucide-react';

function useClaims(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({ queryKey: ['insurance-claims', params], queryFn: () => api.get(`/insurance?${qs.toString()}`) });
}

function useClaimStats() {
  return useQuery({ queryKey: ['claim-stats'], queryFn: () => api.get('/insurance/stats') });
}

export function InsuranceClaimsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useClaims({ status: statusFilter, limit: 50 });
  const { data: stats } = useClaimStats();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/insurance', d),
    onSuccess: () => { toast.success('Claim created'); qc.invalidateQueries({ queryKey: ['insurance-claims'] }); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ patient: '', tpaName: '', policyNo: '', claimAmount: 0, policyHolder: '' });

  const handleCreate = () => {
    if (!form.patient || !form.tpaName || !form.policyNo) { toast.error('Fill required fields'); return; }
    createMutation.mutate(form);
  };

  const statusVariant = { 'pre-auth': 'warning', submitted: 'info', 'under-review': 'info', approved: 'success', 'partially-approved': 'warning', rejected: 'destructive', settled: 'success' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Insurance / TPA</h1>
          <p className="text-muted-foreground">Claim management and pre-authorization</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> New Claim</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Claims', value: stats.total, icon: Shield, color: 'text-blue-600' },
            { label: 'Pending', value: stats.pending, icon: Shield, color: 'text-yellow-600' },
            { label: 'Total Claimed', value: `₹${(stats.totalClaimed || 0).toLocaleString('en-IN')}`, icon: Shield, color: 'text-purple-600' },
            { label: 'Total Approved', value: `₹${(stats.totalApproved || 0).toLocaleString('en-IN')}`, icon: Shield, color: 'text-green-600' },
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
          <CardHeader><CardTitle className="text-lg">New Insurance Claim</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient ID</label>
              <Input value={form.patient} onChange={e => setForm({...form, patient: e.target.value})} placeholder="Patient ObjectId" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">TPA Name</label>
              <Input value={form.tpaName} onChange={e => setForm({...form, tpaName: e.target.value})} placeholder="e.g. MediAssist" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Policy No</label>
              <Input value={form.policyNo} onChange={e => setForm({...form, policyNo: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Policy Holder</label>
              <Input value={form.policyHolder} onChange={e => setForm({...form, policyHolder: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Claim Amount</label>
              <Input type="number" value={form.claimAmount} onChange={e => setForm({...form, claimAmount: +e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create Claim'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Claims ({data?.total || 0})</CardTitle>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All Status</option>
            {['pre-auth','submitted','under-review','approved','partially-approved','rejected','settled'].map(s => <option key={s} value={s}>{s}</option>)}
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
                    <th className="pb-2 font-medium">Claim No</th>
                    <th className="pb-2 font-medium">Patient</th>
                    <th className="pb-2 font-medium">TPA</th>
                    <th className="pb-2 font-medium">Policy</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.claims || []).map(c => (
                    <tr key={c._id} className="border-b last:border-0 text-sm">
                      <td className="py-2 font-mono text-xs">{c.claimNo}</td>
                      <td className="py-2">{c.patient?.firstName} {c.patient?.lastName}</td>
                      <td className="py-2">{c.tpaName}</td>
                      <td className="py-2 font-mono text-xs">{c.policyNo}</td>
                      <td className="py-2 font-medium">₹{(c.claimAmount || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2"><Badge variant={statusVariant[c.status]}>{c.status}</Badge></td>
                      <td className="py-2 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
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
