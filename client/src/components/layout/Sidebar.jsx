import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard, Users, Stethoscope, Building2, CalendarCheck, DollarSign,
  Pill, BedDouble, ClipboardList, BarChart3, Clock,
  FlaskConical, Droplets, Siren, Scissors, ShoppingCart, Brush,
  CalendarDays, Shield, Cross, MessageSquare, AlertTriangle, Syringe, Activity,
  Mail, Wifi, Settings, ChevronLeft, ChevronRight,
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const menuItems = roleMenus[user?.role] || roleMenus.admin;

  return (
    <aside className={cn(
      "flex h-full flex-col border-r bg-card transition-all duration-300 ease-in-out relative overflow-hidden",
      isCollapsed ? "w-20" : "w-60"
    )}>
      <div className={cn(
        "flex h-14 items-center border-b transition-all duration-300 shrink-0",
        isCollapsed ? "justify-center px-0" : "px-5"
      )}>
        <Building2 className="h-6 w-6 text-primary shrink-0" />
        {!isCollapsed && <span className="ml-3 text-sm font-bold whitespace-nowrap tracking-tight text-foreground">Royale Hospital</span>}
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-[1.375rem] z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:shadow-lg hover:bg-accent transition-all"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200',
                isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                isActive
                  ? 'bg-primary/8 text-primary border-l-2 border-l-primary'
                  : 'text-[#acadb1] hover:bg-accent/60 hover:text-foreground border-l-2 border-l-transparent'
              )
            }
          >
            <item.icon className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-5 w-5")} />
            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-200">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
