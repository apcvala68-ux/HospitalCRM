import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyDoctorProfile } from '../../hooks/useDoctor';
import { useCurrentQueue, useStartConsultation } from '../../hooks/useQueue';
import { useToast } from '../../hooks/useToast';
import { DashboardCard, DashboardCardHeader, DashboardCardTitle, DashboardCardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Activity, Users, CheckCircle, Clock, ArrowRight, Loader2, AlertTriangle, Heart, Stethoscope, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { displayPhone } from '../../lib/utils';

export function DoctorDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: profileData, isLoading: profileLoading, error: profileError } = useMyDoctorProfile();
  const doctorId = profileData?.doctor?._id;
  const { data: queueData, isLoading: queueLoading, error: queueError } = useCurrentQueue(doctorId);
  const startConsultation = useStartConsultation();
  const queryError = profileError || queueError;
  useEffect(() => { if (queryError) toast.error(queryError.message || 'Failed to load'); }, [queryError]);

  if (profileLoading || queueLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive font-medium">Failed to load</p>
        <p className="text-xs text-muted-foreground mt-1">{queryError.message}</p>
      </div>
    );
  }

  const doctor = profileData?.doctor;
  if (!doctor) return <div className="py-12 text-center text-muted-foreground">Doctor profile not found</div>;

  const ready = queueData?.ready || [];
  const waiting = queueData?.waiting || [];
  const inTriage = queueData?.inTriage || [];
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
    <div className="dashboard-wrapper">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="dashboard-greeting">
          <h1>Dr. {doctor.user?.name}</h1>
          <p className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" />{doctor.specialization}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{doctor.department?.name}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(new Date(), 'EEE, MMM d, yyyy')}</span>
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1 shrink-0">
          Fee: ₹{doctor.consultationFee}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <DashboardCard className={waiting.length + inTriage.length > 0 ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20' : ''}>
          <DashboardCardHeader className="flex flex-row items-center justify-between space-y-0">
            <DashboardCardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Waiting</DashboardCardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </DashboardCardHeader>
          <DashboardCardContent>
            <p className="text-2xl font-bold">{waiting.length + inTriage.length}</p>
            {inTriage.length > 0 && <p className="text-xs text-muted-foreground mt-1">{inTriage.length} in triage</p>}
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard className={ready.length > 0 ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' : ''}>
          <DashboardCardHeader className="flex flex-row items-center justify-between space-y-0">
            <DashboardCardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-green-500" /> Ready</DashboardCardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </DashboardCardHeader>
          <DashboardCardContent>
            <p className="text-2xl font-bold text-green-600">{ready.length}</p>
            {ready.length > 0 && <p className="text-xs text-green-600 mt-1">Vitals recorded</p>}
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader className="flex flex-row items-center justify-between space-y-0">
            <DashboardCardTitle className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> Completed</DashboardCardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </DashboardCardHeader>
          <DashboardCardContent>
            <p className="text-2xl font-bold text-blue-600">{historyCount}</p>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader className="flex flex-row items-center justify-between space-y-0">
            <DashboardCardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> Total Today</DashboardCardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </DashboardCardHeader>
          <DashboardCardContent>
            <p className="text-2xl font-bold">{ready.length + waiting.length + inTriage.length + historyCount}</p>
          </DashboardCardContent>
        </DashboardCard>
      </div>

      {/* Next Patient - Hero Card */}
      {nextPatient ? (
        <DashboardCard className="border-2 border-primary shadow-lg">
          <DashboardCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <DashboardCardTitle className="text-lg flex items-center gap-2 text-primary normal-case tracking-normal">
                <ArrowRight className="h-5 w-5" />
                Next Patient
              </DashboardCardTitle>
              <Badge variant={nextPatient.status === 'ready' ? 'success' : nextPatient.status === 'triage' ? 'info' : 'warning'} className="text-sm">
                {nextPatient.status === 'ready' ? 'Ready for Consultation' : nextPatient.status === 'triage' ? 'In Triage' : 'Waiting'}
              </Badge>
            </div>
          </DashboardCardHeader>
          <DashboardCardContent>
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
                    <span>{displayPhone(nextPatient.patient?.phone)}</span>
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
          </DashboardCardContent>
        </DashboardCard>
      ) : (
        <DashboardCard className="border-2 border-dashed">
          <DashboardCardContent className="py-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No patients in queue</p>
            <p className="text-sm text-muted-foreground">New patients will appear here when triage is complete</p>
          </DashboardCardContent>
        </DashboardCard>
      )}

      {/* Upcoming Queue */}
      {upcomingQueue.length > 0 && (
        <DashboardCard>
          <DashboardCardHeader className="pb-3">
            <DashboardCardTitle className="text-base flex items-center gap-2 normal-case tracking-normal">
              <Users className="h-4 w-4" />
              Upcoming Queue ({upcomingQueue.length})
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="space-y-2">
              {upcomingQueue.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between rounded-lg border border-border/40 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
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
          </DashboardCardContent>
        </DashboardCard>
      )}
    </div>
  );
}
