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
    const [isExpanded, setIsExpanded] = useState(true);

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

export default MasterData;