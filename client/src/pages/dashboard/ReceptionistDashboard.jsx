import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Users, CalendarCheck, ClipboardList, Siren, MessageSquare, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardStats, useTodayAppointments, usePatientStats,
} from '../../hooks/useDashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export function ReceptionistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useDashboardStats();
  const { data: todayApptData } = useTodayAppointments();
  const { data: patientStatsData } = usePatientStats();

  const s = stats || {};
  const todayAppts = todayApptData?.appointments || [];
  const patientStats = patientStatsData?.stats || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground">Front Desk & Patient Management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card onClick={() => navigate('/patients/new')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> New Registration
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">Register</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/appointments')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-green-500" /> Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{s.todayAppointments || 0}</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/queue')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-purple-500" /> Queue
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{s.waitingInQueue || 0}</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/triage')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" /> Triage
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">Start</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Today's Appointments</CardTitle></CardHeader>
          <CardContent>
            {todayAppts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No appointments today</p>
            ) : (
              <div className="space-y-2">
                {todayAppts.slice(0, 6).map((apt) => (
                  <div key={apt._id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {apt.patientName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{apt.patientName}</p>
                        <p className="text-xs text-muted-foreground">{apt.time} · {apt.department}</p>
                      </div>
                    </div>
                    <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'destructive' : 'info'} className="text-xs">
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Patient Registrations (7 days)</CardTitle></CardHeader>
          <CardContent className="h-64">
            {patientStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="newPatients" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New" />
                  <Bar dataKey="returningPatients" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Returning" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card onClick={() => navigate('/ambulance')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Siren className="h-4 w-4 text-red-500" /> Ambulance
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">Dispatch</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/feedback')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-500" /> Feedback
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">View</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/patients')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> All Patients
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{s.totalPatients || 0}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
