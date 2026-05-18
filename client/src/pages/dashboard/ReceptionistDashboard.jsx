import { useAuth } from '../../context/AuthContext';
import { DashboardCard, DashboardCardHeader, DashboardCardTitle, DashboardCardContent } from '../../components/ui/card';
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
    <div className="dashboard-wrapper">
      <div className="dashboard-greeting">
        <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
        <p>Front Desk & Patient Management</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard onClick={() => navigate('/patients/new')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> New Registration
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">Register</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/appointments')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-green-500" /> Today's Appointments
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">{s.todayAppointments || 0}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/queue')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-purple-500" /> Queue
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">{s.waitingInQueue || 0}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/triage')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" /> Triage
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">Start</p></DashboardCardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="text-sm font-bold uppercase tracking-widest">Today's Appointments</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            {todayAppts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No appointments today</p>
            ) : (
              <div className="space-y-2">
                {todayAppts.slice(0, 6).map((apt) => (
                  <div key={apt._id} className="flex items-center justify-between rounded-lg border border-border/40 p-2.5">
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
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="text-sm font-bold uppercase tracking-widest">Patient Registrations (7 days)</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="h-64">
            {patientStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="newPatients" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New" />
                  <Bar dataKey="returningPatients" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Returning" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </DashboardCardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <DashboardCard onClick={() => navigate('/ambulance')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-red-500" /> Ambulance
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">Dispatch</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/feedback')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-500" /> Feedback
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">View</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/patients')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> All Patients
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">{s.totalPatients || 0}</p></DashboardCardContent>
        </DashboardCard>
      </div>
    </div>
  );
}
