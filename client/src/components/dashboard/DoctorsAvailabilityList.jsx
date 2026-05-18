import { Chip } from '@heroui/react';
import { useDoctorsAvailability } from '../../hooks/useDashboard';

function Avatar({ name }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'D';
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
      {initials}
    </div>
  );
}

export function DoctorsAvailabilityList() {
  const { data, isLoading } = useDoctorsAvailability();
  const doctors = data?.doctors || [];
  const items = doctors.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">No doctors found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/30 rounded-xl border border-border/60 bg-card shadow-[var(--shadow-card)] overflow-hidden">
      {items.map((doc) => (
        <div key={doc._id} className="flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/40 hover:border-l-2 hover:border-l-primary transition-all duration-150 border-l-2 border-l-transparent">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={doc.name} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{doc.specialization}</p>
            </div>
          </div>
          <Chip color={doc.isAvailable ? 'success' : 'danger'} variant="soft" size="sm">
            {doc.isAvailable ? 'Available' : 'Unavailable'}
          </Chip>
        </div>
      ))}
    </div>
  );
}
