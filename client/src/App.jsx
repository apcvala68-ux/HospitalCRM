import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientListPage } from './pages/patients/PatientListPage';
import { PatientFormPage } from './pages/patients/PatientFormPage';
import { PatientDetailPage } from './pages/patients/PatientDetailPage';
import { QueuePage } from './pages/queue/QueuePage';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { ConsultationPage } from './pages/doctor/ConsultationPage';
import { BillingListPage } from './pages/billing/BillingListPage';
import { NewInvoicePage } from './pages/billing/NewInvoicePage';
import { InvoiceDetailPage } from './pages/billing/InvoiceDetailPage';
import { EODReportPage } from './pages/billing/EODReportPage';
import { IPDPage } from './pages/ipd/IPDPage';
import { PharmacyPage } from './pages/pharmacy/PharmacyPage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { DoctorsListPage } from './pages/doctors/DoctorsListPage';
import { DepartmentsPage } from './pages/departments/DepartmentsPage';
import { AppointmentsPage } from './pages/appointments/AppointmentsPage';
import { GoogleCallback } from './pages/GoogleCallback';
import { LabOrdersPage } from './pages/lab/LabOrdersPage';
import { BloodBankPage } from './pages/blood-bank/BloodBankPage';
import { AmbulancePage } from './pages/ambulance/AmbulancePage';
import { OTSurgeryPage } from './pages/ot-surgery/OTSurgeryPage';
import { PurchaseOrdersPage } from './pages/purchase-orders/PurchaseOrdersPage';
import { HousekeepingPage } from './pages/housekeeping/HousekeepingPage';
import { StaffRosterPage } from './pages/roster/StaffRosterPage';
import { InsuranceClaimsPage } from './pages/insurance/InsuranceClaimsPage';
import { MortuaryPage } from './pages/mortuary/MortuaryPage';
import { FeedbackPage } from './pages/feedback/FeedbackPage';
import { NursingMARPage } from './pages/nursing/NursingMARPage';
import { AllergyPage } from './pages/allergy/AllergyPage';
import { TriagePage } from './pages/triage/TriagePage';
import { PrescriptionPrint } from './pages/prescription/PrescriptionPrint';
import { EmailPage } from './pages/email/EmailPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { NetworkDiagnosticPage } from './pages/NetworkDiagnosticPage';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="patients" element={<PatientListPage />} />
        <Route path="patients/new" element={<PatientFormPage />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="doctor" element={<DoctorDashboard />} />
        <Route path="consultation/:tokenId" element={<ConsultationPage />} />
        <Route path="doctors" element={<DoctorsListPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="billing" element={<BillingListPage />} />
        <Route path="billing/new" element={<NewInvoicePage />} />
        <Route path="billing/:id" element={<InvoiceDetailPage />} />
        <Route path="reports/eod" element={<EODReportPage />} />
        <Route path="reports" element={<div className="text-muted-foreground">Reports module coming soon</div>} />
        <Route path="pharmacy" element={<PharmacyPage />} />
        <Route path="ipd" element={<IPDPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="lab" element={<LabOrdersPage />} />
        <Route path="blood-bank" element={<BloodBankPage />} />
        <Route path="ambulance" element={<AmbulancePage />} />
        <Route path="ot-surgery" element={<OTSurgeryPage />} />
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="housekeeping" element={<HousekeepingPage />} />
        <Route path="roster" element={<StaffRosterPage />} />
        <Route path="insurance" element={<InsuranceClaimsPage />} />
        <Route path="mortuary" element={<MortuaryPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="nursing" element={<NursingMARPage />} />
        <Route path="allergies" element={<AllergyPage />} />
        <Route path="triage" element={<TriagePage />} />
        <Route path="prescription/:id/print" element={<PrescriptionPrint />} />
        <Route path="email" element={<EmailPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="network-diagnostic" element={<NetworkDiagnosticPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
