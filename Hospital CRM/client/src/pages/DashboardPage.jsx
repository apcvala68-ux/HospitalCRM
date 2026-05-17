import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Users, Stethoscope, CalendarCheck, DollarSign, BedDouble, Clock,
  TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardStats, useMonthlyTrends, usePaymentBreakdown,
  useDepartmentRevenue, useBillingStatus, useBedOccupancy,
  useDoctorPerformance, useAvgWaitTime
} from '../hooks/useDashboard';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useDashboardStats();
  const { data: trends } = useMonthlyTrends();
  const { data: paymentData } = usePaymentBreakdown();
  const { data: deptData } = useDepartmentRevenue();
  const { data: billingData } = useBillingStatus();
  const { data: bedData } = useBedOccupancy();
  const { data: perfData } = useDoctorPerformance();
  const { data: waitData } = useAvgWaitTime();

  const s = stats || {};
  const pctChange = (curr, prev) => prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);

  const statCards = [
    { label: 'Total Patients', value: s.totalPatients || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', change: pctChange(s.monthPatients || 0, s.yesterdayPatients || 0), changeLabel: 'vs yesterday' },
    { label: 'Active Doctors', value: s.totalDoctors || 0, icon: Stethoscope, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
    { label: "Today's Appointments", value: s.todayAppointments || 0, icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', change: pctChange(s.todayAppointments || 0, s.yesterdayAppointments || 0), changeLabel: 'vs yesterday' },
    { label: "Today's Revenue", value: `₹${(s.todayRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', change: pctChange(s.todayRevenue || 0, s.yesterdayRevenue || 0), changeLabel: 'vs yesterday' },
    { label: 'Waiting Queue', value: s.waitingInQueue || 0, icon: Clock, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
    { label: 'IPD Admissions', value: s.activeAdmissions || 0, icon: BedDouble, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950' },
  ];

  const quickActions = [
    { label: 'Register Patient', icon: Users, route: '/patients/new', color: 'text-blue-600' },
    { label: 'Book Appointment', icon: CalendarCheck, route: '/appointments', color: 'text-purple-600' },
    { label: 'Admit Patient', icon: BedDouble, route: '/ipd', color: 'text-cyan-600' },
    { label: 'New Invoice', icon: DollarSign, route: '/billing/new', color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Here's what's happening at Royale Hospital today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className={`rounded-full p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change !== undefined && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  {stat.change >= 0 ? <ArrowUpRight className="h-3 w-3 text-green-600" /> : <ArrowDownRight className="h-3 w-3 text-red-600" />}
                  <span className={stat.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </span>
                  <span className="text-muted-foreground ml-1">{stat.changeLabel}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader><CardTitle className="text-lg">Monthly Revenue (12 months)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends?.revenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `₹${v >= 1000 ? `${v/1000}k` : v}`} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Bed Occupancy</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'Occupied', value: bedData?.occupied || 0 },
                  { name: 'Available', value: bedData?.available || 0 },
                  { name: 'Dirty', value: bedData?.dirty || 0 },
                  { name: 'Maintenance', value: bedData?.maintenance || 0 },
                ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label>
                  {[0, 1, 2, 3].map(i => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-sm text-muted-foreground -mt-4">
              {bedData?.occupancyRate || 0}% occupied
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-lg">Patient Registrations</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends?.patients || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="patients" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Appointments Trend</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends?.appointments || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="appointments" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Payment Methods</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={(paymentData?.breakdown || []).map(d => ({ name: d.method, value: d.total }))} cx="50%" cy="50%" outerRadius={70} dataKey="value" label>
                  {COLORS.slice(0, (paymentData?.breakdown || []).length).map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader><CardTitle className="text-lg">Revenue by Department</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData?.departments || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} tickFormatter={(v) => `₹${v >= 1000 ? `${v/1000}k` : v}`} />
                <YAxis type="category" dataKey="name" fontSize={12} width={100} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Billing Status</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={(billingData?.statuses || []).map(d => ({ name: d.status, value: d.count }))} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" label>
                  {COLORS.slice(0, (billingData?.statuses || []).length).map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-lg">Doctor Performance (Today)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(perfData?.performance || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data today</p>
            ) : (perfData?.performance || []).map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{d.doctor?.[0]}</div>
                  <div>
                    <p className="text-sm font-medium">{d.doctor}</p>
                    <p className="text-xs text-muted-foreground">{d.completed}/{d.total} completed</p>
                  </div>
                </div>
                <Badge variant="success">{Math.round((d.completed / d.total) * 100)}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Avg Wait Time (30 days)</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waitData?.waitTimes || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                <YAxis fontSize={12} unit="min" />
                <Tooltip />
                <Line type="monotone" dataKey="avgMinutes" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((a) => (
                <button key={a.label} onClick={() => navigate(a.route)} className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors text-center">
                  <a.icon className={`h-6 w-6 ${a.color}`} />
                  <p className="text-sm font-medium">{a.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
