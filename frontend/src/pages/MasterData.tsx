import React, { useState } from 'react';
import { UnitsManagementEnhanced } from './settings/UnitsManagementEnhanced';
import { UnitTypes } from './settings/UnitTypes';
import { AITrustSettings } from './settings/AITrustSettings';
import { ServiceCategories } from './settings/ServiceCategories';
import TicketTypes from './settings/TicketTypes';
import TicketClassifications from './settings/TicketClassifications';
import TicketStatuses from './settings/TicketStatuses';
import PatientTypes from './settings/PatientTypes';
import SLASettings from './settings/SLASettings';
import RolesPermissions from './settings/RolesPermissions';
import ResponseTemplates from './settings/ResponseTemplates';

type TabType = 'units' | 'unit-types' | 'service-categories' | 'ticket-types' | 'ticket-classifications' | 'ticket-statuses' | 'patient-types' | 'sla-settings' | 'roles-permissions' | 'response-templates' | 'ai-trust';

const MasterData: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('units');

    const organizationTabs = [
        { id: 'units', name: 'Unit Kerja', icon: 'domain' },
        { id: 'unit-types', name: 'Tipe Unit Kerja', icon: 'corporate_fare' },
        { id: 'service-categories', name: 'Kategori Layanan', icon: 'category' }
    ];

    const ticketTabs = [
        { id: 'ticket-types', name: 'Tipe Tiket', icon: 'confirmation_number' },
        { id: 'ticket-classifications', name: 'Klasifikasi', icon: 'segment' },
        { id: 'ticket-statuses', name: 'Status Tiket', icon: 'flag' },
        { id: 'patient-types', name: 'Jenis Pasien', icon: 'accessibility_new' },
        { id: 'sla-settings', name: 'Pengaturan SLA', icon: 'timer' }
    ];

    const systemTabs = [
        { id: 'roles-permissions', name: 'Peran & Akses', icon: 'admin_panel_settings' },
        { id: 'response-templates', name: 'Template Respon', icon: 'chat' },
        { id: 'ai-trust', name: 'Pengaturan AI', icon: 'psychology' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'units':
                return <UnitsManagementEnhanced embedded={true} />;
            case 'unit-types':
                return <UnitTypes />;
            case 'service-categories':
                return <ServiceCategories />;
            case 'ticket-types':
                return <TicketTypes />;
            case 'ticket-classifications':
                return <TicketClassifications />;
            case 'ticket-statuses':
                return <TicketStatuses />;
            case 'patient-types':
                return <PatientTypes />;
            case 'sla-settings':
                return <SLASettings />;
            case 'roles-permissions':
                return <RolesPermissions />;
            case 'response-templates':
                return <ResponseTemplates />;
            case 'ai-trust':
                return <AITrustSettings />;
            default:
                return <UnitsManagementEnhanced embedded={true} />;
        }
    };

    const getCurrentTabName = () => {
        const allTabs = [...organizationTabs, ...ticketTabs, ...systemTabs];
        return allTabs.find(tab => tab.id === activeTab)?.name || 'Unit Kerja';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Master Data</h1>
                        <p className="text-gray-600 mt-1">Kelola data master sistem</p>
                    </div>
                    
                    <div className="flex">
                        {/* Sidebar Navigation */}
                        <div className="w-64 border-r border-gray-200 bg-gray-50">
                            <div className="p-4">
                                <div className="space-y-6">
                                    {/* Organization Section */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                            Organisasi
                                        </h3>
                                        <div className="space-y-1">
                                            {organizationTabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id as TabType)}
                                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                        activeTab === tab.id
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {tab.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Ticket Section */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                            Tiket
                                        </h3>
                                        <div className="space-y-1">
                                            {ticketTabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id as TabType)}
                                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                        activeTab === tab.id
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {tab.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* System Section */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                            Sistem
                                        </h3>
                                        <div className="space-y-1">
                                            {systemTabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id as TabType)}
                                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                        activeTab === tab.id
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {tab.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="p-6">
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {getCurrentTabName()}
                                    </h2>
                                </div>
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MasterData;