import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Stethoscope } from 'lucide-react';
import { useDoctorsAvailability } from '../../hooks/useDashboard';

export function DoctorsAvailabilityList({ className }) {
  const { data, isLoading } = useDoctorsAvailability();
  const doctors = data?.doctors || [];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader><CardTitle className="text-lg">Doctors</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground text-center py-8">Loading...</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Doctors</CardTitle>
        <Badge variant="outline">{doctors.length} total</Badge>
      </CardHeader>
      <CardContent>
        {doctors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No doctors found</p>
        ) : (
          <div className="space-y-2">
            {doctors.slice(0, 5).map((doc) => (
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
                <Badge variant={doc.isAvailable ? 'success' : 'destructive'} className="text-xs">
                  {doc.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
