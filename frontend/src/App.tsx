import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/tickets/TicketList';
import TicketDetail from './pages/tickets/TicketDetail';
import CreateInternalTicket from './pages/tickets/CreateInternalTicket';
import TiketEksternal from './pages/tickets/TiketEksternal';
import QRManagement from './pages/tickets/QRManagement';
import AIEscalationManagement from './pages/tickets/AIEscalationManagement';
import EscalationManagement from './pages/tickets/EscalationManagement';
import SettingsPage from './pages/settings/SettingsPage';
import MasterData from './pages/MasterData';
import UnifiedMasterData from './pages/UnifiedMasterData';
import Reports from './pages/Reports';
import NotificationSettings from './pages/NotificationSettings';
import LoginPage from './pages/LoginPage';
import UserManagement from './pages/users/UserManagement';
import UserProfile from './pages/users/UserProfile';
import TicketDetailView from './pages/tickets/TicketDetailView';
import TicketTracker from './pages/tickets/TicketTracker';
import SurveyForm from './pages/survey/SurveyForm';
import SurveyLanding from './pages/survey/SurveyLanding';
import SurveyReport from './pages/survey/SurveyReport';
import PublicSurveyForm from './pages/survey/PublicSurveyForm';
import PublicSurveyLanding from './pages/survey/PublicSurveyLanding';
import ExternalTicketForm from './pages/tickets/ExternalTicketForm';
import BukuPetunjuk from './pages/BukuPetunjuk';

// Master Data Components
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
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ticket-tracker" element={<TicketTracker />} />
          <Route path="/tiket-eksternal" element={<ExternalTicketForm />} />
          <Route path="/tiket-eksternal/:qrCode" element={<ExternalTicketForm />} />
          <Route path="/survey" element={<PublicSurveyLanding />} />
          <Route path="/survey/public" element={<PublicSurveyForm />} />
          <Route path="/survey/public/:qrCode" element={<PublicSurveyForm />} />
          <Route path="/buku-petunjuk" element={<BukuPetunjuk />} />
          
          {/* Public Survey Routes */}
          <Route path="/survey" element={<SurveyLanding />} />
          <Route path="/survey/form" element={<SurveyForm />} />
          <Route path="/survey/public" element={<SurveyForm />} />

          {/* Protected Admin Routes */}
          <Route path="/*" element={
            <ProtectedRoute requireAdmin={true}>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Ticket Routes */}
                  <Route path="/tickets" element={<TicketList />} />
                  <Route path="/tickets/:id" element={<TicketDetail />} />
                  <Route path="/tickets/view" element={<TicketDetailView />} />
                  <Route path="/tickets/create/internal" element={<CreateInternalTicket />} />
                  <Route path="/tickets/tiket-eksternal" element={<TiketEksternal />} />
                  <Route path="/tickets/qr-management" element={<QRManagement />} />
                  <Route path="/qr-codes" element={<QRManagement />} />
                  <Route path="/tickets/ai-escalation" element={<AIEscalationManagement />} />
                  <Route path="/tickets/escalation" element={<EscalationManagement />} />

                  {/* User Management Routes */}
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/users/profile" element={<UserProfile />} />

                  {/* Survey Routes */}
                  <Route path="/survey/admin" element={<SurveyLanding />} />
                  <Route path="/survey/form" element={<SurveyForm />} />
                  <Route path="/survey/report" element={<SurveyReport />} />

                  {/* Master Data Routes */}
                  <Route path="/master-data" element={<MasterData />} />
                  <Route path="/master-data/units" element={<UnitsPage />} />
                  <Route path="/master-data/unit-types" element={<UnitTypesPage />} />
                  <Route path="/master-data/service-categories" element={<ServiceCategoriesPage />} />
                  <Route path="/master-data/ticket-types" element={<TicketTypesPage />} />
                  <Route path="/master-data/ticket-classifications" element={<TicketClassificationsPage />} />
                  <Route path="/master-data/ticket-statuses" element={<TicketStatusesPage />} />
                  <Route path="/master-data/patient-types" element={<PatientTypesPage />} />
                  <Route path="/master-data/roles-permissions" element={<RolesPermissionsPage />} />
                  <Route path="/master-data/sla-settings" element={<SLASettingsPage />} />
                  <Route path="/unified-master-data" element={<UnifiedMasterData />} />
                  
                  {/* Settings Routes */}
                  <Route path="/settings/*" element={<SettingsPage />} />
                  
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/realtime-notification" element={<NotificationSettings />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
