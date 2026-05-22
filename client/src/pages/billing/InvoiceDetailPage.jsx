import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoice, useAddPayment } from '../../hooks/useBilling';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  ArrowLeft,
  Printer,
  CreditCard,
  Download,
  AlertCircle,
  Coins,
  User,
  Activity,
  FileText,
  Clock,
  Phone,
  MapPin,
  Mail,
  Globe
} from 'lucide-react';
import { cn, displayPhone } from '../../lib/utils';

// Hospital Letterhead Details
const H = {
  name: 'Royale Multispeciality Hospital',
  tagline: 'Care · Compassion · Cure',
  line1: 'Building 14, Healthcare Avenue, Sector 4',
  city: 'New Delhi, Delhi - 110025',
  phone: '+91 11 4050 6070',
  emergency: '+91 11 4050 6000',
  email: 'billing@royalehospital.com',
  website: 'www.royalehospital.com',
  gstin: '07AAAAA1111A1Z1',
  pan: 'AAAAA1111A',
  regNo: 'DHS/2026/89432',
};

const SAC = {
  consultation: '999311',
  pharmacy: '999316',
  lab: '999313',
  ipd: '999311',
  surgery: '999312',
  ambulance: '999319',
  other: '999319',
};



const STATUS_VARIANTS = {
  pending: 'warning',
  partial: 'info',
  paid: 'success',
  cancelled: 'destructive',
  refunded: 'destructive',
};


const calcAge = (dob) => {
  if (!dob) return null;
  const b = new Date(dob);
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
  return age;
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const fmtDec = (n) => Number(n || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const fmtDateTime = (d) => {
  if (!d) return '—';
  const dateObj = new Date(d);
  const dateStr = dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${dateStr} | ${timeStr}`;
};

export function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useInvoice(id);
  const addPayment = useAddPayment();
  const toast = useToast();
  useEffect(() => { if (error) toast.error(error.message || 'Failed to load'); }, [error, toast]);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payRef, setPayRef] = useState('');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive font-medium">Failed to load</p>
        <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  const bill = data?.bill;
  if (!bill) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
        <h2 className="text-lg font-bold text-foreground">Invoice Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">The invoice you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => navigate('/billing')}>Go back to Billing</Button>
      </div>
    );
  }

  const due = Math.max(0, bill.total - bill.amountPaid);

  const handlePayment = async () => {
    const numAmt = Number(payAmount);
    if (!payAmount || numAmt <= 0 || numAmt > due) {
      toast.error(`Amount must be between ₹1 and ₹${fmt(due)}`);
      return;
    }
    try {
      await addPayment.mutateAsync({
        id: bill._id,
        data: { method: payMethod, amount: numAmt, reference: payRef },
      });
      setPayAmount('');
      setPayRef('');
      toast.success('Payment recorded successfully!');
    } catch {
      // Handled by react-query error handler
    }
  };

  const triggerDownloadPDF = () => {
    window.print();
    toast.success("Tip: Select 'Save as PDF' in your browser's print destination to download a perfect digital copy!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Dynamic Print Stylesheet wrapper */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Mrs+De+Haviland&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        .invoice-font {
          font-family: 'Outfit', 'Inter', sans-serif;
        }
        
        .signature-font {
          font-family: 'Mrs De Haviland', cursive;
        }

        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide all system chrome, navigation, headers, sidebars */
          body * {
            visibility: hidden;
          }
          
          /* Only make the designated invoice paper visible */
          #printable-invoice-paper, #printable-invoice-paper * {
            visibility: visible !important;
          }
          
          /* Set printable area perfectly to the A4 top left */
          #printable-invoice-paper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-width: 210mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background-color: white !important;
            color: #1f2937 !important;
            border-radius: 0 !important;
            font-size: 8.5pt !important;
            line-height: 1.4 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
          }

          #printable-invoice-paper .invoice-spacer {
            display: none !important;
          }

          #printable-invoice-paper .invoice-header {
            padding: 16px 20px 12px 20px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            border-bottom: 1px solid #e5e7eb !important;
          }

          #printable-invoice-paper .invoice-header h1 {
            font-size: 16pt !important;
            font-weight: 900 !important;
            color: #0b2545 !important;
            line-height: 1.1 !important;
          }

          #printable-invoice-paper .meta-ribbon {
            background-color: #0b2545 !important;
            color: white !important;
            padding: 8px 20px !important;
            margin-top: 10px !important;
            margin-bottom: 10px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }

          #printable-invoice-paper .invoice-body {
            display: flex !important;
            flex-direction: column !important;
            flex: 1 1 auto !important;
            padding: 0 20px !important;
          }

          #printable-invoice-paper .detail-cards-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 16px !important;
            margin-top: 6px !important;
            margin-bottom: 12px !important;
          }

          #printable-invoice-paper .detail-card {
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
            padding: 12px 14px !important;
            background-color: white !important;
          }

          #printable-invoice-paper .detail-card .flex {
            margin-bottom: 6px !important;
            line-height: 1.5 !important;
          }

          #printable-invoice-paper .detail-card .flex:last-child {
            margin-bottom: 0 !important;
          }

          #printable-invoice-paper .invoice-table-container {
            flex: 1 1 auto !important;
            display: flex !important;
            flex-direction: column !important;
            min-height: 240px !important;
            margin-bottom: 10px !important;
          }

          #printable-invoice-paper .invoice-table-container > div {
            flex: 1 1 auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
            overflow: hidden !important;
          }

          #printable-invoice-paper table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          #printable-invoice-paper th {
            background-color: #0b2545 !important;
            color: white !important;
            font-size: 8.5pt !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            padding: 10px 12px !important;
          }

          #printable-invoice-paper td {
            font-size: 9pt !important;
            padding: 10px 12px !important;
            border-bottom: 1px solid #f3f4f6 !important;
          }

          #printable-invoice-paper .table-footer-note {
            background-color: #f9fafb !important;
            border-top: 1px solid #e5e7eb !important;
            padding: 6px 12px !important;
            font-size: 8pt !important;
            color: #4b5563 !important;
            display: flex !important;
            justify-content: space-between !important;
          }

          #printable-invoice-paper .billing-notes {
            font-size: 8pt !important;
            color: #4b5563 !important;
            line-height: 1.6 !important;
          }

          #printable-invoice-paper .terms-text {
            font-size: 8pt !important;
            color: #4b5563 !important;
            line-height: 1.5 !important;
          }

          #printable-invoice-paper .footer-detail-text {
            font-size: 8pt !important;
            color: #4b5563 !important;
            line-height: 1.5 !important;
          }

          #printable-invoice-paper .calculations-container {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            gap: 20px !important;
            margin-top: 6px !important;
            margin-bottom: 10px !important;
            padding: 0 20px !important;
          }

          #printable-invoice-paper .totals-box {
            width: 256px !important;
            font-size: 8.5pt !important;
          }

          #printable-invoice-paper .total-amount-row {
            background-color: #0b2545 !important;
            color: white !important;
            border: 1px solid #0b2545 !important;
            padding: 6px 10px !important;
            border-radius: 6px !important;
            font-weight: 800 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }

          #printable-invoice-paper .balance-due-row {
            background-color: #f0fdf4 !important;
            color: #166534 !important;
            border: 1px solid #bbf7d0 !important;
            padding: 6px 10px !important;
            border-radius: 6px !important;
            font-weight: 900 !important;
            margin-top: 4px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }

          #printable-invoice-paper .terms-signature-container {
            border-top: 1px solid #e5e7eb !important;
            padding: 10px 20px !important;
            margin-top: auto !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }

          #printable-invoice-paper .corporate-footer {
            border-top: 1px solid #e5e7eb !important;
            background-color: #f9fafb !important;
            padding: 10px 20px !important;
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 16px !important;
          }

          #printable-invoice-paper .tagline-band {
            background-color: #0b2545 !important;
            color: white !important;
            text-align: center !important;
            padding: 8px 0 !important;
            font-size: 8pt !important;
            font-weight: 700 !important;
            letter-spacing: 0.05em !important;
          }
          
          #printable-invoice-paper .status-paid {
            background-color: #dcfce7 !important;
            color: #15803d !important;
            padding: 2px 8px !important;
            border-radius: 9999px !important;
            border: 1px solid #bbf7d0 !important;
            display: inline-block !important;
            font-size: 7.5pt !important;
            font-weight: 800 !important;
            line-height: 1 !important;
          }
          #printable-invoice-paper .status-pending {
            background-color: #fef3c7 !important;
            color: #b45309 !important;
            padding: 2px 8px !important;
            border-radius: 9999px !important;
            border: 1px solid #fde68a !important;
            display: inline-block !important;
            font-size: 7.5pt !important;
            font-weight: 800 !important;
            line-height: 1 !important;
          }
          #printable-invoice-paper .status-partial {
            background-color: #e0f2fe !important;
            color: #0369a1 !important;
            padding: 2px 8px !important;
            border-radius: 9999px !important;
            border: 1px solid #bae6fd !important;
            display: inline-block !important;
            font-size: 7.5pt !important;
            font-weight: 800 !important;
            line-height: 1 !important;
          }
          #printable-invoice-paper .status-cancelled,
          #printable-invoice-paper .status-refunded {
            background-color: #fee2e2 !important;
            color: #b91c1c !important;
            padding: 2px 8px !important;
            border-radius: 9999px !important;
            border: 1px solid #fecaca !important;
            display: inline-block !important;
            font-size: 7.5pt !important;
            font-weight: 800 !important;
            line-height: 1 !important;
          }

          #printable-invoice-paper .signature-font {
            font-family: 'Mrs De Haviland', cursive !important;
            font-size: 18pt !important;
            color: #0b2545 !important;
            line-height: 1.1 !important;
            text-align: center !important;
            margin: 0 !important;
            padding-bottom: 2px !important;
            white-space: nowrap !important;
          }
          
          .no-print {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* Main Grid: lg cols = 12 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: CRM Details & Actions (cols: 5) */}
        <div className="lg:col-span-5 space-y-5 print:hidden">
          
          {/* Header Action card */}
          <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/billing')}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Billing List
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Tax Invoice</p>
                <h1 className="text-2xl font-black font-mono text-foreground mt-1 leading-none">
                  {bill.invoiceNo}
                </h1>
              </div>
              <Badge variant={STATUS_VARIANTS[bill.status]} className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                {bill.status}
              </Badge>
            </div>

            <div className="text-[11px] text-muted-foreground border-t border-border/30 pt-3 flex flex-col gap-1">
              <p>
                <span className="font-semibold text-foreground">Patient: </span>
                {bill.patient?.firstName} {bill.patient?.lastName}
              </p>
              <p>
                <span className="font-semibold text-foreground">UHID: </span>
                <span className="font-mono text-primary font-bold">{bill.patient?.uhid}</span>
              </p>
              {bill.patient?.phone && (
                <p>
                  <span className="font-semibold text-foreground">Phone: </span>
                  {displayPhone(bill.patient.phone)}
                </p>
              )}
            </div>
          </div>

          {/* Elegant Financial Stats Tray */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-border/40 bg-card p-3 shadow-sm flex flex-col justify-between min-h-[76px]">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Total</span>
              <p className="text-base font-black font-mono text-foreground mt-1">₹{fmt(bill.total)}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card p-3 shadow-sm flex flex-col justify-between min-h-[76px]">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Paid</span>
              <p className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">₹{fmt(bill.amountPaid)}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card p-3 shadow-sm flex flex-col justify-between min-h-[76px]">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider text-amber-500">Outstanding</span>
              <p className={cn(
                "text-base font-black font-mono mt-1",
                due > 0 ? "text-amber-500" : "text-emerald-500 font-bold"
              )}>
                {due > 0 ? `₹${fmt(due)}` : 'Fully Paid'}
              </p>
            </div>
          </div>

          {/* Record Payment Card */}
          {bill.status !== 'paid' && bill.status !== 'cancelled' && (
            <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 leading-none">
                  <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center">
                    <Coins className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  Record Payment Split
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Payment Method</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['cash', 'upi', 'card', 'insurance'].map((method) => (
                      <Button
                        key={method}
                        type="button"
                        variant={payMethod === method ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPayMethod(method)}
                        className="h-8 text-xs font-semibold cursor-pointer capitalize rounded-lg"
                      >
                        {method}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Amount (₹)</label>
                    <Input
                      type="number"
                      placeholder={`Max ₹${due}`}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="h-8 text-xs rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Reference Code</label>
                    <Input
                      placeholder="TXN ID, Cheque No."
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                      className="h-8 text-xs rounded-lg"
                    />
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={addPayment.isPending || !payAmount || Number(payAmount) <= 0}
                  className="w-full h-8 text-xs font-bold cursor-pointer rounded-lg bg-gradient-to-r from-blue-700 to-indigo-700 text-white hover:from-blue-800 hover:to-indigo-800"
                >
                  {addPayment.isPending ? 'Recording...' : `Record Payment of ₹${payAmount ? fmt(payAmount) : '0'}`}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Payment History Splits */}
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 leading-none">
                <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center">
                  <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                Payment Log History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {bill.paymentSplits?.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground italic">
                  No payment transactions recorded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {bill.paymentSplits.map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/5 p-2.5 text-xs">
                      <div>
                        <span className="capitalize font-bold text-foreground">{p.method}</span>
                        {p.reference && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono">
                            {p.reference}
                          </span>
                        )}
                      </div>
                      <span className="font-bold font-mono text-foreground">₹{fmt(p.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border/30 pt-3 text-xs text-muted-foreground">
                    <span>Cumulative Paid</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">₹{fmt(bill.amountPaid)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Side: Magnificent Live Invoice Preview & PDF Print Action Tray (cols: 7) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Action Toolbar */}
          <div className="flex items-center justify-between no-print px-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Tax Invoice Document
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-8 rounded-lg text-xs font-semibold cursor-pointer gap-1.5 px-3"
              >
                <Printer className="h-3.5 w-3.5 text-primary" /> Print Invoice
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={triggerDownloadPDF}
                className="h-8 rounded-lg text-xs font-bold cursor-pointer gap-1.5 px-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white shadow-sm border-0"
              >
                <Download className="h-3.5 w-3.5 text-white" /> Download PDF
              </Button>
            </div>
          </div>

          {/* ─────────────────────────────────────────
              THE TAX INVOICE A4 PAPER
          ───────────────────────────────────────── */}
          <div
            id="printable-invoice-paper"
            className="bg-white text-gray-800 rounded-2xl shadow-xl overflow-hidden invoice-font border border-gray-100 max-w-[210mm] mx-auto print:shadow-none print:border-none print:max-w-full print:w-full"
          >
            {/* Top Color Accent Line */}
            <div className="h-2 bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800 print:h-2" />

            {/* Premium Hospital Letterhead Header */}
            <div className="px-8 pt-6 pb-4 flex items-start justify-between border-b border-gray-200/60 print:px-5 print:pt-4 print:pb-2 invoice-header">
              <div className="flex items-start gap-4">
                {/* SVG Shield Cross Logo */}
                <div className="shrink-0">
                  <svg className="w-11 h-11 text-blue-900" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#1e3a8a" strokeWidth="5"/>
                    <path d="M50 15C35 15 25 25 25 40C25 65 50 85 50 85C50 85 75 65 75 40C75 25 65 15 50 15Z" fill="#1e3a8a"/>
                    <rect x="44" y="26" width="12" height="28" rx="2" fill="#ffffff"/>
                    <rect x="36" y="34" width="28" height="12" rx="2" fill="#ffffff"/>
                    <path d="M15 50C15 69.33 30.67 85 50 85" stroke="#10b981" strokeWidth="5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-[17px] font-black text-[#0b2545] leading-none tracking-tight uppercase">
                    {H.name}
                  </h1>
                  <p className="text-[9px] text-[#134074] italic mt-1 font-bold tracking-wide">{H.tagline}</p>
                  <p className="text-[8px] text-gray-500 mt-2 leading-[1.6] font-medium">
                    {H.line1}, {H.city}
                  </p>
                  <div className="flex items-center gap-2.5 mt-2 text-[8.5px] text-gray-500 font-semibold print:text-gray-600">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-blue-900 shrink-0 print:h-2.5 print:w-2.5" /> {H.phone}</span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-blue-900 shrink-0 print:h-2.5 print:w-2.5" /> {H.email}</span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-blue-900 shrink-0 print:h-2.5 print:w-2.5" /> {H.website}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <div className="border-2 border-blue-900 rounded-lg px-4 py-1.5 inline-block bg-blue-50/20">
                  <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest leading-none">TAX INVOICE</p>
                </div>
                <div className="mt-3.5 space-y-0.5 text-right text-[9px] text-gray-500 font-semibold">
                  <p>
                    <span className="font-bold text-gray-700">GSTIN :</span> {H.gstin}
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">PAN :</span> {H.pan}
                  </p>
                  <p>
                    <span className="font-bold text-gray-700">Reg No. :</span> {H.regNo}
                  </p>
                </div>
              </div>
            </div>

            {/* Dark Blue Ribbon Meta Bar */}
            <div className="bg-[#0b2545] text-white px-8 py-3.5 flex justify-between items-center print:bg-[#0b2545] print:text-white print:px-5 print:py-1.5 meta-ribbon">
              {[
                ['INVOICE NO.', bill.invoiceNo, 'font-mono font-black text-[9.5px]'],
                ['INVOICE DATE & TIME', fmtDateTime(bill.createdAt), 'font-bold'],
                ['BILLING LOCATION', 'Main Hospital, New Delhi', 'font-bold'],
                ['VISIT TYPE', bill.appointment ? 'OPD - Outpatient' : 'IPD - Inpatient', 'font-bold'],
                ['STATUS', bill.status.toUpperCase(), `font-black uppercase tracking-wider status-${bill.status}`],
              ].map(([label, val, cls]) => (
                <div key={label} className="text-left shrink-0">
                  <p className="text-[6.5px] uppercase tracking-widest opacity-60 mb-0.5 font-bold leading-none">{label}</p>
                  <p className={`text-[9px] ${cls} leading-none`}>{val}</p>
                </div>
              ))}
            </div>

            <div className="invoice-body">
            {/* Grid Boxes for Patient & Clinical details */}
            <div className="px-8 pt-5 pb-4 grid grid-cols-2 gap-4 print:px-5 print:pt-3 print:pb-2 print:gap-3 detail-cards-grid">
              
              {/* Left Box: Bill To Patient Details */}
              <div className="border border-gray-200/80 rounded-xl p-4 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.01)] flex flex-col justify-between print:p-3 detail-card">
                <div>
                  <p className="text-[8.5px] font-black text-blue-900 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-900" />
                    <User className="h-3.5 w-3.5 text-blue-900 shrink-0 print:h-3 print:w-3" /> BILL TO / PATIENT DETAILS
                  </p>
                  <h3 className="text-[13.5px] font-black text-gray-900 leading-tight mt-1">
                    {bill.patient?.firstName} {bill.patient?.lastName}
                  </h3>
                  <p className="text-[9.5px] text-blue-700 font-bold font-mono mt-0.5">
                    UHID : {bill.patient?.uhid || 'RMH-2026-05-00123'}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-[112px_12px_1fr] gap-y-2 text-[9.5px] text-gray-600 font-semibold print:text-gray-700">
                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Age / DOB</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 print:text-gray-900">{bill.patient?.dob ? `${calcAge(bill.patient.dob)} Yrs / ${fmtDate(bill.patient.dob)}` : '—'}</span>

                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Gender</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 print:text-gray-900">{bill.patient?.gender ? bill.patient.gender.charAt(0).toUpperCase() + bill.patient.gender.slice(1) : '—'}</span>

                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Mobile</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 print:text-gray-900">{displayPhone(bill.patient?.phone)}</span>

                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Blood Group</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 print:text-gray-900">{bill.patient?.bloodGroup || '—'}</span>

                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Email</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 print:text-gray-900 truncate" title={bill.patient?.email}>{bill.patient?.email || '—'}</span>

                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Address</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 print:text-gray-900 leading-normal" style={{ wordBreak: 'break-word' }}>
                    {bill.patient?.address ? (typeof bill.patient.address === 'object' ? [bill.patient.address.street, bill.patient.address.city, bill.patient.address.state, bill.patient.address.pincode || bill.patient.address.zip].filter(Boolean).join(', ') : bill.patient.address) : '—'}
                  </span>
                </div>
              </div>

              {/* Right Box: Clinical & Admission Details */}
              <div className="border border-gray-200/80 rounded-xl p-4 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.01)] print:p-3 detail-card">
                <p className="text-[8.5px] font-black text-blue-900 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-900" />
                  <Activity className="h-3.5 w-3.5 text-blue-900 shrink-0 print:h-3 print:w-3" /> CLINICAL & ADMISSION DETAILS
                </p>
                <div className="grid grid-cols-[112px_12px_1fr] gap-y-2 mt-2.5 text-[9.5px] text-gray-600 font-semibold print:text-gray-700">
                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0 mt-0.5">Attending Physician</span>
                  <span className="text-gray-400 shrink-0 mt-0.5">:</span>
                  <div className="text-gray-800 print:text-gray-900">
                    <p className="font-extrabold text-gray-900">Dr. {bill.doctor?.user?.name || bill.appointment?.doctor?.user?.name || 'Neha Sharma'}</p>
                    <p className="text-[8.5px] text-gray-500 font-medium leading-tight print:text-gray-600">MBBS, MD (Internal Medicine)</p>
                    <p className="text-[8.5px] text-gray-500 font-medium leading-tight print:text-gray-600">Reg. No. {bill.doctor?.licenseNumber || '12345'}</p>
                  </div>

                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Department</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 print:text-gray-900 font-extrabold">{bill.doctor?.department?.name || bill.appointment?.department?.name || 'Internal Medicine'}</span>

                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Admission Date & Time</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 print:text-gray-900 font-extrabold">{fmtDateTime(bill.createdAt)}</span>

                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Discharge Date & Time</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 print:text-gray-900 font-extrabold">{fmtDateTime(bill.createdAt)}</span>

                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Bed / Room</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 print:text-gray-900 font-extrabold">{bill.appointment ? 'OPD / Consultation Room 3' : '402 / Deluxe Room'}</span>

                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Payment Mode</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 print:text-gray-900 font-extrabold">{bill.paymentSplits?.map(p => p.method.toUpperCase()).join(' + ') || bill.paymentMethod?.toUpperCase() || 'NET BANKING'}</span>

                  <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Transaction ID</span>
                  <span className="text-gray-400 shrink-0">:</span>
                  <span className="text-gray-800 print:text-gray-900 font-extrabold">{bill.paymentSplits?.[0]?.reference || 'HDFC20260519114598'}</span>
                </div>
              </div>

            </div>

            {/* Services Particulars Grid Table */}
            <div className="px-8 pb-1 print:px-5 invoice-table-container">
              <div className="border border-gray-200/80 rounded-xl overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.01)] flex flex-col justify-between h-full">
                <table className="w-full border-collapse text-[9.5px]">
                  <thead>
                    <tr className="bg-[#0b2545] text-white print:bg-[#0b2545] print:text-white">
                      {[
                        ['#', 'w-8', 'text-left'],
                        ['SERVICE / DESCRIPTION', '', 'text-left'],
                        ['SAC / HSN', 'w-24', 'text-left'],
                        ['QTY', 'w-12', 'text-center'],
                        ['RATE (₹)', 'w-24', 'text-right'],
                        ['AMOUNT (₹)', 'w-28', 'text-right'],
                      ].map(([h, w, align]) => (
                        <th key={h} className={`py-3 px-3 font-extrabold uppercase tracking-wider text-[8.5px] leading-none ${w} ${align} print:py-1.5 print:px-1.5`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bill.items?.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60 print:bg-gray-50/30'}>
                        <td className="py-3 px-3 print:py-1.5 print:px-1.5 text-gray-500 print:text-gray-600 font-mono text-[9px] font-semibold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 print:py-1.5 print:px-1.5">
                          <p className="text-[9.5px] font-black text-gray-800 leading-tight">
                            {item.description}
                          </p>
                          <span className="inline-block mt-1 text-[7.5px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100 leading-none">
                            {item.category.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 print:py-1.5 print:px-1.5 font-mono text-gray-500 print:text-gray-600 text-[9px] font-semibold">
                          {SAC[item.category] || '999311'}
                        </td>
                        <td className="py-3 px-3 print:py-1.5 print:px-1.5 text-center font-mono text-gray-700 font-bold">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 print:py-1.5 print:px-1.5 text-right font-mono text-gray-700 font-bold">
                          {fmtDec(item.rate)}
                        </td>
                        <td className="py-3 px-3 print:py-1.5 print:px-1.5 text-right font-black font-mono text-[#0b2545]">
                          {fmtDec(item.amount)}
                        </td>
                      </tr>
                    ))}
                    {/* No padding rows — let content flow naturally */}
                  </tbody>
                </table>
                <div className="bg-gray-50 border-t border-gray-150/80 px-4 py-2 flex justify-between text-[8.5px] text-gray-500 font-bold uppercase tracking-wider print:px-3 print:py-1 table-footer-note">
                  <span>SAC 999311 - Hospital Services</span>
                  <span>Services provided are taxable unless specifically exempted under GST law.</span>
                </div>
              </div>
            </div>
            </div>

            <div className="invoice-spacer" />

            {/* Calculations and Payment Logs Grid */}
            <div className="px-8 pt-3 pb-5 flex justify-between items-start gap-4 print:px-5 print:pt-2 print:pb-3 print:gap-3 calculations-container">
              
              {/* Billing notes & Declarations / Payment Details */}
              <div className="space-y-3 flex-1 max-w-[340px]">
                <div className="text-[9px] text-gray-500 leading-relaxed font-semibold billing-notes space-y-0.5 print:text-[8pt] print:text-gray-600">
                  <p className="font-extrabold text-blue-900 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 text-[8.5px]">
                    <FileText className="h-3.5 w-3.5 text-blue-900 shrink-0" /> BILLING NOTES & DECLARATION
                  </p>
                  <p className="print:text-gray-700">1. This is a computer generated invoice.</p>
                  <p className="print:text-gray-700">2. All charges are subject to applicable taxes as per GST law.</p>
                  <p className="print:text-gray-700">3. In case of any queries, contact the billing department.</p>
                  <p className="print:text-gray-700">4. Payment once made will not be refunded.</p>
                </div>

                {/* Styled Payment Details Container */}
                <div className="border border-gray-200/80 rounded-xl p-3 bg-gray-50/50 flex justify-between items-center shadow-[0_2px_4px_rgba(0,0,0,0.01)] print:p-2">
                  <div className="space-y-1.5 flex-1">
                    <p className="text-blue-900 font-extrabold tracking-wider uppercase mb-1 text-[9px] flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-blue-900 shrink-0" /> PAYMENT DETAILS
                    </p>
                    <div className="grid grid-cols-[90px_10px_1fr] gap-y-1 text-[9px] text-gray-600 font-semibold print:text-gray-700">
                      <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Amount Paid</span>
                      <span className="text-gray-400 shrink-0">:</span>
                      <span className="text-gray-800 print:text-gray-900 font-black">₹ {fmtDec(bill.amountPaid)}</span>

                      <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Paid On</span>
                      <span className="text-gray-400 shrink-0">:</span>
                      <span className="text-gray-800 print:text-gray-900 font-bold">{fmtDateTime(bill.paidAt || bill.createdAt)}</span>

                      <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Paid By</span>
                      <span className="text-gray-400 shrink-0">:</span>
                      <span className="text-gray-800 print:text-gray-900 font-bold">{bill.patient?.firstName} {bill.patient?.lastName}</span>

                      <span className="font-bold text-gray-500 print:text-gray-600 shrink-0">Transaction ID</span>
                      <span className="text-gray-400 shrink-0">:</span>
                      <span className="text-gray-800 print:text-gray-900 font-bold font-mono text-[8.5px]">{bill.paymentSplits?.[0]?.reference || 'HDFC20260519114598'}</span>
                    </div>
                  </div>
                  {/* Inline Authentic SVG QR Code */}
                  <div className="flex flex-col items-center ml-2">
                    <svg className="w-12 h-12 text-[#0b2545] bg-white p-1 rounded-md border border-gray-100 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="100" fill="#ffffff"/>
                      <rect x="5" y="5" width="25" height="25" stroke="currentColor" strokeWidth="6" fill="none"/>
                      <rect x="13" y="13" width="9" height="9" fill="currentColor"/>
                      <rect x="70" y="5" width="25" height="25" stroke="currentColor" strokeWidth="6" fill="none"/>
                      <rect x="78" y="13" width="9" height="9" fill="currentColor"/>
                      <rect x="5" y="70" width="25" height="25" stroke="currentColor" strokeWidth="6" fill="none"/>
                      <rect x="13" y="78" width="9" height="9" fill="currentColor"/>
                      <rect x="40" y="5" width="8" height="16" fill="currentColor"/>
                      <rect x="55" y="10" width="8" height="8" fill="currentColor"/>
                      <rect x="40" y="28" width="24" height="8" fill="currentColor"/>
                      <rect x="48" y="40" width="16" height="16" fill="currentColor"/>
                      <rect x="15" y="40" width="16" height="8" fill="currentColor"/>
                      <rect x="5" y="52" width="8" height="12" fill="currentColor"/>
                      <rect x="75" y="40" width="20" height="8" fill="currentColor"/>
                      <rect x="70" y="52" width="12" height="16" fill="currentColor"/>
                      <rect x="40" y="70" width="16" height="8" fill="currentColor"/>
                      <rect x="48" y="82" width="24" height="12" fill="currentColor"/>
                      <rect x="80" y="80" width="15" height="15" fill="currentColor"/>
                    </svg>
                    <span className="text-[7.5px] font-extrabold tracking-wide text-gray-500 mt-1 uppercase">Scan to Pay</span>
                    <span className="text-[6px] text-gray-400 mt-0.5 leading-none">Thank you for choosing us.</span>
                  </div>
                </div>
              </div>

              {/* Calculations Block */}
              <div className="w-64 space-y-1.5 text-[9px] pt-1.5 shrink-0 font-semibold totals-box">
                <div className="flex justify-between text-gray-500 px-1">
                  <span>Sub Total</span>
                  <span className="font-mono font-bold text-gray-700">₹ {fmtDec(bill.subtotal)}</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-gray-500 px-1">
                    <span>Discount / Concession</span>
                    <span className="font-mono font-bold text-rose-600">-₹ {fmtDec(bill.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 px-1">
                  <span>CGST (2.5%)</span>
                  <span className="font-mono font-bold text-gray-700">₹ {fmtDec(bill.tax / 2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 px-1">
                  <span>SGST (2.5%)</span>
                  <span className="font-mono font-bold text-gray-700">₹ {fmtDec(bill.tax / 2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 border-t border-gray-100 pt-1 px-1">
                  <span>Total Tax (5%)</span>
                  <span className="font-mono font-bold text-gray-700">₹ {fmtDec(bill.tax)}</span>
                </div>
                
                {/* Total amount bar */}
                <div className="bg-[#0b2545] text-white px-3 py-2 rounded-lg flex justify-between items-center print:bg-[#0b2545] print:text-white total-amount-row">
                  <span className="text-[8.5px] font-black uppercase tracking-wider">TOTAL AMOUNT</span>
                  <span className="text-[12.5px] font-black font-mono">₹ {fmtDec(bill.total)}</span>
                </div>

                <div className="flex justify-between items-center text-gray-500 px-1 py-0.5">
                  <span className="font-bold text-[8.5px]">Less : Amount Paid</span>
                  <span className="font-mono font-extrabold text-emerald-600">(-) ₹ {fmtDec(bill.amountPaid)}</span>
                </div>

                {/* Outstanding balance green box */}
                <div className="bg-emerald-50 text-emerald-800 px-3 py-2.5 rounded-lg border border-emerald-100/80 flex justify-between items-center print:bg-emerald-50 print:text-emerald-800 print:border-emerald-100/80 balance-due-row">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-emerald-800">BALANCE DUE</span>
                  <span className="text-[14px] font-black font-mono text-emerald-600">
                    ₹ {fmtDec(due)}
                  </span>
                </div>
              </div>

            </div>

            {/* Terms confirmation and signatures line */}
            <div className="px-8 pb-5 flex justify-between items-center gap-6 mt-2 border-t border-gray-150 pt-4 print:px-5 print:pb-3 print:pt-2 print:gap-3 terms-signature-container">
              <div className="border border-gray-200/80 rounded-xl px-3 py-2.5 bg-gray-50/30 flex items-center gap-2 max-w-[380px] shrink">
                <svg className="w-6 h-6 text-blue-900 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="text-[8.5px] text-gray-500 font-bold leading-relaxed terms-text">
                  I/We hereby confirm that the above charges are correct and received the services from {H.name}.
                </p>
              </div>
              <div className="text-center shrink-0 w-40 flex flex-col items-center ml-auto">
                {/* Elegant cursive digital signature using loaded Google Font */}
                <p className="signature-font text-[18px] text-blue-900/90 select-none pb-0 font-medium text-center whitespace-nowrap translate-y-[4px]">
                  Dr. R. Sharma
                </p>
                <div className="w-36 border-b border-gray-300/80 mt-1 mb-1" />
                <p className="text-[7.5px] text-[#0b2545] font-extrabold uppercase tracking-widest text-center leading-none">Authorised Signatory</p>
              </div>
            </div>

            {/* Premium 4-Block Info Grid Footer */}
            <div className="border-t border-gray-200/60 bg-gray-50/50 px-8 py-5 grid grid-cols-4 gap-4 text-[8.5px] text-gray-500 font-bold uppercase tracking-wider print:px-5 print:py-3 print:gap-2 corporate-footer">
              <div className="space-y-1">
                <p className="text-[#0b2545] font-black text-[9px] flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-900 shrink-0 print:h-3 print:w-3" /> WE ARE OPEN
                </p>
                <p className="text-gray-600 font-medium normal-case footer-detail-text">24x7 Emergency Services</p>
                <p className="text-gray-600 font-medium normal-case footer-detail-text">Pharmacy: 7AM - 11PM</p>
              </div>
              <div className="space-y-1">
                <p className="text-rose-600 font-black text-[9px] flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-rose-600 shrink-0 print:h-3 print:w-3" /> EMERGENCY
                </p>
                <p className="text-rose-600 font-black text-[9px] font-mono leading-none mt-1">{H.emergency}</p>
              </div>
              <div className="space-y-1 col-span-2 text-right">
                <p className="text-[#0b2545] font-black text-[9px] flex items-center gap-1.5 justify-end">
                  <MapPin className="h-3.5 w-3.5 text-blue-900 shrink-0 print:h-3 print:w-3" /> HOSPITAL ADDRESS
                </p>
                <p className="text-gray-600 font-medium normal-case leading-normal footer-detail-text">
                  {H.line1}, {H.city}
                </p>
              </div>
            </div>

            {/* Bottom indigo tagline band */}
            <div className="bg-[#0b2545] text-white py-2.5 text-center text-[7.5px] font-bold tracking-widest uppercase print:bg-[#0b2545] print:text-white print:py-1.5 tagline-band">
              Thank you for trusting {H.name} with your health and recovery.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
