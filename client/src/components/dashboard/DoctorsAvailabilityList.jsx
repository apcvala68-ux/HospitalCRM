import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Stethoscope, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDoctorsAvailability } from '../../hooks/useDashboard';
import { cn } from '../../lib/utils';

export function DoctorsAvailabilityList() {
  const navigate = useNavigate();
  const { data, isLoading } = useDoctorsAvailability();
  const doctors = data?.doctors || [];
  const displayDoctors = doctors.slice(0, 5);

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
        {doctors.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground">No doctors found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayDoctors.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {doc.name?.split(' ').map(n => n[0]).join('') || 'D'}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Dr. {doc.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{doc.specialization}</p>
                  </div>
                </div>
                <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  doc.isAvailable
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                )}>
                  {doc.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
