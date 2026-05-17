import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Stethoscope, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDoctorsAvailability } from '../../hooks/useDashboard';

export function DoctorsAvailabilityList() {
  const navigate = useNavigate();
  const { data, isLoading } = useDoctorsAvailability();
  const doctors = data?.doctors || [];
  const displayDoctors = doctors.slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-lg">Doctors</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground text-center py-8">Loading...</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Doctors</CardTitle>
      </CardHeader>
      <CardContent>
        {doctors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No doctors found</p>
        ) : (
          <>
            <div className="space-y-2">
              {displayDoctors.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between rounded-lg border p-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {doc.name?.split(' ').map(n => n[0]).join('') || 'D'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Dr. {doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                    </div>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    doc.isAvailable
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {doc.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => navigate('/doctors')}
              className="w-full mt-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              View All Doctors
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
