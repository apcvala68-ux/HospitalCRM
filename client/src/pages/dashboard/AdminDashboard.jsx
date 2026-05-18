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
import Chart from 'react-apexcharts';
import { Sparkline } from '../../components/charts/Sparkline';
import { RadialGauge } from '../../components/charts/RadialGauge';
import { AppointmentRequestList } from '../../components/dashboard/AppointmentRequestList';
import { PatientReportsList } from '../../components/dashboard/PatientReportsList';
import { DoctorsAvailabilityList } from '../../components/dashboard/DoctorsAvailabilityList';
import { PatientRecordsTable } from '../../components/dashboard/PatientRecordsTable';
import { LatestAppointmentsTable } from '../../components/dashboard/LatestAppointmentsTable';
import { generateSparkline } from '../../lib/demoData';

const COLORS = ['#2563eb', '#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#ef4444'];

const pctChange = (curr, prev) => prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);

function StatCard({ label, value, icon: Icon, color, bg, change, sparkline = [] }) {
  const up = change >= 0;
  const chartData = sparkline.length > 0 ? sparkline : generateSparkline();

  return (
    <Card className="shadow-[var(--shadow-kpi)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <CardContent className="p-4 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className={cn('rounded-xl p-2.5 shrink-0', bg)}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          {change !== 0 && (
            <span className={up ? 'stat-trend-up' : 'stat-trend-down'}>
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {up ? '+' : ''}{change}%
            </span>
          )}
        </div>
        <div className="mt-2.5">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">{label}</span>
          <p className="mt-1 text-2xl font-bold text-foreground tracking-tight leading-none">{value}</p>
        </div>
      </CardContent>
      <div className="mt-auto border-t border-border/30 pt-0">
        <Sparkline data={chartData} color={color} height={32} />
      </div>
    </Card>
  );
}

function QuickAction({ label, icon: Icon, route, color, bg, navigate }) {
  return (
    <div
      onClick={() => navigate(route)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(route); }}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3',
        'shadow-[var(--shadow-kpi)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5',
        'cursor-pointer transition-all duration-200 group active:scale-[0.98]'
      )}
    >
      <div className={cn('rounded-xl p-2.5 shrink-0 transition-transform duration-200 group-hover:scale-110', bg)}>
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <span className="text-sm font-medium text-foreground flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
    </div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{children}</h2>
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

  const barChartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'system-ui, sans-serif' },
    colors: ['#2563eb', '#93c5fd'],
    plotOptions: {
      bar: { horizontal: false, columnWidth: '55%', borderRadius: 3, borderRadiusApplication: 'end' },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: patientStats.map(d => d.label),
      labels: { style: { colors: '#706f70', fontSize: '11px', fontWeight: 500 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#706f70', fontSize: '11px' } },
    },
    grid: { borderColor: '#ebedf1', strokeDashArray: 3, xaxis: { lines: { show: false } } },
    tooltip: {
      style: { fontSize: '12px' },
      theme: 'light',
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '11px',
      labels: { colors: '#706f70' },
      markers: { width: 8, height: 8, radius: 2 },
      itemMargin: { horizontal: 12 },
    },
    states: { hover: { filter: { type: 'lighten', value: 0.05 } } },
  };

  const barSeries = [
    { name: 'New', data: patientStats.map(d => d.newPatients || 0) },
    { name: 'Returning', data: patientStats.map(d => d.returningPatients || 0) },
  ];

  const deptChartOptions = {
    chart: { type: 'donut', toolbar: { show: false }, fontFamily: 'system-ui, sans-serif' },
    colors: COLORS,
    plotOptions: { pie: { donut: { size: '55%' }, expandOnClick: false } },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: {
      style: { fontSize: '12px' },
      y: { formatter: (v) => `₹${v.toLocaleString('en-IN')}` },
    },
    states: { hover: { filter: { type: 'none' } } },
  };

  return (
    <div className="dashboard-wrapper">
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((sc) => (
          <StatCard key={sc.label} {...sc} />
        ))}
      </div>

      <div>
        <SectionTitle>Quick Access</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {quickActions.map((a) => (
            <QuickAction key={a.label} {...a} navigate={navigate} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
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

        <div className="lg:col-span-3">
          <SectionTitle>
            Patient Statistics
          </SectionTitle>
          <DashboardCard>
            <DashboardCardContent>
              <div className="h-52">
                {patientStats.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">No data available</p>
                  </div>
                ) : (
                  <Chart options={barChartOptions} series={barSeries} type="bar" height={208} />
                )}
              </div>
            </DashboardCardContent>
          </DashboardCard>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Patient Visits</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <RadialGauge percentage={Math.min(gauge.total, 100)} size={100} color="#2563eb" />
              </div>
              <div className="flex-1 space-y-2 pt-1">
                {[
                  { label: 'Male', val: gauge.male, color: '#2563eb' },
                  { label: 'Female', val: gauge.female, color: '#ec4899' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                      <span className="text-xs text-muted-foreground">{r.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{r.val}%</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Other</span>
                    <span className="text-xs font-semibold text-foreground">{gauge.other || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Today's Revenue</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <p className="text-2xl font-bold text-emerald-600 tracking-tight">
              ₹{(s.todayRevenue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Billed: <span className="font-semibold text-foreground">₹{(s.todayBilled || 0).toLocaleString('en-IN')}</span>
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted-foreground">Collection rate</span>
                <span className="text-xs font-bold text-emerald-600">{collectionRate}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/50 px-2.5 py-2">
                <p className="text-[10px] font-medium text-muted-foreground">This Month</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">₹{(s.monthRevenue || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50 px-2.5 py-2">
                <p className="text-[10px] font-medium text-muted-foreground">Avg / Day</p>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-0.5">₹{s.monthRevenue ? Math.round(s.monthRevenue / 30).toLocaleString('en-IN') : 0}</p>
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Bed Occupancy</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="flex flex-col items-center">
              <RadialGauge percentage={bedData?.occupancyRate || 0} size={100} color="#10b981" />
              <div className="mt-2 w-full grid grid-cols-4 gap-1 text-center">
                {[
                  { label: 'Avail', val: bedData?.available || 0, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
                  { label: 'Occup', val: bedData?.occupied || 0, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
                  { label: 'Dirty', val: bedData?.dirty || 0, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
                  { label: 'Maint', val: bedData?.maintenance || 0, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40' },
                ].map(b => (
                  <div key={b.label} className={cn('rounded-lg py-1.5 px-1', b.bg)}>
                    <p className={cn('text-sm font-bold', b.color)}>{b.val}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCardContent>
        </DashboardCard>

        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Queue Status</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-2">
            {[
              { label: 'Waiting', val: s.waitingInQueue || 0, dot: 'bg-amber-400' },
              { label: 'In Triage', val: '—', dot: 'bg-sky-400' },
              { label: 'With Doctor', val: '—', dot: 'bg-violet-400' },
              { label: 'Completed Today', val: s.todayAppointments || 0, dot: 'bg-emerald-400' },
            ].map(q => (
              <div key={q.label} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={cn('h-2 w-2 rounded-full', q.dot)} />
                  <span className="text-xs text-muted-foreground">{q.label}</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{q.val}</span>
              </div>
            ))}
            <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2 text-center">
              <p className="text-[11px] text-muted-foreground">Avg wait time</p>
              <p className="text-sm font-bold text-primary mt-0.5">~12 min</p>
            </div>
          </DashboardCardContent>
        </DashboardCard>
      </div>

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
                <div className="flex items-center gap-3">
                  <div className="h-28 w-28 shrink-0">
                    <Chart
                      options={deptChartOptions}
                      series={deptRevenue.slice(0, 6).map(d => d.revenue)}
                      type="donut"
                      height={112}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {deptRevenue.slice(0, 6).map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between py-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                          <span className="text-[11px] text-foreground/80 truncate max-w-[90px]">{d.name}</span>
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
