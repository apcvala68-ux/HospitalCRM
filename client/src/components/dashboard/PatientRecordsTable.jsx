import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePatientRecords } from '../../hooks/useDashboard';

const deptColors = {
  Cardiology: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Neurology: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  Dermatology: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  Orthopedics: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  Urology: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  Radiology: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  'ENT Surgery': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  General: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export function PatientRecordsTable() {
  const navigate = useNavigate();
  const { data, isLoading } = usePatientRecords();
  const records = data?.records || [];
  const [showMore, setShowMore] = useState(false);

  const displayRecords = showMore ? records : records.slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-lg">Patient Record</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground text-center py-8">Loading...</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Patient Record</CardTitle>
        <Badge variant="outline">{records.length} records</Badge>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No patient records yet</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium text-muted-foreground">Patient Name</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Diagnosis</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Department</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRecords.map((r) => (
                    <tr key={r._id} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{r.patientName}</td>
                      <td className="py-2.5 text-muted-foreground">{r.diagnosis}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${deptColors[r.department] || deptColors.General}`}>
                          {r.department}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground">{r.lastVisit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {records.length > 5 && !showMore && (
              <Button variant="ghost" className="w-full mt-2" onClick={() => navigate('/patients')}>
                View More ({records.length - 5} more)
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
