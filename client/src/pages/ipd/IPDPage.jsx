import { useState } from 'react';
import { useWards, useWardBeds, useActiveAdmissions, useAdmission, useAdmitPatient, useDischarge, useAddVitals, useAddNote, useMarkBedClean } from '../../hooks/useIPD';
import { usePatientSearch } from '../../hooks/usePatients';
import { useDoctors } from '../../hooks/useDoctor';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/useToast';
import { BedDouble, UserPlus, Search, Activity, FileText, LogOut, CheckCircle, Stethoscope } from 'lucide-react';

export function IPDPage() {
  const [activeTab, setActiveTab] = useState('beds');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedBed, setSelectedBed] = useState('');
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [vitalsForm, setVitalsForm] = useState({ bp: '', temperature: '', pulse: '', spo2: '' });
  const [noteInput, setNoteInput] = useState('');
  const [dischargeSummary, setDischargeSummary] = useState('');

  const { data: wardsData } = useWards();
  const { data: bedsData } = useWardBeds(selectedWard);
  const { data: activeData } = useActiveAdmissions();
  const { data: admissionData } = useAdmission(selectedAdmission);
  const { data: searchResults } = usePatientSearch(patientSearch);
  const { data: doctorsData } = useDoctors();

  const admitPatient = useAdmitPatient();
  const discharge = useDischarge();
  const addVitals = useAddVitals();
  const addNote = useAddNote();
  const markClean = useMarkBedClean();
  const toast = useToast();

  const wards = wardsData?.wards || [];
  const beds = bedsData?.beds || [];
  const admissions = activeData?.admissions || [];
  const doctors = doctorsData?.doctors || [];
  const admission = admissionData?.admission;

  const handleAdmit = async () => {
    if (!selectedPatient || !selectedBed || !diagnosis) {
      toast.error('Select patient, bed, and enter diagnosis');
      return;
    }
    await admitPatient.mutateAsync({
      patientId: selectedPatient._id,
      bedId: selectedBed,
      diagnosis,
      admittingDoctorId: doctors[0]?._id,
    });
    setSelectedPatient(null);
    setSelectedBed('');
    setDiagnosis('');
    setPatientSearch('');
  };

  const handleDischarge = async () => {
    if (!selectedAdmission) return;
    await discharge.mutateAsync({ id: selectedAdmission, data: { dischargeSummary } });
    setSelectedAdmission(null);
    setDischargeSummary('');
  };

  const handleVitals = async () => {
    if (!selectedAdmission) return;
    await addVitals.mutateAsync({ id: selectedAdmission, data: vitalsForm });
    setVitalsForm({ bp: '', temperature: '', pulse: '', spo2: '' });
  };

  const handleNote = async () => {
    if (!selectedAdmission || !noteInput) return;
    await addNote.mutateAsync({ id: selectedAdmission, data: { note: noteInput, category: 'nursing' } });
    setNoteInput('');
  };

  const statusColor = { available: 'bg-green-500', occupied: 'bg-blue-500', dirty: 'bg-yellow-500', maintenance: 'bg-red-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IPD / Ward Management</h1>
          <p className="text-muted-foreground">Manage admissions, beds, and patient care</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeTab === 'beds' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('beds')}>Bed View</Button>
          <Button variant={activeTab === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('active')}>Active Patients</Button>
          <Button variant={activeTab === 'admit' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('admit')}>Admit</Button>
          <Button variant={activeTab === 'detail' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('detail')}>Patient Detail</Button>
        </div>
      </div>

      {activeTab === 'beds' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select Ward</option>
              {wards.map((w) => <option key={w._id} value={w._id}>{w.name} (₹{w.ratePerDay}/day)</option>)}
            </select>
          </div>
          {beds.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {beds.map((bed) => (
                <div key={bed._id} className={`rounded-lg border p-4 ${bed.status === 'occupied' ? 'border-blue-300 bg-blue-50 dark:bg-blue-950' : bed.status === 'dirty' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold">{bed.bedNo}</span>
                    <span className={`h-3 w-3 rounded-full ${statusColor[bed.status]}`} />
                  </div>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">{bed.status}</p>
                  {bed.currentPatient && (
                    <p className="mt-1 text-xs font-medium">
                      {bed.currentPatient?.firstName} {bed.currentPatient?.lastName}
                    </p>
                  )}
                  {bed.status === 'dirty' && (
                    <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => markClean.mutate(bed._id)}>
                      <CheckCircle className="mr-1 h-3 w-3" /> Mark Clean
                    </Button>
                  )}
                  {bed.status === 'available' && (
                    <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => { setSelectedBed(bed._id); setActiveTab('admit'); }}>
                      Admit
                    </Button>
                  )}
                  {bed.status === 'occupied' && (
                    <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => {
                      const adm = admissions.find(a => a.bed?._id === bed._id || a.bed === bed._id);
                      if (adm) { setSelectedAdmission(adm._id); setActiveTab('detail'); }
                    }}>
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'active' && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Active Admissions ({admissions.length})</CardTitle></CardHeader>
          <CardContent>
            {admissions.length === 0 ? <p className="text-sm text-muted-foreground">No active admissions</p> : (
              <div className="space-y-2">
                {admissions.map((a) => (
                  <div key={a._id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{a.patient?.firstName} {a.patient?.lastName} — {a.patient?.uhid}</p>
                      <p className="text-xs text-muted-foreground">
                        Bed: {a.bed?.bedNo} · Ward: {a.ward?.name} · Dr. {a.admittingDoctor?.user?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{new Date(a.createdAt).toLocaleDateString()}</Badge>
                      <Button size="sm" onClick={() => { setSelectedAdmission(a._id); setActiveTab('detail'); }}>View</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'admit' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Admit Patient</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient</label>
                <Input placeholder="Search patient..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
                {searchResults?.patients?.length > 0 && (
                  <div className="max-h-32 overflow-y-auto rounded-lg border">
                    {searchResults.patients.map((p) => (
                      <button key={p._id} type="button" onClick={() => { setSelectedPatient(p); setPatientSearch(`${p.firstName} ${p.lastName} (${p.uhid})`); }} className="w-full px-3 py-2 text-left text-sm hover:bg-accent">
                        {p.firstName} {p.lastName} — {p.uhid}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bed</label>
                <select value={selectedBed} onChange={(e) => setSelectedBed(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Select bed</option>
                  {beds.filter(b => b.status === 'available').map((b) => (
                    <option key={b._id} value={b._id}>{b.bedNo}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Diagnosis</label>
                <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <Button onClick={handleAdmit} disabled={admitPatient.isPending} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" /> Admit Patient
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Available Beds</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {beds.filter(b => b.status === 'available').map((b) => (
                  <button key={b._id} type="button" onClick={() => setSelectedBed(b._id)} className={`rounded-lg border p-3 text-center text-sm transition-colors ${selectedBed === b._id ? 'border-primary bg-primary/10' : 'hover:bg-accent'}`}>
                    {b.bedNo}
                  </button>
                ))}
                {beds.filter(b => b.status === 'available').length === 0 && (
                  <p className="col-span-3 text-sm text-muted-foreground">No available beds</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'detail' && admission && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{admission.patient?.firstName} {admission.patient?.lastName}</h2>
              <p className="text-sm text-muted-foreground">
                {admission.patient?.uhid} · Bed {admission.bed?.bedNo} · {admission.ward?.name} · Admitted: {new Date(admission.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button variant="destructive" onClick={handleDischarge} disabled={discharge.isPending}>
              <LogOut className="mr-2 h-4 w-4" /> Discharge
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Vitals</CardTitle></CardHeader>
              <CardContent>
                {admission.vitals?.length > 0 && (
                  <div className="mb-3 space-y-1 text-sm">
                    {admission.vitals.slice(-3).reverse().map((v, i) => (
                      <div key={i} className="rounded bg-muted p-2 text-xs">
                        <span className="text-muted-foreground">{new Date(v.recordedAt).toLocaleString()}</span>
                        <div className="mt-1">BP: {v.bp} | Pulse: {v.pulse} | Temp: {v.temperature}°C | SpO2: {v.spo2}%</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="BP" value={vitalsForm.bp} onChange={(e) => setVitalsForm({ ...vitalsForm, bp: e.target.value })} />
                  <Input placeholder="Temp" value={vitalsForm.temperature} onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })} />
                  <Input placeholder="Pulse" value={vitalsForm.pulse} onChange={(e) => setVitalsForm({ ...vitalsForm, pulse: e.target.value })} />
                  <Input placeholder="SpO2" value={vitalsForm.spo2} onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: e.target.value })} />
                </div>
                <Button size="sm" onClick={handleVitals} disabled={addVitals.isPending} className="mt-2 w-full">Record Vitals</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Daily Notes</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-3 max-h-40 space-y-1 overflow-y-auto text-sm">
                  {admission.dailyNotes?.slice().reverse().map((n, i) => (
                    <div key={i} className="rounded bg-muted p-2 text-xs">
                      <span className="font-medium capitalize">{n.category}</span>: {n.note}
                      <span className="ml-2 text-muted-foreground">{new Date(n.date).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add note..." value={noteInput} onChange={(e) => setNoteInput(e.target.value)} />
                  <Button size="sm" onClick={handleNote} disabled={addNote.isPending || !noteInput}>Add</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Diet & Discharge</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Current Diet</label>
                  <p className="font-medium capitalize">{admission.diet}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Discharge Summary</label>
                  <textarea value={dischargeSummary} onChange={(e) => setDischargeSummary(e.target.value)} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Write discharge summary..." />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
