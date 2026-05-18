import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, DashboardCard, DashboardCardHeader, DashboardCardTitle, DashboardCardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import {
  Users, Stethoscope, CalendarCheck, DollarSign,
  Users2, FlaskConical, FileText, BedDouble, ClipboardList,
  TrendingUp, TrendingDown, Activity, Clock, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardStats, usePatientStats, usePatientVisitsGauge,
  useDepartmentRevenue, useBedOccupancy,
  useQuickStats,
} from '../../hooks/useDashboard';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Sparkline } from '../../components/charts/Sparkline';
import { RadialGauge } from '../../components/charts/RadialGauge';
import { AppointmentRequestList } from '../../components/dashboard/AppointmentRequestList';
import { PatientReportsList } from '../../components/dashboard/PatientReportsList';
import { DoctorsAvailabilityList } from '../../components/dashboard/DoctorsAvailabilityList';
import { PatientRecordsTable } from '../../components/dashboard/PatientRecordsTable';
import { LatestAppointmentsTable } from '../../components/dashboard/LatestAppointmentsTable';

const COLORS = ['#2563eb', '#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#ef4444'];

const pctChange = (curr, prev) => prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);

// ─── Micro stat card ────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg, change, sparkline = [] }) {
  const up = change >= 0;

  const graphData = sparkline.length > 0 ? sparkline : [
    { value: 10 }, { value: 12 }, { value: 11 }, { value: 13 },
    { value: 12 }, { value: 14 }, { value: 13 }
  ];

  return (
    <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.04)] hover:shadow-[0_4px_12px_-2px_rgb(0_0_0_/_0.08)] transition-shadow duration-200 h-[150px] flex flex-col justify-between">
      <CardContent className="p-4 pb-1 relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className={cn('rounded-xl p-2.5 shrink-0', bg)}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          {change !== 0 && (
            <span className={cn(
              'shrink-0 flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5',
              up ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
            )}>
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {up ? '+' : ''}{change}%
            </span>
          )}
        </div>
        <div className="mt-2.5">
          <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider leading-tight block">{label}</span>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-foreground leading-none">{value}</p>
        </div>
      </CardContent>
      <div className="w-full h-11 opacity-50 pointer-events-none mt-auto">
        <Sparkline data={graphData} color={color} height={44} />
      </div>
    </Card>
  );
}

// ─── Quick action pill ───────────────────────────────────────────────────────
function QuickAction({ label, icon: Icon, route, color, bg, navigate }) {
  return (
    <button
      onClick={() => navigate(route)}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5',
        'hover:bg-accent hover:border-border hover:shadow-md cursor-pointer transition-all duration-150 group active:scale-[0.98]'
      )}
    >
      <div className={cn('rounded-xl p-2.5 shrink-0 transition-all duration-150 group-hover:scale-110 group-active:scale-95', bg)}>
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <span className="text-sm font-semibold text-foreground/90 group-hover:text-foreground">{label}</span>
      <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
    </button>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────
function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-bold text-foreground tracking-wide">{children}</h2>
      {action}
    </div>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useDashboardStats();
  const { data: patientStatsData } = usePatientStats();
  const { data: gaugeData } = usePatientVisitsGauge();
  const { data: deptData } = useDepartmentRevenue();
  const { data: bedData } = useBedOccupancy();
  const { data: quickStats } = useQuickStats();

  const s = stats || {};
  const patientStats = patientStatsData?.stats || [];
  const deptRevenue = deptData?.departments || [];
  const gauge = gaugeData || { total: 0, male: 0, female: 0, other: 0 };

  const statCards = [
    {
      label: 'Total Patients',
      value: (s.totalPatients || 0).toLocaleString(),
      icon: Users,
      color: '#2563eb',
      bg: 'bg-blue-50 dark:bg-blue-950',
      change: pctChange(s.monthPatients || 0, s.yesterdayPatients || 0),
      sparkline: quickStats?.patients || [],
    },
    {
      label: "Today's Appointments",
      value: s.todayAppointments || 0,
      icon: CalendarCheck,
      color: '#f59e0b',
      bg: 'bg-amber-50 dark:bg-amber-950',
      change: pctChange(s.todayAppointments || 0, s.yesterdayAppointments || 0),
      sparkline: quickStats?.appointments || [],
    },
    {
      label: 'Active Doctors',
      value: s.totalDoctors || 0,
      icon: Stethoscope,
      color: '#6366f1',
      bg: 'bg-violet-50 dark:bg-violet-950',
      change: 0,
      sparkline: [],
    },
    {
      label: "Today's Revenue",
      value: `₹${(s.todayRevenue || 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: '#10b981',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      change: pctChange(s.todayRevenue || 0, s.yesterdayRevenue || 0),
      sparkline: quickStats?.revenue || [],
    },
    {
      label: 'Beds Available',
      value: bedData?.available || 0,
      icon: BedDouble,
      color: '#0ea5e9',
      bg: 'bg-sky-50 dark:bg-sky-950',
      change: 0,
      sparkline: [],
    },
    {
      label: 'Queue Waiting',
      value: s.waitingInQueue || 0,
      icon: Clock,
      color: '#ef4444',
      bg: 'bg-red-50 dark:bg-red-950',
      change: 0,
      sparkline: [],
    },
  ];

  const quickActions = [
    { label: 'All Patients', icon: Users2, route: '/patients', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
    { label: 'Doctors', icon: Stethoscope, route: '/doctors', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950' },
    { label: 'Lab Results', icon: FlaskConical, route: '/lab', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950' },
    { label: 'Prescriptions', icon: FileText, route: '/pharmacy', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
    { label: 'IPD Visits', icon: BedDouble, route: '/ipd', color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950' },
    { label: 'Medical Records', icon: ClipboardList, route: '/patients', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  ];

  const collectionRate = s.todayBilled ? Math.round((s.todayRevenue / s.todayBilled) * 100) : 0;

  return (
    <div className="dashboard-wrapper">

      {/* ── Top bar: greeting + date + key live metrics ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-foreground">{s.todayAppointments || 0} visits today</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 shadow-sm">
            <Activity className="h-3 w-3 text-amber-500" />
            <span className="text-xs font-medium text-foreground">{s.waitingInQueue || 0} in queue</span>
          </div>
        </div>
      </div>

      {/* ── Row 1: 6 stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((sc) => (
          <StatCard key={sc.label} {...sc} />
        ))}
      </div>

      {/* ── Row 2: Quick Actions (horizontal pill strip) ── */}
      <div>
        <SectionTitle>Quick Access</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {quickActions.map((a) => (
            <QuickAction key={a.label} {...a} navigate={navigate} />
          ))}
        </div>
      </div>

      {/* ── Row 3: Appointments + Patient Stats chart ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Appointment requests – takes 2/5 */}
        <div className="lg:col-span-2">
          <SectionTitle action={
            <button className="text-[11px] text-primary font-semibold flex items-center gap-0.5 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          }>
            Appointment Requests
          </SectionTitle>
          <AppointmentRequestList />
        </div>

        {/* Patient stats chart – takes 3/5 */}
        <div className="lg:col-span-3">
          <SectionTitle action={
            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground/80">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />New</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-300" />Returning</span>
            </div>
          }>
            Patient Statistics
          </SectionTitle>
          <DashboardCard>
            <DashboardCardContent className="h-64 pt-3">
              {patientStats.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" debounce={1}>
                  <BarChart data={patientStats} barSize={20} barGap={6} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} vertical={false} />
                    <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} width={35} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12, borderRadius: 8,
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--card))',
                        boxShadow: '0 4px 12px rgba(0,0,0,.1)'
                      }}
                    />
                    <Bar dataKey="newPatients" stackId="a" fill="#2563eb" radius={[3, 3, 0, 0]} name="New" />
                    <Bar dataKey="returningPatients" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Returning" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </DashboardCardContent>
          </DashboardCard>
        </div>
      </div>

      {/* ── Row 4: Patient Visits gauge + Revenue + Bed Occupancy + Queue ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Patient Visits Gauge */}
        <DashboardCard>
          <DashboardCardHeader className="pb-0 pt-3.5 px-3.5">
            <DashboardCardTitle>Patient Visits</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="flex flex-col items-center pt-3">
            <RadialGauge percentage={Math.min(gauge.total, 100)} size={140} color="#2563eb" label="Total" />
            <div className="mt-3 w-full px-2 space-y-1.5">
              {[
                { label: 'Male', val: gauge.male, color: '#2563eb' },
                { label: 'Female', val: gauge.female, color: '#ec4899' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/5" style={{ background: r.color }} />
                    <span className="text-xs font-medium text-muted-foreground">{r.label}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">{r.val}%</span>
                </div>
              ))}
            </div>
          </DashboardCardContent>
        </DashboardCard>

        {/* Revenue */}
        <DashboardCard>
          <DashboardCardHeader className="pb-0 pt-3.5 px-3.5">
            <DashboardCardTitle>Today's Revenue</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="pt-3">
            <p className="text-3xl font-bold text-emerald-600 tracking-tight">
              ₹{(s.todayRevenue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Billed: <span className="font-semibold text-foreground">₹{(s.todayBilled || 0).toLocaleString('en-IN')}</span>
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground/80">Collection rate</span>
                <span className="text-xs font-bold text-emerald-600">{collectionRate}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/50 px-3 py-2.5">
                <p className="text-[11px] font-medium text-muted-foreground/80">This Month</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  ₹{(s.monthRevenue || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50 px-3 py-2.5">
                <p className="text-[11px] font-medium text-muted-foreground/80">Avg / Day</p>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                  ₹{s.monthRevenue ? Math.round(s.monthRevenue / 30).toLocaleString('en-IN') : 0}
                </p>
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>

        {/* Bed Occupancy */}
        <DashboardCard>
          <DashboardCardHeader className="pb-0 pt-3.5 px-3.5">
            <DashboardCardTitle>Bed Occupancy</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="flex flex-col items-center pt-3">
            <RadialGauge percentage={bedData?.occupancyRate || 0} size={140} color="#10b981" />
            <div className="mt-3 w-full grid grid-cols-4 gap-1.5 text-center">
              {[
                { label: 'Avail', val: bedData?.available || 0, color: 'text-emerald-600' },
                { label: 'Occup', val: bedData?.occupied || 0, color: 'text-blue-600' },
                { label: 'Dirty', val: bedData?.dirty || 0, color: 'text-amber-600' },
                { label: 'Maint', val: bedData?.maintenance || 0, color: 'text-red-500' },
              ].map(b => (
                <div key={b.label} className="rounded-lg bg-muted/50 py-2 px-1">
                  <p className={cn('text-sm font-bold', b.color)}>{b.val}</p>
                  <p className="text-[10px] font-medium text-muted-foreground/70 mt-0.5">{b.label}</p>
                </div>
              ))}
            </div>
          </DashboardCardContent>
        </DashboardCard>

        {/* Queue Status */}
        <DashboardCard>
          <DashboardCardHeader className="pb-0 pt-3.5 px-3.5">
            <DashboardCardTitle>Queue Status</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="pt-3 space-y-2">
            {[
              { label: 'Waiting', val: s.waitingInQueue || 0, dot: 'bg-amber-400' },
              { label: 'In Triage', val: '—', dot: 'bg-sky-400' },
              { label: 'With Doctor', val: '—', dot: 'bg-violet-400' },
              { label: 'Completed Today', val: s.todayAppointments || 0, dot: 'bg-emerald-400' },
            ].map(q => (
              <div key={q.label} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={cn('h-2 w-2 rounded-full ring-1 ring-black/5', q.dot)} />
                  <span className="text-xs font-medium text-muted-foreground">{q.label}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{q.val}</span>
              </div>
            ))}
            <div className="pt-1 rounded-lg bg-muted/20 px-3 py-2.5 text-center">
              <p className="text-[11px] font-medium text-muted-foreground/70">Avg wait time</p>
              <p className="text-sm font-bold text-foreground mt-0.5">~12 min</p>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      </div>

      {/* ── Row 5: Patient Reports + Doctors Availability ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SectionTitle action={
            <button className="text-[11px] text-primary font-semibold flex items-center gap-0.5 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          }>
            Recent Patient Reports
          </SectionTitle>
          <PatientReportsList />
        </div>
        <div className="lg:col-span-2">
          <SectionTitle action={
            <button className="text-[11px] text-primary font-semibold flex items-center gap-0.5 hover:underline" onClick={() => navigate('/doctors')}>
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          }>
            Doctors On Duty
          </SectionTitle>
          <DoctorsAvailabilityList />
        </div>
      </div>

      {/* ── Row 6: Top Departments + Patient Records ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SectionTitle action={<Badge variant="outline" className="text-[10px] px-2 py-0.5">By Revenue</Badge>}>
            Top Departments
          </SectionTitle>
          <DashboardCard>
            <DashboardCardContent>
              {deptRevenue.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="h-32 w-32 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deptRevenue.slice(0, 6).map(d => ({ name: d.name, value: d.revenue }))}
                          cx="50%" cy="50%"
                          innerRadius={32} outerRadius={58}
                          paddingAngle={3} dataKey="value"
                        >
                          {deptRevenue.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip
                          formatter={v => `₹${v.toLocaleString('en-IN')}`}
                          contentStyle={{ fontSize: 11, borderRadius: 6 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {deptRevenue.slice(0, 6).map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                          <span className="text-[11px] text-foreground truncate max-w-[90px]">{d.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          ₹{(d.revenue || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DashboardCardContent>
          </DashboardCard>
        </div>
        <div className="lg:col-span-3">
          <SectionTitle>Patient Records</SectionTitle>
          <PatientRecordsTable />
        </div>
      </div>

      {/* ── Row 7: Latest Appointments (full width) ── */}
      <div>
        <SectionTitle action={
          <button className="text-[11px] text-primary font-semibold flex items-center gap-0.5 hover:underline" onClick={() => navigate('/appointments')}>
            View all <ArrowUpRight className="h-3 w-3" />
          </button>
        }>
          Latest Appointments
        </SectionTitle>
        <LatestAppointmentsTable />
      </div>
    </div>
  );
}