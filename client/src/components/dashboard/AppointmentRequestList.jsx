import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTodayAppointments } from '../../hooks/useDashboard';

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
      <Card>
        <CardHeader><CardTitle className="text-lg">Appointment Request</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground text-center py-8">Loading...</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Appointment Request</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/appointments')}>
          View More <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No appointments today</p>
        ) : (
          <div className="space-y-3">
            {displayAppointments.map((apt) => (
              <div key={apt._id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {apt.patientName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{apt.patientName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{apt.department}</span>
                    </div>
                  </div>
                </div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[apt.status] || statusColors.scheduled}`}>
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
