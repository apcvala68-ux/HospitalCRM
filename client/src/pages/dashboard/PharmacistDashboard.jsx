import { useAuth } from '../../context/AuthContext';
import { DashboardCard, DashboardCardHeader, DashboardCardTitle, DashboardCardContent } from '../../components/ui/card';
import { Pill, ShoppingCart, Droplets, AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { generateLowStockData } from '../../lib/demoData';

export function PharmacistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const lowStockData = generateLowStockData();

  const chartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'system-ui, sans-serif' },
    colors: ['#ef4444'],
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 3, borderRadiusApplication: 'end' } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: lowStockData.map(d => d.name),
      labels: { style: { colors: '#706f70', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#706f70', fontSize: '11px' } },
    },
    grid: { borderColor: '#ebedf1', strokeDashArray: 3, xaxis: { lines: { show: false } } },
    tooltip: { enabled: true },
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-greeting">
        <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
        <p>Pharmacy & Inventory Overview</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard onClick={() => navigate('/pharmacy')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-blue-500" /> Total Medicines
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">-</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/pharmacy')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Low Stock
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold text-red-600">{lowStockData.length}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/purchase-orders')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-green-500" /> Orders
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">-</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/blood-bank')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-purple-500" /> Blood Bank
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">-</p></DashboardCardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Low Stock Alert</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="h-64">
              <Chart options={chartOptions} series={[{ data: lowStockData.map(d => d.stock), name: 'Current Stock' }]} type="bar" height={256} />
            </div>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Pending Prescriptions</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <p className="text-sm text-muted-foreground text-center py-6">No pending prescriptions</p>
          </DashboardCardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <DashboardCard onClick={() => navigate('/pharmacy')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" /> Inventory
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">Manage</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/purchase-orders')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-cyan-500" /> Purchase Orders
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">View</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/blood-bank')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-red-500" /> Blood Bank
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">View</p></DashboardCardContent>
        </DashboardCard>
      </div>
    </div>
  );
}
