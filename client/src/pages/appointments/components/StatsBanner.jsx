import { Card, CardContent } from '../../../components/ui/card';
import { Calendar, Clock, CheckCircle, CalendarX2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

function StatCard({ label, value, icon: Icon, color, bg, changeText, isIncrease }) {
  return (
    <Card className="flex-1 min-w-[220px] shadow-[var(--shadow-kpi)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden">
      <CardContent className="py-4 px-5 flex-1">
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase block">{label}</span>
            <p className="text-3xl font-extrabold text-foreground tracking-tight leading-none">{value}</p>
            {changeText && (
              <span className={cn("text-xs font-semibold block mt-1", isIncrease ? 'text-emerald-500' : 'text-rose-500')}>
                {changeText}
              </span>
            )}
          </div>
          <div className={cn('rounded-xl p-3 shrink-0 flex items-center justify-center', bg)}>
            <Icon className="h-5.5 w-5.5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsBanner({ todayAppts, total, scheduledCount, completedCount, cancelledCount }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Today's Appointments"
        value={todayAppts}
        icon={Calendar}
        color="#3b82f6"
        bg="bg-blue-50 dark:bg-blue-950/30"
        changeText={`of ${total} total`}
        isIncrease
      />
      <StatCard
        label="Scheduled"
        value={scheduledCount}
        icon={Clock}
        color="#f59e0b"
        bg="bg-amber-50 dark:bg-amber-950/30"
        changeText="Awaiting"
        isIncrease
      />
      <StatCard
        label="Completed"
        value={completedCount}
        icon={CheckCircle}
        color="#0d9488"
        bg="bg-teal-50 dark:bg-teal-950/30"
        changeText="Done today"
        isIncrease
      />
      <StatCard
        label="Cancelled"
        value={cancelledCount}
        icon={CalendarX2}
        color="#ef4444"
        bg="bg-red-50 dark:bg-red-950/30"
        changeText={cancelledCount > 0 ? `${cancelledCount} cancelled` : ''}
        isIncrease={false}
      />
    </div>
  );
}
