import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useLatestAppointments } from '../../hooks/useDashboard';

const statusColors = {
  scheduled: 'info',
  confirmed: 'success',
  'checked-in': 'warning',
  completed: 'default',
  cancelled: 'destructive',
  'no-show': 'destructive',
};

export function LatestAppointmentsTable() {
  const { data, isLoading } = useLatestAppointments();
  const appointments = data?.appointments || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-lg">Latest Appointments</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground text-center py-8">Loading...</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Latest Appointments</CardTitle>
        <Badge variant="outline">{appointments.length} records</Badge>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No appointments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Patient ID</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Patient Name</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Session Type</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Doctor Name</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Date & Time</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt._id} className="border-b last:border-0">
                    <td className="py-2.5 font-mono text-xs">{apt.patientId}</td>
                    <td className="py-2.5 font-medium">{apt.patientName}</td>
                    <td className="py-2.5 text-muted-foreground">{apt.sessionType}</td>
                    <td className="py-2.5 text-muted-foreground">{apt.doctorName}</td>
                    <td className="py-2.5 text-muted-foreground">{apt.dateTime}</td>
                    <td className="py-2.5 text-right">
                      <Badge variant={statusColors[apt.status] || 'outline'} className="text-xs">
                        {apt.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
