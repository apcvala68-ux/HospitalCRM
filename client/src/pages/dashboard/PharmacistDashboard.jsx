import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Pill, ShoppingCart, Droplets, AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../../hooks/useDashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export function PharmacistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useDashboardStats();
  const s = stats || {};

  const lowStockData = [
    { name: 'Paracetamol', stock: 12, min: 50 },
    { name: 'Amoxicillin', stock: 8, min: 30 },
    { name: 'Metformin', stock: 25, min: 40 },
    { name: 'Omeprazole', stock: 5, min: 25 },
    { name: 'Ibuprofen', stock: 18, min: 35 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground">Pharmacy & Inventory Overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card onClick={() => navigate('/pharmacy')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Pill className="h-4 w-4 text-blue-500" /> Total Medicines
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">-</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/pharmacy')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-600">{lowStockData.length}</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/purchase-orders')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-green-500" /> Orders
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">-</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/blood-bank')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Droplets className="h-4 w-4 text-purple-500" /> Blood Bank
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">-</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Low Stock Alert</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lowStockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="stock" fill="#ef4444" radius={[4, 4, 0, 0]} name="Current Stock" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Pending Prescriptions</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">No pending prescriptions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card onClick={() => navigate('/pharmacy')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" /> Inventory
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">Manage</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/purchase-orders')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-cyan-500" /> Purchase Orders
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">View</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/blood-bank')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Droplets className="h-4 w-4 text-red-500" /> Blood Bank
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">View</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
