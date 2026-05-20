import { useAuth } from '../../context/AuthContext';
import { DashboardCard, DashboardCardHeader, DashboardCardTitle, DashboardCardContent } from '../../components/ui/card';
import { Activity, Users, BedDouble, Syringe, Heart, Thermometer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardStats, useBedOccupancy, useDoctorPerformance,
} from '../../hooks/useDashboard';
import Chart from 'react-apexcharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function NurseDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useDashboardStats();
  const { data: bedData } = useBedOccupancy();
  const { data: perfData } = useDoctorPerformance();

  const s = stats || {};
  const performance = perfData?.performance || [];

  const bedChartOptions = {
    chart: { type: 'donut', toolbar: { show: false }, fontFamily: 'system-ui, sans-serif' },
    colors: COLORS,
    plotOptions: { pie: { donut: { size: '55%' }, expandOnClick: false } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', fontSize: '11px', labels: { colors: '#706f70' }, itemMargin: { horizontal: 15 } },
    tooltip: { enabled: true },
    states: { hover: { filter: { type: 'none' } } },
  };

  const perfChartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'system-ui, sans-serif' },
    colors: ['#2563eb', '#10b981'],
    plotOptions: { bar: { horizontal: true, columnWidth: '60%', borderRadius: 3, borderRadiusApplication: 'end' } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: performance.map(d => d.doctor),
      labels: { style: { colors: '#706f70', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#706f70', fontSize: '11px' } },
    },
    grid: { borderColor: '#ebedf1', strokeDashArray: 3 },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px', labels: { colors: '#706f70' }, markers: { width: 8, height: 8 } },
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-greeting">
        <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
        <p>Nursing & Patient Care Overview</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard onClick={() => navigate('/triage')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" /> Waiting Queue
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">{s.waitingInQueue || 0}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/ipd')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-blue-500" /> Active IPD
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">{s.activeAdmissions || 0}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/patients')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" /> Total Patients
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">{s.totalPatients || 0}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/nursing')} className="card-hover cursor-pointer">
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
            <DashboardCardTitle>Bed Occupancy</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="h-64">
              <Chart options={bedChartOptions} series={[bedData?.occupied || 0, bedData?.available || 0, bedData?.dirty || 0, bedData?.maintenance || 0]} type="donut" height={230} />
              <p className="text-center text-xs text-muted-foreground -mt-2">{bedData?.occupancyRate || 0}% occupied</p>
            </div>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Doctor Performance Today</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="h-64">
              {performance.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No data today</p>
              ) : (
                <Chart options={perfChartOptions} series={[{ name: 'Total', data: performance.map(d => d.total) }, { name: 'Completed', data: performance.map(d => d.completed) }]} type="bar" height={256} />
              )}
            </div>
          </DashboardCardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <DashboardCard onClick={() => navigate('/allergies')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" /> Allergies
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">View</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/lab')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" /> Lab Orders
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">View</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/nursing')} className="card-hover cursor-pointer">
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
