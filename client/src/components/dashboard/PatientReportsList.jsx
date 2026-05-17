import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export function PatientReportsList() {
  const navigate = useNavigate();
  const { data, isLoading } = useRecentLabResults();
  const results = data?.labResults || [];
  const displayResults = results.slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-lg">Patient Reports</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground text-center py-8">Loading...</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Patient Reports</CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No lab results yet</p>
        ) : (
          <>
            <div className="space-y-2">
              {displayResults.map((r) => (
                <div key={r._id} className="flex items-center justify-between rounded-lg border p-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{categoryIcons[r.category] || '📋'}</span>
                    <div>
                      <p className="text-sm font-medium">{r.patientName}</p>
                      <p className="text-xs text-muted-foreground">{r.testName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      r.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
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
            <Button
              onClick={() => navigate('/lab')}
              className="w-full mt-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              View All Reports
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
