import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RolesPermissions from './RolesPermissions';
import ResponseTemplates from './ResponseTemplates';
import { AITrustSettings } from './AITrustSettings';
import AppSettings from './AppSettings';

const SettingsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Pengaturan Sistem
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Kelola pengaturan sistem, peran pengguna, dan konfigurasi aplikasi
                    </p>
                </div>

                <Routes>
                    <Route path="/" element={<Navigate to="/settings/app-settings" replace />} />
                    <Route path="/app-settings" element={<AppSettings />} />
                    <Route path="/roles-permissions" element={<RolesPermissions />} />
                    <Route path="/response-templates" element={<ResponseTemplates />} />
                    <Route path="/ai-trust" element={<AITrustSettings />} />
                </Routes>
            </div>
        </div>
    );
};

export default SettingsPage;