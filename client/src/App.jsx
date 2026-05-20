import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { GoogleCallback } from './pages/GoogleCallback';

function lazyPage(importFn) {
  return lazy(() => importFn().then(m => ({ default: m[Object.keys(m).find(k => typeof m[k] === 'function')] })));
}

const DashboardPage = lazyPage(() => import('./pages/DashboardPage'));
const PatientListPage = lazyPage(() => import('./pages/patients/PatientListPage'));
const PatientFormPage = lazyPage(() => import('./pages/patients/PatientFormPage'));
const PatientDetailPage = lazyPage(() => import('./pages/patients/PatientDetailPage'));
const QueuePage = lazyPage(() => import('./pages/queue/QueuePage'));
const DoctorDashboard = lazyPage(() => import('./pages/doctor/DoctorDashboard'));
const ConsultationPage = lazyPage(() => import('./pages/doctor/ConsultationPage'));
const BillingListPage = lazyPage(() => import('./pages/billing/BillingListPage'));
const NewInvoicePage = lazyPage(() => import('./pages/billing/NewInvoicePage'));
const InvoiceDetailPage = lazyPage(() => import('./pages/billing/InvoiceDetailPage'));
const EODReportPage = lazyPage(() => import('./pages/billing/EODReportPage'));
const IPDPage = lazyPage(() => import('./pages/ipd/IPDPage'));
const PharmacyPage = lazyPage(() => import('./pages/pharmacy/PharmacyPage'));
const AttendancePage = lazyPage(() => import('./pages/attendance/AttendancePage'));
const AnalyticsPage = lazyPage(() => import('./pages/analytics/AnalyticsPage'));
const DoctorsListPage = lazyPage(() => import('./pages/doctors/DoctorsListPage'));
const DoctorDetailPage = lazyPage(() => import('./pages/doctors/DoctorDetailPage'));
const DoctorFormPage = lazyPage(() => import('./pages/doctors/DoctorFormPage'));
const DepartmentListPage = lazyPage(() => import('./pages/departments/DepartmentListPage'));
const DepartmentFormPage = lazyPage(() => import('./pages/departments/DepartmentFormPage'));
const DepartmentDetailPage = lazyPage(() => import('./pages/departments/DepartmentDetailPage'));
const AppointmentsPage = lazyPage(() => import('./pages/appointments/AppointmentsPage'));
const LabOrdersPage = lazyPage(() => import('./pages/lab/LabOrdersPage'));
const BloodBankPage = lazyPage(() => import('./pages/blood-bank/BloodBankPage'));
const AmbulancePage = lazyPage(() => import('./pages/ambulance/AmbulancePage'));
const OTSurgeryPage = lazyPage(() => import('./pages/ot-surgery/OTSurgeryPage'));
const PurchaseOrdersPage = lazyPage(() => import('./pages/purchase-orders/PurchaseOrdersPage'));
const HousekeepingPage = lazyPage(() => import('./pages/housekeeping/HousekeepingPage'));
const StaffRosterPage = lazyPage(() => import('./pages/roster/StaffRosterPage'));
const InsuranceClaimsPage = lazyPage(() => import('./pages/insurance/InsuranceClaimsPage'));
const MortuaryPage = lazyPage(() => import('./pages/mortuary/MortuaryPage'));
const FeedbackPage = lazyPage(() => import('./pages/feedback/FeedbackPage'));
const NursingMARPage = lazyPage(() => import('./pages/nursing/NursingMARPage'));
const AllergyPage = lazyPage(() => import('./pages/allergy/AllergyPage'));
const TriagePage = lazyPage(() => import('./pages/triage/TriagePage'));
const PrescriptionPrint = lazyPage(() => import('./pages/prescription/PrescriptionPrint'));
const EmailPage = lazyPage(() => import('./pages/email/EmailPage'));
const SettingsPage = lazyPage(() => import('./pages/settings/SettingsPage'));
const NetworkDiagnosticPage = lazyPage(() => import('./pages/NetworkDiagnosticPage'));

const spinner = (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return spinner;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return spinner;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Suspense fallback={spinner}><DashboardPage /></Suspense>} />
        <Route path="patients" element={<Suspense fallback={spinner}><PatientListPage /></Suspense>} />
        <Route path="patients/new" element={<Suspense fallback={spinner}><PatientFormPage /></Suspense>} />
        <Route path="patients/:id" element={<Suspense fallback={spinner}><PatientDetailPage /></Suspense>} />
        <Route path="patients/:id/edit" element={<Suspense fallback={spinner}><PatientFormPage /></Suspense>} />
        <Route path="queue" element={<Suspense fallback={spinner}><QueuePage /></Suspense>} />
        <Route path="doctor" element={<Suspense fallback={spinner}><DoctorDashboard /></Suspense>} />
        <Route path="consultation/:tokenId" element={<Suspense fallback={spinner}><ConsultationPage /></Suspense>} />
        <Route path="doctors" element={<Suspense fallback={spinner}><DoctorsListPage /></Suspense>} />
        <Route path="doctors/new" element={<Suspense fallback={spinner}><DoctorFormPage /></Suspense>} />
        <Route path="doctors/:id" element={<Suspense fallback={spinner}><DoctorDetailPage /></Suspense>} />
        <Route path="doctors/:id/edit" element={<Suspense fallback={spinner}><DoctorFormPage /></Suspense>} />
        <Route path="departments" element={<Suspense fallback={spinner}><DepartmentListPage /></Suspense>} />
        <Route path="departments/new" element={<Suspense fallback={spinner}><DepartmentFormPage /></Suspense>} />
        <Route path="departments/:id" element={<Suspense fallback={spinner}><DepartmentDetailPage /></Suspense>} />
        <Route path="departments/:id/edit" element={<Suspense fallback={spinner}><DepartmentFormPage /></Suspense>} />
        <Route path="appointments" element={<Suspense fallback={spinner}><AppointmentsPage /></Suspense>} />
        <Route path="billing" element={<Suspense fallback={spinner}><BillingListPage /></Suspense>} />
        <Route path="billing/new" element={<Suspense fallback={spinner}><NewInvoicePage /></Suspense>} />
        <Route path="billing/:id" element={<Suspense fallback={spinner}><InvoiceDetailPage /></Suspense>} />
        <Route path="reports/eod" element={<Suspense fallback={spinner}><EODReportPage /></Suspense>} />
        <Route path="reports" element={<Navigate to="/reports/eod" replace />} />
        <Route path="pharmacy" element={<Suspense fallback={spinner}><PharmacyPage /></Suspense>} />
        <Route path="ipd" element={<Suspense fallback={spinner}><IPDPage /></Suspense>} />
        <Route path="attendance" element={<Suspense fallback={spinner}><AttendancePage /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={spinner}><AnalyticsPage /></Suspense>} />
        <Route path="lab" element={<Suspense fallback={spinner}><LabOrdersPage /></Suspense>} />
        <Route path="blood-bank" element={<Suspense fallback={spinner}><BloodBankPage /></Suspense>} />
        <Route path="ambulance" element={<Suspense fallback={spinner}><AmbulancePage /></Suspense>} />
        <Route path="ot-surgery" element={<Suspense fallback={spinner}><OTSurgeryPage /></Suspense>} />
        <Route path="purchase-orders" element={<Suspense fallback={spinner}><PurchaseOrdersPage /></Suspense>} />
        <Route path="housekeeping" element={<Suspense fallback={spinner}><HousekeepingPage /></Suspense>} />
        <Route path="roster" element={<Suspense fallback={spinner}><StaffRosterPage /></Suspense>} />
        <Route path="insurance" element={<Suspense fallback={spinner}><InsuranceClaimsPage /></Suspense>} />
        <Route path="mortuary" element={<Suspense fallback={spinner}><MortuaryPage /></Suspense>} />
        <Route path="feedback" element={<Suspense fallback={spinner}><FeedbackPage /></Suspense>} />
        <Route path="nursing" element={<Suspense fallback={spinner}><NursingMARPage /></Suspense>} />
        <Route path="allergies" element={<Suspense fallback={spinner}><AllergyPage /></Suspense>} />
        <Route path="triage" element={<Suspense fallback={spinner}><TriagePage /></Suspense>} />
        <Route path="prescription/:id/print" element={<Suspense fallback={spinner}><PrescriptionPrint /></Suspense>} />
        <Route path="email" element={<Suspense fallback={spinner}><EmailPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={spinner}><SettingsPage /></Suspense>} />
        <Route path="network-diagnostic" element={<Suspense fallback={spinner}><NetworkDiagnosticPage /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
