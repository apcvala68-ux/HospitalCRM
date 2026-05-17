import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useMyDoctorProfile } from '../../hooks/useDoctor';
import { useCreateVitals } from '../../hooks/useVitals';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Activity, Check, AlertTriangle, Heart, Thermometer, Weight, Wind, Droplets } from 'lucide-react';

function useWaitingPatients(doctorId) {
  return useQuery({
    queryKey: ['queue', 'waiting', doctorId],
    queryFn: () => api.get(`/queue/current/${doctorId}`),
    enabled: !!doctorId,
    refetchInterval: 10000,
  });
}

export function TriagePage() {
  const { data: profileData } = useMyDoctorProfile();
  const doctorId = profileData?.doctor?._id;
  const { data: queueData, isLoading } = useWaitingPatients(doctorId);
  const createVitals = useCreateVitals();
  const qc = useQueryClient();
  const toast = useToast();

  const [selectedToken, setSelectedToken] = useState(null);
  const [form, setForm] = useState({
    bpSystolic: '', bpDiastolic: '', pulse: '', temperature: '',
    weight: '', height: '', spo2: '', respiratoryRate: '', bloodSugar: '',
    chiefComplaint: '', painScore: '', triageNotes: '',
  });

  const waiting = queueData?.waiting || [];
  const inTriage = queueData?.inTriage || [];
  const ready = queueData?.ready || [];

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!selectedToken || !form.chiefComplaint) {
      toast.error('Select patient and enter chief complaint');
      return;
    }
    try {
      await createVitals.mutateAsync({
        patient: selectedToken.patient._id,
        token: selectedToken._id,
        bpSystolic: form.bpSystolic ? +form.bpSystolic : undefined,
        bpDiastolic: form.bpDiastolic ? +form.bpDiastolic : undefined,
        pulse: form.pulse ? +form.pulse : undefined,
        temperature: form.temperature ? +form.temperature : undefined,
        weight: form.weight ? +form.weight : undefined,
        height: form.height ? +form.height : undefined,
        spo2: form.spo2 ? +form.spo2 : undefined,
        respiratoryRate: form.respiratoryRate ? +form.respiratoryRate : undefined,
        bloodSugar: form.bloodSugar ? +form.bloodSugar : undefined,
        chiefComplaint: form.chiefComplaint,
        painScore: form.painScore ? +form.painScore : undefined,
        triageNotes: form.triageNotes || undefined,
      });
      qc.invalidateQueries({ queryKey: ['queue'] });
      setSelectedToken(null);
      setForm({ bpSystolic: '', bpDiastolic: '', pulse: '', temperature: '', weight: '', height: '', spo2: '', respiratoryRate: '', bloodSugar: '', chiefComplaint: '', painScore: '', triageNotes: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const isAbnormal = (type, value) => {
    if (!value) return false;
    const v = +value;
    if (type === 'bpSystolic') return v > 140 || v < 90;
    if (type === 'bpDiastolic') return v > 90 || v < 60;
    if (type === 'pulse') return v > 100 || v < 60;
    if (type === 'temperature') return v > 99 || v < 96;
    if (type === 'spo2') return v < 95;
    return false;
  };

  const patientList = [...waiting, ...inTriage, ...ready];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nurse Station — Triage</h1>
        <p className="text-muted-foreground">Record vitals and chief complaint before doctor consultation</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Waiting</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-yellow-600">{waiting.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Triage</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-blue-600">{inTriage.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Ready for Doctor</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">{ready.length}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Patient Queue</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
            ) : patientList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No patients in queue</p>
            ) : (
              <div className="space-y-2">
                {patientList.map(t => {
                  const isReady = t.status === 'ready';
                  const isInTriage = t.status === 'triage';
                  return (
                    <div
                      key={t._id}
                      className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${selectedToken?._id === t._id ? 'border-primary bg-primary/5' : ''} ${isReady ? 'border-green-300 bg-green-50 dark:bg-green-950' : ''}`}
                      onClick={() => { setSelectedToken(t); if (!isInTriage && !isReady) api.put(`/queue/${t._id}/call`).then(() => qc.invalidateQueries({ queryKey: ['queue'] })); }}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isReady ? 'bg-green-100 text-green-700' : isInTriage ? 'bg-blue-100 text-blue-700' : 'bg-primary/10 text-primary'}`}>
                          {t.tokenNo}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{t.patient?.firstName} {t.patient?.lastName}</p>
                          <p className="text-xs text-muted-foreground">{t.patient?.uhid} · {t.patient?.gender} · {t.patient?.phone}</p>
                        </div>
                      </div>
                      <Badge variant={isReady ? 'success' : isInTriage ? 'info' : 'warning'}>{t.status}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedToken ? `Vitals — ${selectedToken.patient?.firstName} ${selectedToken.patient?.lastName}` : 'Select a Patient'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedToken ? (
              <p className="text-sm text-muted-foreground text-center py-8">Click a patient from the queue to record vitals</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">BP Systolic</label>
                    <Input type="number" placeholder="120" value={form.bpSystolic} onChange={e => updateForm('bpSystolic', e.target.value)} className={isAbnormal('bpSystolic', form.bpSystolic) ? 'border-red-400' : ''} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">BP Diastolic</label>
                    <Input type="number" placeholder="80" value={form.bpDiastolic} onChange={e => updateForm('bpDiastolic', e.target.value)} className={isAbnormal('bpDiastolic', form.bpDiastolic) ? 'border-red-400' : ''} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Heart className="h-3 w-3" /> Pulse (bpm)</label>
                    <Input type="number" placeholder="72" value={form.pulse} onChange={e => updateForm('pulse', e.target.value)} className={isAbnormal('pulse', form.pulse) ? 'border-orange-400' : ''} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Thermometer className="h-3 w-3" /> Temp (°F)</label>
                    <Input type="number" placeholder="98.6" step="0.1" value={form.temperature} onChange={e => updateForm('temperature', e.target.value)} className={isAbnormal('temperature', form.temperature) ? 'border-orange-400' : ''} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Weight className="h-3 w-3" /> Weight (kg)</label>
                    <Input type="number" placeholder="70" step="0.1" value={form.weight} onChange={e => updateForm('weight', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Height (cm)</label>
                    <Input type="number" placeholder="170" value={form.height} onChange={e => updateForm('height', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Droplets className="h-3 w-3" /> SpO2 (%)</label>
                    <Input type="number" placeholder="98" value={form.spo2} onChange={e => updateForm('spo2', e.target.value)} className={isAbnormal('spo2', form.spo2) ? 'border-red-400' : ''} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Wind className="h-3 w-3" /> Resp. Rate</label>
                    <Input type="number" placeholder="18" value={form.respiratoryRate} onChange={e => updateForm('respiratoryRate', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Blood Sugar (mg/dL)</label>
                  <Input type="number" placeholder="100" value={form.bloodSugar} onChange={e => updateForm('bloodSugar', e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Pain Score (0-10)</label>
                  <div className="flex gap-1">
                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button key={n} type="button" onClick={() => updateForm('painScore', n)} className={`flex-1 h-8 rounded text-xs font-bold transition-colors ${+form.painScore === n ? (n <= 3 ? 'bg-green-500 text-white' : n <= 6 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white') : 'bg-muted hover:bg-muted/80'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Chief Complaint *</label>
                  <Input value={form.chiefComplaint} onChange={e => updateForm('chiefComplaint', e.target.value)} placeholder="e.g. Fever since 3 days, headache" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Triage Notes</label>
                  <Input value={form.triageNotes} onChange={e => updateForm('triageNotes', e.target.value)} placeholder="Additional observations..." />
                </div>

                <Button onClick={handleSubmit} disabled={createVitals.isPending || !form.chiefComplaint} className="w-full">
                  <Check className="mr-2 h-4 w-4" />
                  {createVitals.isPending ? 'Recording...' : 'Record Vitals & Mark Ready'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
