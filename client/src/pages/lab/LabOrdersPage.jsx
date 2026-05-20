import { useState, useCallback, Fragment, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { usePatientSearch } from '../../hooks/usePatients';
import { useDoctors } from '../../hooks/useDoctor';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  FlaskConical, Plus, Search, X, CheckCircle, Clock, AlertCircle,
  ChevronDown, ChevronRight, TestTube, User,
  Beaker, Syringe, Microscope, Droplets, Activity,
  Copy, Check,
} from 'lucide-react';
import { cn, displayPhone } from '../../lib/utils';

const AVAILABLE_TESTS = [
  { name: 'CBC (Complete Blood Count)', category: 'hematology' },
  { name: 'HbA1c', category: 'biochemistry' },
  { name: 'Blood Sugar Fasting', category: 'biochemistry' },
  { name: 'Blood Sugar PP', category: 'biochemistry' },
  { name: 'Lipid Profile', category: 'biochemistry' },
  { name: 'Liver Function Test', category: 'biochemistry' },
  { name: 'Kidney Function Test', category: 'biochemistry' },
  { name: 'Thyroid Profile (T3, T4, TSH)', category: 'biochemistry' },
  { name: 'Serum Electrolytes', category: 'biochemistry' },
  { name: 'Uric Acid', category: 'biochemistry' },
  { name: 'Vitamin D', category: 'biochemistry' },
  { name: 'Vitamin B12', category: 'biochemistry' },
  { name: 'Iron Studies', category: 'biochemistry' },
  { name: 'CRP', category: 'serology' },
  { name: 'ESR', category: 'hematology' },
  { name: 'PT/INR', category: 'hematology' },
  { name: 'D-Dimer', category: 'hematology' },
  { name: 'Dengue NS1 Antigen', category: 'serology' },
  { name: 'Dengue IgG/IgM', category: 'serology' },
  { name: 'Malaria Antigen', category: 'microbiology' },
  { name: 'Typhoid (Widal)', category: 'serology' },
  { name: 'Urine Routine', category: 'urinalysis' },
  { name: 'Urine Culture', category: 'microbiology' },
  { name: 'Stool Examination', category: 'microbiology' },
  { name: 'H. pylori Antigen', category: 'microbiology' },
  { name: 'ECG', category: 'radiology' },
  { name: 'Chest X-Ray PA', category: 'radiology' },
  { name: 'X-Ray (Other)', category: 'radiology' },
  { name: 'Ultrasound Abdomen', category: 'radiology' },
  { name: 'Echocardiogram', category: 'radiology' },
  { name: 'Mammography', category: 'radiology' },
  { name: 'MRI Scan', category: 'radiology' },
  { name: 'CT Scan', category: 'radiology' },
  { name: 'PAP Smear', category: 'pathology' },
  { name: 'Biopsy', category: 'pathology' },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'warning', icon: Clock },
  collected: { label: 'Collected', color: 'info', icon: TestTube },
  processing: { label: 'Processing', color: 'info', icon: Activity },
  completed: { label: 'Completed', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'destructive', icon: X },
};

const CATEGORY_ICONS = {
  hematology: Droplets,
  biochemistry: Beaker,
  microbiology: Microscope,
  serology: Syringe,
  urinalysis: Droplets,
  radiology: Activity,
  pathology: Microscope,
  other: FlaskConical,
};

const TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Collected', value: 'collected' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
];

function useLabOrders(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({
    queryKey: ['lab-orders', params],
    queryFn: () => api.get(`/lab-orders?${qs.toString()}`),
  });
}

function useLabStats() {
  return useQuery({ queryKey: ['lab-stats'], queryFn: () => api.get('/lab-orders/stats') });
}

function TestRow({ test, index, orderId, onResultAdded, onStatusUpdated }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [showResultForm, setShowResultForm] = useState(false);
  const [result, setResult] = useState({ resultValue: '', unit: test.unit || '', normalRange: test.normalRange || '', remarks: '' });
  const updateStatusMut = useMutation({
    mutationFn: ({ status, testIndex }) => api.put(`/lab-orders/${orderId}/status`, { status, testIndex }),
    onSuccess: () => {
      toast.success('Sample collected');
      qc.invalidateQueries({ queryKey: ['lab-orders'] });
      onStatusUpdated?.();
    },
    onError: (e) => toast.error(e.message || 'Failed to update status'),
  });

  const addResultMut = useMutation({
    mutationFn: (data) => api.put(`/lab-orders/${orderId}/result`, data),
    onSuccess: () => {
      toast.success('Result saved');
      qc.invalidateQueries({ queryKey: ['lab-orders'] });
      setShowResultForm(false);
      onResultAdded?.();
    },
    onError: (e) => toast.error(e.message || 'Failed to save result'),
  });

  const CatIcon = CATEGORY_ICONS[test.category] || FlaskConical;

  const handleSaveResult = () => {
    if (!result.resultValue) { toast.error('Enter result value'); return; }
    addResultMut.mutate({ testIndex: index, ...result });
  };

  const testStatus = test.status || 'pending';

  return (
    <div className="rounded-lg border bg-card/50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <CatIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{test.testName}</span>
          <Badge variant={STATUS_CONFIG[testStatus]?.color || 'default'} size="sm" className="shrink-0">
            {STATUS_CONFIG[testStatus]?.label || testStatus}
          </Badge>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {testStatus === 'pending' && (
            <button
              onClick={() => updateStatusMut.mutate({ status: 'collected', testIndex: index })}
              disabled={updateStatusMut.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {updateStatusMut.isPending ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <TestTube className="h-3.5 w-3.5" />
              )}
              {updateStatusMut.isPending ? 'Collecting...' : 'Collect Sample'}
            </button>
          )}
          {(testStatus === 'collected' || testStatus === 'in-progress') && (
            <button
              onClick={() => setShowResultForm(!showResultForm)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all cursor-pointer"
            >
              <Beaker className="h-3.5 w-3.5" /> Enter Result
            </button>
          )}
        </div>
      </div>

      {testStatus === 'completed' && test.resultValue && (
        <div className="mt-2 ml-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold text-foreground">{test.resultValue} {test.unit}</span>
          {test.normalRange && <span className="text-muted-foreground">Normal: {test.normalRange}</span>}
          {test.remarks && <span className="text-muted-foreground italic">{test.remarks}</span>}
        </div>
      )}

      {showResultForm && (
        <div className="mt-2 ml-6 grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Result Value</label>
            <input
              value={result.resultValue}
              onChange={(e) => setResult({ ...result, resultValue: e.target.value })}
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
              placeholder="e.g. 5.2"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Unit</label>
            <input
              value={result.unit}
              onChange={(e) => setResult({ ...result, unit: e.target.value })}
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
              placeholder="mg/dL"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Normal Range</label>
            <input
              value={result.normalRange}
              onChange={(e) => setResult({ ...result, normalRange: e.target.value })}
              className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
              placeholder="4.0-5.6"
            />
          </div>
          <div className="flex items-end gap-1">
            <input
              value={result.remarks}
              onChange={(e) => setResult({ ...result, remarks: e.target.value })}
              className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-sm"
              placeholder="Remarks"
            />
            <button
              onClick={handleSaveResult}
              disabled={addResultMut.isPending}
              className="inline-flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-3 h-8 text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {addResultMut.isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setShowResultForm(false)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-input bg-background text-sm hover:bg-accent active:scale-95 transition-all cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderDetail({ order, onClose }) {
  const qc = useQueryClient();
  const toast = useToast();
  const verifyMut = useMutation({
    mutationFn: () => api.put(`/lab-orders/${order._id}/verify`),
    onSuccess: () => {
      toast.success('Order verified');
      qc.invalidateQueries({ queryKey: ['lab-orders'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const handleRefresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['lab-orders'] });
  }, [qc]);

  const allCompleted = order.tests?.every((t) => (t.status || 'pending') === 'completed' || t.status === 'cancelled');
  const anyPending = order.tests?.some((t) => (t.status || 'pending') === 'pending');

  return (
    <div className="border-t bg-muted/30">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm flex-1">
            <div>
              <span className="text-xs text-muted-foreground">Patient</span>
              <p className="font-medium">{order.patient?.firstName} {order.patient?.lastName}</p>
              <p className="text-xs text-muted-foreground font-mono">{order.patient?.uhid} · {displayPhone(order.patient?.phone)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Doctor</span>
              <p className="font-medium">{order.doctor?.user?.name || '—'}</p>
              <p className="text-xs text-muted-foreground">{order.doctor?.specialization || ''}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Order No</span>
              <p className="font-medium font-mono">{order.orderNo}</p>
              <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Verified</span>
              <p className="font-medium">{order.isVerified ? 'Yes' : 'No'}</p>
              {order.verifiedBy?.name && <p className="text-xs text-muted-foreground">by {order.verifiedBy.name}</p>}
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}><ChevronRight className="h-4 w-4" /></Button>
        </div>

        {order.notes && (
          <div className="text-sm">
            <span className="text-xs text-muted-foreground">Notes:</span>
            <p className="text-muted-foreground">{order.notes}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Tests ({order.tests?.length || 0})</h4>
            <div className="flex gap-2">
              {allCompleted && !order.isVerified && (
                <button
                  onClick={() => verifyMut.mutate()}
                  disabled={verifyMut.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {verifyMut.isPending ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5" />
                  )}
                  {verifyMut.isPending ? 'Verifying...' : 'Verify All'}
                </button>
              )}
              {anyPending && (
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all cursor-pointer"
                >
                  <Activity className="h-3.5 w-3.5" /> Refresh
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {order.tests?.map((test, i) => (
              <TestRow
                key={i}
                test={test}
                index={i}
                orderId={order._id}
                onResultAdded={handleRefresh}
                onStatusUpdated={handleRefresh}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateOrderForm({ onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [patientQuery, setPatientQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [customTests, setCustomTests] = useState([]);
  const [customTestInput, setCustomTestInput] = useState('');
  const [notes, setNotes] = useState('');

  const { data: searchResults, isLoading: searching } = usePatientSearch(patientQuery);
  const { data: doctorsData } = useDoctors();

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/lab-orders', d),
    onSuccess: () => {
      toast.success('Lab order created');
      qc.invalidateQueries({ queryKey: ['lab-orders'] });
      qc.invalidateQueries({ queryKey: ['lab-stats'] });
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const allTestNames = [
    ...selectedTests,
    ...customTests.map((name) => ({ name, category: 'other' })),
  ];

  const handleCreate = () => {
    if (!selectedPatient) { toast.error('Select a patient'); return; }
    if (!selectedDoctor) { toast.error('Select a doctor'); return; }
    if (allTestNames.length === 0) { toast.error('Add at least one test'); return; }
    createMutation.mutate({
      patient: selectedPatient._id,
      doctor: selectedDoctor,
      tests: allTestNames.map((t) => ({ testName: t.name, category: t.category })),
      notes,
    });
  };

  const toggleTest = (test) => {
    setSelectedTests((prev) =>
      prev.find((t) => t.name === test.name) ? prev.filter((t) => t.name !== test.name) : [...prev, test]
    );
  };

  const addCustomTest = () => {
    if (customTestInput.trim() && !customTests.includes(customTestInput.trim())) {
      setCustomTests([...customTests, customTestInput.trim()]);
      setCustomTestInput('');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">New Lab Order</CardTitle>
        <Button size="sm" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {!selectedPatient ? (
          <div className="space-y-3">
            <label className="text-sm font-medium">Search Patient</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background pl-10 pr-3 text-sm"
                placeholder="Search by name, phone, or UHID..."
              />
            </div>
            {patientQuery.length >= 2 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border divide-y">
                {searching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                ) : searchResults?.patients?.length > 0 ? (
                  searchResults.patients.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => { setSelectedPatient(p); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                    >
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.uhid} · {displayPhone(p.phone)}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">No patients found</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{selectedPatient.uhid} · {displayPhone(selectedPatient.phone)} · {selectedPatient.gender}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setSelectedPatient(null); setPatientQuery(''); }}>
                Change
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Doctor</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">Select doctor</option>
                {(doctorsData?.doctors || []).map((d) => (
                  <option key={d._id} value={d._id}>{d.user?.name} — {d.specialization}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Tests</label>
              <div className="max-h-64 overflow-y-auto rounded-lg border divide-y">
                {AVAILABLE_TESTS.map((test) => {
                  const selected = selectedTests.find((t) => t.name === test.name);
                  return (
                    <label
                      key={test.name}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={() => toggleTest(test)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{test.name}</span>
                      <Badge variant="outline" size="sm" className="ml-auto">{test.category}</Badge>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Tests</label>
              <div className="flex gap-2">
                <input
                  value={customTestInput}
                  onChange={(e) => setCustomTestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTest())}
                  className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="Type custom test name..."
                />
                <Button size="sm" variant="outline" onClick={addCustomTest}>Add</Button>
              </div>
              {customTests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {customTests.map((t, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {t}
                      <button onClick={() => setCustomTests(customTests.filter((_, j) => j !== i))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-20 rounded-lg border border-input bg-background p-3 text-sm resize-none"
                placeholder="Any instructions or notes for the lab..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleCreate} isLoading={createMutation.isPending}>
                <Plus className="h-4 w-4 sm:mr-2" /><FlaskConical className="h-4 w-4 sm:hidden" /><span className="hidden sm:inline">Create Order</span>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

const GRADIENTS = [
  'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)', // Violet to Pink
  'linear-gradient(135deg, #f472b6 0%, #f43f5e 100%)', // Pink to Rose
  'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)', // Cyan to Blue
  'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', // Teal to Greenish Teal
  'linear-gradient(135deg, #fb923c 0%, #f97316 100%)', // Orange to Rust
  'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)', // Light Purple to Indigo
  'linear-gradient(135deg, #f472b6 0%, #a855f7 100%)', // Pink to Purple
  'linear-gradient(135deg, #34d399 0%, #059669 100%)', // Mint to Emerald
];

const getGradient = (id) => {
  if (!id) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[idx];
};

function StatCard({ label, value, icon: Icon, color, bg, changeText, isIncrease }) {
  return (
    <Card className="flex-1 min-w-[220px] shadow-[var(--shadow-kpi)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden">
      <CardContent className="py-4 px-5 flex-1">
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase block">{label}</span>
            <p className="text-3xl font-extrabold text-foreground tracking-tight leading-none">{value}</p>
            {changeText && (
              <span className={cn("text-xs font-semibold block mt-1", isIncrease ? 'text-emerald-500' : 'text-rose-500')}>
                {changeText}
              </span>
            )}
          </div>
          <div className={cn('rounded-xl p-3 shrink-0 flex items-center justify-center', bg)}>
            <Icon className="h-5.5 w-5.5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LabOrdersPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const { data, isLoading, error } = useLabOrders({ status: activeTab || undefined, search: search || undefined, limit: 100 });
  const { data: stats } = useLabStats();
  const orders = data?.orders || [];
  const toast = useToast();
  useEffect(() => { if (error) toast.error(error.message || 'Failed to load'); }, [error]);

  const statusCounts = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const kpiCards = stats ? [
    {
      label: 'Total Orders',
      value: stats.total.toLocaleString(),
      icon: FlaskConical,
      color: '#3b82f6',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      changeText: 'All registered requests',
      isIncrease: true,
    },
    {
      label: 'Pending',
      value: stats.pending.toLocaleString(),
      icon: Clock,
      color: '#fbbf24',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      changeText: 'Awaiting collection',
      isIncrease: false,
    },
    {
      label: 'Today\'s Orders',
      value: stats.todayOrders.toLocaleString(),
      icon: Activity,
      color: '#a855f7',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      changeText: 'Ordered within last 24h',
      isIncrease: true,
    },
    {
      label: 'Completed',
      value: stats.completed.toLocaleString(),
      icon: CheckCircle,
      color: '#10b981',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      changeText: 'Reports fully verified',
      isIncrease: true,
    },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Laboratory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Lab test orders and results
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 sm:mr-2" /><FlaskConical className="h-4 w-4 sm:hidden" /><span className="hidden sm:inline">{showForm ? 'Close Form' : 'New Order'}</span>
        </Button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      )}

      {/* Controls Row */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full bg-card p-3 rounded-xl border border-border/50 shadow-sm">
          {/* Left Side: Search Form */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient, order no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 rounded-xl border-border/20 bg-muted/15 focus-visible:bg-background focus:ring-1 focus:ring-primary h-9 text-xs"
            />
          </div>

          {/* Right Side: Tab-like Buttons for All, Pending, Collected, Processing, Completed */}
          <div className="flex flex-wrap items-center gap-1.5 bg-muted/30 dark:bg-muted/10 p-1 rounded-xl border border-border/50">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              const count = tab.value ? statusCounts[tab.value] : null;
              return (
                <button
                  key={tab.value}
                  onClick={() => { setActiveTab(tab.value); setExpandedId(null); }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  )}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono",
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showForm && (
        <CreateOrderForm onClose={() => setShowForm(false)} />
      )}

      {/* Orders Table Card */}
      <Card>
        <CardContent className="pt-6">
          {error ? (<div className="py-8 text-center"><p className="text-destructive font-medium">Failed to load</p><p className="text-xs text-muted-foreground mt-1">{error.message}</p></div>) : isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {search ? 'No orders match your search' : activeTab ? `No ${activeTab} orders` : 'No lab orders yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                    <tr className="border-b text-left text-[10px] font-bold text-muted-foreground/55 uppercase tracking-widest">
                      <th className="pb-3 pr-2 w-10 text-center font-semibold">#</th>
                      <th className="pb-3 font-semibold">Order No</th>
                      <th className="pb-3 font-semibold">Patient</th>
                      <th className="pb-3 font-semibold hidden md:table-cell">Doctor</th>
                      <th className="pb-3 font-semibold hidden md:table-cell">Tests Status</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold hidden lg:table-cell">Ordered Date</th>
                      <th className="pb-3 font-semibold w-24 text-right pr-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                  {orders.map((o, idx) => {
                    const isExpanded = expandedId === o._id;
                    const completedCount = o.tests?.filter((t) => (t.status || 'pending') === 'completed').length || 0;
                    const totalTests = o.tests?.length || 0;

                    return (
                      <Fragment key={o._id}>
                        <tr
                          className={cn(
                            "border-b last:border-0 hover:bg-muted/40 transition-colors cursor-pointer",
                            isExpanded && "bg-muted/20 hover:bg-muted/30 border-b-0"
                          )}
                          onClick={() => setExpandedId(isExpanded ? null : o._id)}
                        >
                          <td className="py-3.5 pr-2 text-center text-xs text-muted-foreground font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 text-sm">
                            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground dark:text-zinc-400 bg-muted/40 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-border/60 dark:border-zinc-800/80 shadow-sm" onClick={(e) => e.stopPropagation()}>
                              {o.orderNo}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(o.orderNo);
                                  setCopiedId(o._id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="text-muted-foreground/60 hover:text-foreground dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors p-0.5 rounded cursor-pointer shrink-0"
                                title="Copy Order No"
                              >
                                {copiedId === o._id ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </span>
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white font-black text-xs shadow-md border border-white/10"
                                style={{ background: getGradient(o.patient?._id) }}
                              >
                                {o.patient?.firstName?.charAt(0)}{o.patient?.lastName?.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm hover:text-primary transition-colors">
                                  {o.patient?.firstName} {o.patient?.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">{o.patient?.uhid}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 hidden md:table-cell">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-foreground">{o.doctor?.user?.name || '—'}</span>
                              <span className="text-xs text-muted-foreground">{o.doctor?.specialization || ''}</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-sm font-medium text-foreground hidden md:table-cell">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-foreground">{completedCount}/{totalTests} Completed</span>
                              <span className="text-[10px] text-muted-foreground font-mono">({totalTests > 0 ? Math.round((completedCount/totalTests)*100) : 0}%)</span>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <Badge
                              variant={STATUS_CONFIG[o.status]?.color || 'default'}
                              className="capitalize px-2 py-0.5 font-semibold text-[11px] border-border/10"
                            >
                              {STATUS_CONFIG[o.status]?.label || o.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-xs text-muted-foreground whitespace-nowrap font-medium font-mono hidden lg:table-cell">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3.5 text-right pr-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer"
                                title="Toggle Expand"
                              >
                                {isExpanded ? <ChevronDown className="h-[18px] w-[18px]" /> : <ChevronRight className="h-[18px] w-[18px]" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="p-0 bg-muted/10 border-b">
                              <OrderDetail order={o} onClose={() => setExpandedId(null)} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
