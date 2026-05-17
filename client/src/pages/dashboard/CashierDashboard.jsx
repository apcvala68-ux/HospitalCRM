import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { DollarSign, TrendingUp, Clock, FileText, Shield, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardStats, usePaymentBreakdown, useBillingStatus, useRevenueTrend,
} from '../../hooks/useDashboard';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function CashierDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useDashboardStats();
  const { data: paymentData } = usePaymentBreakdown();
  const { data: billingData } = useBillingStatus();
  const { data: trendData } = useRevenueTrend(7);

  const s = stats || {};
  const trend = trendData?.trend || [];
  const payments = paymentData?.breakdown || [];
  const statuses = billingData?.statuses || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground">Billing & Payment Overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" /> Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">{(s.todayRevenue || 0).toLocaleString('en-IN')}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-500" /> Total Billed
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{(s.todayBilled || 0).toLocaleString('en-IN')}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" /> Month Revenue
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-3xl font-bold">{(s.monthRevenue || 0).toLocaleString('en-IN')}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" /> Pending Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statuses.find(st => st.status === 'draft')?.count || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Revenue Trend (7 days)</CardTitle></CardHeader>
          <CardContent className="h-64">
            {trend.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                  <YAxis fontSize={12} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Payment Methods</CardTitle></CardHeader>
          <CardContent className="h-64">
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={payments.map(d => ({ name: d.method, value: d.total }))} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {payments.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card onClick={() => navigate('/billing')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" /> All Invoices
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{statuses.reduce((a, b) => a + b.count, 0) || 0}</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/insurance')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" /> Insurance Claims
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">-</p></CardContent>
        </Card>
        <Card onClick={() => navigate('/reports/eod')} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4 text-purple-500" /> EOD Report
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">View</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
