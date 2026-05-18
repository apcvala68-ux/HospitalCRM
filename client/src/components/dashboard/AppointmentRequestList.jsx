import { Chip } from '@heroui/react';
import { Clock, MapPin } from 'lucide-react';
import { useTodayAppointments } from '../../hooks/useDashboard';

const statusColorMap = {
  scheduled: 'warning',
  confirmed: 'success',
  'checked-in': 'accent',
  completed: 'default',
  cancelled: 'danger',
  'no-show': 'danger',
};

function Avatar({ name }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
      {initial}
    </div>
  );
}

export function AppointmentRequestList() {
  const { data, isLoading } = useTodayAppointments();
  const appointments = data?.appointments || [];
  const items = appointments.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">No appointments today</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/30 rounded-xl border border-border/60 bg-card shadow-[var(--shadow-card)] overflow-hidden">
      {items.map((apt) => (
        <div key={apt._id} className="flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/40 hover:border-l-2 hover:border-l-primary transition-all duration-150 border-l-2 border-l-transparent">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={apt.patientName} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{apt.patientName}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.time}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{apt.department}</span>
              </div>
            </div>
          </div>
          <Chip color={statusColorMap[apt.status] || 'default'} variant="soft" size="sm">
            {apt.status}
          </Chip>
        </div>
      ))}
    </div>
  );
}
