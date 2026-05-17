import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import {
  Users, Stethoscope, CalendarCheck, DollarSign,
  Users2, Building2, FlaskConical, FileText, BedDouble, ClipboardList,
  TrendingUp, TrendingDown, Activity, Clock, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardStats, usePatientStats, usePatientVisitsGauge,
  useDoctorsAvailability, useDepartmentRevenue, useBedOccupancy,
  useQuickStats,
} from '../../hooks/useDashboard';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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
  
  // Dummy data for cards that don't have historical data yet
  const graphData = sparkline.length > 0 ? sparkline : [
    { value: 10 }, { value: 12 }, { value: 11 }, { value: 13 },
    { value: 12 }, { value: 14 }, { value: 13 }
  ];

  return (
    <Card className="overflow-hidden border border-border/40 shadow-none hover:shadow-md transition-shadow duration-200 bg-card h-[140px] flex flex-col justify-between">
      <CardContent className="p-4 pb-2 relative z-10">
        <div className="flex items-start justify-between">
          <div className={cn('rounded-lg p-2 shrink-0', bg)}>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          {change !== 0 && (
            <span className={cn(
              'flex items-center gap-0.5 text-[10px] font-semibold rounded-full px-1.5 py-0.5 shadow-sm',
              up ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50' : 'bg-red-50 text-red-500 dark:bg-red-950/50'
            )}>
              {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              {up ? '+' : ''}{change}%
            </span>
          )}
        </div>
        <div className="mt-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest leading-tight block whitespace-nowrap">{label}</span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground leading-none">{value}</p>
        </div>
      </CardContent>
      <div className="w-full h-12 opacity-50 pointer-events-none mt-auto">
        <Sparkline data={graphData} color={color} height={48} />
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
        'flex items-center gap-2.5 rounded-xl border border-border/40 bg-card px-3.5 py-2.5',
        'hover:bg-accent hover:border-border hover:shadow-sm cursor-pointer transition-all duration-150 group'
      )}
    >
      <div className={cn('rounded-lg p-1.5 shrink-0', bg)}>
        <Icon className={cn('h-3.5 w-3.5', color)} />
      </div>
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────
function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[13px] font-bold text-foreground uppercase tracking-widest">{children}</h2>
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
    <div className="space-y-5 px-1 py-0.5">

      {/* ── Top bar: greeting + date + key live metrics ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
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
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />New</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-200" />Returning</span>
            </div>
          }>
            Patient Statistics
          </SectionTitle>
          <Card className="border-border/40 shadow-none">
            <CardContent className="p-4 h-52">
              {patientStats.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-muted-foreground">No data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientStats} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} width={30} />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11, borderRadius: 8,
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--card))',
                        boxShadow: '0 4px 12px rgba(0,0,0,.08)'
                      }}
                    />
                    <Bar dataKey="newPatients" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} name="New" />
                    <Bar dataKey="returningPatients" stackId="a" fill="#bfdbfe" radius={[4, 4, 0, 0]} name="Returning" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Row 4: Patient Visits gauge + Revenue + Bed Occupancy + Queue ── */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

        {/* Patient Visits Gauge */}
        <Card className="border-border/40 shadow-none">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Patient Visits</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex flex-col items-center">
            <RadialGauge percentage={Math.min(gauge.total, 100)} size={110} color="#2563eb" label="Total" />
            <div className="mt-3 w-full space-y-1.5">
              {[
                { label: 'Male', val: gauge.male, color: '#2563eb' },
                { label: 'Female', val: gauge.female, color: '#ec4899' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                    <span className="text-[11px] text-muted-foreground">{r.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold">{r.val}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-border/40 shadow-none">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Today's Revenue</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-3xl font-bold text-emerald-600 tracking-tight">
              ₹{(s.todayRevenue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Billed: <span className="font-medium text-foreground">₹{(s.todayBilled || 0).toLocaleString('en-IN')}</span>
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Collection rate</span>
                <span className="text-[10px] font-bold text-emerald-600">{collectionRate}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 px-3 py-2">
                <p className="text-[10px] text-muted-foreground">This Month</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  ₹{(s.monthRevenue || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 px-3 py-2">
                <p className="text-[10px] text-muted-foreground">Avg / Day</p>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                  ₹{s.monthRevenue ? Math.round(s.monthRevenue / 30).toLocaleString('en-IN') : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bed Occupancy */}
        <Card className="border-border/40 shadow-none">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bed Occupancy</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex flex-col items-center">
            <RadialGauge percentage={bedData?.occupancyRate || 0} size={110} color="#10b981" />
            <div className="mt-3 w-full grid grid-cols-2 gap-2 text-center">
              {[
                { label: 'Available', val: bedData?.available || 0, color: 'text-emerald-600' },
                { label: 'Occupied', val: bedData?.occupied || 0, color: 'text-blue-600' },
                { label: 'Dirty', val: bedData?.dirty || 0, color: 'text-amber-600' },
                { label: 'Maint.', val: bedData?.maintenance || 0, color: 'text-red-500' },
              ].map(b => (
                <div key={b.label} className="rounded-lg bg-muted/40 py-1.5">
                  <p className={cn('text-base font-bold', b.color)}>{b.val}</p>
                  <p className="text-[10px] text-muted-foreground">{b.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Queue Status */}
        <Card className="border-border/40 shadow-none">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Queue Status</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {[
              { label: 'Waiting', val: s.waitingInQueue || 0, dot: 'bg-amber-400' },
              { label: 'In Triage', val: '—', dot: 'bg-sky-400' },
              { label: 'With Doctor', val: '—', dot: 'bg-violet-400' },
              { label: 'Completed Today', val: s.todayAppointments || 0, dot: 'bg-emerald-400' },
            ].map(q => (
              <div key={q.label} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', q.dot)} />
                  <span className="text-[11px] text-muted-foreground">{q.label}</span>
                </div>
                <span className="text-[11px] font-bold text-foreground">{q.val}</span>
              </div>
            ))}
            <div className="mt-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-center">
              <p className="text-[10px] text-muted-foreground">Avg wait time</p>
              <p className="text-sm font-bold text-foreground">~12 min</p>
            </div>
          </CardContent>
        </Card>
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
          <Card className="border-border/40 shadow-none">
            <CardContent className="p-4">
              {deptRevenue.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No data yet</p>
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
            </CardContent>
          </Card>
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