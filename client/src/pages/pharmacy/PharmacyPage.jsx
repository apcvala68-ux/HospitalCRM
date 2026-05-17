import { useState } from 'react';
import { useMedicines, useInventory, useAddStock, useDispense, useLowStockAlerts, useCreateMedicine } from '../../hooks/usePharmacy';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/useToast';
import { Pill, Plus, AlertTriangle, Package, Search, MinusCircle } from 'lucide-react';

export function PharmacyPage() {
  const [tab, setTab] = useState('inventory');
  const [search, setSearch] = useState('');
  const [medForm, setMedForm] = useState({ medicine: '', batchNo: '', expiryDate: '', quantity: 0, mrp: 0, supplier: '' });
  const [dispenseQty, setDispenseQty] = useState({});
  const [newMed, setNewMed] = useState({ name: '', genericName: '', category: '', unit: 'tablet', reorderLevel: 10 });

  const { data: medicinesData } = useMedicines(search);
  const { data: inventoryData } = useInventory({});
  const { data: alertsData } = useLowStockAlerts();
  const addStock = useAddStock();
  const dispense = useDispense();
  const createMedicine = useCreateMedicine();
  const toast = useToast();

  const medicines = medicinesData?.medicines || [];
  const inventory = inventoryData?.inventory || [];
  const alerts = alertsData?.alerts || [];

  const getStock = (medId) => inventory.filter(i => i.medicine?._id === medId).reduce((s, i) => s + i.quantity, 0);

  const handleAddStock = async () => {
    if (!medForm.medicine || !medForm.batchNo) { toast.error('Select medicine and enter batch'); return; }
    await addStock.mutateAsync(medForm);
    setMedForm({ medicine: '', batchNo: '', expiryDate: '', quantity: 0, mrp: 0, supplier: '' });
  };

  const handleDispense = async (id) => {
    const qty = dispenseQty[id];
    if (!qty || qty <= 0) return;
    await dispense.mutateAsync({ id, data: { quantity: qty } });
    setDispenseQty({ ...dispenseQty, [id]: 0 });
  };

  const handleCreateMedicine = async () => {
    if (!newMed.name) { toast.error('Medicine name required'); return; }
    await createMedicine.mutateAsync(newMed);
    setNewMed({ name: '', genericName: '', category: '', unit: 'tablet', reorderLevel: 10 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pharmacy</h1>
          <p className="text-muted-foreground">Medicine inventory and dispensing</p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {alerts.length} low stock alert{alerts.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant={tab === 'inventory' ? 'default' : 'outline'} size="sm" onClick={() => setTab('inventory')}>
          <Package className="mr-1 h-4 w-4" /> Inventory
        </Button>
        <Button variant={tab === 'add' ? 'default' : 'outline'} size="sm" onClick={() => setTab('add')}>
          <Plus className="mr-1 h-4 w-4" /> Add Stock
        </Button>
        <Button variant={tab === 'new' ? 'default' : 'outline'} size="sm" onClick={() => setTab('new')}>
          <Pill className="mr-1 h-4 w-4" /> New Medicine
        </Button>
        <Button variant={tab === 'alerts' ? 'default' : 'outline'} size="sm" onClick={() => setTab('alerts')}>
          <AlertTriangle className="mr-1 h-4 w-4" /> Alerts ({alerts.length})
        </Button>
      </div>

      {tab === 'inventory' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Stock Inventory</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-2 font-medium">Medicine</th>
                    <th className="pb-2 font-medium">Batch</th>
                    <th className="pb-2 font-medium">Expiry</th>
                    <th className="pb-2 font-medium text-right">Qty</th>
                    <th className="pb-2 font-medium text-right">MRP</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item._id} className="border-b last:border-0 text-sm">
                      <td className="py-2 font-medium">{item.medicine?.name}</td>
                      <td className="py-2 font-mono text-xs">{item.batchNo}</td>
                      <td className="py-2">
                        {new Date(item.expiryDate) < new Date() ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          new Date(item.expiryDate).toLocaleDateString()
                        )}
                      </td>
                      <td className="py-2 text-right font-bold">{item.quantity}</td>
                      <td className="py-2 text-right">₹{item.mrp}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <Input type="number" placeholder="Qty" className="h-8 w-20" value={dispenseQty[item._id] || ''} onChange={(e) => setDispenseQty({ ...dispenseQty, [item._id]: Number(e.target.value) })} />
                          <Button size="sm" variant="outline" onClick={() => handleDispense(item._id)} disabled={!dispenseQty[item._id]}>
                            <MinusCircle className="mr-1 h-3 w-3" /> Dispense
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'add' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Add Stock</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Medicine</label>
                <select value={medForm.medicine} onChange={(e) => setMedForm({ ...medForm, medicine: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Select</option>
                  {medicines.map((m) => <option key={m._id} value={m._id}>{m.name} ({m.genericName})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Batch No" value={medForm.batchNo} onChange={(e) => setMedForm({ ...medForm, batchNo: e.target.value })} />
                <Input type="date" placeholder="Expiry" value={medForm.expiryDate} onChange={(e) => setMedForm({ ...medForm, expiryDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Quantity" value={medForm.quantity} onChange={(e) => setMedForm({ ...medForm, quantity: Number(e.target.value) })} />
                <Input type="number" placeholder="MRP" value={medForm.mrp} onChange={(e) => setMedForm({ ...medForm, mrp: Number(e.target.value) })} />
              </div>
              <Input placeholder="Supplier" value={medForm.supplier} onChange={(e) => setMedForm({ ...medForm, supplier: e.target.value })} />
              <Button onClick={handleAddStock} disabled={addStock.isPending} className="w-full">Add to Inventory</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Current Stock Levels</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {medicines.slice(0, 20).map((m) => (
                <div key={m._id} className="flex items-center justify-between text-sm">
                  <span>{m.name}</span>
                  <span className={`font-mono font-bold ${getStock(m._id) <= m.reorderLevel ? 'text-destructive' : ''}`}>
                    {getStock(m._id)} {m.unit}s
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'new' && (
        <Card className="max-w-md">
          <CardHeader><CardTitle className="text-lg">Add New Medicine</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Medicine name *" value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} />
            <Input placeholder="Generic name" value={newMed.genericName} onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Category" value={newMed.category} onChange={(e) => setNewMed({ ...newMed, category: e.target.value })} />
              <select value={newMed.unit} onChange={(e) => setNewMed({ ...newMed, unit: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                {['tablet', 'capsule', 'ml', 'mg', 'injection', 'syrup', 'cream'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <Input type="number" placeholder="Reorder at" value={newMed.reorderLevel} onChange={(e) => setNewMed({ ...newMed, reorderLevel: Number(e.target.value) })} />
            </div>
            <Button onClick={handleCreateMedicine} disabled={createMedicine.isPending} className="w-full">Add Medicine</Button>
          </CardContent>
        </Card>
      )}

      {tab === 'alerts' && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Low Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No low stock alerts</p>
            ) : (
              <div className="space-y-2">
                {alerts.map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <div>
                      <p className="font-medium">{a.medicine?.name}</p>
                      <p className="text-xs text-muted-foreground">{a.medicine?.genericName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-destructive">{a.currentStock} in stock</p>
                      <p className="text-xs text-muted-foreground">Reorder at: {a.reorderLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
