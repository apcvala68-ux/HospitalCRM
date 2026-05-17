import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ShoppingCart, Plus, Search } from 'lucide-react';

function usePurchaseOrders(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({ queryKey: ['purchase-orders', params], queryFn: () => api.get(`/purchase-orders?${qs.toString()}`) });
}

function usePOStats() {
  return useQuery({ queryKey: ['po-stats'], queryFn: () => api.get('/purchase-orders/stats') });
}

export function PurchaseOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = usePurchaseOrders({ status: statusFilter, limit: 50 });
  const { data: stats } = usePOStats();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/purchase-orders', d),
    onSuccess: () => { toast.success('PO created'); qc.invalidateQueries({ queryKey: ['purchase-orders'] }); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ vendor: { name: '', phone: '', email: '' }, items: [{ medicineName: '', quantity: 1, rate: 0, gst: 0 }] });

  const handleCreate = () => {
    if (!form.vendor.name) { toast.error('Vendor name required'); return; }
    createMutation.mutate(form);
  };

  const statusVariant = { draft: 'secondary', ordered: 'warning', received: 'success', partial: 'info', cancelled: 'destructive' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Pharmacy procurement and vendor management</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" /> New PO</Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total POs', value: stats.total, icon: ShoppingCart, color: 'text-blue-600' },
            { label: 'Pending', value: stats.pending, icon: ShoppingCart, color: 'text-yellow-600' },
            { label: 'Today', value: stats.todayOrders, icon: ShoppingCart, color: 'text-purple-600' },
            { label: 'Total Spent', value: `₹${(stats.totalSpent || 0).toLocaleString('en-IN')}`, icon: ShoppingCart, color: 'text-green-600' },
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
          <CardHeader><CardTitle className="text-lg">New Purchase Order</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor Name</label>
              <Input value={form.vendor.name} onChange={e => setForm({...form, vendor: {...form.vendor, name: e.target.value}})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor Phone</label>
              <Input value={form.vendor.phone} onChange={e => setForm({...form, vendor: {...form.vendor, phone: e.target.value}})} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Items</label>
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={item.medicineName} onChange={e => { const items = [...form.items]; items[i].medicineName = e.target.value; setForm({...form, items}); }} placeholder="Medicine name" className="flex-1" />
                  <Input type="number" value={item.quantity} onChange={e => { const items = [...form.items]; items[i].quantity = +e.target.value; setForm({...form, items}); }} placeholder="Qty" className="w-20" />
                  <Input type="number" value={item.rate} onChange={e => { const items = [...form.items]; items[i].rate = +e.target.value; setForm({...form, items}); }} placeholder="Rate" className="w-24" />
                  <Input type="number" value={item.gst} onChange={e => { const items = [...form.items]; items[i].gst = +e.target.value; setForm({...form, items}); }} placeholder="GST%" className="w-20" />
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setForm({...form, items: [...form.items, { medicineName: '', quantity: 1, rate: 0, gst: 0 }]})}>+ Add Item</Button>
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create PO'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Orders ({data?.total || 0})</CardTitle>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All Status</option>
            {['draft','ordered','received','partial','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
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
                    <th className="pb-2 font-medium">PO No</th>
                    <th className="pb-2 font-medium">Vendor</th>
                    <th className="pb-2 font-medium">Items</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.orders || []).map(o => (
                    <tr key={o._id} className="border-b last:border-0 text-sm">
                      <td className="py-2 font-mono text-xs">{o.poNo}</td>
                      <td className="py-2">{o.vendor?.name}</td>
                      <td className="py-2">{o.items?.length || 0}</td>
                      <td className="py-2 font-medium">₹{(o.total || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2"><Badge variant={statusVariant[o.status]}>{o.status}</Badge></td>
                      <td className="py-2 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
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
