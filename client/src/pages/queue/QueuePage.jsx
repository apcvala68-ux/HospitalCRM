import { useState } from 'react';
import { useCurrentQueue, useQueueHistory, useGenerateToken, useCallPatient, useCompletePatient } from '../../hooks/useQueue';
import { usePatientSearch } from '../../hooks/usePatients';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/useToast';
import { Search, UserPlus, Phone, Clock, CheckCircle, SkipForward, History } from 'lucide-react';

const DOCTORS = [
  { _id: null, label: 'Select a doctor...' },
  { _id: '673b0b8b1d1c1a2a3b4c5d6e', label: 'Dr. Sharma (General Medicine)' },
  { _id: '673b0b8b1d1c1a2a3b4c5d6f', label: 'Dr. Patel (Cardiology)' },
];

export function QueuePage() {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const toast = useToast();

  const { data: queueData, isLoading: queueLoading } = useCurrentQueue(selectedDoctor);
  const { data: historyData } = useQueueHistory(selectedDoctor);
  const { data: searchResults } = usePatientSearch(patientSearch);
  const generateToken = useGenerateToken();
  const callPatient = useCallPatient();
  const completePatient = useCompletePatient();

  const handleGenerateToken = async () => {
    if (!selectedDoctor || !selectedPatient) {
      toast.error('Select a doctor and patient first');
      return;
    }
    try {
      await generateToken.mutateAsync({
        patientId: selectedPatient._id,
        doctorId: selectedDoctor,
      });
      setSelectedPatient(null);
      setPatientSearch('');
    } catch (err) {
      // handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <p className="text-muted-foreground">Manage patient queues for doctors</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generate Token</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Doctor</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {DOCTORS.map((d) => (
                  <option key={d._id || 'placeholder'} value={d._id || ''}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, UHID, phone..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchResults?.patients?.length > 0 && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border">
                  {searchResults.patients.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(p);
                        setPatientSearch(`${p.firstName} ${p.lastName} (${p.uhid})`);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
                        selectedPatient?._id === p._id ? 'bg-accent' : ''
                      }`}
                    >
                      {p.firstName} {p.lastName} — {p.uhid}
                      <span className="ml-2 text-muted-foreground">{p.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleGenerateToken}
              disabled={!selectedDoctor || !selectedPatient || generateToken.isPending}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{generateToken.isPending ? 'Generating...' : 'Generate Token'}</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Live Queue</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">{showHistory ? 'Live' : 'History'}</span>
            </Button>
          </CardHeader>
          <CardContent>
            {!selectedDoctor ? (
              <p className="text-sm text-muted-foreground">Select a doctor to view queue</p>
            ) : queueLoading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : showHistory ? (
              <div className="space-y-2">
                {historyData?.tokens?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No completed tokens today</p>
                ) : (
                  historyData?.tokens?.map((t) => (
                    <div key={t._id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">
                          #{t.tokenNo} — {t.patient?.firstName} {t.patient?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.patient?.uhid}</p>
                      </div>
                      <Badge variant={t.status === 'completed' ? 'success' : 'destructive'}>
                        {t.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {queueData?.withDoctor?.length > 0 && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Currently With Doctor</p>
                    {queueData.withDoctor.map((t) => (
                      <div key={t._id} className="mt-1 flex items-center justify-between">
                        <div>
                          <p className="font-medium">#{t.tokenNo} — {t.patient?.firstName} {t.patient?.lastName}</p>
                          <p className="text-xs text-muted-foreground">{t.patient?.uhid}</p>
                        </div>
                        <Button size="sm" onClick={() => completePatient.mutate(t._id)}>
                          <CheckCircle className="mr-1 h-4 w-4" /> Complete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-sm font-medium text-muted-foreground">
                  Waiting ({queueData?.waiting?.length || 0})
                </p>
                {queueData?.waiting?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No patients in queue</p>
                ) : (
                  queueData?.waiting?.map((t) => (
                    <div key={t._id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {t.tokenNo}
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            {t.patient?.firstName} {t.patient?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{t.patient?.uhid} · {t.patient?.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => callPatient.mutate(t._id)}>
                          <SkipForward className="mr-1 h-4 w-4" /> Call
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
