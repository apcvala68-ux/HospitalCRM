import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { DoctorDashboard } from './doctor/DoctorDashboard';
import { CashierDashboard } from './dashboard/CashierDashboard';
import { NurseDashboard } from './dashboard/NurseDashboard';
import { PharmacistDashboard } from './dashboard/PharmacistDashboard';
import { ReceptionistDashboard } from './dashboard/ReceptionistDashboard';

const roleDashboards = {
  admin: AdminDashboard,
  doctor: DoctorDashboard,
  cashier: CashierDashboard,
  nurse: NurseDashboard,
  pharmacist: PharmacistDashboard,
  receptionist: ReceptionistDashboard,
};

export function DashboardPage() {
  const { user } = useAuth();
  const Dashboard = roleDashboards[user?.role] || AdminDashboard;
  return <Dashboard />;
}
