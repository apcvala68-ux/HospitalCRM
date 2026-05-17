import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoice, useAddPayment } from '../../hooks/useBilling';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Printer, CreditCard, Building2 } from 'lucide-react';

const statusVariant = {
  pending: 'warning',
  partial: 'info',
  paid: 'success',
  cancelled: 'destructive',
  refunded: 'destructive',
};

export function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useInvoice(id);
  const addPayment = useAddPayment();
  const toast = useToast();
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('cash');
  const [payRef, setPayRef] = useState('');

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const bill = data?.bill;
  if (!bill) return <div className="py-12 text-center text-muted-foreground">Invoice not found</div>;

  const due = bill.total - bill.amountPaid;

  const handlePayment = async () => {
    if (payAmount <= 0 || payAmount > due) {
      toast.error(`Amount must be between ₹1 and ₹${due}`);
      return;
    }
    try {
      await addPayment.mutateAsync({
        id: bill._id,
        data: { method: payMethod, amount: payAmount, reference: payRef },
      });
      setPayAmount(0);
      setPayRef('');
      toast.success('Payment recorded');
    } catch (err) {
      // handled by hook
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/billing')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-mono">{bill.invoiceNo}</h1>
              <Badge variant={statusVariant[bill.status]}>{bill.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              {bill.patient?.firstName} {bill.patient?.lastName} · {bill.patient?.uhid} · {bill.patient?.phone}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 print:hidden">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Subtotal</CardTitle>
          </CardHeader>
          <CardContent><p className="text-lg font-bold">₹{bill.subtotal?.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Tax</CardTitle>
          </CardHeader>
          <CardContent><p className="text-lg font-bold">₹{bill.tax?.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Discount</CardTitle>
          </CardHeader>
          <CardContent><p className="text-lg font-bold">-₹{bill.discount?.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">₹{bill.total?.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium text-right">Rate</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items?.map((item, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 text-sm">{i + 1}</td>
                  <td className="py-2 text-sm font-medium">{item.description}</td>
                  <td className="py-2 text-sm capitalize">{item.category}</td>
                  <td className="py-2 text-sm text-right">{item.quantity}</td>
                  <td className="py-2 text-sm text-right">₹{item.rate?.toLocaleString()}</td>
                  <td className="py-2 text-sm text-right font-medium">₹{item.amount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{bill.subtotal?.toLocaleString()}</span></div>
            {bill.tax > 0 && <div className="flex justify-between"><span>Tax</span><span>₹{bill.tax?.toLocaleString()}</span></div>}
            {bill.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{bill.discount?.toLocaleString()}</span></div>}
            <div className="flex justify-between border-t pt-1 text-lg font-bold"><span>Total</span><span>₹{bill.total?.toLocaleString()}</span></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bill.paymentSplits?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet</p>
            ) : (
              <div className="space-y-2">
                {bill.paymentSplits.map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <div>
                      <span className="capitalize font-medium">{p.method}</span>
                      {p.reference && <span className="ml-2 text-muted-foreground">({p.reference})</span>}
                    </div>
                    <span className="font-medium">₹{p.amount?.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Total Paid</span>
                  <span>₹{bill.amountPaid?.toLocaleString()}</span>
                </div>
                {due > 0 && (
                  <div className="flex justify-between text-destructive font-bold">
                    <span>Due</span>
                    <span>₹{due.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {bill.status !== 'paid' && bill.status !== 'cancelled' && (
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Record Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                {['cash', 'upi', 'card', 'insurance'].map((method) => (
                  <Button
                    key={method}
                    type="button"
                    variant={payMethod === method ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPayMethod(method)}
                    className="capitalize"
                  >
                    {method}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                placeholder={`Amount (max ₹${due})`}
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
              />
              <Input
                placeholder="Reference (optional)"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
              />
              <Button onClick={handlePayment} disabled={addPayment.isPending || payAmount <= 0} className="w-full">
                {addPayment.isPending ? 'Recording...' : `Pay ₹${payAmount || 0}`}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="print-only hidden print:block text-center text-sm text-muted-foreground pt-8">
        <Building2 className="mx-auto h-8 w-8 mb-2" />
        <p className="font-bold text-lg">Royale Hospital</p>
        <p>Invoice: {bill.invoiceNo} | Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
        <p className="mt-4">Patient: {bill.patient?.firstName} {bill.patient?.lastName} ({bill.patient?.uhid})</p>
        <hr className="my-4" />
        {bill.items?.map((item, i) => (
          <p key={i} className="flex justify-between px-8">
            <span>{item.description} x{item.quantity}</span>
            <span>₹{item.amount?.toLocaleString()}</span>
          </p>
        ))}
        <hr className="my-2" />
        <p className="flex justify-between px-8 font-bold"><span>Total</span><span>₹{bill.total?.toLocaleString()}</span></p>
        <p className="flex justify-between px-8"><span>Paid</span><span>₹{bill.amountPaid?.toLocaleString()}</span></p>
        {bill.paymentSplits?.map((p, i) => (
          <p key={i} className="text-xs text-muted-foreground">Paid via {p.method}</p>
        ))}
      </div>
    </div>
  );
}

function DollarSign(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
