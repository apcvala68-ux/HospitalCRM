import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTodayAppointments } from '../../hooks/useDashboard';

const statusColors = {
  scheduled: 'info',
  confirmed: 'success',
  'checked-in': 'warning',
  completed: 'default',
  cancelled: 'destructive',
  'no-show': 'destructive',
};

export function AppointmentRequestList() {
  const navigate = useNavigate();
  const { data, isLoading } = useTodayAppointments();
  const appointments = data?.appointments || [];
  const [showMore, setShowMore] = useState(false);

  const displayAppointments = showMore ? appointments : appointments.slice(0, 5);

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
        <Badge variant="outline">{appointments.length} today</Badge>
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
                <Badge variant={statusColors[apt.status] || 'outline'} className="text-xs">
                  {apt.status}
                </Badge>
              </div>
            ))}
            {appointments.length > 5 && !showMore && (
              <Button variant="ghost" className="w-full mt-2" onClick={() => navigate('/appointments')}>
                View More ({appointments.length - 5} more)
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
