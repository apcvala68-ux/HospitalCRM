import { useState, useRef, useCallback, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCalendarEvents, useAppointments, useCancelAppointment, useCreateAppointment } from '../../hooks/useAppointments';
import { useDoctors, useMyDoctorProfile } from '../../hooks/useDoctor';
import { usePatientSearch } from '../../hooks/usePatients';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/useToast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Plus, X, ChevronLeft, ChevronRight, Search, SlidersHorizontal,
  Clock, CheckCircle, CalendarX2, ArrowUpDown, ArrowUp, ArrowDown, Eye,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];
const GRADIENTS = ['linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)','linear-gradient(135deg, #f472b6 0%, #f43f5e 100%)','linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)','linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)','linear-gradient(135deg, #fb923c 0%, #f97316 100%)','linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)','linear-gradient(135deg, #f472b6 0%, #a855f7 100%)','linear-gradient(135deg, #34d399 0%, #059669 100%)'];
const getGradient = (id) => { if (!id) return GRADIENTS[0]; let h=0; for(let i=0;i<id.length;i++) h=id.charCodeAt(i)+((h<<5)-h); return GRADIENTS[Math.abs(h)%GRADIENTS.length]; };
function SortIcon({ active, direction }) { if(!active) return <ArrowUpDown className="h-3 w-3 opacity-30 shrink-0" />; return direction==='asc' ? <ArrowUp className="h-3 w-3 shrink-0" /> : <ArrowDown className="h-3 w-3 shrink-0" />; }
function getPageNumbers(c,t){if(t<=7)return Array.from({length:t},(_,i)=>i+1);const p=[1];let s=Math.max(2,c-2),e=Math.min(t-1,c+2);if(c<=3)e=Math.min(5,t-1);if(c>=t-2)s=Math.max(t-4,2);if(s>2)p.push('...');for(let i=s;i<=e;i++)p.push(i);if(e<t-1)p.push('...');p.push(t);return p;}
function StatCard({ label, value, icon: Icon, color, bg, changeText, isIncrease }) {
  return (
    <Card className="flex-1 min-w-[220px] shadow-[var(--shadow-kpi)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden">
      <CardContent className="py-4 px-5 flex-1">
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase block">{label}</span>
            <p className="text-3xl font-extrabold text-foreground tracking-tight leading-none">{value}</p>
            {changeText && (
              <span className={cn("text-xs font-semibold block mt-1", isIncrease ? 'text-emerald-500' : 'text-rose-500')}>
                {changeText}
              </span>
            )}
          </div>
          <div className={cn('rounded-xl p-3 shrink-0 flex items-center justify-center', bg)}>
            <Icon className="h-5.5 w-5.5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
const statusVariant = { scheduled:'warning', confirmed:'info', completed:'success', cancelled:'destructive', 'checked-in':'info' };

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
.fc .fc-daygrid-day-number { font-size: 0.8rem !important; font-weight: 500 !important; padding: 4px 6px !important; }
.fc .fc-col-header-cell-cushion { font-size: 0.75rem !important; font-weight: 600 !important; text-transform: uppercase !important; color: hsl(var(--muted-foreground)) !important; padding: 6px 0 !important; }
.fc .fc-timegrid-slot { height: 2rem !important; }
.fc .fc-timegrid-slot-label-cushion { font-size: 0.7rem !important; font-weight: 500 !important; }
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
  const { data: myProfile } = useMyDoctorProfile();
  const myDoctorId = myProfile?.doctor?._id || myProfile?._id;
  const effectiveDoctor = user?.role === 'doctor' ? (myDoctorId || '') : doctorFilter;

  const { data: eventsData } = useCalendarEvents(dateRange.start, dateRange.end, effectiveDoctor);
  const { data: listData, isLoading: listLoading, error: listError } = useAppointments({ page, limit, search, sortBy, sortOrder, status: statusFilter, doctor: effectiveDoctor });
  const { data: doctorsData } = useDoctors();
  const { data: searchResults } = usePatientSearch(patientSearch);
  const createAppointment = useCreateAppointment();
  const cancelAppointment = useCancelAppointment();
  const toast = useToast();
  useEffect(() => {
    if (listError) toast.error(listError.message || 'Failed to load data');
  }, [listError]);

  const doctors = doctorsData?.doctors || [];
  const appointments = listData?.appointments || [];
  const total = listData?.total || 0;
  const totalPages = listData?.totalPages || 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const up = useCallback((u) => {
    setSp(p => { const n = new URLSearchParams(p); Object.entries(u).forEach(([k, v]) => { if (v) n.set(k, v); else n.delete(k); }); return n; });
  }, [setSp]);
  const hs = (k) => { if (sortBy === k) up({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc', page: '1' }); else up({ sortBy: k, sortOrder: 'asc', page: '1' }); };
  const cl = (n) => { up({ limit: String(n), page: '1' }); };
  useEffect(() => { const h = setTimeout(() => { up({ search: searchInput, page: '1' }); }, 350); return () => clearTimeout(h); }, [searchInput, up]);
  const haf = !!(statusFilter || search || (user?.role !== 'doctor' && doctorFilter));
  const hcf = () => { setSearchInput(''); setDoctorFilter(''); up({ status: '', search: '', page: '1' }); };

  const handleDatesSet = (arg) => { setDateRange({ start: arg.start.toISOString(), end: arg.end.toISOString() }); };
  const handleDateClick = (arg) => { setSelectedDate(arg.dateStr); setShowBook(true); };
  const handleEventClick = (arg) => { setSelectedEvent(arg.event.extendedProps); };
  const handleBook = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedDate) { toast.error('Select patient, doctor, and date'); return; }
    const [h, m] = selectedSlot.split(':').map(Number);
    const end = `${String(h + (m + 15 >= 60 ? 1 : 0)).padStart(2, '0')}:${String((m + 15) % 60).padStart(2, '0')}`;
    try {
      await createAppointment.mutateAsync({ patient: selectedPatient._id, doctor: selectedDoctor, date: selectedDate, timeSlot: { start: selectedSlot, end }, reason, status: 'scheduled' });
      setShowBook(false); setSelectedPatient(null); setPatientSearch(''); setReason('');
    } catch { /* hook handles errors via onError */ }
  };
  const gp = (p) => { if (p < 1 || p > totalPages) return; up({ page: String(p) }); };
  const goToPage = gp;

  const events = (eventsData?.events || []).map(e => ({ ...e, start: e.start, end: e.end }));
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter(a => a.date?.startsWith(todayStr)).length;
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
          <Button variant={view === 'calendar' ? 'default' : 'outline'} size="sm" onClick={() => setView('calendar')}><Calendar className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Calendar</span></Button>
          <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setView('list')}><span className="hidden sm:inline">List</span></Button>
          <Button onClick={() => setShowBook(true)}><Plus className="h-4 w-4 sm:mr-2" /><Calendar className="h-4 w-4 sm:hidden" /><span className="hidden sm:inline">Book</span></Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Appointments" value={todayCount} icon={Calendar} color="#3b82f6" bg="bg-blue-50 dark:bg-blue-950/30" changeText={`of ${total} total`} isIncrease />
        <StatCard label="Scheduled" value={scheduledCount} icon={Clock} color="#f59e0b" bg="bg-amber-50 dark:bg-amber-950/30" changeText="Awaiting" isIncrease />
        <StatCard label="Completed" value={completedCount} icon={CheckCircle} color="#0d9488" bg="bg-teal-50 dark:bg-teal-950/30" changeText="Done today" isIncrease />
        <StatCard label="Cancelled" value={cancelledCount} icon={CalendarX2} color="#ef4444" bg="bg-red-50 dark:bg-red-950/30" changeText={cancelledCount > 0 ? `${cancelledCount} cancelled` : ''} isIncrease={false} />
      </div>

      {showBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowBook(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-card border shadow-2xl p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Book Appointment</h2>
              <button onClick={() => setShowBook(false)} className="w-8 h-8 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Patient</label>
                {selectedPatient ? (
                  <div className="flex items-center justify-between rounded-xl border border-border/60 dark:border-zinc-800/80 p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-md" style={{ background: getGradient(selectedPatient._id) }}>{selectedPatient.firstName?.charAt(0)}{selectedPatient.lastName?.charAt(0)}</div>
                      <div><p className="text-sm font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</p><p className="text-[11px] text-muted-foreground font-mono">{selectedPatient.uhid}</p></div>
                    </div>
                    <button onClick={() => { setSelectedPatient(null); setPatientSearch(''); }} className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <div>
                    <Input placeholder="Search patient by name or ID..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} className="rounded-xl border-border/20 bg-muted/15 h-9 text-xs" />
                    {searchResults?.patients?.length > 0 && (
                      <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-border/40 bg-card shadow-lg">
                        {searchResults.patients.map(p => (
                          <button key={p._id} type="button" onClick={() => { setSelectedPatient(p); setPatientSearch(''); }} className="w-full px-3 py-2.5 text-left text-sm hover:bg-muted/50 border-b last:border-0 border-border/10 flex items-center gap-2 cursor-pointer">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-[10px] shadow-sm shrink-0" style={{ background: getGradient(p._id) }}>{p.firstName?.charAt(0)}{p.lastName?.charAt(0)}</div>
                            <div><p className="font-medium text-sm">{p.firstName} {p.lastName}</p><p className="text-[10px] text-muted-foreground font-mono">{p.uhid}</p></div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Doctor</label>
                <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} className="flex h-9 w-full rounded-xl border border-border/20 bg-muted/15 px-3 text-xs outline-none cursor-pointer">
                  <option value="">Select doctor</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{d.user?.name} — {d.specialization}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Date</label>
                <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="h-9 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Time</label>
                <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="flex h-9 w-full rounded-xl border border-border/20 bg-muted/15 px-3 text-xs outline-none cursor-pointer">
                  {Array.from({ length: 16 }, (_, i) => `${String(9 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-foreground">Reason</label>
                <Input placeholder="Reason for visit..." value={reason} onChange={e => setReason(e.target.value)} className="rounded-xl border-border/20 bg-muted/15 h-9 text-xs" />
              </div>
              <div className="md:col-span-2">
                <Button onClick={handleBook} disabled={createAppointment.isPending} className="rounded-xl">{createAppointment.isPending ? 'Booking...' : 'Book Appointment'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'calendar' ? (
        <>
          {user?.role !== 'doctor' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground shrink-0">Doctor:</label>
              <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}
                className="h-9 rounded-xl border border-border/20 bg-muted/15 px-3 text-xs outline-none cursor-pointer">
                <option value="">All Doctors</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.user?.name}</option>)}
              </select>
            </div>
          )}
          <Card>
            <CardContent className="p-4">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
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
                nowIndicator={true}
                eventContent={(arg) => ({
                  html: `<div style="font-size:11px;line-height:1.3;padding:1px 3px;">
                    <strong>${arg.event.title.split(' - ')[0]}</strong>
                    <div style="font-size:10px;opacity:0.8">${arg.timeText} · ${arg.event.extendedProps?.status}</div>
                  </div>`,
                })}
              />
              <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{background:'#f59e0b'}} />Scheduled</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{background:'#3b82f6'}} />Confirmed</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{background:'#22c55e'}} />Completed</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{background:'#ef4444'}} />Cancelled</span>
              </div>
            </CardContent>
          </Card>

          {selectedEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedEvent(null)}>
              <div className="w-full max-w-sm rounded-2xl bg-card border shadow-2xl p-5 space-y-3" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">Appointment Details</h3>
                  <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-muted rounded-lg cursor-pointer"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Patient:</span> <span className="font-medium">{selectedEvent.patient?.firstName} {selectedEvent.patient?.lastName}</span></p>
                  <p><span className="text-muted-foreground">Doctor:</span> <span className="font-medium">{selectedEvent.doctor?.user?.name}</span></p>
                  <p><span className="text-muted-foreground">Status:</span> <Badge variant={statusVariant[selectedEvent.status] || 'default'} className="capitalize">{selectedEvent.status}</Badge></p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { navigate(`/patients/${selectedEvent.patient?._id}`); setSelectedEvent(null); }} className="w-full">View Patient</Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 w-full bg-card p-3 rounded-xl border border-border/50 shadow-sm">
              <form onSubmit={e => e.preventDefault()} className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by reason..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-10 pr-4 rounded-xl border-border/20 bg-muted/15 focus-visible:bg-background focus:ring-1 focus:ring-primary h-9 text-xs" />
              </form>
              <div className="flex items-center gap-2">
                {haf && <button onClick={hcf} className="h-9 px-3.5 rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-sm"><X className="h-3.5 w-3.5" /><span className="hidden sm:inline"> Clear Filters</span></button>}
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={cn("h-9 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none", isFilterOpen ? "bg-muted text-foreground border-zinc-300 dark:bg-[#18181b] dark:text-zinc-100 dark:border-zinc-700 shadow-md" : "border-border/60 dark:border-border/20 bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 text-muted-foreground hover:text-foreground")}>
                  <SlidersHorizontal className="h-3.5 w-3.5" /><span className="hidden sm:inline"> Filter</span>{(statusFilter || (user?.role !== 'doctor' && doctorFilter)) && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              </div>
            </div>
            {isFilterOpen && (
              <div className="p-4 bg-card rounded-xl border border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="text-[10px] font-bold text-muted-foreground block mb-2 uppercase tracking-wider">Status</span><div className="flex flex-wrap gap-2">{['', 'scheduled', 'confirmed', 'checked-in', 'completed', 'cancelled'].map(s => <button key={s} onClick={() => up({ status: s, page: '1' })} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none", (statusFilter === s) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/10 hover:bg-muted/20 border-border/10 text-muted-foreground hover:text-foreground")}>{s ? s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ') : 'All'}</button>)}</div></div>
                  {user?.role !== 'doctor' && (
                    <div><span className="text-[10px] font-bold text-muted-foreground block mb-2 uppercase tracking-wider">Doctor</span>
                      <select value={doctorFilter} onChange={e => { setDoctorFilter(e.target.value); up({ page: '1' }); }}
                        className="h-9 rounded-xl border border-input bg-background px-3 text-xs outline-none w-full max-w-xs cursor-pointer">
                        <option value="">All Doctors</option>
                        {doctors.map(d => <option key={d._id} value={d._id}>{d.user?.name} — {d.specialization}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">
              {listLoading ? (
                <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
              ) : appointments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">{search || statusFilter || doctorFilter ? 'No appointments match your filters' : 'No appointments yet'}</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="pb-3 pr-2 w-10 text-center font-semibold">#</th>
                          <th className="pb-3 font-semibold">Patient</th>
                          <th className="pb-3 font-semibold hidden md:table-cell">Doctor</th>
                          <th className="pb-3 font-semibold cursor-pointer select-none hidden md:table-cell" onClick={() => hs('date')}><span className="inline-flex items-center gap-1">Date <SortIcon active={sortBy === 'date'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('timeSlot.start')}><span className="inline-flex items-center gap-1">Time <SortIcon active={sortBy === 'timeSlot.start'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => hs('status')}><span className="inline-flex items-center gap-1">Status <SortIcon active={sortBy === 'status'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold cursor-pointer select-none hidden lg:table-cell" onClick={() => hs('createdAt')}><span className="inline-flex items-center gap-1">Created <SortIcon active={sortBy === 'createdAt'} direction={sortOrder} /></span></th>
                          <th className="pb-3 font-semibold w-32 text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((a, idx) => (
                          <tr key={a._id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                            <td className="py-3.5 pr-2 text-center text-xs text-muted-foreground font-mono">{from + idx}</td>
                            <td className="py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white font-black text-xs shadow-md border border-white/10" style={{ background: getGradient(a.patient?._id || a._id) }}>
                                  {a.patient?.firstName?.charAt(0)}{a.patient?.lastName?.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-sm">{a.patient?.firstName} {a.patient?.lastName}</span>
                                  <span className="text-xs text-muted-foreground font-mono">{a.patient?.uhid || ''}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 hidden md:table-cell"><span className="text-sm font-medium">{a.doctor?.user?.name || <span className="text-muted-foreground">—</span>}</span><span className="block text-[10px] text-muted-foreground">{a.doctor?.specialization}</span></td>
                            <td className="py-3.5 text-xs text-muted-foreground whitespace-nowrap font-medium hidden md:table-cell">{a.date ? new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                            <td className="py-3.5 text-sm font-medium">{a.timeSlot?.start}–{a.timeSlot?.end}</td>
                            <td className="py-3.5"><Badge variant={statusVariant[a.status] || 'default'} className="capitalize">{a.status}</Badge></td>
                            <td className="py-3.5 text-xs text-muted-foreground whitespace-nowrap font-medium hidden lg:table-cell">{new Date(a.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td className="py-3.5 text-right pr-4">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => navigate(`/patients/${a.patient?._id}`)} className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer" title="View"><Eye className="h-[18px] w-[18px]" /></button>
                                {a.status !== 'cancelled' && a.status !== 'completed' && (
                                  <button onClick={() => cancelAppointment.mutate(a._id)} className="w-9 h-9 rounded-full border border-red-200 dark:border-red-950/60 flex items-center justify-center bg-red-50/50 hover:bg-red-100 dark:bg-[#2a1415] dark:hover:bg-[#3f1a1c] text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 shadow-sm transition-all duration-200 cursor-pointer" title="Cancel"><X className="h-4 w-4" /></button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 border-t border-border/10 mt-2">
                    <div className="flex flex-wrap items-center gap-4">
                      <p className="text-xs text-muted-foreground font-semibold">Showing {from}–{to} of {total} appointments</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 border-l border-border/20 pl-4">
                        <label htmlFor="page-size" className="font-semibold">Rows per page:</label>
                        <select id="page-size" value={limit} onChange={e => cl(Number(e.target.value))} className="rounded-xl border border-border/20 bg-muted/15 hover:bg-muted/25 px-2.5 py-1 text-[11px] font-semibold transition-colors outline-none cursor-pointer">{PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n} className="bg-background">{n}</option>)}</select>
                      </div>
                    </div>
                    {totalPages > 1 && <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                      {getPageNumbers(page, totalPages).map((p, i) => p === '...' ? <span key={`e-${i}`} className="px-1 text-muted-foreground font-semibold">…</span> : <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => goToPage(p)} className="h-8 min-w-[2rem] px-2 font-semibold text-xs">{p}</Button>)}
                      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
                    </div>}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
