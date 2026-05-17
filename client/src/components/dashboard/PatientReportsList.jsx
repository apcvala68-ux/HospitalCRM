import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { data, isLoading } = useRecentLabResults();
  const results = data?.labResults || [];
  const displayResults = results.slice(0, 5);

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
        {results.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground">No lab results yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayResults.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{categoryIcons[r.category] || '📋'}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{r.patientName}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{r.testName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    r.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                    r.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
                    'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                  )}>
                    {r.status}
                  </span>
                  {r.status === 'completed' && (
                    <button className="rounded p-1 hover:bg-muted">
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
