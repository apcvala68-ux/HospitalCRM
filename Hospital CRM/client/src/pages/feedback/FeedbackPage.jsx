import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { MessageSquare, Plus, Search, Star } from 'lucide-react';

function useFeedbacks(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({ queryKey: ['feedback', params], queryFn: () => api.get(`/feedback?${qs.toString()}`) });
}

function useFeedbackStats() {
  return useQuery({ queryKey: ['feedback-stats'], queryFn: () => api.get('/feedback/stats') });
}

export function FeedbackPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useFeedbacks({ status: statusFilter, type: typeFilter, limit: 50 });
  const { data: stats } = useFeedbackStats();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/feedback', d),
    onSuccess: () => { toast.success('Feedback submitted'); qc.invalidateQueries({ queryKey: ['feedback'] }); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolution }) => api.put(`/feedback/${id}/resolve`, { resolution }),
    onSuccess: () => { toast.success('Feedback resolved'); qc.invalidateQueries({ queryKey: ['feedback'] }); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ type: 'complaint', category: 'doctor', subject: '', description: '', rating: 5 });

  const handleCreate = () => {
    if (!form.description) { toast.error('Description required'); return; }
    createMutation.mutate(form);
  };

  const statusVariant = { open: 'warning', 'in-progress': 'info', resolved: 'success', closed: 'secondary' };
  const typeVariant = { compliment: 'success', suggestion: 'info', complaint: 'destructive', general: 'secondary' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feedback & Complaints</h1>
          <p className="text-muted-foreground">Patient satisfaction and grievance management</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> New Feedback</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Open', value: stats.open },
            { label: 'Resolved', value: stats.resolved },
            { label: 'Complaints', value: stats.complaints },
            { label: 'Avg Rating', value: `${stats.avgRating}/5` },
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
          <CardHeader><CardTitle className="text-lg">New Feedback</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {['compliment','suggestion','complaint','general'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {['doctor','nursing','pharmacy','billing','housekeeping','food','ambulance','administration','other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setForm({...form, rating: n})} className="cursor-pointer">
                    <Star className={`h-5 w-5 ${n <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? 'Submitting...' : 'Submit Feedback'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Feedback ({data?.total || 0})</CardTitle>
          <div className="flex gap-2">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Types</option>
              {['compliment','suggestion','complaint','general'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Status</option>
              {['open','in-progress','resolved','closed'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <div className="space-y-3">
              {(data?.feedbacks || []).map(f => (
                <div key={f._id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={typeVariant[f.type]}>{f.type}</Badge>
                        <Badge variant={statusVariant[f.status]}>{f.status}</Badge>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(n => <Star key={n} className={`h-3 w-3 ${n <= (f.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}
                        </div>
                      </div>
                      <p className="mt-1 text-sm font-medium">{f.subject || f.description}</p>
                      <p className="text-xs text-muted-foreground">{f.patientName || f.patient?.firstName} · {f.category} · {new Date(f.createdAt).toLocaleDateString()}</p>
                      {f.resolution && <p className="mt-2 text-sm text-green-600">Resolved: {f.resolution}</p>}
                    </div>
                    {f.status !== 'resolved' && f.status !== 'closed' && (
                      <Button size="sm" variant="outline" onClick={() => {
                        const resolution = prompt('Enter resolution:');
                        if (resolution) resolveMutation.mutate({ id: f._id, resolution });
                      }}>Resolve</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
