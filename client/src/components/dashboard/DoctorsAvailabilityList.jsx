import { DashboardCard, DashboardCardContent } from '../ui/card';
import { useDoctorsAvailability } from '../../hooks/useDashboard';
import { cn } from '../../lib/utils';

export function DoctorsAvailabilityList() {
  const { data, isLoading } = useDoctorsAvailability();
  const doctors = data?.doctors || [];
  const displayDoctors = doctors.slice(0, 5);

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
        {doctors.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No doctors found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {displayDoctors.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between px-3.5 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                    {doc.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'D'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5 truncate">{doc.specialization}</p>
                  </div>
                </div>
                <span className={cn('shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                  doc.isAvailable
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                )}>
                  {doc.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            ))}
          </div>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
}
