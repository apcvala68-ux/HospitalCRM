import { useAuth } from '../../context/AuthContext';
import { DashboardCard, DashboardCardHeader, DashboardCardTitle, DashboardCardContent } from '../../components/ui/card';
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
    <div className="dashboard-wrapper">
      <div className="dashboard-greeting">
        <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
        <p>Billing & Payment Overview</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" /> Today's Revenue
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold text-green-600">{(s.todayRevenue || 0).toLocaleString('en-IN')}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-500" /> Total Billed
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">{(s.todayBilled || 0).toLocaleString('en-IN')}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" /> Month Revenue
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-2xl font-bold">{(s.monthRevenue || 0).toLocaleString('en-IN')}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" /> Pending Bills
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <p className="text-2xl font-bold">{statuses.find(st => st.status === 'draft')?.count || 0}</p>
          </DashboardCardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="text-sm font-bold uppercase tracking-widest">Revenue Trend (7 days)</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="h-64">
            {trend.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                  <YAxis fontSize={11} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle className="text-sm font-bold uppercase tracking-widest">Payment Methods</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent className="h-64">
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={payments.map(d => ({ name: d.method, value: d.total }))} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {payments.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </DashboardCardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <DashboardCard onClick={() => navigate('/billing')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" /> All Invoices
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">{statuses.reduce((a, b) => a + b.count, 0) || 0}</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/insurance')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" /> Insurance Claims
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">-</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/reports/eod')} className="cursor-pointer hover:shadow-md transition-shadow">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-purple-500" /> EOD Report
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">View</p></DashboardCardContent>
        </DashboardCard>
      </div>
    </div>
  );
}
