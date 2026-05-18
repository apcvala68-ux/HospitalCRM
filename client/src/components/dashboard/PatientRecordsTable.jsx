import { DashboardCard, DashboardCardContent } from '../ui/card';
import { usePatientRecords } from '../../hooks/useDashboard';
import { cn } from '../../lib/utils';

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
  const { data, isLoading } = usePatientRecords();
  const records = data?.records || [];
  const displayRecords = records.slice(0, 5);

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
        {records.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No patient records yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="px-3.5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Patient Name</th>
                  <th className="px-3.5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Diagnosis</th>
                  <th className="px-3.5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Department</th>
                  <th className="px-3.5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {displayRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-3.5 py-3 text-sm font-semibold text-foreground">{r.patientName}</td>
                    <td className="px-3.5 py-3 text-xs text-muted-foreground">{r.diagnosis}</td>
                    <td className="px-3.5 py-3">
                      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold', deptColors[r.department] || deptColors.General)}>
                        {r.department}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-right text-xs text-muted-foreground">{r.lastVisit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCardContent>
    </DashboardCard>
  );
}
