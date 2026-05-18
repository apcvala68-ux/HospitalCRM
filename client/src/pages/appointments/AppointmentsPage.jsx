import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCalendarEvents, useAppointments, useCancelAppointment } from '../../hooks/useAppointments';
import { useDoctors } from '../../hooks/useDoctor';
import { usePatientSearch } from '../../hooks/usePatients';
import { useCreateAppointment } from '../../hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/useToast';
import { Calendar, Plus, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export function AppointmentsPage() {
  const [view, setView] = useState('calendar');
  const calendarRef = useRef(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showBook, setShowBook] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('09:00');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reason, setReason] = useState('');

  const { data: eventsData } = useCalendarEvents(dateRange.start, dateRange.end);
  const { data: listData, isLoading: listLoading } = useAppointments({ limit: 50 });
  const { data: doctorsData } = useDoctors();
  const { data: searchResults } = usePatientSearch(patientSearch);
  const createAppointment = useCreateAppointment();
  const cancelAppointment = useCancelAppointment();
  const toast = useToast();

  const doctors = doctorsData?.doctors || [];
  const appointments = listData?.appointments || [];

  const handleDatesSet = (arg) => {
    setDateRange({ start: arg.start.toISOString(), end: arg.end.toISOString() });
  };

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setShowBook(true);
  };

  const handleEventClick = (arg) => {
    const event = arg.event;
    toast.info(`${event.title} — ${event.extendedProps?.status}`);
  };

  const handleBook = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedDate) {
      toast.error('Select patient, doctor, and date');
      return;
    }
    const endTime = selectedSlot;
    const [h, m] = endTime.split(':').map(Number);
    const end = `${String(h + (m + 15 >= 60 ? 1 : 0)).padStart(2, '0')}:${String((m + 15) % 60).padStart(2, '0')}`;
    try {
      await createAppointment.mutateAsync({
        patient: selectedPatient._id,
        doctor: selectedDoctor,
        date: selectedDate,
        timeSlot: { start: selectedSlot, end },
        reason,
        status: 'scheduled',
      });
      setShowBook(false);
      setSelectedPatient(null);
      setPatientSearch('');
      setReason('');
    } catch (err) {
      // handled by hook
    }
  };

  const events = (eventsData?.events || []).map(e => ({
    ...e,
    start: e.start,
    end: e.end,
  }));

  const statusVariant = { scheduled: 'warning', confirmed: 'info', completed: 'success', cancelled: 'destructive', 'checked-in': 'info' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage patient appointments</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === 'calendar' ? 'default' : 'outline'} size="sm" onClick={() => setView('calendar')}>
            <Calendar className="mr-1 h-4 w-4" /> Calendar
          </Button>
          <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setView('list')}>
            List
          </Button>
          <Button onClick={() => setShowBook(true)}>
            <Plus className="mr-2 h-4 w-4" /> Book
          </Button>
        </div>
      </div>

      {showBook && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Book Appointment</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowBook(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient</label>
              {selectedPatient ? (
                <div className="flex items-center justify-between rounded-lg border p-2">
                  <span className="text-sm">{selectedPatient.firstName} {selectedPatient.lastName} — {selectedPatient.uhid}</span>
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedPatient(null); setPatientSearch(''); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Input placeholder="Search patient..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
                  {searchResults?.patients?.length > 0 && (
                    <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border">
                      {searchResults.patients.map((p) => (
                        <button key={p._id} type="button" onClick={() => { setSelectedPatient(p); setPatientSearch(''); }} className="w-full px-3 py-2 text-left text-sm hover:bg-accent">
                          {p.firstName} {p.lastName} — {p.uhid}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Doctor</label>
              <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>{d.user?.name} — {d.specialization}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {Array.from({ length: 16 }, (_, i) => `${String(9 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Reason</label>
              <Input placeholder="Reason for visit..." value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleBook} disabled={createAppointment.isPending}>
                {createAppointment.isPending ? 'Booking...' : 'Book Appointment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'calendar' ? (
        <Card>
          <CardContent className="p-4">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={events}
              datesSet={handleDatesSet}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="auto"
              slotMinTime="08:00"
              slotMaxTime="18:00"
              allDaySlot={false}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-lg">All Appointments ({appointments.length})</CardTitle></CardHeader>
          <CardContent>
            {listLoading ? (
              <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
            ) : appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-2 font-medium">Patient</th>
                      <th className="pb-2 font-medium">Doctor</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a._id} className="border-b last:border-0 text-sm">
                        <td className="py-2 font-medium">{a.patient?.firstName} {a.patient?.lastName}</td>
                        <td className="py-2">{a.doctor?.user?.name}</td>
                        <td className="py-2">{new Date(a.date).toLocaleDateString()}</td>
                        <td className="py-2">{a.timeSlot?.start} - {a.timeSlot?.end}</td>
                        <td className="py-2">
                          <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                        </td>
                        <td className="py-2">
                          {a.status !== 'cancelled' && a.status !== 'completed' && (
                            <Button size="sm" variant="ghost" onClick={() => cancelAppointment.mutate(a._id)}>Cancel</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
