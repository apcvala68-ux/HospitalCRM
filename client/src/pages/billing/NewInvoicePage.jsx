import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateInvoice } from '../../hooks/useBilling';
import { usePatientSearch } from '../../hooks/usePatients';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Plus, X, DollarSign, Search } from 'lucide-react';

const CATEGORIES = ['consultation', 'pharmacy', 'lab', 'ipd', 'surgery', 'ambulance', 'other'];

export function NewInvoicePage() {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();
  const toast = useToast();
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { data: searchResults } = usePatientSearch(patientSearch);
  const [items, setItems] = useState([
    { description: '', category: 'consultation', quantity: 1, rate: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');

  const updateItem = (i, field, value) => {
    const updated = items.map((item, idx) =>
      idx === i ? { ...item, [field]: value } : item
    );
    setItems(updated);
  };

  const addItem = () => setItems([...items, { description: '', category: 'other', quantity: 1, rate: 0 }]);
  const removeItem = (i) => items.length > 1 && setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, item) => s + item.quantity * item.rate, 0);
  const total = subtotal + tax - discount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) { toast.error('Select a patient'); return; }
    if (items.some((i) => !i.description)) { toast.error('All items need a description'); return; }
    if (items.every((i) => i.rate === 0)) { toast.error('Add at least one item with a rate'); return; }

    try {
      const res = await createInvoice.mutateAsync({
        patient: selectedPatient._id,
        items: items.map((i) => ({
          description: i.description,
          category: i.category,
          quantity: i.quantity,
          rate: i.rate,
        })),
        discount: Number(discount),
        tax: Number(tax),
        notes,
      });
      navigate(`/billing/${res.bill._id}`);
    } catch (err) {
      // handled by hook
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/billing')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Invoice</h1>
          <p className="text-muted-foreground">Create a new invoice for a patient</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-4 w-4" />
            Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedPatient ? (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                <p className="text-sm text-muted-foreground">{selectedPatient.uhid} · {selectedPatient.phone}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedPatient(null); setPatientSearch(''); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Search patient by name, UHID, or phone..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              {searchResults?.patients?.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-lg border">
                  {searchResults.patients.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(p);
                        setPatientSearch('');
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                    >
                      {p.firstName} {p.lastName} — {p.uhid} <span className="text-muted-foreground">{p.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Invoice Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-1 h-4 w-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                  />
                </div>
                <select
                  value={item.category}
                  onChange={(e) => updateItem(i, 'category', e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', Math.max(1, Number(e.target.value)))}
                  className="w-20"
                  min="1"
                />
                <Input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => updateItem(i, 'rate', Number(e.target.value))}
                  className="w-24"
                />
                <div className="flex h-10 w-20 items-center justify-end text-sm font-medium">
                  ₹{(item.quantity * item.rate).toLocaleString()}
                </div>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Discount</span>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-28 h-8 text-right"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Tax</span>
                <Input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="w-28 h-8 text-right"
                />
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Optional notes..."
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/billing')}>Cancel</Button>
          <Button type="submit" disabled={createInvoice.isPending}>
            <DollarSign className="mr-2 h-4 w-4" />
            {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}
