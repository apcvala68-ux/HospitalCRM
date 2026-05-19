import { useState, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';
import {
  LayoutDashboard, Users, Stethoscope, Building2, CalendarCheck, DollarSign,
  Pill, BedDouble, ClipboardList, BarChart3, Clock,
  FlaskConical, Droplets, Siren, Scissors, ShoppingCart, Brush,
  CalendarDays, Shield, Cross, MessageSquare, AlertTriangle, Syringe, Activity,
  Mail, Wifi, Settings, ChevronLeft, ChevronRight, Lock,
} from 'lucide-react';

const UNLOCKED = new Set(['/', '/patients', '/allergies', '/doctors', '/departments', '/lab', '/billing', '/settings']);
const LOCKED_MSG = '🔒 This module is locked. Contact Axiora Digital for full access.';

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

export function Sidebar({ user, mobileOpen, onMobileClose }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const menuItems = roleMenus[user?.role] || roleMenus.admin;
  const collapseTimer = useRef(null);
  const t = useToast();

  const isMobileMode = mobileOpen !== undefined;

  const handleMouseEnter = useCallback(() => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
    setIsCollapsed(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isPinned) {
      collapseTimer.current = setTimeout(() => { setIsCollapsed(true); }, 200);
    }
  }, [isPinned]);

  const handleToggle = useCallback(() => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
    if (isPinned) { setIsPinned(false); setIsCollapsed(true); }
    else { setIsPinned(true); setIsCollapsed(false); }
  }, [isPinned]);

  const handleNavClick = useCallback(() => {
    if (!isPinned) setIsCollapsed(true);
  }, [isPinned]);

  const handleMobileNavClick = useCallback(() => {
    onMobileClose?.();
  }, [onMobileClose]);

  const renderNavItems = useCallback((expanded, onNavClick) => (
    menuItems.map((item) => {
      const unlocked = UNLOCKED.has(item.to);
      const linkClasses = ({ isActive }) =>
        cn(
          'flex items-center rounded-lg text-sm transition-all duration-150',
          expanded ? 'px-3 py-2' : 'justify-center p-2.5',
          !unlocked && 'opacity-50',
          unlocked && isActive
            ? 'bg-[#f4f4f6] text-foreground font-semibold dark:bg-[#26262b]'
            : unlocked
              ? 'font-medium text-muted-foreground hover:bg-[#f4f4f6] hover:text-foreground dark:hover:bg-[#26262b]'
              : 'font-medium text-muted-foreground'
        );

      if (unlocked) {
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavClick}
            title={!expanded ? item.label : undefined}
            className={linkClasses}
          >
            <item.icon className="shrink-0 h-[18px] w-[18px] transition-all duration-150" />
            <span className={cn("whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-300 ease-in-out", expanded ? "max-w-[160px] opacity-100 ml-2.5" : "max-w-0 opacity-0 ml-0")}>
              {item.label}
            </span>
          </NavLink>
        );
      }

      return (
        <button
          key={item.to}
          onClick={() => t.info(LOCKED_MSG)}
          title={!expanded ? item.label : undefined}
          className={linkClasses({ isActive: false }) + ' w-full cursor-pointer'}
        >
          <item.icon className="shrink-0 h-[18px] w-[18px] transition-all duration-150" />
          <span className={cn("whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-300 ease-in-out flex items-center gap-1", expanded ? "max-w-[160px] opacity-100 ml-2.5" : "max-w-0 opacity-0 ml-0")}>
            {item.label}
            <Lock className="h-3 w-3 shrink-0 text-muted-foreground/40" />
          </span>
        </button>
      );
    })
  ), [menuItems, t]);

  const renderLogo = (expanded) => (
    <div className={cn(
      "flex h-14 items-center border-b transition-all duration-300 shrink-0",
      expanded ? "px-5" : "justify-center px-0"
    )}>
      <Building2 className="h-5 w-5 text-primary shrink-0 transition-all duration-300" />
      <span className={cn(
        "text-[15px] font-bold whitespace-nowrap tracking-tight text-foreground overflow-hidden transition-all duration-300 ease-in-out",
        expanded ? "max-w-[150px] opacity-100 ml-2.5" : "max-w-0 opacity-0 ml-0"
      )}>
        Royale Hospital
      </span>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileMode && (
        <div
          className={cn(
            "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden",
            mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      {isMobileMode && (
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex h-full w-60 flex-col border-r border-border/60 bg-card transition-transform duration-300 ease-in-out lg:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {renderLogo(true)}
          <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent">
            {renderNavItems(true, handleMobileNavClick)}
          </nav>
        </aside>
      )}

      {/* Desktop sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "hidden lg:flex h-full flex-col border-r border-border/60 bg-card transition-all duration-300 ease-in-out relative",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        {renderLogo(!isCollapsed)}

        <button
          onClick={handleToggle}
          title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
          className={cn(
            "absolute -right-3.5 top-[1.375rem] z-50 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-background shadow-md hover:shadow-lg hover:bg-accent hover:border-accent transition-all",
            isPinned && "text-primary border-primary/30"
          )}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent">
          {renderNavItems(!isCollapsed, handleNavClick)}
        </nav>
      </aside>
    </>
  );
}
