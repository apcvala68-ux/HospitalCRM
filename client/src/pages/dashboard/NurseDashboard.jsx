import { useAuth } from '../../context/AuthContext';
import { DashboardCard, DashboardCardHeader, DashboardCardTitle, DashboardCardContent } from '../../components/ui/card';
import { Activity, Users, BedDouble, Syringe, Heart, Thermometer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardStats, useBedOccupancy, useDoctorPerformance,
} from '../../hooks/useDashboard';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function NurseDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useDashboardStats();
  const { data: bedData } = useBedOccupancy();
  const { data: perfData } = useDoctorPerformance();

  const s = stats || {};
  const performance = perfData?.performance || [];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-greeting">
        <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
        <p>Nursing & Patient Care Overview</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard onClick={() => navigate('/triage')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" /> Waiting Queue
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">{s.waitingInQueue || 0}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/ipd')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-blue-500" /> Active IPD
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">{s.activeAdmissions || 0}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/patients')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" /> Total Patients
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">{s.totalPatients || 0}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/nursing')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Syringe className="h-4 w-4 text-purple-500" /> MAR Tasks
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">-</p></DashboardCardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="text-sm font-bold uppercase tracking-widest">Bed Occupancy</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { name: 'Occupied', value: bedData?.occupied || 0 },
                  { name: 'Available', value: bedData?.available || 0 },
                  { name: 'Dirty', value: bedData?.dirty || 0 },
                  { name: 'Maintenance', value: bedData?.maintenance || 0 },
                ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-sm text-muted-foreground mt-2">{bedData?.occupancyRate || 0}% occupied</p>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="text-sm font-bold uppercase tracking-widest">Doctor Performance Today</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            {performance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No data today</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={performance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={11} />
                  <YAxis type="category" dataKey="doctor" fontSize={11} width={80} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Total" />
                  <Bar dataKey="completed" fill="#10b981" radius={[0, 4, 4, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </DashboardCardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <DashboardCard onClick={() => navigate('/allergies')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" /> Allergies
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">View</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/lab')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" /> Lab Orders
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">View</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/nursing')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Syringe className="h-4 w-4 text-cyan-500" /> Nursing MAR
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">View</p></DashboardCardContent>
        </DashboardCard>
      </div>
    </div>
  );
}
