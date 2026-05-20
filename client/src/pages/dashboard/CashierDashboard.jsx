import { useAuth } from '../../context/AuthContext';
import { DashboardCard, DashboardCardHeader, DashboardCardTitle, DashboardCardContent } from '../../components/ui/card';
import { DollarSign, TrendingUp, Clock, FileText, Shield, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardStats, usePaymentBreakdown, useBillingStatus, useRevenueTrend,
} from '../../hooks/useDashboard';
import Chart from 'react-apexcharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

  const revenueChartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'system-ui, sans-serif' },
    colors: ['#10b981'],
    plotOptions: { bar: { columnWidth: '50%', borderRadius: 3, borderRadiusApplication: 'end' } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: trend.map(d => d.date ? d.date.slice(5) : ''),
      labels: { style: { colors: '#706f70', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#706f70', fontSize: '11px' }, formatter: (v) => v >= 1000 ? `${v/1000}k` : v },
    },
    grid: { borderColor: '#ebedf1', strokeDashArray: 3, xaxis: { lines: { show: false } } },
    tooltip: { y: { formatter: (v) => `₹${v.toLocaleString('en-IN')}` } },
  };

  const paymentChartOptions = {
    chart: { type: 'donut', toolbar: { show: false }, fontFamily: 'system-ui, sans-serif' },
    colors: COLORS,
    plotOptions: { pie: { donut: { size: '55%' }, expandOnClick: false } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', fontSize: '11px', labels: { colors: '#706f70' }, itemMargin: { horizontal: 12 } },
    tooltip: { y: { formatter: (v) => `₹${v.toLocaleString('en-IN')}` } },
    states: { hover: { filter: { type: 'none' } } },
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-greeting">
        <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
        <p>Billing & Payment Overview</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard className="card-hover cursor-pointer" onClick={() => navigate('/billing')}>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" /> Today's Revenue
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <p className="text-2xl font-bold text-green-600">₹{(s.todayRevenue || 0).toLocaleString('en-IN')}</p>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard className="card-hover cursor-pointer" onClick={() => navigate('/billing')}>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-500" /> Total Billed
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <p className="text-2xl font-bold">₹{(s.todayBilled || 0).toLocaleString('en-IN')}</p>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard className="card-hover cursor-pointer" onClick={() => navigate('/billing')}>
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" /> Month Revenue
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <p className="text-2xl font-bold">₹{(s.monthRevenue || 0).toLocaleString('en-IN')}</p>
          </DashboardCardContent>
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
            <DashboardCardTitle>Revenue Trend (7 days)</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="h-64">
              {trend.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
              ) : (
                <Chart options={revenueChartOptions} series={[{ data: trend.map(d => d.revenue), name: 'Revenue' }]} type="bar" height={256} />
              )}
            </div>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard>
          <DashboardCardHeader>
            <DashboardCardTitle>Payment Methods</DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <div className="h-64">
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
              ) : (
                <Chart options={paymentChartOptions} series={payments.map(d => d.total)} type="donut" height={256} />
              )}
            </div>
          </DashboardCardContent>
        </DashboardCard>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <DashboardCard onClick={() => navigate('/billing')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" /> All Invoices
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent>
            <p className="text-xl font-bold">{statuses.reduce((a, b) => a + b.count, 0) || 0}</p>
          </DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/insurance')} className="card-hover cursor-pointer">
          <DashboardCardHeader>
            <DashboardCardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" /> Insurance Claims
            </DashboardCardTitle>
          </DashboardCardHeader>
          <DashboardCardContent><p className="text-xl font-bold">-</p></DashboardCardContent>
        </DashboardCard>
        <DashboardCard onClick={() => navigate('/reports/eod')} className="card-hover cursor-pointer">
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
