import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateInvoice } from '../../hooks/useBilling';
import { usePatientSearch } from '../../hooks/usePatients';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import {
  ArrowLeft, Plus, X, Search, ShoppingBag, Percent,
  Receipt, Stethoscope, FileText, Building2,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
//  HOSPITAL CONFIG — replace all values before going live
// ─────────────────────────────────────────────────────────────────────────────
const H = {
  name: 'Royale Hospital',
  tagline: 'Quality Healthcare · Compassionate Service',
  line1: '42, Main Road, Near Civil Hospital',
  city: 'Sirkali, Tamil Nadu – 609 108',
  phone: '+91 90000 00000',
  email: 'billing@royalehospital.in',
  website: 'www.royalehospital.in',
  gstin: '33AAAAA0000A1Z5',     // Replace with actual GSTIN
  regNo: 'TN/HOSP/2019/0042',   // Replace with actual hospital registration
  cin: 'U85110TN2019PTC000001', // Replace or remove if N/A
};

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['consultation', 'pharmacy', 'lab', 'ipd', 'surgery', 'ambulance', 'other'];

// SAC codes for common healthcare services (Schedule of Services under GST)
const SAC = {
  consultation: '999311',  // Inpatient services / OPD consultation
  pharmacy: '30049',   // Medicaments (HSN)
  lab: '998931',  // Medical laboratory testing services
  ipd: '999311',  // Hospital accommodation/inpatient
  surgery: '999316',  // Surgical procedures
  ambulance: '996419',  // Ambulance services
  other: '999399',  // Other health services
};

const CAT_BADGE = {
  consultation: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pharmacy: 'bg-blue-100 text-blue-700 border-blue-200',
  lab: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  ipd: 'bg-purple-100 text-purple-700 border-purple-200',
  surgery: 'bg-rose-100 text-rose-700 border-rose-200',
  ambulance: 'bg-amber-100 text-amber-700 border-amber-200',
  other: 'bg-gray-100 text-gray-600 border-gray-200',
};

const GST_OPTIONS = [
  { label: '0% — Healthcare Exempt', value: 0 },
  { label: '5% GST', value: 5 },
  { label: '12% GST', value: 12 },
  { label: '18% GST', value: 18 },
];

const PAYMENT_MODES = ['cash', 'card', 'upi', 'insurance', 'cheque', 'online_transfer'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getGradient = (id) => {
  const G = [
    'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
    'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
    'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
    'linear-gradient(135deg, #f472b6 0%, #f43f5e 100%)',
  ];
  if (!id) return G[0];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return G[Math.abs(h) % G.length];
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
const fmtDate = (d = new Date()) =>
  d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Barcode SVG ──────────────────────────────────────────────────────────────
const BarcodeSVG = () => (
  <svg className="h-6 w-28 text-gray-400" viewBox="0 0 100 25" fill="currentColor">
    {[[0, 2], [3, 1], [6, 3], [11, 1], [14, 2], [18, 4], [24, 1], [27, 2], [31, 3], [36, 1],
    [39, 4], [45, 2], [49, 1], [52, 3], [57, 2], [61, 1], [64, 4], [70, 2], [74, 1],
    [77, 3], [82, 2], [86, 1], [89, 4], [95, 2], [98, 2]].map(([x, w], i) => (
      <rect key={i} x={x} y="2" width={w} height="20" />
    ))}
  </svg>
);

// ─── Form section wrapper ─────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, action, children }) => (
  <div className="rounded-xl border border-border/50 bg-card shadow-sm" style={{ overflow: 'visible' }}>
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">{title}</p>
      </div>
      {action}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function NewInvoicePage() {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();
  const toast = useToast();

  // patient
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { data: searchResults } = usePatientSearch(patientSearch);

  // invoice lines
  const [items, setItems] = useState([
    { description: '', category: 'consultation', quantity: 1, rate: 0 },
  ]);

  // billing metadata
  const [discount, setDiscount] = useState(0);
  const [gstRate, setGstRate] = useState(0);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [doctorName, setDoctorName] = useState('');
  const [department, setDepartment] = useState('');
  const [notes, setNotes] = useState('');
  const [autoDetectedFrom, setAutoDetectedFrom] = useState('');

  // stable invoice number for this session
  const [invoiceNo] = useState(() => {
    const d = new Date();
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `INV-${ym}-${Math.floor(1000 + Math.random() * 9000)}`;
  });

  // ── Auto-detect attending physician & department ──
  useEffect(() => {
    if (!selectedPatient) {
      setDoctorName('');
      setDepartment('');
      setAutoDetectedFrom('');
      return;
    }

    const detectDoctorAndDept = async () => {
      try {
        const data = await api.get(`/patients/${selectedPatient._id}/history`);
        if (!data) return;

        // 1. Active IPD Admission
        const activeIpd = data.ipdAdmissions?.find(adm => adm.status === 'active');
        if (activeIpd && activeIpd.admittingDoctor) {
          const doc = activeIpd.admittingDoctor;
          if (doc.user?.name) {
            setDoctorName(doc.user.name);
            setDepartment(doc.department?.name || doc.specialization || '');
            setAutoDetectedFrom('Active IPD Admission');
            return;
          }
        }

        // 2. Latest Appointment
        if (data.appointments?.length > 0) {
          const apt = data.appointments[0];
          if (apt.doctor?.user?.name) {
            setDoctorName(apt.doctor.user.name);
            setDepartment(apt.doctor.department?.name || apt.doctor.specialization || '');
            setAutoDetectedFrom('Latest Appointment');
            return;
          }
        }

        // 3. Latest Prescription
        if (data.prescriptions?.length > 0) {
          const rx = data.prescriptions[0];
          if (rx.doctor?.user?.name) {
            setDoctorName(rx.doctor.user.name);
            setDepartment(rx.doctor.department?.name || rx.doctor.specialization || '');
            setAutoDetectedFrom('Latest Prescription');
            return;
          }
        }

        // 4. Latest Queue Token
        if (data.queueTokens?.length > 0) {
          const token = data.queueTokens[0];
          if (token.doctor?.user?.name) {
            setDoctorName(token.doctor.user.name);
            setDepartment(token.department?.name || token.doctor.department?.name || token.doctor.specialization || '');
            setAutoDetectedFrom('Latest Queue Token');
            return;
          }
        }

        // 5. Latest Lab Report
        if (data.labOrders?.length > 0) {
          const lo = data.labOrders[0];
          if (lo.doctor?.user?.name) {
            setDoctorName(lo.doctor.user.name);
            setDepartment(lo.doctor.department?.name || lo.doctor.specialization || '');
            setAutoDetectedFrom('Latest Lab Report');
            return;
          }
        }

        // If no records found, reset detection label but preserve manual input if already typed
        setAutoDetectedFrom('');
      } catch (err) {
        console.error('Failed to auto-detect doctor/department:', err);
      }
    };

    detectDoctorAndDept();
  }, [selectedPatient]);

  // ── Computations ──
  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const discountAmt = Math.max(0, Number(discount) || 0);
  const taxableAmt = Math.max(0, subtotal - discountAmt);
  const gstAmt = Math.round(taxableAmt * gstRate / 100);
  const cgst = gstAmt / 2;
  const sgst = gstAmt / 2;
  const netTotal = taxableAmt + gstAmt;
  const visitType = items.some(i => i.category === 'ipd') ? 'IPD' : 'OPD';
  const today = fmtDate();

  // ── Item helpers ──
  const updateItem = (i, field, val) =>
    setItems(items.map((it, idx) => idx === i ? { ...it, [field]: val } : it));
  const addItem = () =>
    setItems([...items, { description: '', category: 'other', quantity: 1, rate: 0 }]);
  const removeItem = (i) =>
    items.length > 1 && setItems(items.filter((_, idx) => idx !== i));

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) { toast.error('Please select a patient'); return; }
    if (items.some(i => !i.description.trim())) {
      toast.error('Every line item must have a description'); return;
    }
    if (items.every(i => i.rate === 0)) {
      toast.error('Add at least one item with a rate'); return;
    }
    try {
      const res = await createInvoice.mutateAsync({
        patient: selectedPatient._id,
        items: items.map(i => ({
          description: i.description,
          category: i.category,
          quantity: i.quantity,
          rate: i.rate,
        })),
        discount: discountAmt,
        tax: gstAmt,
        notes,
        paymentMode,
        doctorName,
        department,
      });
      navigate(`/billing/${res.bill._id}`);
    } catch (_) { /* handled by hook */ }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 w-full max-w-7xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <Button
          type="button" variant="ghost" size="icon"
          onClick={() => navigate('/billing')}
          className="h-9 w-9 rounded-full border border-border bg-background shadow-sm hover:bg-muted shrink-0 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Button>
        <div>
          <h1 className="text-[16px] font-bold tracking-tight text-foreground">New Invoice</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Create a new patient billing record — #{invoiceNo}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ════════════════════════════════════════
            LEFT — form controls  (7 cols)
        ════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-4">

          {/* Patient search — kept outside <form> to avoid z-index issues */}
          <div
            className="rounded-xl border border-border/50 bg-card shadow-sm"
            style={{ overflow: 'visible', position: 'relative', zIndex: 20 }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
              <Search className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Patient</p>
            </div>
            <div className="p-4" style={{ overflow: 'visible', position: 'relative', zIndex: 30 }}>
              {selectedPatient ? (
                <div className="flex items-center justify-between rounded-xl border border-border/50 p-3 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[11px] shadow border border-white/10"
                      style={{ background: getGradient(selectedPatient._id) }}
                    >
                      {selectedPatient.firstName?.charAt(0)}{selectedPatient.lastName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[13px] text-foreground">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        UHID: {selectedPatient.uhid}
                        {selectedPatient.phone && ` · ${selectedPatient.phone}`}
                        {selectedPatient.dob && ` · ${calcAge(selectedPatient.dob)} yrs`}
                        {selectedPatient.gender && ` · ${selectedPatient.gender.charAt(0).toUpperCase()}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button" variant="ghost" size="icon"
                    onClick={() => { setSelectedPatient(null); setPatientSearch(''); }}
                    className="h-7 w-7 rounded-full hover:bg-muted cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search by name, UHID or phone…"
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                    className="pl-9 h-9 rounded-xl text-sm"
                  />
                  {searchResults?.patients?.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-border/40 animate-in fade-in slide-in-from-top-1 duration-150">
                      {searchResults.patients.map(p => (
                        <button
                          key={p._id} type="button"
                          onClick={() => { setSelectedPatient(p); setPatientSearch(''); }}
                          className="w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[10px]"
                              style={{ background: getGradient(p._id) }}
                            >
                              {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-[12px] text-foreground">{p.firstName} {p.lastName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{p.uhid}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded shrink-0">
                            {p.phone}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Invoice metadata */}
            <Section icon={Receipt} title="Invoice Details">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value)}
                    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer capitalize"
                  >
                    {PAYMENT_MODES.map(m => (
                      <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">GST Rate</label>
                  <select
                    value={gstRate}
                    onChange={e => setGstRate(Number(e.target.value))}
                    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    {GST_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Bill Date</label>
                  <div className="h-8 rounded-lg border border-border/50 bg-muted/30 px-2.5 flex items-center text-xs text-muted-foreground font-mono">
                    {today}
                  </div>
                </div>
              </div>
            </Section>

            {/* Attending physician */}
            <Section
              icon={Stethoscope}
              title="Attending Physician"
              action={autoDetectedFrom && (
                <span className="text-[9.5px] text-emerald-500 font-semibold flex items-center gap-1 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-detected from {autoDetectedFrom}
                </span>
              )}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Doctor Name</label>
                  <Input
                    value={doctorName}
                    onChange={e => {
                      setDoctorName(e.target.value);
                      if (autoDetectedFrom) setAutoDetectedFrom('');
                    }}
                    placeholder="Dr. Full Name"
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Department</label>
                  <Input
                    value={department}
                    onChange={e => {
                      setDepartment(e.target.value);
                      if (autoDetectedFrom) setAutoDetectedFrom('');
                    }}
                    placeholder="e.g. General Medicine, Cardiology"
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
              </div>
            </Section>

            {/* Invoice lines */}
            <div className="rounded-xl border border-border/50 bg-card shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Invoice Lines</p>
                </div>
                <Button
                  type="button" variant="outline" size="sm"
                  onClick={addItem}
                  className="h-7 rounded-lg text-[11px] font-semibold cursor-pointer px-3 gap-1"
                >
                  <Plus className="h-3 w-3 text-primary" /> Add Line
                </Button>
              </div>

              {/* Column header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-4 pt-2.5 pb-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/10 border-b border-border/20">
                <div className="col-span-4">Description</div>
                <div className="col-span-3">Category</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Rate (₹)</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>

              <div className="p-3 space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center bg-muted/15 rounded-lg p-2.5 border border-border/30">
                    <div className="col-span-12 sm:col-span-4">
                      <Input
                        placeholder="Service or item name…"
                        value={item.description}
                        onChange={e => updateItem(i, 'description', e.target.value)}
                        className="h-7 text-xs rounded-md border-border/60 w-full"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <select
                        value={item.category}
                        onChange={e => updateItem(i, 'category', e.target.value)}
                        className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Input
                        type="number" min="1"
                        value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', Math.max(1, Number(e.target.value)))}
                        className="h-7 text-xs text-center rounded-md px-1 font-mono"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground font-bold pointer-events-none">₹</span>
                        <Input
                          type="number" min="0"
                          value={item.rate}
                          onChange={e => updateItem(i, 'rate', Math.max(0, Number(e.target.value)))}
                          className="h-7 text-xs text-right rounded-md pl-4 pr-2 font-mono"
                        />
                      </div>
                    </div>
                    <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-1">
                      <span className="text-xs font-bold font-mono text-foreground bg-muted/50 px-2.5 py-1 rounded flex-1 sm:flex-initial text-right border border-border/20">
                        ₹{fmt(item.quantity * item.rate)}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="h-7 w-7 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adjustments + Notes */}
            <div className="grid grid-cols-2 gap-4">
              <Section icon={Percent} title="Adjustments">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">Subtotal</span>
                    <span className="text-[11px] font-semibold font-mono text-foreground">₹{fmt(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">Discount (₹)</span>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground font-bold pointer-events-none">₹</span>
                      <Input
                        type="number" min="0"
                        value={discount}
                        onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                        className="pl-5 h-7 text-right text-xs font-mono rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      GST ({gstRate}%)
                      {gstRate > 0 && <span className="text-[9px] block text-muted-foreground/60">CGST {gstRate / 2}% + SGST {gstRate / 2}%</span>}
                    </span>
                    <span className="text-[11px] font-semibold font-mono text-foreground">+₹{fmt(gstAmt)}</span>
                  </div>
                  <div className="border-t border-border/40 pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground">Net Payable</span>
                    <span className="text-[14px] font-black font-mono text-primary">₹{fmt(netTotal)}</span>
                  </div>
                </div>
              </Section>

              <Section icon={FileText} title="Remarks / Notes">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs resize-none placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  placeholder="Insurance claim no., TPA details, special remarks…"
                />
              </Section>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-1">
              <Button
                type="button" variant="outline"
                onClick={() => navigate('/billing')}
                className="h-9 px-5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createInvoice.isPending}
                className="h-9 px-5 rounded-xl text-xs font-bold cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5"
              >
                <Receipt className="h-3.5 w-3.5" />
                {createInvoice.isPending ? 'Generating…' : 'Generate Invoice'}
              </Button>
            </div>
          </form>
        </div>

        {/* ════════════════════════════════════════
            RIGHT — invoice preview  (5 cols)
        ════════════════════════════════════════ */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          {/* Outer tray */}
          <div className="rounded-2xl bg-gray-200/70 dark:bg-zinc-900 border border-border/40 p-3 shadow-inner">

            {/* Tray label */}
            <div className="flex items-center justify-between mb-2 px-0.5">
              <p className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Live Invoice Preview
              </p>
              <p className="text-[8.5px] text-muted-foreground font-mono">{invoiceNo}</p>
            </div>

            {/* ─────────────────────────────────────────
                INVOICE PAPER  (always white bg)
            ───────────────────────────────────────── */}
            <div className="bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden font-sans leading-normal select-none">

              {/* Top color accent */}
              <div className="h-1.5 bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-600" />

              {/* ── Letterhead ── */}
              <div className="px-6 pt-5 pb-4 flex items-start justify-between border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-700 flex items-center justify-center shrink-0 shadow">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-[15px] font-black text-blue-900 leading-tight tracking-wide uppercase">
                      {H.name}
                    </h1>
                    <p className="text-[8px] text-gray-400 italic mt-0.5">{H.tagline}</p>
                    <p className="text-[7.5px] text-gray-500 mt-1.5 leading-[1.6]">
                      {H.line1}, {H.city}<br />
                      ☎ {H.phone} &nbsp;|&nbsp; ✉ {H.email}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="border-2 border-blue-700 rounded-md px-2.5 py-1 inline-block">
                    <p className="text-[11px] font-black text-blue-800 uppercase tracking-wider">TAX INVOICE</p>
                  </div>
                  <div className="mt-2 space-y-0.5 text-right">
                    <p className="text-[7px] text-gray-500">
                      <span className="font-bold text-gray-700">GSTIN:</span> {H.gstin}
                    </p>
                    <p className="text-[7px] text-gray-500">
                      <span className="font-bold text-gray-700">Reg No:</span> {H.regNo}
                    </p>
                    <p className="text-[7px] text-gray-400 italic">{H.website}</p>
                  </div>
                </div>
              </div>

              {/* ── Invoice meta bar ── */}
              <div className="bg-blue-800 text-white px-6 py-2.5 grid grid-cols-4 gap-2">
                {[
                  ['Invoice No.', invoiceNo, 'font-mono font-bold'],
                  ['Bill Date', today, 'font-semibold'],
                  ['Visit Type', visitType, 'font-semibold'],
                  ['Status', 'DRAFT', 'font-bold text-amber-300'],
                ].map(([label, val, cls]) => (
                  <div key={label}>
                    <p className="text-[6.5px] uppercase tracking-wider opacity-60 mb-0.5">{label}</p>
                    <p className={`text-[10px] ${cls}`}>{val}</p>
                  </div>
                ))}
              </div>

              {/* ── Patient + Clinical details ── */}
              <div className="px-6 pt-3 pb-2 grid grid-cols-2 gap-3">

                {/* Bill To */}
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-2">Bill To / Patient</p>
                  {selectedPatient ? (
                    <div className="space-y-1">
                      <p className="text-[13px] font-black text-gray-900 leading-tight">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </p>
                      <p className="text-[8.5px] text-blue-700 font-bold font-mono">
                        UHID: {selectedPatient.uhid}
                      </p>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5">
                        {[
                          ['Age', selectedPatient.dob ? `${calcAge(selectedPatient.dob)} Yrs` : null],
                          ['Sex', selectedPatient.gender ? selectedPatient.gender.charAt(0).toUpperCase() : null],
                          ['Blood', selectedPatient.bloodGroup || null],
                          ['Phone', selectedPatient.phone || null],
                        ].filter(([, v]) => v).map(([k, v]) => (
                          <p key={k} className="text-[7.5px] text-gray-600">
                            <span className="font-bold">{k}: </span>{v}
                          </p>
                        ))}
                      </div>
                      {selectedPatient.email && (
                        <p className="text-[7px] text-gray-400 mt-1 truncate">{selectedPatient.email}</p>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 flex flex-col items-center gap-1.5">
                      <Search className="h-4 w-4 text-gray-300 animate-pulse" />
                      <p className="text-[8px] text-gray-400 italic text-center">Select a patient to populate</p>
                    </div>
                  )}
                </div>

                {/* Clinical Info */}
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-2">Clinical Details</p>
                  <div className="space-y-2">
                    {[
                      ['Attending Physician', doctorName || '—'],
                      ['Department', department || '—'],
                      ['Payment Mode', paymentMode.replace('_', ' ').toUpperCase()],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-[7px] font-semibold text-gray-400 uppercase leading-none mb-0.5">{label}</p>
                        <p className={cn('text-[9.5px] font-bold leading-tight', val === '—' ? 'text-gray-300 font-normal italic' : 'text-gray-700')}>
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Items table ── */}
              <div className="px-6 pb-0">
                <table className="w-full border-collapse text-[9px]">
                  <thead>
                    <tr className="bg-slate-900 text-slate-100">
                      {[
                        ['#', 'w-6', 'text-left'],
                        ['Service Description', '', 'text-left'],
                        ['SAC/HSN', 'w-16', 'text-left'],
                        ['Qty', 'w-8', 'text-center'],
                        ['Rate (₹)', 'w-16', 'text-right'],
                        ['Amount (₹)', 'w-20', 'text-right'],
                      ].map(([h, w, align]) => (
                        <th key={h} className={`py-2.5 px-3 font-extrabold uppercase tracking-widest text-[8px] leading-none ${w} ${align}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {items.map((item, idx) => (
                       <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                         <td className="py-2.5 px-3 text-gray-400 font-mono text-[8px]">
                           {String(idx + 1).padStart(2, '0')}
                         </td>
                         <td className="py-2.5 px-3">
                           <p className="text-[10px] font-semibold text-gray-800 leading-snug">
                             {item.description
                               ? item.description
                               : <span className="text-gray-300 italic font-normal text-[9px]">Item description</span>
                             }
                           </p>
                           <span className={cn(
                             'inline-block mt-0.5 text-[6.5px] font-bold uppercase px-1.5 py-0.5 rounded border leading-none',
                             CAT_BADGE[item.category]
                           )}>
                             {item.category}
                           </span>
                         </td>
                         <td className="py-2.5 px-3 font-mono text-gray-400 text-[7.5px]">
                           {SAC[item.category]}
                         </td>
                         <td className="py-2.5 px-3 text-center font-mono text-gray-600">
                           {item.quantity}
                         </td>
                         <td className="py-2.5 px-3 text-right font-mono text-gray-600">
                           ₹{fmt(item.rate)}
                         </td>
                         <td className="py-2.5 px-3 text-right font-bold font-mono text-gray-800">
                           ₹{fmt(item.quantity * item.rate)}
                         </td>
                       </tr>
                     ))}
                    {/* Pad to minimum 4 rows for a clean look */}
                    {items.length < 4 && Array.from({ length: 4 - items.length }).map((_, i) => {
                      const rowIdx = items.length + i;
                      return (
                        <tr key={`pad-${i}`} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                          <td className="py-3 px-2 text-gray-300 font-mono text-[8px]">
                            {String(rowIdx + 1).padStart(2, '0')}
                          </td>
                          <td className="py-3 px-2 text-gray-300/80 text-[9px] italic font-light">
                            —
                          </td>
                          <td className="py-3 px-2 text-gray-300/80 text-[8.5px] font-mono text-left">
                            —
                          </td>
                          <td className="py-3 px-2 text-gray-300/80 text-[8.5px] text-center font-mono">
                            —
                          </td>
                          <td className="py-3 px-2 text-gray-300/80 text-[8.5px] text-right font-mono">
                            —
                          </td>
                          <td className="py-3 px-2 text-gray-300/80 text-[8.5px] text-right font-mono">
                            —
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Totals ── */}
              <div className="px-6 pt-3 pb-3 flex justify-end">
                <div className="w-56 space-y-1 text-[9px]">
                  <div className="border-t border-gray-200 pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-mono font-semibold text-gray-700">₹{fmt(subtotal)}</span>
                    </div>
                    {discountAmt > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Discount / Concession</span>
                        <span className="font-mono font-semibold text-rose-600">-₹{fmt(discountAmt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Taxable Amount</span>
                      <span className="font-mono font-semibold text-gray-700">₹{fmt(taxableAmt)}</span>
                    </div>
                  </div>

                  {/* GST breakdown */}
                  <div className="border-t border-gray-200 pt-1 space-y-0.5">
                    {gstRate > 0 ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">CGST @ {gstRate / 2}%</span>
                          <span className="font-mono text-gray-600">₹{fmt(cgst)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">SGST @ {gstRate / 2}%</span>
                          <span className="font-mono text-gray-600">₹{fmt(sgst)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-gray-400 italic">GST — Healthcare Exempt (0%)</span>
                        <span className="font-mono text-gray-400">₹0.00</span>
                      </div>
                    )}
                  </div>

                  {/* Grand total box */}
                  <div className="mt-1.5 flex justify-between items-center bg-blue-800 text-white px-3 py-2.5 rounded-lg">
                    <span className="text-[10px] font-black uppercase tracking-wider">Amount Due</span>
                    <span className="text-[14px] font-black font-mono">₹{fmt(netTotal)}</span>
                  </div>

                  {/* Amount in words */}
                  <p className="text-[7px] text-gray-400 italic text-right pt-0.5">
                    (Amount in words: Rupees{' '}
                    {netTotal === 0
                      ? 'Zero Only'
                      : `${fmt(netTotal)} Only`})
                  </p>
                </div>
              </div>

              {/* ── Remarks ── */}
              {notes && (
                <div className="px-6 pb-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <p className="text-[7px] font-black text-amber-700 uppercase tracking-wider mb-1">
                      Remarks / Special Instructions
                    </p>
                    <p className="text-[8.5px] text-gray-600 italic leading-relaxed">{notes}</p>
                  </div>
                </div>
              )}

              {/* ── Declaration ── */}
              <div className="px-6 pb-3">
                <div className="border-t border-gray-100 pt-2">
                  <p className="text-[7px] text-gray-400 leading-[1.7]">
                    <span className="font-bold text-gray-500">Declaration: </span>
                    We declare that this invoice shows the actual price of the services/goods described and that all particulars are true and correct to the best of our knowledge. Healthcare services under SAC 9993 are exempt from GST per Sl. No. 74 of Notification 12/2017-CT(Rate) dated 28.06.2017. All disputes subject to local jurisdiction only.
                  </p>
                </div>
              </div>

              {/* ── Signature + Barcode footer ── */}
              <div className="px-6 pt-2 pb-4 flex items-end justify-between border-t border-gray-100">
                <div>
                  <BarcodeSVG />
                  <p className="text-[6.5px] text-gray-400 font-mono mt-1 leading-tight">
                    {invoiceNo} · {new Date().toISOString().slice(0, 10)}
                  </p>
                  <p className="text-[6px] text-gray-300 font-bold uppercase tracking-widest mt-1">
                    Computer Generated Bill · No Manual Signature Required
                  </p>
                </div>
                <div className="text-right space-y-4">
                  <div>
                    <div className="w-24 border-b border-gray-300 mb-1 ml-auto" />
                    <p className="text-[7px] text-gray-500 font-semibold uppercase tracking-wider">Patient / Guardian</p>
                  </div>
                  <div>
                    <div className="w-24 border-b border-gray-300 mb-1 ml-auto" />
                    <p className="text-[7px] text-gray-500 font-semibold uppercase tracking-wider">Authorised Signatory</p>
                  </div>
                </div>
              </div>

              {/* Bottom color accent */}
              <div className="h-1.5 bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-600" />
            </div>
            {/* End invoice paper */}
          </div>
        </div>
        {/* End right column */}
      </div>
    </div>
  );
}