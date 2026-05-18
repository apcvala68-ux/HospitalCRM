import { DashboardCard, DashboardCardContent } from '../ui/card';
import { Clock, MapPin } from 'lucide-react';
import { useTodayAppointments } from '../../hooks/useDashboard';
import { cn } from '../../lib/utils';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'checked-in': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  'no-show': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function AppointmentRequestList() {
  const { data, isLoading } = useTodayAppointments();
  const appointments = data?.appointments || [];
  const displayAppointments = appointments.slice(0, 5);

  if (isLoading) {
    return (
      <DashboardCard>
        <DashboardCardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </DashboardCardContent>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <DashboardCardContent className="p-0">
        {appointments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No appointments today</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {displayAppointments.map((apt) => (
              <div key={apt._id} className="flex items-center justify-between px-3.5 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                    {apt.patientName?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{apt.patientName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground/80 mt-0.5">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{apt.department}</span>
                    </div>
                  </div>
                </div>
                <span className={cn('shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold', statusColors[apt.status] || statusColors.scheduled)}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
}
