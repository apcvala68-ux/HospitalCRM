import { Card, CardContent, DashboardCard, DashboardCardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import {
  Users, Users2, Stethoscope, BedDouble, FlaskConical, FileText,
  ClipboardList, DollarSign, CalendarCheck, Calendar,
  TrendingUp, TrendingDown, ChevronRight, ArrowUpRight, Bed, Clock, Wallet,
  HeartPulse, Venus, Baby, Crown, PieChart, ChevronDown, Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardStats, usePatientStats, usePatientVisitsGauge,
  useDepartmentRevenue, useBedOccupancy,
  useQuickStats,
} from '../../hooks/useDashboard';
import { Popover, PopoverTrigger, PopoverContent, RangeCalendar } from "@heroui/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import { useState } from "react";
import Chart from 'react-apexcharts';
import { Sparkline } from '../../components/charts/Sparkline';
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
    <Card className="flex-1 min-w-[200px] shadow-[var(--shadow-kpi)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden">
      <CardContent className="py-4 px-5 pb-2 flex-1">
        <div className="flex justify-between items-center gap-3">
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase block">{label}</span>
            <p className="text-3xl font-extrabold text-foreground tracking-tight leading-none">{value}</p>
            {change !== 0 && change !== undefined && (
              <div className="h-4 flex items-center mt-1">
                <span className={cn("flex items-center gap-1 text-[10.5px] font-bold", up ? 'text-emerald-500' : 'text-rose-500')}>
                  {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {up ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
          <div className={cn('rounded-xl p-3 shrink-0 flex items-center justify-center', bg)}>
            <Icon className="h-5.5 w-5.5" style={{ color }} />
          </div>
        </div>
      </CardContent>
      <div className="mt-auto border-t border-border/20 pt-0">
        <Sparkline data={chartData} color={color} height={24} />
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

const formatDateCompact = (calendarDate) => {
  if (!calendarDate) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthStr = months[calendarDate.month - 1];
  return `${monthStr} ${calendarDate.day}, ${calendarDate.year}`;
};

const DEPT_CONFIGS = {
  'Cardiology': { color: '#2563eb', icon: HeartPulse, textClass: 'text-blue-500', bgClass: 'bg-blue-500/10 border-blue-500/20 text-blue-500' },
  'Gynecology': { color: '#0ea5e9', icon: Venus, textClass: 'text-cyan-500', bgClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500' },
  'Orthopedics': { color: '#6366f1', icon: Activity, textClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' },
  'Pediatrics': { color: '#f59e0b', icon: Baby, textClass: 'text-amber-500', bgClass: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
  'General Medicine': { color: '#10b981', icon: Stethoscope, textClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' },
  'General': { color: '#10b981', icon: Stethoscope, textClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' },
};

const getDeptConfig = (name) => {
  return DEPT_CONFIGS[name] || {
    color: '#6b7280',
    icon: Stethoscope,
    textClass: 'text-gray-500',
    bgClass: 'bg-gray-500/10 border-gray-500/20 text-gray-500',
  };
};

const calendarCellCss = `
.range-calendar-fix { padding: 4px !important; }
.range-calendar-fix [data-slot="range-calendar"] { padding: 8px !important; gap: 4px !important; }
.range-calendar-fix [data-slot="range-calendar-grid"] { padding: 2px !important; gap: 0 !important; }
.range-calendar-fix [data-slot="cell"] { margin: 0 !important; padding: 0 !important; }
.range-calendar-fix [data-slot="cell-button"] { color: hsl(var(--foreground)) !important; font-size: 0.8rem !important; font-weight: 500 !important; width: 32px !important; height: 32px !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 0.5rem !important; margin: 1px !important; padding: 0 !important; background: transparent !important; border: none !important; cursor: pointer !important; }
.range-calendar-fix [data-slot="cell-button"]:hover { background: hsl(var(--accent)) !important; color: hsl(var(--accent-foreground)) !important; }
.range-calendar-fix [data-slot="cell"][data-selected] [data-slot="cell-button"] { background: hsl(var(--primary)) !important; color: hsl(var(--primary-foreground)) !important; }
.range-calendar-fix [data-slot="cell"][data-range-selection] { background: hsl(var(--primary) / 0.1) !important; }
.range-calendar-fix [data-slot="cell"][data-range-selection] [data-slot="cell-button"] { background: transparent !important; }
.range-calendar-fix [data-slot="cell"][data-disabled] [data-slot="cell-button"] { opacity: 0.3 !important; cursor: not-allowed !important; }
.range-calendar-fix [data-slot="range-calendar-header-cell"] { color: hsl(var(--muted-foreground)) !important; font-size: 0.65rem !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.04em !important; padding: 2px 0 6px !important; }
.range-calendar-fix [data-slot="range-calendar-nav-button"] { color: hsl(var(--foreground)) !important; border: 2px solid hsl(var(--foreground) / 0.25) !important; border-radius: 0.5rem !important; width: 30px !important; height: 30px !important; display: flex !important; align-items: center !important; justify-content: center !important; background: hsl(var(--card)) !important; margin: 0 2px !important; padding: 0 !important; cursor: pointer !important; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1) !important; }
.range-calendar-fix [data-slot="range-calendar-nav-button"]:hover { background: hsl(var(--accent)) !important; }
.range-calendar-fix [data-slot="range-calendar-heading"], .range-calendar-fix [data-slot="range-calendar-year-picker-trigger"] { color: hsl(var(--foreground)) !important; font-weight: 700 !important; font-size: 0.85rem !important; padding: 0 !important; margin: 0 !important; }
`;


export function AdminDashboard() {
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState({
    start: today(getLocalTimeZone()).subtract({ days: 7 }),
    end: today(getLocalTimeZone()),
  });

  const { data: stats } = useDashboardStats(dateRange);
  const { data: patientStatsData } = usePatientStats(dateRange);
  const { data: gaugeData } = usePatientVisitsGauge(dateRange);
  const { data: deptData } = useDepartmentRevenue(dateRange);
  const { data: bedData } = useBedOccupancy(dateRange);
  const { data: quickStats } = useQuickStats(dateRange);

  const s = stats || {};
  const patientStats = patientStatsData?.stats || [];
  const deptRevenue = deptData?.departments || [];
  const gauge = gaugeData || { total: 0, male: 0, female: 0, other: 0 };
  
  const dominantGender = gauge.female >= gauge.male ? 'Female' : 'Male';
  const dominantPct = gauge.female >= gauge.male ? gauge.female : gauge.male;

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
      tickPlacement: 'on',
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

  const chartColors = deptRevenue.slice(0, 5).map(d => getDeptConfig(d.name).color);

  const deptChartOptions = {
    chart: { type: 'donut', toolbar: { show: false }, fontFamily: 'system-ui, sans-serif' },
    colors: chartColors.length > 0 ? chartColors : COLORS,
    labels: deptRevenue.slice(0, 5).map(d => d.name),
    plotOptions: { 
      pie: { 
        donut: { 
          size: '72%',
          background: 'transparent',
        }, 
        expandOnClick: true 
      } 
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { show: true, width: 3, colors: ['var(--card)'] },
    tooltip: {
      style: { fontSize: '12px' },
      y: { formatter: (v) => `₹${v.toLocaleString('en-IN')}` },
    },
    states: { hover: { filter: { type: 'darken', value: 0.9 } } },
  };

  return (
    <div className="dashboard-wrapper">
      <style>{calendarCellCss}</style>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your business performance and key metrics.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center rounded-lg bg-muted/50 p-1">
            {[7, 30, 90, 365].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange({ start: today(getLocalTimeZone()).subtract({ days }), end: today(getLocalTimeZone()) })}
                className={cn(
                  "px-3 py-1.5 text-[13px] font-medium rounded-md transition-all",
                  today(getLocalTimeZone()).subtract({ days }).compare(dateRange.start) === 0 ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {days === 365 ? '1y' : `${days}d`}
              </button>
            ))}
          </div>
          <div className="hidden md:block">
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-card text-foreground text-sm font-medium hover:bg-accent hover:border-border transition-colors shadow-sm select-none h-9 cursor-pointer">
                  <Calendar className="h-4 w-4 text-muted-foreground/80" />
                  <span className="text-[13px] font-medium tracking-tight">
                    {formatDateCompact(dateRange.start)} – {formatDateCompact(dateRange.end)}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="range-calendar-fix p-0 border border-border/60 shadow-lg rounded-xl overflow-hidden bg-card">
                <RangeCalendar 
                  value={dateRange} 
                  onChange={setDateRange}
                  aria-label="Select dates"
                >
                  <RangeCalendar.Header>
                    <RangeCalendar.YearPickerTrigger>
                      <RangeCalendar.YearPickerTriggerHeading />
                      <RangeCalendar.YearPickerTriggerIndicator />
                    </RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.NavButton slot="previous" />
                    <RangeCalendar.NavButton slot="next" />
                  </RangeCalendar.Header>
                  <RangeCalendar.Grid>
                    <RangeCalendar.GridHeader>
                      {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                    </RangeCalendar.GridHeader>
                    <RangeCalendar.GridBody>
                      {(date) => (
                        <RangeCalendar.Cell date={date}>
                          {({ formattedDate }) => formattedDate}
                        </RangeCalendar.Cell>
                      )}
                    </RangeCalendar.GridBody>
                  </RangeCalendar.Grid>
                </RangeCalendar>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
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
        <div className="lg:col-span-2 flex flex-col h-full">
          <SectionTitle action={
            <button className="text-[11px] text-primary font-semibold flex items-center gap-0.5 hover:underline" onClick={() => navigate('/appointments')}>View all <ArrowUpRight className="h-3 w-3" /></button>
          }>
            Appointment Requests
          </SectionTitle>
          <AppointmentRequestList dateRange={dateRange} className="flex-1" />
        </div>

        <div className="lg:col-span-3 flex flex-col h-full">
          <SectionTitle>
            Patient Statistics
          </SectionTitle>
          <DashboardCard className="flex-1 flex flex-col">
            <DashboardCardContent className="flex-1 flex flex-col justify-center pb-2 pt-0">
              <div className="h-full w-full min-h-[224px]">
                {patientStats.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">No data available</p>
                  </div>
                ) : (
                  <Chart options={barChartOptions} series={barSeries} type="bar" height="100%" />
                )}
              </div>
            </DashboardCardContent>
          </DashboardCard>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <DashboardCard className="border border-border/50 bg-card shadow-[var(--shadow-kpi)] p-4 flex flex-col justify-between h-full rounded-2xl hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Patient Visits</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Today</span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 dark:border-emerald-900/30 flex items-center justify-center">
              <Users className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center mt-6">
            <div className="relative flex items-center justify-center shrink-0 w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800/80"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Male Segment (Blue) */}
                <path
                  className="text-blue-500"
                  strokeDasharray={`${gauge.male}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Female Segment (Pink) - offset by Male Dash */}
                <path
                  className="text-pink-500"
                  strokeDasharray={`${gauge.female}, 100`}
                  strokeDashoffset={`-${gauge.male}`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-foreground tracking-tight leading-none">{dominantPct}%</span>
                <span className="text-[11px] text-muted-foreground mt-1.5 font-medium">{dominantGender}</span>
              </div>
            </div>
            
            <div className="flex justify-center items-center gap-6 mt-5 w-full">
              {[
                { label: 'Male', val: gauge.male, color: 'bg-blue-500' },
                { label: 'Female', val: gauge.female, color: 'bg-pink-500' },
                { label: 'Other', val: gauge.other || 0, color: 'bg-slate-500' },
              ].map(r => (
                <div key={r.label} className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className={cn("h-2 w-2 rounded-full", r.color)} />
                    <span className="text-muted-foreground">{r.label}</span>
                  </div>
                  <span className="font-semibold text-foreground mt-1 text-xs">{r.val}%</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-5 rounded-xl bg-slate-100 dark:bg-slate-900/30 border border-border/40 dark:border-border/5 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Visits</span>
            </div>
            <span className="text-sm font-bold text-foreground">{gauge.total}</span>
          </div>
        </DashboardCard>

        <DashboardCard className="border border-border/50 bg-card shadow-[var(--shadow-kpi)] p-4 flex flex-col justify-between h-full rounded-2xl hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Today's Revenue</span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 dark:border-emerald-900/30 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹</span>
            </div>
          </div>
          
          <div className="mt-4 flex-1 flex flex-col justify-center">
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
              ₹{(s.todayRevenue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Billed: <span className="font-semibold text-foreground">₹{(s.todayBilled || 0).toLocaleString('en-IN')}</span>
            </p>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5 text-[11px]">
                <span className="text-muted-foreground">Collection rate</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{collectionRate}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/10 dark:border-emerald-950/40 p-2.5 flex flex-col justify-between">
              <div className="h-6 w-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/50 flex items-center justify-center shrink-0 mb-1.5">
                <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">This Month</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{(s.monthRevenue || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="rounded-xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/10 dark:border-blue-950/40 p-2.5 flex flex-col justify-between">
              <div className="h-6 w-6 rounded-lg bg-blue-500/10 dark:bg-blue-950/50 flex items-center justify-center shrink-0 mb-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Avg / Day</p>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">₹{s.monthRevenue ? Math.round(s.monthRevenue / 30).toLocaleString('en-IN') : 0}</p>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="border border-border/50 bg-card shadow-[var(--shadow-kpi)] p-4 flex flex-col justify-between h-full rounded-2xl hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Bed Occupancy</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Live Overview</span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-violet-500/10 dark:bg-[#23153c] border border-violet-500/20 dark:border-violet-900/30 flex items-center justify-center">
              <Bed className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          
          <div className="relative flex flex-col items-center justify-center mt-5 h-36">
            <div className="relative flex items-center justify-center w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800/80"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${bedData?.occupancyRate || 0}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-foreground tracking-tight leading-none">{bedData?.occupancyRate || 0}%</span>
                <span className="text-[11px] text-muted-foreground mt-1.5 font-medium">Occupied</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-4 gap-1.5 text-center">
            {[
              { label: 'Available', val: bedData?.available || 0, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/5 dark:bg-[#0a2318]/20 border border-emerald-500/10 dark:border-emerald-950/30' },
              { label: 'Occupied', val: bedData?.occupied || 0, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/5 dark:bg-[#081b33]/20 border border-blue-500/10 dark:border-blue-950/30' },
              { label: 'Dirty', val: bedData?.dirty || 0, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/5 dark:bg-[#2a1b0c]/20 border border-amber-500/10 dark:border-amber-950/30' },
              { label: 'Maintenance', val: bedData?.maintenance || 0, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/5 dark:bg-[#2a0e12]/20 border border-red-500/10 dark:border-red-950/30' },
            ].map(b => (
              <div key={b.label} className={cn('rounded-xl py-2 px-1 flex flex-col items-center justify-center', b.bg)}>
                <span className={cn('text-sm font-bold leading-none', b.color)}>{b.val}</span>
                <span className="text-[8px] text-muted-foreground mt-1.5 block leading-none">{b.label}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard className="border border-border/50 bg-card shadow-[var(--shadow-kpi)] p-4 flex flex-col justify-between h-full rounded-2xl hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Queue Status</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Live</span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 dark:bg-[#112340] border border-blue-500/20 dark:border-blue-900/30 flex items-center justify-center">
              <Users2 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="space-y-2 mt-4 flex-1 flex flex-col justify-center">
            {[
              { label: 'Waiting', val: s.waitingInQueue || 0, dot: 'bg-amber-400' },
              { label: 'In Triage', val: s.triageInQueue || 0, dot: 'bg-sky-400' },
              { label: 'With Doctor', val: s.withDoctorInQueue || 0, dot: 'bg-violet-400' },
              { label: 'Completed Today', val: s.completedTodayInQueue || s.todayAppointments || 0, dot: 'bg-emerald-400' },
            ].map(q => (
              <div key={q.label} className="flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-border/40 dark:border-border/5 px-3 py-2 flex items-center hover:bg-slate-200 dark:hover:bg-slate-900/60 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className={cn('h-2 w-2 rounded-full shrink-0', q.dot)} />
                  <span className="text-xs text-muted-foreground">{q.label}</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{q.val}</span>
              </div>
            ))}
          </div>
          
          <div className="rounded-xl bg-sky-500/10 dark:bg-sky-950/30 border border-sky-500/20 dark:border-sky-900/30 px-3 py-2.5 flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span className="text-xs text-muted-foreground">Avg wait time</span>
            </div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">~12 min</span>
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SectionTitle action={
            <button className="text-[11px] text-primary font-semibold flex items-center gap-0.5 hover:underline" onClick={() => navigate('/patients')}>View all <ArrowUpRight className="h-3 w-3" /></button>
          }>
            Recent Patient Reports
          </SectionTitle>
          <PatientReportsList dateRange={dateRange} />
        </div>
        <div className="lg:col-span-2">
          <SectionTitle action={
            <button className="text-[11px] text-primary font-semibold flex items-center gap-0.5 hover:underline" onClick={() => navigate('/doctors')}>
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          }>
            Doctors On Duty
          </SectionTitle>
          <DoctorsAvailabilityList dateRange={dateRange} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <DashboardCard className="border border-border/50 bg-card shadow-[var(--shadow-kpi)] p-5 rounded-2xl hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col justify-between">
            <DashboardCardContent className="p-0 flex flex-col justify-between h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                    <PieChart className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground tracking-tight uppercase">TOP DEPARTMENTS</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">By Revenue</span>
                  </div>
                </div>
              </div>

              {/* Main Body */}
              {deptRevenue.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
              ) : (() => {
                const totalRevenue = deptRevenue.reduce((sum, d) => sum + d.revenue, 0);
                
                // Dynamic Period-over-Period Trend Calculation
                const calculateRealTrend = () => {
                  if (!quickStats?.revenue || quickStats.revenue.length < 2) return 12.4; // fallback to seed baseline if insufficient points
                  const half = Math.floor(quickStats.revenue.length / 2);
                  const older = quickStats.revenue.slice(0, half).reduce((sum, r) => sum + (r.value || 0), 0);
                  const newer = quickStats.revenue.slice(half).reduce((sum, r) => sum + (r.value || 0), 0);
                  if (older === 0) return newer > 0 ? 100 : 0;
                  return Math.round(((newer - older) / older) * 100);
                };
                const trendVal = calculateRealTrend();
                const isTrendUp = trendVal >= 0;

                return (
                  <div className="flex flex-col md:flex-row items-center gap-5 flex-1 my-2">
                    {/* Left Column: Donut Chart (Bigger!) */}
                    <div className="relative flex items-center justify-center h-44 w-44 md:h-56 md:w-56 shrink-0">
                      <Chart
                        options={deptChartOptions}
                        series={deptRevenue.slice(0, 5).map(d => d.revenue)}
                        type="donut"
                        height={220}
                        width="100%"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                        <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-semibold">Total Revenue</span>
                        <span className="text-xl font-bold text-foreground mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</span>
                        <span className={`hidden md:flex text-[9px] font-semibold mt-0.5 items-center gap-0.5 ${isTrendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isTrendUp ? '↗' : '↘'} {Math.abs(trendVal)}% vs last period
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Custom Progress Indicators */}
                    <div className="flex-1 space-y-3 hidden md:block">
                      {deptRevenue.slice(0, 5).map((d) => {
                        const config = getDeptConfig(d.name);
                        const IconComponent = config.icon;
                        const percentShare = totalRevenue > 0 ? ((d.revenue / totalRevenue) * 100).toFixed(1) : '0.0';

                        return (
                          <div key={d.name} className="flex flex-col">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`h-6.5 w-6.5 rounded-full ${config.bgClass} border border-transparent flex items-center justify-center shrink-0`}>
                                  <IconComponent className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-[11px] font-semibold text-foreground/90 truncate max-w-[85px]">{d.name}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[11px] font-bold text-foreground">
                                  ₹{(d.revenue || 0).toLocaleString('en-IN')}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-medium">
                                  {percentShare}%
                                </span>
                              </div>
                            </div>
                            {/* Elegant status line ending at the percentage boundary */}
                            <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-1 rounded-full overflow-hidden mt-1.5">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${percentShare}%`, 
                                  backgroundColor: config.color,
                                  boxShadow: `0 0 6px ${config.color}35`
                                }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Footer Stats widgets */}
              {deptRevenue.length > 0 && (() => {
                const totalRevenue = deptRevenue.reduce((sum, d) => sum + d.revenue, 0);
                
                const calculateRealTrend = () => {
                  if (!quickStats?.revenue || quickStats.revenue.length < 2) return 12.4;
                  const half = Math.floor(quickStats.revenue.length / 2);
                  const older = quickStats.revenue.slice(0, half).reduce((sum, r) => sum + (r.value || 0), 0);
                  const newer = quickStats.revenue.slice(half).reduce((sum, r) => sum + (r.value || 0), 0);
                  if (older === 0) return newer > 0 ? 100 : 0;
                  return Math.round(((newer - older) / older) * 100);
                };
                const trendVal = calculateRealTrend();
                const isTrendUp = trendVal >= 0;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-3.5 mt-4 border-t border-border/40">
                    <div className="bg-slate-500/5 dark:bg-slate-400/5 border border-border/30 rounded-xl p-2 flex items-center gap-1.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                        <ClipboardList className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-foreground leading-none">{deptRevenue.length}</span>
                        <span className="text-[8px] text-muted-foreground mt-0.5 truncate">Depts</span>
                      </div>
                    </div>

                    <div className="bg-slate-500/5 dark:bg-slate-400/5 border border-border/30 rounded-xl p-2 flex items-center gap-1.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] font-bold leading-none ${isTrendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isTrendUp ? '+' : ''}{trendVal}%
                        </span>
                        <span className="text-[8px] text-muted-foreground mt-0.5 truncate">vs Last P</span>
                      </div>
                    </div>

                    <div className="bg-slate-500/5 dark:bg-slate-400/5 border border-border/30 rounded-xl p-2 flex items-center gap-1.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                        <Wallet className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-foreground leading-none">
                          ₹{Math.round(totalRevenue / deptRevenue.length).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[8px] text-muted-foreground mt-0.5 truncate">Avg. Rev</span>
                      </div>
                    </div>

                    <div className="bg-slate-500/5 dark:bg-slate-400/5 border border-border/30 rounded-xl p-2 flex items-center gap-1.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                        <Crown className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-foreground truncate" title={deptRevenue[0]?.name || 'N/A'}>
                          {deptRevenue[0]?.name || 'N/A'}
                        </span>
                        <span className="text-[8px] text-muted-foreground mt-0.5 truncate">Top Perf</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </DashboardCardContent>
          </DashboardCard>
        </div>
        <div className="lg:col-span-3 hidden md:block">
          <SectionTitle action={
            <button className="text-[11px] text-primary font-semibold flex items-center gap-0.5 hover:underline" onClick={() => navigate('/patients')}>
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          }>
            Patient Records
          </SectionTitle>
          <div className="overflow-x-auto"><PatientRecordsTable dateRange={dateRange} /></div>
        </div>
      </div>

    </div>
  );
}
