import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Badge } from '../../components/ui/badge';
import {
  FileText, FlaskConical, DollarSign, Clock, Calendar, BedDouble,
  Syringe, Shield, Scissors, MessageSquare, Heart, Droplets, AlertTriangle,
  Pill, Star,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { PatientHeroHeader } from './components/PatientHeroHeader';
import { PatientStatsBar } from './components/PatientStatsBar';
import {
  PatientTabPrescriptions,
  PatientTabLabOrders,
  PatientTabAppointments,
  PatientTabBilling,
} from './components/PatientTabContent';

function usePatientHistory(id) {
  return useQuery({
    queryKey: ['patient-history', id],
    queryFn: () => api.get(`/patients/${id}/history`),
    enabled: !!id,
  });
}

const statusVariant = {
  pending: 'warning', completed: 'success', cancelled: 'destructive',
  'with-doctor': 'info', waiting: 'warning', called: 'info',
  paid: 'success', partial: 'warning', unpaid: 'destructive',
  scheduled: 'warning', confirmed: 'info', 'checked-in': 'info',
  active: 'success', discharged: 'secondary', expired: 'destructive',
  collected: 'info', stored: 'success', issued: 'warning',
  'in-progress': 'info', 'pre-op': 'info', postponed: 'secondary',
  open: 'warning', resolved: 'success', closed: 'secondary',
  'pre-auth': 'warning', submitted: 'info', 'under-review': 'info',
  approved: 'success', 'partially-approved': 'warning', rejected: 'destructive', settled: 'success',
  'no-show': 'destructive',
};

const severityColor = {
  mild: 'bg-green-500', moderate: 'bg-yellow-500', severe: 'bg-orange-500', 'life-threatening': 'bg-red-600'
};

export function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = usePatientHistory(id);
  const toast = useToast();
  useEffect(() => { if (error) toast.error(error.message || 'Failed to load patient'); }, [error, toast]);

  const patient = data?.patient;
  const summary = data?.summary;
  const allergies = data?.allergies ?? [];
  const prescriptions = data?.prescriptions ?? [];
  const labOrders = data?.labOrders ?? [];
  const billings = data?.billings ?? [];
  const appointments = data?.appointments ?? [];
  const ipdAdmissions = data?.ipdAdmissions ?? [];
  const queueTokens = data?.queueTokens ?? [];
  const marRecords = data?.marRecords ?? [];
  const insuranceClaims = data?.insuranceClaims ?? [];
  const bloodRecords = data?.bloodRecords ?? [];
  const surgeries = data?.surgeries ?? [];
  const feedbacks = data?.feedbacks ?? [];
  const medicalHistory = data?.medicalHistory ?? {};

  const dob = patient?.dob;
  const age = useMemo(() => {
    if (!dob) return '?';
    const now = new Date();
    return Math.floor((now.getTime() - new Date(dob).getTime()) / 31557600000);
  }, [dob]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="py-12 text-center space-y-1">
        <p className="text-destructive font-medium">{error ? 'Failed to load patient' : 'Patient not found'}</p>
        {error && <p className="text-xs text-muted-foreground">{error.message}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hero Header */}
      <PatientHeroHeader
        patient={patient}
        age={age}
        allergies={allergies}
        medicalHistory={medicalHistory}
        id={id}
        navigate={navigate}
      />

      {/* Stats Bar */}
      <PatientStatsBar summary={summary} />

      {/* Tabs */}
      <Tabs defaultValue="prescriptions">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/30 p-1">
          <TabsTrigger value="prescriptions" className="text-xs gap-1.5 rounded-lg">
            <FileText className="h-3 w-3" />Prescriptions {prescriptions.length > 0 && <span className="ml-0.5 opacity-60">({prescriptions.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="lab" className="text-xs gap-1.5 rounded-lg">
            <FlaskConical className="h-3 w-3" />Lab Orders {labOrders.length > 0 && <span className="ml-0.5 opacity-60">({labOrders.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="appointments" className="text-xs gap-1.5 rounded-lg">
            <Calendar className="h-3 w-3" />Appointments {appointments.length > 0 && <span className="ml-0.5 opacity-60">({appointments.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="billing" className="text-xs gap-1.5 rounded-lg">
            <DollarSign className="h-3 w-3" />Billing {billings.length > 0 && <span className="ml-0.5 opacity-60">({billings.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="visits" className="text-xs gap-1.5 rounded-lg">
            <Clock className="h-3 w-3" />Visits {queueTokens.length > 0 && <span className="ml-0.5 opacity-60">({queueTokens.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="ipd" className="text-xs gap-1.5 rounded-lg">
            <BedDouble className="h-3 w-3" />IPD {ipdAdmissions.length > 0 && <span className="ml-0.5 opacity-60">({ipdAdmissions.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="mar" className="text-xs gap-1.5 rounded-lg">
            <Syringe className="h-3 w-3" />MAR {marRecords.length > 0 && <span className="ml-0.5 opacity-60">({marRecords.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="surgeries" className="text-xs gap-1.5 rounded-lg">
            <Scissors className="h-3 w-3" />Surgeries {surgeries.length > 0 && <span className="ml-0.5 opacity-60">({surgeries.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="insurance" className="text-xs gap-1.5 rounded-lg">
            <Shield className="h-3 w-3" />Insurance {insuranceClaims.length > 0 && <span className="ml-0.5 opacity-60">({insuranceClaims.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="blood" className="text-xs gap-1.5 rounded-lg">
            <Droplets className="h-3 w-3" />Blood {bloodRecords.length > 0 && <span className="ml-0.5 opacity-60">({bloodRecords.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="allergies" className="text-xs gap-1.5 rounded-lg">
            <AlertTriangle className="h-3 w-3" />Allergies {allergies.length > 0 && <span className="ml-0.5 opacity-60">({allergies.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1.5 rounded-lg">
            <Heart className="h-3 w-3" />Medical History
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs gap-1.5 rounded-lg">
            <MessageSquare className="h-3 w-3" />Feedback {feedbacks.length > 0 && <span className="ml-0.5 opacity-60">({feedbacks.length})</span>}
          </TabsTrigger>
        </TabsList>

        <div className="mt-3">
          <TabsContent value="prescriptions">
            <PatientTabPrescriptions prescriptions={prescriptions} />
          </TabsContent>

          <TabsContent value="lab">
            <PatientTabLabOrders labOrders={labOrders} />
          </TabsContent>

          <TabsContent value="appointments">
            <PatientTabAppointments appointments={appointments} />
          </TabsContent>

          <TabsContent value="billing">
            <PatientTabBilling billings={billings} />
          </TabsContent>

          <TabsContent value="visits">
            <VisitsTab queueTokens={queueTokens} />
          </TabsContent>

          <TabsContent value="ipd">
            <IPDTab ipdAdmissions={ipdAdmissions} />
          </TabsContent>

          <TabsContent value="mar">
            <MARTab marRecords={marRecords} />
          </TabsContent>

          <TabsContent value="surgeries">
            <SurgeriesTab surgeries={surgeries} />
          </TabsContent>

          <TabsContent value="insurance">
            <InsuranceTab insuranceClaims={insuranceClaims} />
          </TabsContent>

          <TabsContent value="blood">
            <BloodTab bloodRecords={bloodRecords} />
          </TabsContent>

          <TabsContent value="allergies">
            <AllergiesTab allergies={allergies} />
          </TabsContent>

          <TabsContent value="history">
            <MedicalHistoryTab medicalHistory={medicalHistory} />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackTab feedbacks={feedbacks} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

/* ── Inline small tabs ───────────────────────────────────── */

function EmptyState({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
      <Icon className="h-8 w-8 opacity-30" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function SimpleTable({ headers, rows }) {
  return (
    <div className="rounded-xl border border-border/40 overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30 text-left text-xs text-muted-foreground bg-muted/20">
              {headers.map(h => <th key={h} className="py-2.5 px-4 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors">
                {row.map((cell, j) => <td key={j} className="py-2.5 px-4">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VisitsTab({ queueTokens }) {
  if (!queueTokens.length) return <EmptyState icon={Clock} label="No queue visits recorded" />;
  return (
    <SimpleTable
      headers={['Token', 'Date', 'Doctor', 'Department', 'Token No', 'Status']}
      rows={queueTokens.map(q => [
        <span className="font-mono text-xs">{q.tokenNo}</span>,
        new Date(q.date).toLocaleDateString('en-IN'),
        q.doctor?.user?.name ?? '--',
        q.department ?? '--',
        <span className="font-bold">{q.tokenNumber}</span>,
        <Badge variant={statusVariant[q.status]} className="text-[10px]">{q.status}</Badge>,
      ])}
    />
  );
}

function IPDTab({ ipdAdmissions }) {
  if (!ipdAdmissions.length) return <EmptyState icon={BedDouble} label="No IPD admissions recorded" />;
  return (
    <div className="space-y-2">
      {ipdAdmissions.map(adm => (
        <div key={adm._id} className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <BedDouble className="h-4 w-4 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">{adm.admissionNo}</p>
                <p className="text-xs text-muted-foreground">{adm.ward?.name} · Bed {adm.bed?.bedNo ?? adm.bedNo} · {adm.admittingDoctor?.user?.name}</p>
              </div>
            </div>
            <Badge variant={statusVariant[adm.status]}>{adm.status}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="bg-muted/20 rounded-lg p-2"><span className="text-muted-foreground">Admitted: </span>{new Date(adm.admissionDate).toLocaleDateString('en-IN')}</div>
            {adm.dischargeDate && <div className="bg-muted/20 rounded-lg p-2"><span className="text-muted-foreground">Discharged: </span>{new Date(adm.dischargeDate).toLocaleDateString('en-IN')}</div>}
            {adm.diagnosis && <div className="bg-muted/20 rounded-lg p-2 md:col-span-2"><span className="text-muted-foreground">Diagnosis: </span>{adm.diagnosis}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function MARTab({ marRecords }) {
  if (!marRecords.length) return <EmptyState icon={Pill} label="No MAR records" />;
  return (
    <div className="space-y-2">
      {marRecords.map(mar => (
        <div key={mar._id} className="rounded-xl border border-border/40 bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pill className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{mar.medication} — {mar.dosage}</p>
                <p className="text-xs text-muted-foreground">{mar.route} · {mar.frequency} · Since {new Date(mar.startDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
            <Badge variant={statusVariant[mar.status]}>{mar.status}</Badge>
          </div>
          {mar.administrations?.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border/20">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/20 text-muted-foreground bg-muted/20">
                    {['Scheduled', 'Given At', 'Dose', 'Status', 'Vitals', 'Remarks'].map(h => (
                      <th key={h} className="py-2 px-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mar.administrations.slice(-10).reverse().map((a, i) => (
                    <tr key={i} className="border-b border-border/10 last:border-0">
                      <td className="py-1.5 px-3">{a.scheduledTime}</td>
                      <td className="py-1.5 px-3">{a.administeredAt ? new Date(a.administeredAt).toLocaleString() : '--'}</td>
                      <td className="py-1.5 px-3">{a.dose ?? '--'}</td>
                      <td className="py-1.5 px-3"><Badge variant={statusVariant[a.status]} className="text-[10px]">{a.status}</Badge></td>
                      <td className="py-1.5 px-3 text-muted-foreground">{a.vitals?.bp ? `BP: ${a.vitals.bp}` : '--'}</td>
                      <td className="py-1.5 px-3 text-muted-foreground">{a.remarks ?? '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SurgeriesTab({ surgeries }) {
  if (!surgeries.length) return <EmptyState icon={Scissors} label="No surgeries recorded" />;
  return (
    <div className="space-y-2">
      {surgeries.map(s => (
        <div key={s._id} className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Scissors className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">{s.surgeryNo}</p>
                <p className="text-xs text-muted-foreground">{s.procedure} · {s.otRoom}</p>
              </div>
            </div>
            <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {[
              ['Type', s.surgeryType],
              ['Surgeon', s.surgeon?.user?.name],
              ['Anesthetist', s.anesthetist?.user?.name ?? '--'],
              ['Scheduled', s.scheduledDate ? `${new Date(s.scheduledDate).toLocaleDateString('en-IN')} ${s.scheduledTime ?? ''}` : '--'],
              s.anesthesiaType ? ['Anesthesia', s.anesthesiaType] : null,
              s.bloodRequired ? ['Blood Units', `${s.bloodUnits} units`] : null,
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className="bg-muted/20 rounded-lg p-2">
                <span className="text-muted-foreground">{k}: </span>{v}
              </div>
            ))}
            {s.diagnosis && <div className="bg-muted/20 rounded-lg p-2 md:col-span-3"><span className="text-muted-foreground">Diagnosis: </span>{s.diagnosis}</div>}
            {s.postOpNotes && <div className="bg-muted/20 rounded-lg p-2 md:col-span-3 italic text-muted-foreground">{s.postOpNotes}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function InsuranceTab({ insuranceClaims }) {
  if (!insuranceClaims.length) return <EmptyState icon={Shield} label="No insurance claims" />;
  return (
    <SimpleTable
      headers={['Claim No', 'TPA', 'Policy', 'Claimed', 'Approved', 'Status', 'Date']}
      rows={insuranceClaims.map(c => [
        <span className="font-mono text-xs">{c.claimNo}</span>,
        c.tpaName,
        <span className="font-mono text-xs">{c.policyNo}</span>,
        `₹${(c.claimAmount ?? 0).toLocaleString('en-IN')}`,
        <span className="text-green-600">₹{(c.approvedAmount ?? 0).toLocaleString('en-IN')}</span>,
        <Badge variant={statusVariant[c.status]} className="text-[10px]">{c.status}</Badge>,
        new Date(c.createdAt).toLocaleDateString('en-IN'),
      ])}
    />
  );
}

function BloodTab({ bloodRecords }) {
  if (!bloodRecords.length) return <EmptyState icon={Droplets} label="No blood bank records" />;
  return (
    <SimpleTable
      headers={['Entry No', 'Type', 'Group', 'Qty', 'Cross-Match', 'Status', 'Date']}
      rows={bloodRecords.map(b => [
        <span className="font-mono text-xs">{b.entryNo}</span>,
        <span className="capitalize">{b.type}</span>,
        <span className="font-bold text-red-500">{b.bloodGroup}</span>,
        `${b.quantity} ${b.unit}`,
        b.crossMatchResult ?? '--',
        <Badge variant={statusVariant[b.status]} className="text-[10px]">{b.status}</Badge>,
        new Date(b.createdAt).toLocaleDateString('en-IN'),
      ])}
    />
  );
}

function AllergiesTab({ allergies }) {
  if (!allergies.length) return <EmptyState icon={AlertTriangle} label="No allergies recorded" />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {allergies.map(a => (
        <div key={a._id} className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{a.substance}</p>
              <p className="text-sm text-muted-foreground capitalize mt-0.5">{a.type} · Reaction: {a.reaction}</p>
              {a.onsetDate && <p className="text-xs text-muted-foreground mt-1">Since {new Date(a.onsetDate).toLocaleDateString('en-IN')}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`h-3 w-3 rounded-full ${severityColor[a.severity]}`} />
              <span className="text-sm capitalize font-medium">{a.severity}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MedicalHistoryTab({ medicalHistory }) {
  const sections = [
    { key: 'chronicConditions', label: 'Chronic Conditions', variant: 'outline', color: 'text-amber-500' },
    { key: 'pastSurgeries', label: 'Past Surgeries', variant: 'secondary', color: 'text-muted-foreground' },
    { key: 'familyHistory', label: 'Family History', variant: 'info', color: 'text-blue-500' },
    { key: 'immunizations', label: 'Immunizations', variant: 'success', color: 'text-green-600' },
  ];
  const hasHabits = medicalHistory.habits && (medicalHistory.habits.smoking || medicalHistory.habits.alcohol);
  const hasAny = sections.some(s => medicalHistory[s.key]?.length > 0) || hasHabits;

  if (!hasAny) return <EmptyState icon={Heart} label="No medical history recorded" />;

  return (
    <div className="rounded-xl border border-border/40 bg-card p-5 space-y-5">
      {sections.map(s => medicalHistory[s.key]?.length > 0 && (
        <div key={s.key}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${s.color}`}>{s.label}</p>
          <div className="flex flex-wrap gap-2">
            {medicalHistory[s.key].map((item, i) => <Badge key={i} variant={s.variant}>{item}</Badge>)}
          </div>
        </div>
      ))}
      {hasHabits && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Habits</p>
          <div className="grid grid-cols-2 gap-2">
            {medicalHistory.habits.smoking && <div className="rounded-lg bg-muted/20 px-3 py-2 text-sm"><span className="text-muted-foreground">Smoking: </span>{medicalHistory.habits.smoking}</div>}
            {medicalHistory.habits.alcohol && <div className="rounded-lg bg-muted/20 px-3 py-2 text-sm"><span className="text-muted-foreground">Alcohol: </span>{medicalHistory.habits.alcohol}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackTab({ feedbacks }) {
  if (!feedbacks.length) return <EmptyState icon={MessageSquare} label="No feedback submitted" />;
  return (
    <div className="space-y-2">
      {feedbacks.map(f => (
        <div key={f._id} className="rounded-xl border border-border/40 bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={f.type === 'complaint' ? 'destructive' : f.type === 'compliment' ? 'success' : 'secondary'}>{f.type}</Badge>
                <Badge variant={statusVariant[f.status]}>{f.status}</Badge>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => <Star key={n} className={`h-3 w-3 ${n <= (f.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}
                </div>
              </div>
              <p className="text-sm font-medium">{f.subject ?? f.description}</p>
              <p className="text-xs text-muted-foreground">{f.category} · {new Date(f.createdAt).toLocaleDateString('en-IN')}</p>
              {f.resolution && <p className="text-sm text-green-600 font-medium">✓ {f.resolution}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
