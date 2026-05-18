import { Chip } from '@heroui/react';
import { useRecentLabResults } from '../../hooks/useDashboard';

const statusColorMap = {
  completed: 'success',
  pending: 'warning',
  processing: 'accent',
};

const categoryIcons = {
  hematology: '🩸',
  biochemistry: '🧪',
  microbiology: '🦠',
  serology: '🔬',
  urinalysis: '💧',
  radiology: '📷',
  pathology: '',
  other: '',
};

export function PatientReportsList() {
  const { data, isLoading } = useRecentLabResults();
  const results = data?.labResults || [];
  const items = results.slice(0, 5);

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
        <p className="text-sm text-muted-foreground">No lab results yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/30 rounded-xl border border-border/60 bg-card shadow-[var(--shadow-card)] overflow-hidden">
      {items.map((r) => (
        <div key={r._id} className="flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/40 hover:border-l-2 hover:border-l-primary transition-all duration-150 border-l-2 border-l-transparent">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-base shrink-0">{categoryIcons[r.category] || '📋'}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{r.patientName}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.testName}</p>
            </div>
          </div>
          <Chip color={statusColorMap[r.status] || 'default'} variant="soft" size="sm">
            {r.status}
          </Chip>
        </div>
      ))}
    </div>
  );
}
