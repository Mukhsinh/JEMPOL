import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SettingsLayout from './SettingsLayout';
import UnitsManagement from './UnitsManagement';
import UnitTypesManagement from './UnitTypesManagement';
import ServiceCategoriesManagement from './ServiceCategoriesManagement';
import AITrustManagement from './AITrustManagement';

// Placeholder components for other tabs
const TicketTypesManagement = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Tipe Tiket</h2>
      <p className="text-slate-500 mt-1">Kelola jenis-jenis tiket yang dapat dibuat dalam sistem.</p>
    </div>
    <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 text-center">
      <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">confirmation_number</span>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Tipe Tiket</h3>
      <p className="text-slate-500">Fitur ini sedang dalam pengembangan.</p>
    </div>
  </div>
);

const TicketClassificationsManagement = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Klasifikasi Tiket</h2>
      <p className="text-slate-500 mt-1">Kelola klasifikasi hierarkis untuk tiket.</p>
    </div>
    <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 text-center">
      <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">segment</span>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Klasifikasi Tiket</h3>
      <p className="text-slate-500">Fitur ini sedang dalam pengembangan.</p>
    </div>
  </div>
);

const TicketStatusesManagement = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Status Tiket</h2>
      <p className="text-slate-500 mt-1">Kelola status dan workflow tiket.</p>
    </div>
    <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 text-center">
      <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">flag</span>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Status Tiket</h3>
      <p className="text-slate-500">Fitur ini sedang dalam pengembangan.</p>
    </div>
  </div>
);

const PatientTypesManagement = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Jenis Pasien</h2>
      <p className="text-slate-500 mt-1">Kelola jenis pasien dan prioritas layanan.</p>
    </div>
    <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 text-center">
      <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">accessibility_new</span>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Jenis Pasien</h3>
      <p className="text-slate-500">Fitur ini sedang dalam pengembangan.</p>
    </div>
  </div>
);

const SLASettingsManagement = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pengaturan SLA</h2>
      <p className="text-slate-500 mt-1">Konfigurasi Service Level Agreement untuk berbagai jenis layanan.</p>
    </div>
    <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 text-center">
      <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">timer</span>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Pengaturan SLA</h3>
      <p className="text-slate-500">Fitur ini sedang dalam pengembangan.</p>
    </div>
  </div>
);

const RolesManagement = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Peran & Hak Akses</h2>
      <p className="text-slate-500 mt-1">Kelola peran pengguna dan hak akses dalam sistem.</p>
    </div>
    <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 text-center">
      <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">admin_panel_settings</span>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Peran & Hak Akses</h3>
      <p className="text-slate-500">Fitur ini sedang dalam pengembangan.</p>
    </div>
  </div>
);

const ResponseTemplatesManagement = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Template Respon</h2>
      <p className="text-slate-500 mt-1">Kelola template komunikasi dan respon standar.</p>
    </div>
    <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 text-center">
      <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">chat</span>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Template Respon</h3>
      <p className="text-slate-500">Fitur ini sedang dalam pengembangan.</p>
    </div>
  </div>
);

const SettingsRoutes: React.FC = () => {
  return (
    <SettingsLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/settings/units" replace />} />
        <Route path="/units" element={<UnitsManagement />} />
        <Route path="/unit-types" element={<UnitTypesManagement />} />
        <Route path="/service-categories" element={<ServiceCategoriesManagement />} />
        <Route path="/ticket-types" element={<TicketTypesManagement />} />
        <Route path="/ticket-classifications" element={<TicketClassificationsManagement />} />
        <Route path="/ticket-statuses" element={<TicketStatusesManagement />} />
        <Route path="/patient-types" element={<PatientTypesManagement />} />
        <Route path="/sla-settings" element={<SLASettingsManagement />} />
        <Route path="/roles" element={<RolesManagement />} />
        <Route path="/response-templates" element={<ResponseTemplatesManagement />} />
        <Route path="/ai-trust" element={<AITrustManagement />} />
      </Routes>
    </SettingsLayout>
  );
};

export default SettingsRoutes;