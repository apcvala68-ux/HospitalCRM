import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

export function AppointmentsCalendarView({
  user,
  doctors,
  doctorFilter,
  setDoctorFilter,
  events,
  handleDatesSet,
  handleDateClick,
  handleEventClick,
  calendarRef,
  eventsLoading
}) {
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);

  const filteredDoctors = doctors.filter(d =>
    !doctorSearch || d.user?.name?.toLowerCase().includes(doctorSearch.toLowerCase())
  );
  const selectedDoctorObj = doctors.find(d => d._id === doctorFilter);

  return (
    <>
      {user?.role !== 'doctor' && (
        <div className="flex items-center gap-2 max-w-sm mb-4">
          <label className="text-xs font-semibold text-muted-foreground shrink-0">Filter Doctor:</label>
          <div className="relative w-56">
            {selectedDoctorObj ? (
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-2 py-1 transition-all w-full">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary text-white font-bold text-[10px] shrink-0">
                    {selectedDoctorObj.user?.name?.charAt(0) || 'D'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-foreground truncate">{selectedDoctorObj.user?.name}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setDoctorFilter(''); setDoctorSearch(''); }}
                  className="h-6 px-1.5 border-border/50 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="relative w-full">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="All Doctors (search...)"
                    value={doctorSearch}
                    onChange={e => setDoctorSearch(e.target.value)}
                    onFocus={() => setDoctorDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setDoctorDropdownOpen(false), 200)}
                    className="pl-8 h-8 rounded-xl bg-background text-xs"
                  />
                </div>
                {doctorDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border border-border/60 bg-card shadow-elevated animate-in fade-in duration-100">
                    {filteredDoctors.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">No doctors found</div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setDoctorFilter('');
                            setDoctorSearch('');
                            setDoctorDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-muted/40 border-b border-border/20 flex items-center gap-2 transition-colors cursor-pointer text-xs font-semibold text-foreground/80"
                        >
                          All Doctors
                        </button>
                        {filteredDoctors.map(d => (
                          <button
                            key={d._id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setDoctorFilter(d._id);
                              setDoctorSearch('');
                              setDoctorDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-muted/40 border-b last:border-0 border-border/20 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/20 text-primary font-bold text-[10px] shrink-0">
                              {d.user?.name?.charAt(0) || 'D'}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-semibold text-xs text-foreground truncate">{d.user?.name}</p>
                              <p className="text-[9px] text-muted-foreground truncate">{d.specialization}</p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          {eventsLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
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
                  html: `<div style="font-size:11px;line-height:1.3;padding:2px 4px;font-weight:600;display:flex;flex-direction:column;gap:1px;border-radius:4px;height:100%;box-shadow:inset 2px 0 0 rgba(255,255,255,0.4);">
                    <div style="font-size:10.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${arg.event.title.split(' - ')[0]}</div>
                    <div style="font-size:9.5px;opacity:0.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${arg.timeText} · ${arg.event.extendedProps?.status}</div>
                  </div>`,
                })}
              />
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#f59e0b' }} />
                  Scheduled
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#3b82f6' }} />
                  Confirmed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#22c55e' }} />
                  Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#ef4444' }} />
                  Cancelled
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#8b5cf6' }} />
                  Missed
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
