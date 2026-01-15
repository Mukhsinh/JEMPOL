import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Core Pages
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import Reports from './pages/Reports';
import NotificationSettings from './pages/NotificationSettings';
import BukuPetunjuk from './pages/BukuPetunjuk';

// Ticket Management
import TicketList from './pages/tickets/TicketList';
import TicketDetail from './pages/tickets/TicketDetail';
import TicketDetailView from './pages/tickets/TicketDetailView';
import TicketTracker from './pages/tickets/TicketTracker';
import CreateInternalTicket from './pages/tickets/CreateInternalTicket';
import TiketEksternal from './pages/tickets/TiketEksternal';
import ExternalTicketForm from './pages/tickets/ExternalTicketForm';
import QRManagement from './pages/tickets/QRManagement';
import QRLanding from './pages/tickets/QRLanding';
import AIEscalationManagement from './pages/tickets/AIEscalationManagement';
import EscalationManagement from './pages/tickets/EscalationManagement';

// Assignment/Penugasan Management
import {
  TiketEskalasi,
  TiketEskalasiDetail,
  TiketPrioritas,
  TiketPrioritasDetail,
  TinjauanEksekutif,
  TinjauanEksekutifDetail
} from './pages/assignment';

// Survey Management
import SurveyForm from './pages/survey/SurveyForm';
import SurveyLanding from './pages/survey/SurveyLanding';
import SurveyReport from './pages/survey/SurveyReport';
import PublicSurveyForm from './pages/survey/PublicSurveyForm';

// Public Pages (No Sidebar)
import QRScanLanding from './pages/public/QRScanLanding';
import PublicExternalTicket from './pages/public/PublicExternalTicket';
import PublicInternalTicket from './pages/public/PublicInternalTicket';
import PublicSurvey from './pages/public/PublicSurvey';
import PublicExternalTicketFullscreen from './pages/public/PublicExternalTicketFullscreen';
import PublicSurveyFullscreen from './pages/public/PublicSurveyFullscreen';

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

// Helper component for protected routes with MainLayout
const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requireAdmin={true}>
    <MainLayout>
      {children}
    </MainLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ticket-tracker" element={<TicketTracker />} />
          <Route path="/qr/:code" element={<QRLanding />} />
          <Route path="/tiket-eksternal" element={<ExternalTicketForm />} />
          <Route path="/tiket-eksternal/:qrCode" element={<ExternalTicketForm />} />
          <Route path="/survey/public" element={<PublicSurveyForm />} />
          <Route path="/survey/public/:qrCode" element={<PublicSurveyForm />} />
          <Route path="/buku-petunjuk" element={<BukuPetunjuk />} />

          {/* Public Routes - QR Scan Integration (No Sidebar) */}
          <Route path="/scan/:code" element={<QRScanLanding />} />
          <Route path="/public/tiket-eksternal" element={<PublicExternalTicket />} />
          <Route path="/public/tiket-internal" element={<PublicInternalTicket />} />
          <Route path="/public/survei" element={<PublicSurvey />} />
          {/* Fullscreen Mobile Forms - untuk QR Code scan */}
          <Route path="/public/form-pengaduan" element={<PublicExternalTicketFullscreen />} />
          <Route path="/public/form-survei" element={<PublicSurveyFullscreen />} />

          {/* Protected Admin Routes - Dashboard */}
          <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
          <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />

          {/* Ticket Management */}
          <Route path="/tickets" element={<ProtectedPage><TicketList /></ProtectedPage>} />
          <Route path="/tickets/:id" element={<ProtectedPage><TicketDetail /></ProtectedPage>} />
          <Route path="/tickets/view" element={<ProtectedPage><TicketDetailView /></ProtectedPage>} />
          <Route path="/tickets/create/internal" element={<ProtectedPage><CreateInternalTicket /></ProtectedPage>} />
          <Route path="/tickets/tiket-eksternal" element={<ProtectedPage><TiketEksternal /></ProtectedPage>} />
          <Route path="/tickets/qr-management" element={<ProtectedPage><QRManagement /></ProtectedPage>} />
          <Route path="/qr-codes" element={<ProtectedPage><QRManagement /></ProtectedPage>} />
          <Route path="/tickets/ai-escalation" element={<ProtectedPage><AIEscalationManagement /></ProtectedPage>} />
          <Route path="/tickets/escalation" element={<ProtectedPage><EscalationManagement /></ProtectedPage>} />

          {/* Assignment/Penugasan Management */}
          <Route path="/assignment/tiket-eskalasi" element={<ProtectedPage><TiketEskalasi /></ProtectedPage>} />
          <Route path="/assignment/tiket-eskalasi/:id" element={<ProtectedPage><TiketEskalasiDetail /></ProtectedPage>} />
          <Route path="/assignment/tiket-prioritas" element={<ProtectedPage><TiketPrioritas /></ProtectedPage>} />
          <Route path="/assignment/tiket-prioritas/:id" element={<ProtectedPage><TiketPrioritasDetail /></ProtectedPage>} />
          <Route path="/assignment/tinjauan-eksekutif" element={<ProtectedPage><TinjauanEksekutif /></ProtectedPage>} />
          <Route path="/assignment/tinjauan-eksekutif/:id" element={<ProtectedPage><TinjauanEksekutifDetail /></ProtectedPage>} />

          {/* Survey Management */}
          <Route path="/survey" element={<ProtectedPage><SurveyLanding /></ProtectedPage>} />
          <Route path="/survey/admin" element={<ProtectedPage><SurveyLanding /></ProtectedPage>} />
          <Route path="/survey/form" element={<ProtectedPage><SurveyForm /></ProtectedPage>} />
          <Route path="/survey/report" element={<ProtectedPage><SurveyReport /></ProtectedPage>} />

          {/* User Management */}
          <Route path="/users" element={<ProtectedPage><UserManagement /></ProtectedPage>} />
          <Route path="/users/profile" element={<ProtectedPage><UserProfile /></ProtectedPage>} />

          {/* Master Data Management */}
          <Route path="/master-data" element={<ProtectedPage><MasterData /></ProtectedPage>} />
          <Route path="/master-data/units" element={<ProtectedPage><UnitsPage /></ProtectedPage>} />
          <Route path="/master-data/unit-types" element={<ProtectedPage><UnitTypesPage /></ProtectedPage>} />
          <Route path="/master-data/service-categories" element={<ProtectedPage><ServiceCategoriesPage /></ProtectedPage>} />
          <Route path="/master-data/ticket-types" element={<ProtectedPage><TicketTypesPage /></ProtectedPage>} />
          <Route path="/master-data/ticket-classifications" element={<ProtectedPage><TicketClassificationsPage /></ProtectedPage>} />
          <Route path="/master-data/ticket-statuses" element={<ProtectedPage><TicketStatusesPage /></ProtectedPage>} />
          <Route path="/master-data/patient-types" element={<ProtectedPage><PatientTypesPage /></ProtectedPage>} />
          <Route path="/master-data/roles-permissions" element={<ProtectedPage><RolesPermissionsPage /></ProtectedPage>} />
          <Route path="/master-data/sla-settings" element={<ProtectedPage><SLASettingsPage /></ProtectedPage>} />
          <Route path="/unified-master-data" element={<ProtectedPage><UnifiedMasterData /></ProtectedPage>} />

          {/* Settings */}
          <Route path="/settings/*" element={<ProtectedPage><SettingsPage /></ProtectedPage>} />

          {/* Reports & Analytics */}
          <Route path="/reports" element={<ProtectedPage><Reports /></ProtectedPage>} />

          {/* Notifications */}
          <Route path="/realtime-notification" element={<ProtectedPage><NotificationSettings /></ProtectedPage>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
