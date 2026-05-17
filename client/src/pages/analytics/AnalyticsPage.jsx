import { useState } from 'react';
import { useDashboardStats, useRevenueTrend, useDoctorPerformance, useBedOccupancy } from '../../hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Users, Stethoscope, CalendarCheck, BedDouble, DollarSign, Activity, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Bar({ label, value, max, color = 'bg-primary' }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const navigate = useNavigate();
  const { data: stats } = useDashboardStats();
  const { data: trendData } = useRevenueTrend(14);
  const { data: perfData } = useDoctorPerformance();
  const { data: bedData } = useBedOccupancy();

  const trend = trendData?.trend || [];
  const performance = perfData?.performance || [];
  const maxPerf = Math.max(...performance.map(p => p.total), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Owner's Analytics</h1>
        <p className="text-muted-foreground">Real-time hospital performance dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card onClick={() => navigate('/patients')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats?.totalPatients || 0}</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/doctors')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-green-500" /> Active Doctors
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats?.totalDoctors || 0}</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/appointments')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-purple-500" /> Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats?.todayAppointments || 0}</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/ipd')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-orange-500" /> Active IPD
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats?.activeAdmissions || 0}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" /> Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">₹{stats?.todayRevenue?.toLocaleString() || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Billed: ₹{stats?.todayBilled?.toLocaleString() || 0}</p>
            <div className="mt-4 h-3 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${stats?.todayBilled ? (stats.todayRevenue / stats.todayBilled) * 100 : 0}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Collection rate: {stats?.todayBilled ? Math.round((stats.todayRevenue / stats.todayBilled) * 100) : 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" /> Revenue Trend (14 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length === 0 ? (
              <p className="text-sm text-muted-foreground">No revenue data yet</p>
            ) : (
              <div className="space-y-1">
                {trend.slice(-7).map((d) => (
                  <Bar key={d.date} label={new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} value={d.revenue} max={Math.max(...trend.map(t => t.revenue), 1)} color="bg-blue-500" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-purple-500" /> Doctor Performance Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data today</p>
            ) : (
              <div className="space-y-2">
                {performance.map((p) => (
                  <div key={p.doctor} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">
                        {p.doctor?.split(' ')[1]?.[0] || 'D'}
                      </div>
                      <span className="text-sm font-medium">{p.doctor}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{p.completed}/{p.total} done</span>
                      <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-green-500" style={{ width: `${(p.completed / p.total) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-orange-500" /> Bed Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="relative h-32 w-32">
                <div className="absolute inset-0 rounded-full border-8 border-muted" />
                <div className="absolute inset-0 rounded-full border-8 border-green-500 transition-all" style={{ clipPath: `inset(${100 - (bedData?.occupancyRate || 0)}% 0 0 0)` }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{bedData?.occupancyRate || 0}%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div><p className="text-lg font-bold text-green-600">{bedData?.available || 0}</p></div>
              <div><p className="text-lg font-bold text-blue-600">{bedData?.occupied || 0}</p></div>
              <div><p className="text-lg font-bold text-yellow-600">{bedData?.dirty || 0}</p></div>
              <div><p className="text-lg font-bold text-red-600">{bedData?.maintenance || 0}</p></div>
              <div className="text-xs text-muted-foreground">Available</div>
              <div className="text-xs text-muted-foreground">Occupied</div>
              <div className="text-xs text-muted-foreground">Dirty</div>
              <div className="text-xs text-muted-foreground">Maint.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" /> Waiting in Queue
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats?.waitingInQueue || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" /> Total Beds
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{bedData?.total || 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" /> Avg Daily Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ₹{trend.length > 0 ? Math.round(trend.reduce((s, d) => s + d.revenue, 0) / trend.length).toLocaleString() : 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
