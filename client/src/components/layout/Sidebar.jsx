import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard, Users, Stethoscope, Building2, CalendarCheck, DollarSign,
  Pill, BedDouble, ClipboardList, LogOut, BarChart3, Clock,
  FlaskConical, Droplets, Siren, Scissors, ShoppingCart, Brush,
  CalendarDays, Shield, Cross, MessageSquare, AlertTriangle, Syringe, Activity,
  Mail, Wifi, Settings,
} from 'lucide-react';

const roleMenus = {
  doctor: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor', label: 'My Queue', icon: ClipboardList },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/appointments', label: 'Appointments', icon: CalendarCheck },
    { to: '/ot-surgery', label: 'OT / Surgery', icon: Scissors },
    { to: '/lab', label: 'Laboratory', icon: FlaskConical },
    { to: '/email', label: 'Email', icon: Mail },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  receptionist: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/triage', label: 'Triage', icon: Activity },
    { to: '/appointments', label: 'Appointments', icon: CalendarCheck },
    { to: '/queue', label: 'Queue', icon: ClipboardList },
    { to: '/ambulance', label: 'Ambulance', icon: Siren },
    { to: '/feedback', label: 'Feedback', icon: MessageSquare },
    { to: '/email', label: 'Email', icon: Mail },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/allergies', label: 'Allergies', icon: AlertTriangle },
    { to: '/doctors', label: 'Doctors', icon: Stethoscope },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/appointments', label: 'Appointments', icon: CalendarCheck },
    { to: '/queue', label: 'Queue', icon: ClipboardList },
    { to: '/lab', label: 'Laboratory', icon: FlaskConical },
    { to: '/billing', label: 'Billing', icon: DollarSign },
    { to: '/insurance', label: 'Insurance / TPA', icon: Shield },
    { to: '/pharmacy', label: 'Pharmacy', icon: Pill },
    { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
    { to: '/blood-bank', label: 'Blood Bank', icon: Droplets },
    { to: '/ambulance', label: 'Ambulance', icon: Siren },
    { to: '/ot-surgery', label: 'OT / Surgery', icon: Scissors },
    { to: '/ipd', label: 'IPD / Wards', icon: BedDouble },
    { to: '/nursing', label: 'Nursing / MAR', icon: Syringe },
    { to: '/roster', label: 'Staff Roster', icon: CalendarDays },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/housekeeping', label: 'Housekeeping', icon: Brush },
    { to: '/mortuary', label: 'Mortuary', icon: Cross },
    { to: '/feedback', label: 'Feedback', icon: MessageSquare },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/reports/eod', label: 'EOD Report', icon: ClipboardList },
    { to: '/email', label: 'Email', icon: Mail },
    { to: '/network-diagnostic', label: 'Network Diagnostic', icon: Wifi },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  cashier: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/billing', label: 'Billing', icon: DollarSign },
    { to: '/insurance', label: 'Insurance', icon: Shield },
    { to: '/reports/eod', label: 'EOD Report', icon: ClipboardList },
    { to: '/email', label: 'Email', icon: Mail },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  pharmacist: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/pharmacy', label: 'Pharmacy', icon: Pill },
    { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
    { to: '/blood-bank', label: 'Blood Bank', icon: Droplets },
    { to: '/email', label: 'Email', icon: Mail },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  nurse: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/triage', label: 'Triage', icon: Activity },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/nursing', label: 'Nursing / MAR', icon: Syringe },
    { to: '/ipd', label: 'IPD / Wards', icon: BedDouble },
    { to: '/lab', label: 'Laboratory', icon: FlaskConical },
    { to: '/allergies', label: 'Allergies', icon: AlertTriangle },
    { to: '/email', label: 'Email', icon: Mail },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
};

export function Sidebar({ user }) {
  const menuItems = roleMenus[user?.role] || roleMenus.admin;

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6">
        <Building2 className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">Royale Hospital</span>
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
