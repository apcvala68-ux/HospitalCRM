import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, Droplets, AlertTriangle, User as UserIcon,
  FileText, FlaskConical, DollarSign, BedDouble, Clock, Syringe, Shield, Scissors,
  MessageSquare, Heart, Activity, Pill, TrendingUp, AlertCircle, ChevronDown, ChevronUp,
  Stethoscope, ClipboardList, ShoppingCart, Cross, Star,
} from 'lucide-react';
import { displayPhone } from '../../lib/utils';

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
  open: 'warning', 'in-progress': 'info', resolved: 'success', closed: 'secondary',
  'pre-auth': 'warning', submitted: 'info', 'under-review': 'info',
  approved: 'success', 'partially-approved': 'warning', rejected: 'destructive', settled: 'success',
};

const severityColor = { mild: 'bg-green-500', moderate: 'bg-yellow-500', severe: 'bg-orange-500', 'life-threatening': 'bg-red-500' };

export function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = usePatientHistory(id);
  const toast = useToast();
  useEffect(() => { if (error) toast.error(error.message || 'Failed to load'); }, [error]);
  const [expandedRx, setExpandedRx] = useState(null);
  const [expandedLab, setExpandedLab] = useState(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
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

  const patient = data?.patient;
  const summary = data?.summary;
  if (!patient) return <div className="text-muted-foreground">Patient not found</div>;

  const age = Math.floor((Date.now() - new Date(patient.dob).getTime()) / 31557600000);
  const allergies = data?.allergies || [];
  const prescriptions = data?.prescriptions || [];
  const labOrders = data?.labOrders || [];
  const billings = data?.billings || [];
  const appointments = data?.appointments || [];
  const ipdAdmissions = data?.ipdAdmissions || [];
  const queueTokens = data?.queueTokens || [];
  const marRecords = data?.marRecords || [];
  const insuranceClaims = data?.insuranceClaims || [];
  const bloodRecords = data?.bloodRecords || [];
  const surgeries = data?.surgeries || [];
  const feedbacks = data?.feedbacks || [];
  const medicalHistory = data?.medicalHistory || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {patient.firstName?.[0]}{patient.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{patient.firstName} {patient.lastName}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono">{patient.uhid}</span>
                {patient.bloodGroup && <Badge variant="outline" className="flex items-center gap-1"><Droplets className="h-3 w-3" />{patient.bloodGroup}</Badge>}
                <span>{age}y · {patient.gender}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/patients/${id}/edit`}>
            <Button variant="outline">Edit Patient</Button>
          </Link>
          <Link to={`/queue?patient=${id}`}>
            <Button variant="outline">Add to Queue</Button>
          </Link>
          <Link to={`/billing/new?patient=${id}`}>
            <Button>New Invoice</Button>
          </Link>
        </div>
      </div>

      {allergies.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-medium text-destructive">Allergies:</span>
            <div className="flex flex-wrap gap-2">
              {allergies.map(a => (
                <Badge key={a._id} variant="destructive" className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${severityColor[a.severity]}`} />
                  {a.substance} ({a.reaction})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
          {[
            { label: 'Total Visits', value: summary.totalVisits, icon: Activity, color: 'text-blue-600' },
            { label: 'Prescriptions', value: summary.totalPrescriptions, icon: FileText, color: 'text-green-600' },
            { label: 'Lab Tests', value: summary.totalLabOrders, icon: FlaskConical, color: 'text-purple-600' },
            { label: 'IPD Stays', value: summary.totalIPDAdmissions, icon: BedDouble, color: 'text-cyan-600' },
            { label: 'Surgeries', value: summary.totalSurgeries, icon: Scissors, color: 'text-orange-600' },
            { label: 'Total Spent', value: `₹${summary.totalSpent.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-600' },
            { label: 'Pending', value: `₹${summary.totalPending.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-red-600' },
            { label: 'Last Visit', value: summary.lastVisit, icon: Clock, color: 'text-amber-600' },
          ].map(s => (
            <Card key={s.label} className="text-center">
              <CardContent className="py-3">
                <s.icon className={`mx-auto mb-1 h-4 w-4 ${s.color}`} />
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><UserIcon className="h-4 w-4" />Personal Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Gender</span><span className="capitalize">{patient.gender}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">DOB</span><span>{new Date(patient.dob).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Age</span><span>{age} years</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Blood</span><span>{patient.bloodGroup || '--'}</span></div>
            {patient.aadhaar && <div className="flex justify-between"><span className="text-muted-foreground">Aadhaar</span><span className="font-mono">{patient.aadhaar}</span></div>}
            {patient.maritalStatus && <div className="flex justify-between"><span className="text-muted-foreground">Marital</span><span className="capitalize">{patient.maritalStatus}</span></div>}
            {patient.occupation && <div className="flex justify-between"><span className="text-muted-foreground">Occupation</span><span>{patient.occupation}</span></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" />Contact</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-muted-foreground" />{displayPhone(patient.phone)}</div>
            {patient.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-muted-foreground" />{patient.email}</div>}
            {patient.address?.city && <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-muted-foreground" />{[patient.address.street, patient.address.city, patient.address.state, patient.address.pincode].filter(Boolean).join(', ')}</div>}
            {patient.emergencyContact?.name && (
              <div className="mt-3 border-t pt-3">
                <p className="font-medium text-destructive">Emergency Contact</p>
                <p className="text-muted-foreground">{patient.emergencyContact.name} — {displayPhone(patient.emergencyContact.phone)}</p>
                {patient.emergencyContact.relation && <p className="text-xs text-muted-foreground">{patient.emergencyContact.relation}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" />Registration</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{new Date(patient.createdAt).toLocaleDateString()}</span></div>
            {patient.registeredBy && <div className="flex justify-between"><span className="text-muted-foreground">By</span><span>{patient.registeredBy.name}</span></div>}
            {medicalHistory.chronicConditions?.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <p className="font-medium text-amber-600 flex items-center gap-1"><Heart className="h-3 w-3" />Chronic Conditions</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {medicalHistory.chronicConditions.map((c, i) => <Badge key={i} variant="outline">{c}</Badge>)}
                </div>
              </div>
            )}
            {medicalHistory.habits && (medicalHistory.habits.smoking || medicalHistory.habits.alcohol) && (
              <div className="mt-3 border-t pt-3">
                <p className="font-medium text-muted-foreground">Habits</p>
                {medicalHistory.habits.smoking && <p className="text-sm">Smoking: {medicalHistory.habits.smoking}</p>}
                {medicalHistory.habits.alcohol && <p className="text-sm">Alcohol: {medicalHistory.habits.alcohol}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prescriptions" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="prescriptions" className="flex items-center gap-1"><FileText className="h-3 w-3" />Prescriptions ({prescriptions.length})</TabsTrigger>
          <TabsTrigger value="lab" className="flex items-center gap-1"><FlaskConical className="h-3 w-3" />Lab Orders ({labOrders.length})</TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Billing ({billings.length})</TabsTrigger>
          <TabsTrigger value="visits" className="flex items-center gap-1"><Clock className="h-3 w-3" />Visits ({queueTokens.length})</TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-1"><Calendar className="h-3 w-3" />Appointments ({appointments.length})</TabsTrigger>
          <TabsTrigger value="ipd" className="flex items-center gap-1"><BedDouble className="h-3 w-3" />IPD ({ipdAdmissions.length})</TabsTrigger>
          <TabsTrigger value="mar" className="flex items-center gap-1"><Syringe className="h-3 w-3" />MAR ({marRecords.length})</TabsTrigger>
          <TabsTrigger value="surgeries" className="flex items-center gap-1"><Scissors className="h-3 w-3" />Surgeries ({surgeries.length})</TabsTrigger>
          <TabsTrigger value="insurance" className="flex items-center gap-1"><Shield className="h-3 w-3" />Insurance ({insuranceClaims.length})</TabsTrigger>
          <TabsTrigger value="blood" className="flex items-center gap-1"><Droplets className="h-3 w-3" />Blood ({bloodRecords.length})</TabsTrigger>
          <TabsTrigger value="allergies" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Allergies</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1"><Heart className="h-3 w-3" />Medical History</TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="space-y-3">
          {prescriptions.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No prescriptions</CardContent></Card> : prescriptions.map(rx => (
            <Card key={rx._id}>
              <CardHeader className="cursor-pointer" onClick={() => setExpandedRx(expandedRx === rx._id ? null : rx._id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <div>
                      <CardTitle className="text-sm">{rx.prescriptionNo}</CardTitle>
                      <p className="text-xs text-muted-foreground">{rx.doctor?.user?.name} · {new Date(rx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {rx.diagnoses?.map((d, i) => <Badge key={i} variant="outline">{d}</Badge>)}
                    {expandedRx === rx._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
              {expandedRx === rx._id && (
                <CardContent>
                  {rx.medicines?.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="pb-2 font-medium">Medicine</th>
                            <th className="pb-2 font-medium">Dosage</th>
                            <th className="pb-2 font-medium">Frequency</th>
                            <th className="pb-2 font-medium">Duration</th>
                            <th className="pb-2 font-medium">Route</th>
                            <th className="pb-2 font-medium">Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rx.medicines.map((m, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="py-1.5 font-medium">{m.name}</td>
                              <td className="py-1.5">{m.dosage}</td>
                              <td className="py-1.5">{m.frequency}</td>
                              <td className="py-1.5">{m.duration}</td>
                              <td className="py-1.5 capitalize">{m.route || 'oral'}</td>
                              <td className="py-1.5 text-muted-foreground">{m.instructions || '--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {rx.labTests?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium">Lab Tests Advised</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {rx.labTests.map((t, i) => <Badge key={i} variant="outline">{t.testName}</Badge>)}
                      </div>
                    </div>
                  )}
                  {rx.notes && <p className="mt-3 text-sm text-muted-foreground"><strong>Notes:</strong> {rx.notes}</p>}
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="lab" className="space-y-3">
          {labOrders.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No lab orders</CardContent></Card> : labOrders.map(lo => (
            <Card key={lo._id}>
              <CardHeader className="cursor-pointer" onClick={() => setExpandedLab(expandedLab === lo._id ? null : lo._id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FlaskConical className="h-4 w-4 text-purple-600" />
                    <div>
                      <CardTitle className="text-sm">{lo.orderNo}</CardTitle>
                      <p className="text-xs text-muted-foreground">{lo.doctor?.user?.name} · {new Date(lo.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[lo.status]}>{lo.status}</Badge>
                    {expandedLab === lo._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
              {expandedLab === lo._id && (
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 font-medium">Test</th>
                        <th className="pb-2 font-medium">Category</th>
                        <th className="pb-2 font-medium">Priority</th>
                        <th className="pb-2 font-medium">Result</th>
                        <th className="pb-2 font-medium">Value</th>
                        <th className="pb-2 font-medium">Normal Range</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lo.tests?.map((t, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-1.5 font-medium">{t.testName}</td>
                          <td className="py-1.5 capitalize">{t.category}</td>
                          <td className="py-1.5"><Badge variant={t.priority === 'stat' ? 'destructive' : t.priority === 'urgent' ? 'warning' : 'secondary'}>{t.priority}</Badge></td>
                          <td className="py-1.5">{t.result || '--'}</td>
                          <td className="py-1.5">{t.resultValue ? `${t.resultValue} ${t.unit || ''}` : '--'}</td>
                          <td className="py-1.5 text-muted-foreground">{t.normalRange || '--'}</td>
                          <td className="py-1.5"><Badge variant={statusVariant[t.status]}>{t.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {lo.notes && <p className="mt-3 text-sm text-muted-foreground"><strong>Notes:</strong> {lo.notes}</p>}
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="billing" className="space-y-3">
          {billings.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No billing records</CardContent></Card> : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-3 font-medium">Invoice</th>
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium">Doctor</th>
                      <th className="p-3 font-medium">Items</th>
                      <th className="p-3 font-medium">Total</th>
                      <th className="p-3 font-medium">Paid</th>
                      <th className="p-3 font-medium">Pending</th>
                      <th className="p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billings.map(b => (
                      <tr key={b._id} className="border-b last:border-0">
                        <td className="p-3 font-mono text-xs"><Link to={`/billing/${b._id}`} className="text-primary hover:underline">{b.invoiceNo}</Link></td>
                        <td className="p-3">{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">{b.doctor?.user?.name || '--'}</td>
                        <td className="p-3">{b.items?.length || 0}</td>
                        <td className="p-3 font-medium">₹{(b.total || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-green-600">₹{(b.amountPaid || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-red-600">₹{((b.total || 0) - (b.amountPaid || 0)).toLocaleString('en-IN')}</td>
                        <td className="p-3"><Badge variant={statusVariant[b.status]}>{b.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="visits" className="space-y-3">
          {queueTokens.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No queue visits</CardContent></Card> : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-3 font-medium">Token</th>
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium">Doctor</th>
                      <th className="p-3 font-medium">Department</th>
                      <th className="p-3 font-medium">Token No</th>
                      <th className="p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueTokens.map(q => (
                      <tr key={q._id} className="border-b last:border-0">
                        <td className="p-3 font-mono text-xs">{q.tokenNo}</td>
                        <td className="p-3">{new Date(q.date).toLocaleDateString()}</td>
                        <td className="p-3">{q.doctor?.user?.name || '--'}</td>
                        <td className="p-3">{q.department || '--'}</td>
                        <td className="p-3 font-bold">{q.tokenNumber}</td>
                        <td className="p-3"><Badge variant={statusVariant[q.status]}>{q.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-3">
          {appointments.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No appointments</CardContent></Card> : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium">Time</th>
                      <th className="p-3 font-medium">Doctor</th>
                      <th className="p-3 font-medium">Reason</th>
                      <th className="p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a._id} className="border-b last:border-0">
                        <td className="p-3">{new Date(a.date).toLocaleDateString()}</td>
                        <td className="p-3">{a.timeSlot?.start} - {a.timeSlot?.end}</td>
                        <td className="p-3">{a.doctor?.user?.name || '--'}</td>
                        <td className="p-3 text-muted-foreground">{a.reason || '--'}</td>
                        <td className="p-3"><Badge variant={statusVariant[a.status]}>{a.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ipd" className="space-y-3">
          {ipdAdmissions.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No IPD admissions</CardContent></Card> : ipdAdmissions.map(adm => (
            <Card key={adm._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BedDouble className="h-4 w-4 text-cyan-600" />
                    <div>
                      <CardTitle className="text-sm">{adm.admissionNo}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {adm.ward?.name} · Bed {adm.bed?.bedNo || adm.bedNo} · {adm.admittingDoctor?.user?.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusVariant[adm.status]}>{adm.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-3 text-sm">
                <div><span className="text-muted-foreground">Admitted:</span> {new Date(adm.admissionDate).toLocaleDateString()}</div>
                {adm.dischargeDate && <div><span className="text-muted-foreground">Discharged:</span> {new Date(adm.dischargeDate).toLocaleDateString()}</div>}
                {adm.dischargingDoctor && <div><span className="text-muted-foreground">By:</span> {adm.dischargingDoctor.user?.name}</div>}
                {adm.diagnosis && <div className="md:col-span-3"><span className="text-muted-foreground">Diagnosis:</span> {adm.diagnosis}</div>}
                {adm.condition && <div className="md:col-span-3"><span className="text-muted-foreground">Condition:</span> {adm.condition}</div>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mar" className="space-y-3">
          {marRecords.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No MAR records</CardContent></Card> : marRecords.map(mar => (
            <Card key={mar._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Pill className="h-4 w-4 text-primary" />
                    <div>
                      <CardTitle className="text-sm">{mar.medication} — {mar.dosage}</CardTitle>
                      <p className="text-xs text-muted-foreground">{mar.route} · {mar.frequency} · Since {new Date(mar.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant[mar.status]}>{mar.status}</Badge>
                </div>
              </CardHeader>
              {mar.administrations?.length > 0 && (
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 font-medium">Time</th>
                        <th className="pb-2 font-medium">Given At</th>
                        <th className="pb-2 font-medium">Dose</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Vitals</th>
                        <th className="pb-2 font-medium">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mar.administrations.slice(-10).reverse().map((a, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-1.5">{a.scheduledTime}</td>
                          <td className="py-1.5">{a.administeredAt ? new Date(a.administeredAt).toLocaleString() : '--'}</td>
                          <td className="py-1.5">{a.dose || '--'}</td>
                          <td className="py-1.5"><Badge variant={statusVariant[a.status]}>{a.status}</Badge></td>
                          <td className="py-1.5 text-muted-foreground">{a.vitals?.bp ? `BP: ${a.vitals.bp}` : '--'}</td>
                          <td className="py-1.5 text-muted-foreground">{a.remarks || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="surgeries" className="space-y-3">
          {surgeries.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No surgeries</CardContent></Card> : surgeries.map(s => (
            <Card key={s._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Scissors className="h-4 w-4 text-orange-600" />
                    <div>
                      <CardTitle className="text-sm">{s.surgeryNo}</CardTitle>
                      <p className="text-xs text-muted-foreground">{s.procedure} · {s.otRoom}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-3 text-sm">
                <div><span className="text-muted-foreground">Type:</span> {s.surgeryType}</div>
                <div><span className="text-muted-foreground">Surgeon:</span> {s.surgeon?.user?.name}</div>
                <div><span className="text-muted-foreground">Anesthetist:</span> {s.anesthetist?.user?.name || '--'}</div>
                <div><span className="text-muted-foreground">Scheduled:</span> {s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString() : '--'} {s.scheduledTime || ''}</div>
                {s.anesthesiaType && <div><span className="text-muted-foreground">Anesthesia:</span> {s.anesthesiaType}</div>}
                {s.bloodRequired && <div><span className="text-muted-foreground">Blood:</span> {s.bloodUnits} units</div>}
                {s.diagnosis && <div className="md:col-span-3"><span className="text-muted-foreground">Diagnosis:</span> {s.diagnosis}</div>}
                {s.postOpNotes && <div className="md:col-span-3"><span className="text-muted-foreground">Post-Op:</span> {s.postOpNotes}</div>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="insurance" className="space-y-3">
          {insuranceClaims.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No insurance claims</CardContent></Card> : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-3 font-medium">Claim No</th>
                      <th className="p-3 font-medium">TPA</th>
                      <th className="p-3 font-medium">Policy</th>
                      <th className="p-3 font-medium">Claimed</th>
                      <th className="p-3 font-medium">Approved</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insuranceClaims.map(c => (
                      <tr key={c._id} className="border-b last:border-0">
                        <td className="p-3 font-mono text-xs">{c.claimNo}</td>
                        <td className="p-3">{c.tpaName}</td>
                        <td className="p-3 font-mono text-xs">{c.policyNo}</td>
                        <td className="p-3">₹{(c.claimAmount || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-green-600">₹{(c.approvedAmount || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3"><Badge variant={statusVariant[c.status]}>{c.status}</Badge></td>
                        <td className="p-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="blood" className="space-y-3">
          {bloodRecords.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No blood bank records</CardContent></Card> : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-3 font-medium">Entry No</th>
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium">Group</th>
                      <th className="p-3 font-medium">Qty</th>
                      <th className="p-3 font-medium">Cross-Match</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloodRecords.map(b => (
                      <tr key={b._id} className="border-b last:border-0">
                        <td className="p-3 font-mono text-xs">{b.entryNo}</td>
                        <td className="p-3 capitalize">{b.type}</td>
                        <td className="p-3 font-bold">{b.bloodGroup}</td>
                        <td className="p-3">{b.quantity} {b.unit}</td>
                        <td className="p-3">{b.crossMatchResult || '--'}</td>
                        <td className="p-3"><Badge variant={statusVariant[b.status]}>{b.status}</Badge></td>
                        <td className="p-3">{new Date(b.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="allergies" className="space-y-3">
          {allergies.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No allergies recorded</CardContent></Card> : (
            <div className="grid gap-3 md:grid-cols-2">
              {allergies.map(a => (
                <Card key={a._id} className="border-destructive/50">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{a.substance}</p>
                        <p className="text-sm text-muted-foreground capitalize">{a.type} · {a.reaction}</p>
                        {a.onsetDate && <p className="text-xs text-muted-foreground">Since {new Date(a.onsetDate).toLocaleDateString()}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${severityColor[a.severity]}`} />
                        <span className="text-sm capitalize">{a.severity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Heart className="h-4 w-4 text-red-600" />Medical History</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {medicalHistory.chronicConditions?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Chronic Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.chronicConditions.map((c, i) => <Badge key={i} variant="outline" className="text-sm">{c}</Badge>)}
                  </div>
                </div>
              )}
              {medicalHistory.pastSurgeries?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Past Surgeries</p>
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.pastSurgeries.map((s, i) => <Badge key={i} variant="secondary" className="text-sm">{s}</Badge>)}
                  </div>
                </div>
              )}
              {medicalHistory.familyHistory?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Family History</p>
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.familyHistory.map((f, i) => <Badge key={i} variant="info" className="text-sm">{f}</Badge>)}
                  </div>
                </div>
              )}
              {medicalHistory.immunizations?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Immunizations</p>
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.immunizations.map((im, i) => <Badge key={i} variant="success" className="text-sm">{im}</Badge>)}
                  </div>
                </div>
              )}
              {medicalHistory.habits && (medicalHistory.habits.smoking || medicalHistory.habits.alcohol) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Habits</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {medicalHistory.habits.smoking && <div className="rounded-lg border p-3"><span className="text-muted-foreground">Smoking:</span> {medicalHistory.habits.smoking}</div>}
                    {medicalHistory.habits.alcohol && <div className="rounded-lg border p-3"><span className="text-muted-foreground">Alcohol:</span> {medicalHistory.habits.alcohol}</div>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-3">
          {feedbacks.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No feedback</CardContent></Card> : feedbacks.map(f => (
            <Card key={f._id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={f.type === 'complaint' ? 'destructive' : f.type === 'compliment' ? 'success' : 'secondary'}>{f.type}</Badge>
                      <Badge variant={statusVariant[f.status]}>{f.status}</Badge>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => <Star key={n} className={`h-3 w-3 ${n <= (f.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}
                      </div>
                    </div>
                    <p className="mt-1 text-sm font-medium">{f.subject || f.description}</p>
                    <p className="text-xs text-muted-foreground">{f.category} · {new Date(f.createdAt).toLocaleDateString()}</p>
                    {f.resolution && <p className="mt-2 text-sm text-green-600">Resolved: {f.resolution}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
