import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Download } from 'lucide-react';
import { useRecentLabResults } from '../../hooks/useDashboard';

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

const statusColors = {
  pending: 'warning',
  collected: 'info',
  'in-progress': 'info',
  completed: 'success',
  cancelled: 'destructive',
};

export function PatientReportsList({ className }) {
  const { data, isLoading } = useRecentLabResults();
  const results = data?.labResults || [];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader><CardTitle className="text-lg">Patient Reports</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground text-center py-8">Loading...</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Patient Reports</CardTitle>
        <Badge variant="outline">{results.length} results</Badge>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No lab results yet</p>
        ) : (
          <div className="space-y-2">
            {results.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-lg border p-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{categoryIcons[r.category] || '📋'}</span>
                  <div>
                    <p className="text-sm font-medium">{r.patientName}</p>
                    <p className="text-xs text-muted-foreground">{r.testName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusColors[r.status] || 'outline'} className="text-xs">
                    {r.status}
                  </Badge>
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
