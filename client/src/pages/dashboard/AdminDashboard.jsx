import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Users, Stethoscope, CalendarCheck, DollarSign,
  ArrowUpRight, ArrowDownRight,
  Users2, Building2, FlaskConical, FileText, BedDouble, ClipboardList,
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

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
  const pctChange = (curr, prev) => prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);

  const statCards = [
    { label: 'Patients', value: s.totalPatients || 0, icon: Users, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950', change: pctChange(s.monthPatients || 0, s.yesterdayPatients || 0), sparkline: quickStats?.patients || [] },
    { label: 'Appointments', value: s.todayAppointments || 0, icon: CalendarCheck, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950', change: pctChange(s.todayAppointments || 0, s.yesterdayAppointments || 0), sparkline: quickStats?.appointments || [] },
    { label: 'Doctors', value: s.totalDoctors || 0, icon: Stethoscope, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950', change: 0, sparkline: [] },
    { label: 'Revenue', value: `₹${(s.todayRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950', change: pctChange(s.todayRevenue || 0, s.yesterdayRevenue || 0), sparkline: quickStats?.revenue || [] },
  ];

  const quickActions = [
    { label: 'All Patient', icon: Users2, route: '/patients', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
    { label: 'Doctors', icon: Stethoscope, route: '/doctors', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
    { label: 'Labs Results', icon: FlaskConical, route: '/lab', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
    { label: 'Prescriptions', icon: FileText, route: '/pharmacy', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
    { label: 'Visits', icon: BedDouble, route: '/ipd', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
    { label: 'Medical Records', icon: ClipboardList, route: '/patients', color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950' },
  ];

  const patientStats = patientStatsData?.stats || [];
  const deptRevenue = deptData?.departments || [];
  const gauge = gaugeData || { total: 0, male: 0, female: 0, other: 0 };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-muted-foreground">Today you have {s.todayAppointments || 0} visits</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {new Date().toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Badge>
      </div>

      {/* Row 1: Stat Cards with Sparklines */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              </div>
              {stat.change !== 0 && (
                <Badge variant={stat.change >= 0 ? 'success' : 'destructive'} className="text-xs">
                  {stat.change >= 0 ? '+' : ''}{stat.change}%
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.sparkline.length > 0 && (
                <div className="mt-2">
                  <Sparkline data={stat.sparkline} color={stat.color} height={32} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Appointment Request + Patient Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <AppointmentRequestList className="h-full" />
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Patients Statistics</CardTitle>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />New Patients</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-300" />Old Patients</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1" style={{ minHeight: 240 }}>
            {patientStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={patientStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newPatients" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="New Patients" />
                  <Bar dataKey="returningPatients" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Old Patients" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Quick Actions */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.route)}
            className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors"
          >
            <div className={`rounded-full p-3 ${a.bg}`}>
              <a.icon className={`h-6 w-6 ${a.color}`} />
            </div>
            <p className="text-sm font-medium">{a.label}</p>
          </button>
        ))}
      </div>

      {/* Row 4: Patient Reports + Patient Visits Gauge + Doctors - equal height cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <PatientReportsList className="h-full" />
        <Card className="h-full flex flex-col">
          <CardHeader><CardTitle className="text-lg">Patient Visits</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="relative flex items-center justify-center">
              <RadialGauge percentage={Math.min(gauge.total, 100)} size={160} color="#3b82f6" label="Total Patients" />
            </div>
            <div className="mt-6 w-full max-w-[200px] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  <span>Male</span>
                </div>
                <span className="font-medium">{gauge.male}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-pink-500" />
                  <span>Female</span>
                </div>
                <span className="font-medium">{gauge.female}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <DoctorsAvailabilityList className="h-full" />
      </div>

      {/* Row 5: Latest Appointments - full width */}
      <LatestAppointmentsTable className="h-full" />

      {/* Row 6: Bed Occupancy + Revenue Summary + Queue Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="h-full flex flex-col">
          <CardHeader><CardTitle className="text-lg">Bed Occupancy</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-4">
            <RadialGauge percentage={bedData?.occupancyRate || 0} size={130} color="#10b981" />
            <div className="grid grid-cols-4 gap-3 text-center text-xs mt-4 w-full">
              <div><p className="text-lg font-bold text-green-600">{bedData?.available || 0}</p><p className="text-muted-foreground">Available</p></div>
              <div><p className="text-lg font-bold text-blue-600">{bedData?.occupied || 0}</p><p className="text-muted-foreground">Occupied</p></div>
              <div><p className="text-lg font-bold text-yellow-600">{bedData?.dirty || 0}</p><p className="text-muted-foreground">Dirty</p></div>
              <div><p className="text-lg font-bold text-red-600">{bedData?.maintenance || 0}</p><p className="text-muted-foreground">Maint.</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="h-full flex flex-col">
          <CardHeader><CardTitle className="text-lg">Today's Revenue</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center py-4">
            <p className="text-4xl font-bold text-green-600">{(s.todayRevenue || 0).toLocaleString('en-IN')}</p>
            <p className="text-sm text-muted-foreground mt-1">Billed: ₹{(s.todayBilled || 0).toLocaleString('en-IN')}</p>
            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${s.todayBilled ? Math.min((s.todayRevenue / s.todayBilled) * 100, 100) : 0}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Collection rate: {s.todayBilled ? Math.round((s.todayRevenue / s.todayBilled) * 100) : 0}%</p>
          </CardContent>
        </Card>
        <Card className="h-full flex flex-col">
          <CardHeader><CardTitle className="text-lg">Queue Status</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Waiting</span>
              <Badge variant="warning">{s.waitingInQueue || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">In Triage</span>
              <Badge variant="info">-</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">With Doctor</span>
              <Badge variant="default">-</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed Today</span>
              <Badge variant="success">{s.todayAppointments || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 7: Top Departments + Patient Records */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Top Departments</CardTitle>
            <Badge variant="outline">Revenue</Badge>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center py-4">
            {deptRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No data yet</p>
            ) : (
              <div className="flex items-center gap-6 w-full">
                <div className="h-40 w-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deptRevenue.slice(0, 6).map((d, i) => ({ name: d.name, value: d.revenue }))}
                        cx="50%" cy="50%"
                        innerRadius={40} outerRadius={70}
                        paddingAngle={3} dataKey="value"
                      >
                        {deptRevenue.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {deptRevenue.slice(0, 6).map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span>{d.name}</span>
                      </div>
                      <span className="font-medium">₹{(d.revenue || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <PatientRecordsTable className="h-full" />
      </div>
    </div>
  );
}
