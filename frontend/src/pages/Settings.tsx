import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SettingsLayout from './settings/SettingsLayout';
import PatientTypes from './settings/PatientTypes';
import UnitTypes from './settings/UnitTypes';
import { ServiceCategories } from './settings/ServiceCategories';
import TicketTypes from './settings/TicketTypes';
import TicketClassifications from './settings/TicketClassifications';
import TicketStatuses from './settings/TicketStatuses';
import RolesPermissions from './settings/RolesPermissions';
import ResponseTemplates from './settings/ResponseTemplates';
import { AITrustSettings } from './settings/AITrustSettings';
import SLASettings from './settings/SLASettings';
import UnitsManagement from './settings/UnitsManagement';
import AppSettings from './settings/AppSettings';

const Settings: React.FC = () => {
  return (
    <SettingsLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/settings/patient-types" replace />} />
        <Route path="/patient-types" element={<PatientTypes />} />
        <Route path="/unit-types" element={<UnitTypes />} />
        <Route path="/service-categories" element={<ServiceCategories />} />
        <Route path="/ticket-types" element={<TicketTypes />} />
        <Route path="/ticket-classifications" element={<TicketClassifications />} />
        <Route path="/ticket-statuses" element={<TicketStatuses />} />
        <Route path="/roles-permissions" element={<RolesPermissions />} />
        <Route path="/response-templates" element={<ResponseTemplates />} />
        <Route path="/ai-trust-settings" element={<AITrustSettings />} />
        <Route path="/sla-settings" element={<SLASettings />} />
        <Route path="/units-management" element={<UnitsManagement />} />
        <Route path="/app-settings" element={<AppSettings />} />
      </Routes>
    </SettingsLayout>
  );
};

export default Settings;