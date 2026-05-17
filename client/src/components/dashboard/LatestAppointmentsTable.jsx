import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLatestAppointments } from '../../hooks/useDashboard';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'checked-in': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  'no-show': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function LatestAppointmentsTable() {
  const navigate = useNavigate();
  const { data, isLoading } = useLatestAppointments();
  const appointments = data?.appointments || [];
  const displayAppointments = appointments.slice(0, 5);

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
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No appointments yet</p>
        ) : (
          <>
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
                  {displayAppointments.map((apt) => (
                    <tr key={apt._id} className="border-b last:border-0">
                      <td className="py-2.5 font-mono text-xs">{apt.patientId}</td>
                      <td className="py-2.5 font-medium">{apt.patientName}</td>
                      <td className="py-2.5 text-muted-foreground">{apt.sessionType}</td>
                      <td className="py-2.5 text-muted-foreground">{apt.doctorName}</td>
                      <td className="py-2.5 text-muted-foreground">{apt.dateTime}</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[apt.status] || statusColors.scheduled}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              onClick={() => navigate('/appointments')}
              className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              View All Appointments
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
