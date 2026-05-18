import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { usePatientSearch } from '../../hooks/usePatients';
import { useDoctors } from '../../hooks/useDoctor';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  FlaskConical, Plus, Search, X, CheckCircle, Clock, AlertCircle,
  ChevronDown, ChevronRight, TestTube, User,
  Beaker, Syringe, Microscope, Droplets, Activity,
} from 'lucide-react';

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
              <p className="text-xs text-muted-foreground font-mono">{order.patient?.uhid} · {order.patient?.phone}</p>
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
                        <p className="text-xs text-muted-foreground font-mono">{p.uhid} · {p.phone}</p>
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
                  <p className="text-xs text-muted-foreground font-mono">{selectedPatient.uhid} · {selectedPatient.phone} · {selectedPatient.gender}</p>
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
                <Plus className="mr-2 h-4 w-4" /> Create Order
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function LabOrdersPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const { data, isLoading } = useLabOrders({ status: activeTab || undefined, search: search || undefined, limit: 100 });
  const { data: stats } = useLabStats();
  const orders = data?.orders || [];

  const statusCounts = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laboratory</h1>
          <p className="text-muted-foreground">Lab test orders and results</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> {showForm ? 'Close' : 'New Order'}
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Total Orders', value: stats.total, icon: FlaskConical, color: 'text-blue-600' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600' },
            { label: 'Today', value: stats.todayOrders, icon: AlertCircle, color: 'text-purple-600' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600' },
          ].map((s) => (
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

      <div className="flex items-center gap-4">
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setExpandedId(null); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.value && statusCounts[tab.value] > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">({statusCounts[tab.value]})</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-3 text-sm"
            placeholder="Search orders..."
          />
        </div>
      </div>

      {showForm && (
        <CreateOrderForm onClose={() => setShowForm(false)} />
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Orders ({data?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {search ? 'No orders match your search' : activeTab ? `No ${activeTab} orders` : 'No lab orders yet'}
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((o) => {
                const isExpanded = expandedId === o._id;
                const completedCount = o.tests?.filter((t) => (t.status || 'pending') === 'completed').length || 0;
                const totalTests = o.tests?.length || 0;

                return (
                  <div key={o._id}>
                    <div
                      className="flex items-center gap-3 py-3 px-1 hover:bg-muted/30 rounded-lg cursor-pointer transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : o._id)}
                    >
                      <div className="text-muted-foreground">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 grid grid-cols-5 gap-2 text-sm items-center min-w-0">
                        <div>
                          <p className="font-mono text-xs truncate">{o.orderNo}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-medium truncate">{o.patient?.firstName} {o.patient?.lastName}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate">{o.patient?.uhid}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {completedCount}/{totalTests} tests
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant={STATUS_CONFIG[o.status]?.color || 'default'} size="sm">
                            {STATUS_CONFIG[o.status]?.label || o.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <OrderDetail order={o} onClose={() => setExpandedId(null)} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
