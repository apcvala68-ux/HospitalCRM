import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useCalendarEvents, useAppointments, useCancelAppointment, useCreateAppointment, useConfirmAppointment } from '../../hooks/useAppointments';
import { useDoctors, useMyDoctorProfile, useDoctor } from '../../hooks/useDoctor';
import { usePatientSearch } from '../../hooks/usePatients';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/useToast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Plus, List } from 'lucide-react';

// Sub-components
import { StatsBanner } from './components/StatsBanner';
import { BookingModal } from './components/BookingModal';
import { EventDetailsModal } from './components/EventDetailsModal';
import { AppointmentsCalendarView } from './components/AppointmentsCalendarView';
import { AppointmentsListView } from './components/AppointmentsListView';

const calendarCss = `
.fc { font-family: inherit !important; }
.fc .fc-toolbar-title { font-size: 1rem !important; font-weight: 700 !important; }
.fc .fc-button-group { gap: 6px !important; }
.fc .fc-button-group > .fc-button { border-radius: 0.75rem !important; }
.fc .fc-button-primary { background: hsl(var(--primary)) !important; border-color: hsl(var(--primary)) !important; border-radius: 0.75rem !important; font-size: 0.75rem !important; font-weight: 600 !important; padding: 0.25rem 0.75rem !important; text-transform: capitalize !important; }
.fc .fc-button-primary:not(:disabled).fc-button-active { background: color-mix(in srgb, hsl(var(--primary)) 80%, black) !important; }
.fc .fc-button-primary:hover { opacity: 0.9 !important; }
.fc .fc-button-primary:disabled { opacity: 0.5 !important; }
.fc .fc-today-button { text-transform: capitalize !important; }
.fc .fc-daygrid-day-number { font-size: 0.8rem !important; font-weight: 500 !important; padding: 4px 6px !important; color: hsl(var(--foreground)) !important; text-decoration: none !important; }
.fc .fc-col-header-cell-cushion { font-size: 0.75rem !important; font-weight: 600 !important; text-transform: uppercase !important; color: hsl(var(--muted-foreground)) !important; padding: 6px 0 !important; text-decoration: none !important; }
.fc .fc-timegrid-slot { height: 2rem !important; }
.fc .fc-timegrid-slot-label-cushion { font-size: 0.7rem !important; font-weight: 500 !important; color: hsl(var(--muted-foreground)) !important; }
.fc .fc-event { border-radius: 6px !important; border: none !important; padding: 2px 4px !important; font-size: 0.75rem !important; cursor: pointer !important; }
.fc .fc-event:hover { opacity: 0.85 !important; }
.fc .fc-day-today { background: rgba(59,130,246,0.08) !important; }
.fc-day-today.fc-daygrid-day { background: rgba(59,130,246,0.08) !important; box-shadow: inset 3px 3px 0 hsl(var(--primary)), inset -3px -3px 0 hsl(var(--primary)) !important; }
.fc-day-today.fc-daygrid-day .fc-daygrid-day-frame { position: relative !important; }
.fc-day-today.fc-daygrid-day .fc-daygrid-day-top { background: hsl(var(--primary)); border-radius: 0.5rem; padding: 0 !important; margin: 4px; width: 32px; display: flex; align-items: center; justify-content: center; }
.fc-day-today.fc-daygrid-day .fc-daygrid-day-number { color: hsl(var(--primary-foreground)) !important; font-weight: 800 !important; font-size: 0.9rem !important; padding: 2px 0 !important; }
.fc-day-today.fc-daygrid-day .fc-daygrid-day-frame::after { content: '● Today'; position: absolute; top: 2px; right: 4px; font-size: 10px; font-weight: 700; background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); padding: 2px 8px; border-radius: 6px; line-height: 1.4; letter-spacing: 0.3px; box-shadow: 0 2px 6px rgba(59,130,246,0.3); }
.fc-day-today.fc-timegrid-col { background: rgba(59,130,246,0.08) !important; box-shadow: inset 3px 3px 0 hsl(var(--primary)), inset -3px -3px 0 hsl(var(--primary)) !important; }
.fc-day-today.fc-timegrid-col .fc-timegrid-col-frame { position: relative !important; }
.fc-day-today.fc-timegrid-col .fc-timegrid-col-header { background: transparent !important; }
.fc-day-today.fc-timegrid-col .fc-timegrid-col-header .fc-col-header-cell-cushion { background: hsl(var(--primary)); color: hsl(var(--primary-foreground)) !important; display: inline-block; padding: 4px 10px !important; border-radius: 6px; font-size: 0.8rem !important; }
.fc-day-today.fc-timegrid-col .fc-timegrid-col-frame::after { content: '● Today'; position: absolute; top: 2px; right: 4px; font-size: 10px; font-weight: 700; background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); padding: 2px 8px; border-radius: 6px; line-height: 1.4; letter-spacing: 0.3px; box-shadow: 0 2px 6px rgba(59,130,246,0.3); z-index: 2; }
.fc .fc-highlight { background: hsl(var(--primary)) !important; opacity: 0.1 !important; }
.fc .fc-timegrid-now-indicator-line { border-color: hsl(var(--destructive)) !important; }
.fc .fc-timegrid-now-indicator-arrow { border-color: hsl(var(--destructive)) !important; color: hsl(var(--destructive)) !important; }
`;

const STATUS_COLORS = { 
  scheduled: '#f59e0b', 
  confirmed: '#3b82f6', 
  completed: '#22c55e', 
  cancelled: '#ef4444', 
  'checked-in': '#3b82f6', 
  'no-show': '#8b5cf6' 
};

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get('page')) || 1;
  const limit = Number(sp.get('limit')) || 15;
  const search = sp.get('search') || '';
  const sortBy = sp.get('sortBy') || '';
  const sortOrder = sp.get('sortOrder') || '';
  const statusFilter = sp.get('status') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
  const [doctorFilter, setDoctorFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { user } = useAuth();
  const { data: myProfile } = useMyDoctorProfile(user?.role === 'doctor');
  const myDoctorId = myProfile?.doctor?._id || myProfile?._id;
  const effectiveDoctor = user?.role === 'doctor' ? (myDoctorId || '') : doctorFilter;

  const { data: eventsData, isLoading: eventsLoading } = useCalendarEvents(dateRange.start, dateRange.end, effectiveDoctor);
  const { data: listData, isLoading: listLoading, error: listError } = useAppointments({ page, limit, search, sortBy, sortOrder, status: statusFilter, doctor: effectiveDoctor });
  const { data: doctorsData } = useDoctors();
  const { data: selectedDoctorData } = useDoctor(selectedDoctor);
  const { data: searchResults } = usePatientSearch(patientSearch);
  const createAppointment = useCreateAppointment();
  const confirmAppointment = useConfirmAppointment();
  const cancelAppointment = useCancelAppointment();
  const toast = useToast();

  useEffect(() => {
    if (listError) toast.error(listError.message || 'Failed to load data');
  }, [listError, toast]);

  const doctors = doctorsData?.doctors || [];
  const appointments = listData?.appointments || [];
  const total = listData?.total || 0;
  const totalPages = listData?.totalPages || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const maxSlots = selectedDoctorData?.doctor?.maxPatientsPerHour || 2;
  const availabilityByDay = eventsData?.availabilityByDay;
  const todayStr = new Date().toISOString().split('T')[0];
  
  const selectedDayAvailability = useMemo(() => {
    return (availabilityByDay || []).find(d => d.date === selectedDate)?.hours || {};
  }, [availabilityByDay, selectedDate]);

  const timeSlots = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) =>
      `${String(9 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`
    );
  }, []);

  const slotAvailability = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return {};
    const result = {};
    for (const slot of timeSlots) {
      const hour = slot.split(':')[0];
      const info = selectedDayAvailability[hour];
      result[slot] = info 
        ? { booked: info.booked, max: info.max, full: info.booked >= info.max } 
        : { booked: 0, max: maxSlots, full: false };
    }
    return result;
  }, [selectedDoctor, selectedDate, selectedDayAvailability, timeSlots, maxSlots]);

  const up = useCallback((u) => {
    setSp(p => {
      const n = new URLSearchParams(p);
      Object.entries(u).forEach(([k, v]) => {
        if (v) n.set(k, v);
        else n.delete(k);
      });
      return n;
    });
  }, [setSp]);

  const hs = (k) => {
    if (sortBy === k) up({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc', page: '1' });
    else up({ sortBy: k, sortOrder: 'asc', page: '1' });
  };

  const cl = (n) => { up({ limit: String(n), page: '1' }); };

  useEffect(() => {
    const h = setTimeout(() => { up({ search: searchInput, page: '1' }); }, 350);
    return () => clearTimeout(h);
  }, [searchInput, up]);

  const haf = !!(statusFilter || search || (user?.role !== 'doctor' && doctorFilter));
  
  const hcf = () => {
    setSearchInput('');
    setDoctorFilter('');
    up({ status: '', search: '', page: '1' });
  };

  const handleDatesSet = (arg) => { setDateRange({ start: arg.start.toISOString(), end: arg.end.toISOString() }); };
  const handleDateClick = (arg) => { setSelectedDate(arg.dateStr); setShowBook(true); };
  const handleEventClick = (arg) => { setSelectedEvent({ ...arg.event.extendedProps, _id: arg.event.id }); };
  
  const handleBook = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedDate) {
      toast.error('Select patient, doctor, and date');
      return;
    }
    const [h, m] = selectedSlot.split(':').map(Number);
    const end = `${String(h + (m + 15 >= 60 ? 1 : 0)).padStart(2, '0')}:${String((m + 15) % 60).padStart(2, '0')}`;
    try {
      await createAppointment.mutateAsync({
        patient: selectedPatient._id,
        doctor: selectedDoctor,
        date: selectedDate,
        timeSlot: { start: selectedSlot, end },
        reason,
        status: 'scheduled'
      });
      setShowBook(false);
      setSelectedPatient(null);
      setPatientSearch('');
      setReason('');
    } catch (err) {
      console.error('Failed to book appointment:', err);
    }
  };

  const gp = (p) => {
    if (p < 1 || p > totalPages) return;
    up({ page: String(p) });
  };

  const events = useMemo(() => {
    return (eventsData?.events || []).map(e => ({
      ...e,
      start: e.start,
      end: e.end,
      backgroundColor: STATUS_COLORS[e.extendedProps?.status] || STATUS_COLORS[e.status] || '#3b82f6',
      borderColor: STATUS_COLORS[e.extendedProps?.status] || STATUS_COLORS[e.status] || '#3b82f6'
    }));
  }, [eventsData?.events]);

  const todayAppts = appointments.filter(a => a.date?.startsWith(todayStr)).length;
  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  if (listError) return <div className="flex justify-center py-12"><p className="text-destructive font-medium">Failed to load</p></div>;
  if (listLoading) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <style>{calendarCss}</style>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Schedule, view, and manage patient appointments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={view === 'calendar' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setView('calendar')}
          >
            <Calendar className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Calendar</span>
          </Button>
          <Button 
            variant={view === 'list' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">List</span>
          </Button>
          <Button onClick={() => setShowBook(true)}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <Calendar className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Book</span>
          </Button>
        </div>
      </div>

      <StatsBanner
        todayAppts={todayAppts}
        total={total}
        scheduledCount={scheduledCount}
        completedCount={completedCount}
        cancelledCount={cancelledCount}
      />

      {view === 'calendar' ? (
        <AppointmentsCalendarView
          user={user}
          doctors={doctors}
          doctorFilter={doctorFilter}
          setDoctorFilter={setDoctorFilter}
          events={events}
          handleDatesSet={handleDatesSet}
          handleDateClick={handleDateClick}
          handleEventClick={handleEventClick}
          calendarRef={calendarRef}
          eventsLoading={eventsLoading}
        />
      ) : (
        <AppointmentsListView
          user={user}
          doctors={doctors}
          appointments={appointments}
          total={total}
          totalPages={totalPages}
          from={from}
          to={to}
          page={page}
          limit={limit}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          statusFilter={statusFilter}
          doctorFilter={doctorFilter}
          setDoctorFilter={setDoctorFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          haf={haf}
          hcf={hcf}
          up={up}
          hs={hs}
          cl={cl}
          gp={gp}
          listLoading={listLoading}
          cancelAppointment={cancelAppointment}
          navigate={navigate}
        />
      )}

      <BookingModal
        isOpen={showBook}
        onClose={() => setShowBook(false)}
        doctors={doctors}
        selectedDoctor={selectedDoctor}
        setSelectedDoctor={setSelectedDoctor}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
        patientSearch={patientSearch}
        setPatientSearch={setPatientSearch}
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        reason={reason}
        setReason={setReason}
        searchResults={searchResults}
        slotAvailability={slotAvailability}
        timeSlots={timeSlots}
        maxSlots={maxSlots}
        handleBook={handleBook}
        isPending={createAppointment.isPending}
      />

      <EventDetailsModal
        selectedEvent={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onConfirm={() => {
          confirmAppointment.mutate(selectedEvent._id);
          setSelectedEvent(null);
        }}
        onCancel={() => {
          cancelAppointment.mutate(selectedEvent._id);
          setSelectedEvent(null);
        }}
        onViewPatient={() => {
          navigate(`/patients/${selectedEvent.patient?._id}`);
          setSelectedEvent(null);
        }}
        isConfirmPending={confirmAppointment.isPending}
        isCancelPending={cancelAppointment.isPending}
      />
    </div>
  );
}
