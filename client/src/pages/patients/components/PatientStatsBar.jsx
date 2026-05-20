import { Activity, FileText, FlaskConical, BedDouble, Scissors, DollarSign, Clock } from 'lucide-react';

const STATS = [
  { key: 'totalVisits', label: 'Visits', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'totalPrescriptions', label: 'Prescriptions', icon: FileText, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { key: 'totalLabOrders', label: 'Lab Orders', icon: FlaskConical, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { key: 'totalIPDAdmissions', label: 'IPD Stays', icon: BedDouble, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { key: 'totalSurgeries', label: 'Surgeries', icon: Scissors, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { key: 'totalSpent', label: 'Total Spent', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', currency: true },
  { key: 'totalPending', label: 'Pending', icon: DollarSign, color: 'text-rose-500', bg: 'bg-rose-500/10', currency: true },
  { key: 'lastVisit', label: 'Last Visit', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', isDate: true },
];

export function PatientStatsBar({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
      {STATS.map(s => {
        const raw = summary[s.key];
        let display = raw ?? 0;
        if (s.currency) display = `₹${Number(raw ?? 0).toLocaleString('en-IN')}`;
        else if (s.isDate && raw) {
          const d = new Date(raw);
          display = isNaN(d) ? raw : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
        }

        return (
          <div
            key={s.key}
            className="rounded-xl border border-border/40 bg-card p-3 flex flex-col items-center text-center gap-1.5 hover:border-border/80 transition-colors"
          >
            <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-base font-bold text-foreground leading-none">{display}</p>
            <p className="text-[10px] font-medium text-muted-foreground leading-none">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
}
