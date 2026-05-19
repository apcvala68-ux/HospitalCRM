import { useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useCurrentQueue, useCompletePatient } from '../../hooks/useQueue';
import { usePatient } from '../../hooks/usePatients';
import { useTokenVitals } from '../../hooks/useVitals';
import { usePatientPrescriptions, useCreatePrescription } from '../../hooks/usePrescriptions';
import { usePatientLabTests, useCreateLabTests } from '../../hooks/useLabTests';
import { useMyDoctorProfile } from '../../hooks/useDoctor';
import { useToast } from '../../hooks/useToast';
import { PrescriptionForm } from '../../components/prescription/PrescriptionForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  ArrowLeft, Pill, Beaker, ClipboardList, Loader2, ArrowRight,
  Heart, Thermometer, Weight, Wind, Droplets, AlertTriangle,
  ChevronDown, ChevronUp, FileText, Stethoscope, Activity,
  User, Phone, Mail, MapPin, Calendar, Shield, Eye, EyeOff,
} from 'lucide-react';

const abnormalVitals = (type, value) => {
  if (!value) return false;
  const v = +value;
  if (type === 'bpSystolic') return v > 140 || v < 90;
  if (type === 'bpDiastolic') return v > 90 || v < 60;
  if (type === 'pulse') return v > 100 || v < 60;
  if (type === 'temperature') return v > 99 || v < 96;
  if (type === 'spo2') return v < 95;
  if (type === 'respiratoryRate') return v > 22 || v < 12;
  if (type === 'bloodSugar') return v > 140 || (v < 70 && v > 0);
  return false;
};

const vitalColor = (type, value) => {
  if (!value) return 'text-muted-foreground';
  if (abnormalVitals(type, value)) return 'text-red-600 font-bold';
  return 'text-foreground';
};

const VitalCard = ({ icon: Icon, label, value, unit, type, alert }) => {
  if (!value) return null;
  const isAbnormal = abnormalVitals(type, value);
  return (
    <div className={`rounded-lg border p-3 ${isAbnormal ? 'border-red-300 bg-red-50 dark:bg-red-950/30' : 'bg-muted/50'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className={`h-3.5 w-3.5 ${isAbnormal ? 'text-red-500' : 'text-muted-foreground'}`} />}
        <span className="text-xs text-muted-foreground">{label}</span>
        {isAbnormal && <AlertTriangle className="h-3 w-3 text-red-500 ml-auto" />}
      </div>
      <p className={`text-lg font-bold ${vitalColor(type, value)}`}>
        {value}{unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  );
};

export function ConsultationPage() {
  const { tokenId } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const navigate = useNavigate();
  const toast = useToast();
  const printRef = useRef(null);

  const { data: profileData } = useMyDoctorProfile();
  const doctorId = profileData?.doctor?._id;

  const { data: queueData } = useCurrentQueue(doctorId);
  const { data: patientData, isLoading: patientLoading } = usePatient(patientId);
  const { data: vitalsData } = useTokenVitals(tokenId);
  const { data: prescriptionsData } = usePatientPrescriptions(patientId);
  const { data: labTestsData } = usePatientLabTests(patientId);

  const createPrescription = useCreatePrescription();
  const createLabTests = useCreateLabTests();
  const completePatient = useCompletePatient();

  const [examNotes, setExamNotes] = useState('');
  const [expandedRx, setExpandedRx] = useState(null);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const patient = patientData?.patient;
  const vitals = vitalsData?.vital;
  const prescriptions = prescriptionsData?.prescriptions || [];
  const labTests = labTestsData?.labTests || [];

  const currentToken = queueData?.withDoctor?.find(t => t._id === tokenId) ||
    queueData?.ready?.find(t => t._id === tokenId);

  const getAge = (dob) => {
    if (!dob) return '?';
    return Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);
  };

  const handlePrescriptionSubmit = async (data) => {
    try {
      const prescResult = await createPrescription.mutateAsync({ ...data, patient: patientId });
      const presc = prescResult?.prescription;

      if (data.labTests?.length > 0) {
        await createLabTests.mutateAsync({
          patientId,
          tests: data.labTests,
          prescriptionId: presc?._id,
        });
      }

      toast.success('Prescription saved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleNextPatient = async () => {
    const prescriptionData = { labTests: [] };
    try {
      await completePatient.mutateAsync({ id: tokenId, prescriptionData });
      const nextToken = queueData?.ready?.[1] || queueData?.waiting?.[0] || queueData?.inTriage?.[0];
      if (nextToken) {
        navigate(`/consultation/${nextToken._id}?patientId=${nextToken.patient._id}`, { replace: true });
      } else {
        navigate('/doctor', { replace: true });
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (patientLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) return <div className="py-12 text-center text-muted-foreground">Patient not found</div>;

  const age = getAge(patient.dob);

  return (
    <div className="space-y-4">
      {/* Sticky Header */}
      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/95 backdrop-blur border-b pb-3 pt-1">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/doctor')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{patient.firstName} {patient.lastName}</h1>
                {patient.bloodGroup && <Badge variant="outline" className="text-xs">{patient.bloodGroup}</Badge>}
                {currentToken && <Badge variant="secondary" className="text-xs">#{currentToken.tokenNo}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{patient.uhid} · {age}y · {patient.gender}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {patient.allergies?.length > 0 && (
            <div className="flex items-center gap-1 mr-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-red-600 font-medium">{patient.allergies.join(', ')}</span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <FileText className="mr-1.5 h-3.5 w-3.5" /> Print Rx
          </Button>
          <Button size="sm" onClick={handleNextPatient} disabled={completePatient.isPending} className="min-w-[140px]">
            {completePatient.isPending ? 'Completing...' : 'Next Patient'}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        {/* Left Panel - Patient Info & Vitals */}
        <div className="md:col-span-4 space-y-4">
          {/* Patient Quick Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" />Patient Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
              {patient.address?.city && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{patient.address.city}{patient.address.state ? `, ${patient.address.state}` : ''}</span>
                </div>
              )}
              {patient.medicalHistory?.conditions?.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Heart className="h-3 w-3" />Chronic Conditions</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.medicalHistory.conditions.map((c, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {patient.medicalHistory?.surgeries?.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Past Surgeries</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.medicalHistory.surgeries.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vitals */}
          {vitals ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-green-600" />Current Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <VitalCard icon={Heart} label="BP" value={vitals.bpSystolic && vitals.bpDiastolic ? `${vitals.bpSystolic}/${vitals.bpDiastolic}` : null} type="bpSystolic" />
                  <VitalCard icon={Heart} label="Pulse" value={vitals.pulse} unit="bpm" type="pulse" />
                  <VitalCard icon={Thermometer} label="Temp" value={vitals.temperature} unit="°F" type="temperature" />
                  <VitalCard icon={Droplets} label="SpO2" value={vitals.spo2} unit="%" type="spo2" />
                  <VitalCard icon={Weight} label="Weight" value={vitals.weight} unit="kg" />
                  <VitalCard icon={Wind} label="RR" value={vitals.respiratoryRate} unit="/min" type="respiratoryRate" />
                  {vitals.height && (
                    <div className="rounded-lg border p-3 bg-muted/50">
                      <p className="text-xs text-muted-foreground">Height</p>
                      <p className="text-lg font-bold">{vitals.height} cm</p>
                    </div>
                  )}
                  {vitals.bloodSugar && (
                    <VitalCard icon={Droplets} label="Blood Sugar" value={vitals.bloodSugar} unit="mg/dL" type="bloodSugar" />
                  )}
                </div>

                {/* Chief Complaint */}
                {vitals.chiefComplaint && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> Chief Complaint
                    </p>
                    <p className="text-sm font-medium mt-1">{vitals.chiefComplaint}</p>
                    {vitals.painScore !== null && vitals.painScore !== undefined && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Pain Score:</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 10 }, (_, i) => (
                            <div key={i} className={`h-2 w-3 rounded-sm ${i < vitals.painScore ? (vitals.painScore > 6 ? 'bg-red-500' : vitals.painScore > 3 ? 'bg-amber-500' : 'bg-green-500') : 'bg-muted'}`} />
                          ))}
                        </div>
                        <span className="text-xs font-bold">{vitals.painScore}/10</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
              <CardContent className="py-4 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-amber-600 mb-2" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">No vitals recorded</p>
                <p className="text-xs text-muted-foreground">Patient hasn't been through triage yet</p>
              </CardContent>
            </Card>
          )}

          {/* Examination Notes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Stethoscope className="h-4 w-4" />Examination Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={examNotes}
                onChange={e => setExamNotes(e.target.value)}
                placeholder="Write examination findings..."
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </CardContent>
          </Card>

          {/* Past Prescriptions */}
          {prescriptions.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2"><Pill className="h-4 w-4" />Past Prescriptions</CardTitle>
                  <Badge variant="outline" className="text-xs">{prescriptions.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[350px] overflow-y-auto">
                {prescriptions.slice(0, showFullHistory ? prescriptions.length : 3).map((rx) => (
                  <div key={rx._id} className="rounded-lg border overflow-hidden">
                    <button onClick={() => setExpandedRx(expandedRx === rx._id ? null : rx._id)} className="w-full p-3 text-left hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{new Date(rx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {rx.diagnosis?.length > 0 && (
                            <Badge variant="secondary" className="text-xs">{rx.diagnosis[0].code}</Badge>
                          )}
                        </div>
                        {expandedRx === rx._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{rx.medicines?.length || 0} medicines · {rx.labTests?.length || 0} lab tests</p>
                    </button>
                    {expandedRx === rx._id && (
                      <div className="px-3 pb-3 border-t pt-2 space-y-2">
                        {rx.diagnosis?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {rx.diagnosis.map((d, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{d.code} {d.description}</Badge>
                            ))}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Medicines</p>
                          {rx.medicines?.map((m, i) => (
                            <div key={i} className="flex items-start gap-2 py-1 text-xs">
                              <Pill className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                              <div>
                                <span className="font-medium">{m.name}</span>
                                <span className="text-muted-foreground"> — {m.dosage}, {m.frequency}, {m.duration}</span>
                                {m.instructions && <p className="text-muted-foreground/70">{m.instructions}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                        {rx.labTests?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Lab Tests</p>
                            {rx.labTests.map((lt, i) => (
                              <div key={i} className="flex items-center gap-1.5 py-0.5 text-xs">
                                <Beaker className="h-3 w-3 text-muted-foreground" />
                                <span>{lt.testName}</span>
                                {lt.isCompleted && <Badge variant="success" className="text-xs px-1 py-0">Done</Badge>}
                              </div>
                            ))}
                          </div>
                        )}
                        {rx.notes && <p className="text-xs text-muted-foreground border-t pt-2">{rx.notes}</p>}
                        {rx.followUpDate && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Follow-up: {new Date(rx.followUpDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {prescriptions.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setShowFullHistory(!showFullHistory)}>
                    {showFullHistory ? 'Show Less' : `Show ${prescriptions.length - 3} More`}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Prescription Form */}
        <div className="md:col-span-8">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-5 w-5" />Write Prescription</CardTitle>
            </CardHeader>
            <CardContent>
              <PrescriptionForm
                onSubmit={handlePrescriptionSubmit}
                isSubmitting={createPrescription.isPending}
                examNotes={examNotes}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
