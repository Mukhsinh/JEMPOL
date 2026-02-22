import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppSettingsProvider } from './contexts/AppSettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import MainLayout from './layouts/MainLayout';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full"></div>
  </div>
);

// Core Pages
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import Reports from './pages/Reports';
import NotificationSettings from './pages/NotificationSettings';
import BukuPetunjuk from './pages/BukuPetunjuk';

// Ticket Management (lazy loaded to avoid HMR issues)
const TicketList = lazy(() => import('./pages/tickets/TicketList'));
const TicketDetail = lazy(() => import('./pages/tickets/TicketDetail'));
const TicketDetailView = lazy(() => import('./pages/tickets/TicketDetailView'));
const TiketInternal = lazy(() => import('./pages/tickets/TiketInternal'));
const ExternalTicketForm = lazy(() => import('./pages/tickets/ExternalTicketForm'));
const QRManagement = lazy(() => import('./pages/tickets/QRManagement'));
const AIEscalationManagement = lazy(() => import('./pages/tickets/AIEscalationManagement'));
const EscalationManagement = lazy(() => import('./pages/tickets/EscalationManagement'));

// Survey Management (lazy loaded)
const SurveyLanding = lazy(() => import('./pages/survey/SurveyLanding'));
const SurveyReport = lazy(() => import('./pages/survey/SurveyReport'));
const PublicSurveyForm = lazy(() => import('./pages/survey/PublicSurveyForm'));

// Public Pages
const TrackTicket = lazy(() => import('./pages/public/TrackTicket'));
const DirectInternalTicketForm = lazy(() => import('./pages/public/DirectInternalTicketForm'));
const DirectExternalTicketForm = lazy(() => import('./pages/public/DirectExternalTicketForm'));
const DirectSurveyForm = lazy(() => import('./pages/public/DirectSurveyForm'));
const QRLanding = lazy(() => import('./pages/tickets/QRLanding'));

// User Management
import UserManagement from './pages/users/UserManagement';
import UserProfile from './pages/users/UserProfile';

// Settings
import SettingsPage from './pages/settings/SettingsPage';

// Master Data
import MasterData from './pages/MasterData';
import UnifiedMasterData from './pages/UnifiedMasterData';
import UnitsPage from './pages/master-data/UnitsPage';
import UnitTypesPage from './pages/master-data/UnitTypesPage';
import ServiceCategoriesPage from './pages/master-data/ServiceCategoriesPage';
import TicketTypesPage from './pages/master-data/TicketTypesPage';
import TicketClassificationsPage from './pages/master-data/TicketClassificationsPage';
import TicketStatusesPage from './pages/master-data/TicketStatusesPage';
import PatientTypesPage from './pages/master-data/PatientTypesPage';
import SLASettingsPage from './pages/master-data/SLASettingsPage';
import RolesPermissionsPage from './pages/master-data/RolesPermissionsPage';

function App() {
  return (
    <AuthProvider>
      <AppSettingsProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/lacak-tiket" element={<Suspense fallback={<LoadingSpinner />}><TrackTicket /></Suspense>} />
          <Route path="/track-ticket" element={<Suspense fallback={<LoadingSpinner />}><TrackTicket /></Suspense>} />
          <Route path="/tiket-eksternal" element={<Suspense fallback={<LoadingSpinner />}><ExternalTicketForm /></Suspense>} />
          <Route path="/tiket-eksternal/:qrCode" element={<Suspense fallback={<LoadingSpinner />}><ExternalTicketForm /></Suspense>} />
          <Route path="/survey/public" element={<Suspense fallback={<LoadingSpinner />}><PublicSurveyForm /></Suspense>} />
          <Route path="/survey/public/:qrCode" element={<Suspense fallback={<LoadingSpinner />}><PublicSurveyForm /></Suspense>} />
          <Route path="/buku-petunjuk" element={<BukuPetunjuk />} />
          
          {/* Direct Form Views - Public Access (Tanpa Login, Mobile-First) */}
          {/* ROUTE UTAMA untuk QR Code - Akses publik tanpa login dan tanpa sidebar */}
          <Route path="/form/internal" element={<Suspense fallback={<LoadingSpinner />}><DirectInternalTicketForm /></Suspense>} />
          <Route path="/form/eksternal" element={<Suspense fallback={<LoadingSpinner />}><DirectExternalTicketForm /></Suspense>} />
          <Route path="/form/survey" element={<Suspense fallback={<LoadingSpinner />}><DirectSurveyForm /></Suspense>} />
          
          {/* QR Code Landing Page - Public Access */}
          <Route path="/m/:code" element={<Suspense fallback={<LoadingSpinner />}><QRLanding /></Suspense>} />
          
          {/* Legacy Routes - Redirect ke /form/* untuk backward compatibility */}
          <Route path="/survey" element={<Suspense fallback={<LoadingSpinner />}><DirectSurveyForm /></Suspense>} />

          {/* Protected Admin Routes */}
          <Route path="/*" element={
            <ProtectedRoute requireAdmin={true}>
              <MainLayout>
                <Routes>
                  {/* Dashboard */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Ticket Management */}
                  <Route path="/tickets" element={<Suspense fallback={<LoadingSpinner />}><TicketList /></Suspense>} />
                  <Route path="/tickets/:id" element={<Suspense fallback={<LoadingSpinner />}><TicketDetail /></Suspense>} />
                  <Route path="/tickets/view" element={<Suspense fallback={<LoadingSpinner />}><TicketDetailView /></Suspense>} />
                  {/* Route lama - redirect ke /form/* */}
                  <Route path="/tickets/create/internal" element={<Suspense fallback={<LoadingSpinner />}><DirectInternalTicketForm /></Suspense>} />
                  <Route path="/tickets/internal-form" element={<Suspense fallback={<LoadingSpinner />}><DirectInternalTicketForm /></Suspense>} />
                  <Route path="/tickets/tiket-internal" element={<Suspense fallback={<LoadingSpinner />}><TiketInternal /></Suspense>} />
                  <Route path="/tickets/tiket-eksternal" element={<Suspense fallback={<LoadingSpinner />}><DirectExternalTicketForm /></Suspense>} />
                  {/* QR Management - Hanya Superadmin */}
                  <Route path="/tickets/qr-management" element={
                    <SuperAdminRoute>
                      <Suspense fallback={<LoadingSpinner />}><QRManagement /></Suspense>
                    </SuperAdminRoute>
                  } />
                  <Route path="/qr-codes" element={
                    <SuperAdminRoute>
                      <Suspense fallback={<LoadingSpinner />}><QRManagement /></Suspense>
                    </SuperAdminRoute>
                  } />
                  
                  {/* Escalation Management - Hanya Superadmin */}
                  <Route path="/tickets/ai-escalation" element={
                    <SuperAdminRoute>
                      <Suspense fallback={<LoadingSpinner />}><AIEscalationManagement /></Suspense>
                    </SuperAdminRoute>
                  } />
                  <Route path="/tickets/escalation" element={
                    <SuperAdminRoute>
                      <Suspense fallback={<LoadingSpinner />}><EscalationManagement /></Suspense>
                    </SuperAdminRoute>
                  } />

                  {/* Survey Management */}
                  <Route path="/survey/admin" element={<Suspense fallback={<LoadingSpinner />}><SurveyLanding /></Suspense>} />
                  <Route path="/survey/form" element={<Suspense fallback={<LoadingSpinner />}><DirectSurveyForm /></Suspense>} />
                  <Route path="/survey/report" element={<Suspense fallback={<LoadingSpinner />}><SurveyReport /></Suspense>} />

                  {/* User Management - Hanya Superadmin */}
                  <Route path="/users" element={
                    <SuperAdminRoute>
                      <UserManagement />
                    </SuperAdminRoute>
                  } />
                  <Route path="/users/profile" element={<UserProfile />} />

                  {/* Master Data Management - Hanya Superadmin */}
                  <Route path="/master-data" element={
                    <SuperAdminRoute>
                      <MasterData />
                    </SuperAdminRoute>
                  } />
                  <Route path="/master-data/units" element={
                    <SuperAdminRoute>
                      <UnitsPage />
                    </SuperAdminRoute>
                  } />
                  <Route path="/master-data/unit-types" element={
                    <SuperAdminRoute>
                      <UnitTypesPage />
                    </SuperAdminRoute>
                  } />
                  <Route path="/master-data/service-categories" element={
                    <SuperAdminRoute>
                      <ServiceCategoriesPage />
                    </SuperAdminRoute>
                  } />
                  <Route path="/master-data/ticket-types" element={
                    <SuperAdminRoute>
                      <TicketTypesPage />
                    </SuperAdminRoute>
                  } />
                  <Route path="/master-data/ticket-classifications" element={
                    <SuperAdminRoute>
                      <TicketClassificationsPage />
                    </SuperAdminRoute>
                  } />
                  <Route path="/master-data/ticket-statuses" element={
                    <SuperAdminRoute>
                      <TicketStatusesPage />
                    </SuperAdminRoute>
                  } />
                  <Route path="/master-data/patient-types" element={
                    <SuperAdminRoute>
                      <PatientTypesPage />
                    </SuperAdminRoute>
                  } />
                  <Route path="/master-data/roles-permissions" element={
                    <SuperAdminRoute>
                      <RolesPermissionsPage />
                    </SuperAdminRoute>
                  } />
                  <Route path="/master-data/sla-settings" element={
                    <SuperAdminRoute>
                      <SLASettingsPage />
                    </SuperAdminRoute>
                  } />
                  <Route path="/unified-master-data" element={
                    <SuperAdminRoute>
                      <UnifiedMasterData />
                    </SuperAdminRoute>
                  } />

                  {/* Settings - Hanya Superadmin */}
                  <Route path="/settings/*" element={
                    <SuperAdminRoute>
                      <SettingsPage />
                    </SuperAdminRoute>
                  } />

                  {/* Reports & Analytics */}
                  <Route path="/reports" element={<Reports />} />
                  
                  {/* Notifications - Hanya Superadmin */}
                  <Route path="/realtime-notification" element={
                    <SuperAdminRoute>
                      <NotificationSettings />
                    </SuperAdminRoute>
                  } />
                  
                  {/* Buku Petunjuk - Hanya Superadmin */}
                  <Route path="/buku-petunjuk-admin" element={
                    <SuperAdminRoute>
                      <BukuPetunjuk />
                    </SuperAdminRoute>
                  } />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          } />
          </Routes>
        </Router>
      </AppSettingsProvider>
    </AuthProvider>
  );
}

export default App;