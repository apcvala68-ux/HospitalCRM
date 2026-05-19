import { Chip } from '@heroui/react';
import { Clock, MapPin } from 'lucide-react';
import { useTodayAppointments } from '../../hooks/useDashboard';
import { cn } from '../../lib/utils';

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

export function AppointmentRequestList({ dateRange, className }) {
  const { data, isLoading } = useTodayAppointments(dateRange);
  const appointments = data?.appointments || [];
  const items = appointments.slice(0, 5);

  const paddedItems = [...items];
  while (paddedItems.length < 5) {
    paddedItems.push({ _id: `empty-${paddedItems.length}`, isEmpty: true });
  }

  if (isLoading) {
    return (
      <div className={cn("flex flex-col justify-between rounded-lg border border-border/60 bg-card shadow-[var(--shadow-card)] overflow-hidden", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 flex items-center justify-between px-3.5 py-2.5 border-b border-border/10 last:border-b-0 animate-pulse">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-muted/20 shrink-0" />
              <div className="min-w-0 space-y-1.5">
                <div className="h-3 w-28 bg-muted/20 rounded" />
                <div className="h-2 w-16 bg-muted/20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("divide-y divide-border/30 rounded-lg border border-border/60 bg-card shadow-[var(--shadow-card)] overflow-hidden flex flex-col justify-between", className)}>
      {paddedItems.map((apt) => {
        if (apt.isEmpty) {
          return (
            <div key={apt._id} className="flex-1 flex items-center justify-between px-3.5 py-2.5 border-l-2 border-l-transparent text-muted-foreground/30 select-none">
              <div className="flex items-center gap-3 min-w-0 opacity-40">
                <div className="h-8 w-8 rounded-full bg-muted/20 shrink-0 flex items-center justify-center text-xs font-bold">-</div>
                <div className="min-w-0 space-y-1.5">
                  <div className="h-3 w-24 bg-muted/20 rounded"></div>
                  <div className="h-2 w-16 bg-muted/20 rounded"></div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={apt._id} className="flex-1 flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/40 hover:border-l-2 hover:border-l-primary transition-all duration-150 border-l-2 border-l-transparent">
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
        );
      })}
    </div>
  );
}

