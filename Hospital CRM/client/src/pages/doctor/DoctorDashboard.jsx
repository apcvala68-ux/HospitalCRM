import { useNavigate } from 'react-router-dom';
import { useMyDoctorProfile } from '../../hooks/useDoctor';
import { useCurrentQueue, useStartConsultation } from '../../hooks/useQueue';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Activity, Users, CheckCircle, Clock, ArrowRight, Loader2, AlertTriangle, Heart, Thermometer, Droplets, Stethoscope, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { data: profileData, isLoading: profileLoading } = useMyDoctorProfile();
  const doctorId = profileData?.doctor?._id;
  const { data: queueData, isLoading: queueLoading } = useCurrentQueue(doctorId);
  const startConsultation = useStartConsultation();

  if (profileLoading || queueLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const doctor = profileData?.doctor;
  if (!doctor) return <div className="py-12 text-center text-muted-foreground">Doctor profile not found</div>;

  const ready = queueData?.ready || [];
  const waiting = queueData?.waiting || [];
  const inTriage = queueData?.inTriage || [];
  const withDoctor = queueData?.withDoctor || [];
  const historyCount = queueData?.historyCount || 0;

  const nextPatient = ready[0] || waiting[0] || inTriage[0];
  const upcomingQueue = [...ready.slice(1), ...inTriage, ...waiting];

  const handleStartConsult = async (token) => {
    if (token.status === 'waiting' || token.status === 'triage') {
      await startConsultation.mutateAsync(token._id);
    }
    navigate(`/consultation/${token._id}?patientId=${token.patient._id}`);
  };

  const getAge = (dob) => {
    if (!dob) return '?';
    return Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
            {doctor.user?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dr. {doctor.user?.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" />{doctor.specialization}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{doctor.department?.name}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(new Date(), 'EEE, MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            Fee: ₹{doctor.consultationFee}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={waiting.length + inTriage.length > 0 ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20' : ''}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" />Waiting</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{waiting.length + inTriage.length}</p>
            {inTriage.length > 0 && <p className="text-xs text-muted-foreground mt-1">{inTriage.length} in triage</p>}
          </CardContent>
        </Card>
        <Card className={ready.length > 0 ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' : ''}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Activity className="h-4 w-4 text-green-500" />Ready</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{ready.length}</p>
            {ready.length > 0 && <p className="text-xs text-green-600 mt-1">Vitals recorded</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" />Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{historyCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Activity className="h-4 w-4" />Total Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{ready.length + waiting.length + inTriage.length + historyCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Patient - Hero Card */}
      {nextPatient ? (
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <ArrowRight className="h-5 w-5" />
                Next Patient
              </CardTitle>
              <Badge variant={nextPatient.status === 'ready' ? 'success' : nextPatient.status === 'triage' ? 'info' : 'warning'} className="text-sm">
                {nextPatient.status === 'ready' ? 'Ready for Consultation' : nextPatient.status === 'triage' ? 'In Triage' : 'Waiting'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground shrink-0">
                  #{nextPatient.tokenNo}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-xl font-bold">{nextPatient.patient?.firstName} {nextPatient.patient?.lastName}</p>
                    {nextPatient.patient?.bloodGroup && (
                      <Badge variant="outline" className="text-xs">{nextPatient.patient.bloodGroup}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span>{nextPatient.patient?.uhid}</span>
                    <span>{getAge(nextPatient.patient?.dob)}y · {nextPatient.patient?.gender}</span>
                    <span>{nextPatient.patient?.phone}</span>
                  </div>
                  {nextPatient.patient?.allergies?.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-xs text-red-600 font-medium">Allergies:</span>
                      {nextPatient.patient.allergies.map((a, i) => (
                        <Badge key={i} variant="destructive" className="text-xs px-1.5 py-0">{a}</Badge>
                      ))}
                    </div>
                  )}
                  {nextPatient.patient?.medicalHistory?.conditions?.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Heart className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-xs text-muted-foreground">Conditions:</span>
                      {nextPatient.patient.medicalHistory.conditions.slice(0, 3).map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">{c}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button size="lg" onClick={() => handleStartConsult(nextPatient)} className="min-w-[180px] shrink-0">
                Start Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No patients in queue</p>
            <p className="text-sm text-muted-foreground">New patients will appear here when triage is complete</p>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Queue */}
      {upcomingQueue.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Upcoming Queue ({upcomingQueue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingQueue.map((t, idx) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleStartConsult(t)}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {t.tokenNo}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{t.patient?.firstName} {t.patient?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{t.patient?.uhid} · {getAge(t.patient?.dob)}y · {t.patient?.gender}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {t.patient?.bloodGroup && (
                      <Badge variant="outline" className="text-xs">{t.patient.bloodGroup}</Badge>
                    )}
                    {t.patient?.allergies?.length > 0 && (
                      <AlertTriangle className="h-4 w-4 text-red-500" title={`Allergies: ${t.patient.allergies.join(', ')}`} />
                    )}
                    <Badge variant={t.status === 'ready' ? 'success' : t.status === 'triage' ? 'info' : 'warning'} className="text-xs">
                      {t.status === 'ready' ? 'Ready' : t.status === 'triage' ? 'Triage' : 'Waiting'}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
