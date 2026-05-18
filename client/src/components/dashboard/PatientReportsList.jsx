import { DashboardCard, DashboardCardContent } from '../ui/card';
import { useRecentLabResults } from '../../hooks/useDashboard';
import { cn } from '../../lib/utils';

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
  const displayResults = results.slice(0, 5);

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
        {results.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No lab results yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {displayResults.map((r) => (
              <div key={r._id} className="flex items-center justify-between px-3.5 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">{categoryIcons[r.category] || '📋'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{r.patientName}</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5 truncate">{r.testName}</p>
                  </div>
                </div>
                <span className={cn('shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                  r.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                  r.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                )}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
}
