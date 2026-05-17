import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { data, isLoading } = useTodayAppointments();
  const appointments = data?.appointments || [];
  const displayAppointments = appointments.slice(0, 5);

  if (isLoading) {
    return (
      <Card className="border-border/40 shadow-none h-full flex flex-col">
        <CardContent className="p-4 flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-none h-full flex flex-col">
      <CardContent className="p-4 flex-1">
        {appointments.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground">No appointments today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayAppointments.map((apt) => (
              <div key={apt._id} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {apt.patientName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{apt.patientName}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{apt.department}</span>
                    </div>
                  </div>
                </div>
                <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold', statusColors[apt.status] || statusColors.scheduled)}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
