import { useAuth } from '../../context/AuthContext';
import { DashboardCard, DashboardCardHeader, DashboardCardTitle, DashboardCardContent } from '../../components/ui/card';
import { Pill, ShoppingCart, Droplets, AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export function PharmacistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const lowStockData = [
    { name: 'Paracetamol', stock: 12, min: 50 },
    { name: 'Amoxicillin', stock: 8, min: 30 },
    { name: 'Metformin', stock: 25, min: 40 },
    { name: 'Omeprazole', stock: 5, min: 25 },
    { name: 'Ibuprofen', stock: 18, min: 35 },
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-greeting">
        <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
        <p>Pharmacy & Inventory Overview</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard onClick={() => navigate('/pharmacy')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-blue-500" /> Total Medicines
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">-</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/pharmacy')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Low Stock
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold text-red-600">{lowStockData.length}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/purchase-orders')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-green-500" /> Orders
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">-</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/blood-bank')} className="cursor-pointer hover:shadow-md transition-shadow">
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
            <DashboardCardTitle className="text-sm font-bold uppercase tracking-widest">Low Stock Alert</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lowStockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="stock" fill="#ef4444" radius={[4, 4, 0, 0]} name="Current Stock" />
              </BarChart>
            </ResponsiveContainer>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="text-sm font-bold uppercase tracking-widest">Pending Prescriptions</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <p className="text-sm text-muted-foreground text-center py-6">No pending prescriptions</p>
          </DashboardCardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <DashboardCard onClick={() => navigate('/pharmacy')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" /> Inventory
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">Manage</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/purchase-orders')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-cyan-500" /> Purchase Orders
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">View</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/blood-bank')} className="cursor-pointer hover:shadow-md transition-shadow">
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
