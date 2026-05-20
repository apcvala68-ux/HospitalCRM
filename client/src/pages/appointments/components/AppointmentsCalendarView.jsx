import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Select, ListBox, PopoverContent } from '@heroui/react';
import { Card, CardContent } from '../../../components/ui/card';

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
  return (
    <>
      {user?.role !== 'doctor' && (
        <div className="flex items-center gap-2 max-w-xs mb-4">
          <label className="text-xs font-semibold text-muted-foreground shrink-0">Filter Doctor:</label>
          <Select
            className="w-48"
            placeholder="All Doctors"
            selectedKey={doctorFilter || 'all'}
            onSelectionChange={k => setDoctorFilter(k === 'all' ? '' : String(k))}
          >
            <Select.Trigger className="h-9 rounded-xl bg-background border-border/50 text-xs">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="border border-border/60 shadow-lg">
              <PopoverContent>
                <ListBox>
                  <ListBox.Item id="all" textValue="All Doctors">
                    All Doctors
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  {doctors.map(d => (
                    <ListBox.Item key={d._id} id={d._id} textValue={d.user?.name}>
                      {d.user?.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </PopoverContent>
            </Select.Popover>
          </Select>
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
