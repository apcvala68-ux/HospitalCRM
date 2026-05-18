import { DashboardCard, DashboardCardContent } from '../ui/card';
import { useLatestAppointments } from '../../hooks/useDashboard';
import { cn } from '../../lib/utils';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'checked-in': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  'no-show': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function LatestAppointmentsTable() {
  const { data, isLoading } = useLatestAppointments();
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
            <p className="text-sm text-muted-foreground">No appointments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="px-3.5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Patient ID</th>
                  <th className="px-3.5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Patient Name</th>
                  <th className="px-3.5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Session Type</th>
                  <th className="px-3.5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Doctor Name</th>
                  <th className="px-3.5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</th>
                  <th className="px-3.5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {displayAppointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-3.5 py-3 text-[11px] font-mono text-muted-foreground">{apt.patientId}</td>
                    <td className="px-3.5 py-3 text-sm font-semibold text-foreground">{apt.patientName}</td>
                    <td className="px-3.5 py-3 text-xs text-muted-foreground">{apt.sessionType}</td>
                    <td className="px-3.5 py-3 text-xs text-muted-foreground">{apt.doctorName}</td>
                    <td className="px-3.5 py-3 text-xs text-muted-foreground">{apt.dateTime}</td>
                    <td className="px-3.5 py-3 text-right">
                      <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold', statusColors[apt.status] || statusColors.scheduled)}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
}
