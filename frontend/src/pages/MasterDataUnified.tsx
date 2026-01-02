import React, { useState } from 'react';
import { UnitsManagement } from './settings/UnitsManagement';
import { UnitTypes } from './settings/UnitTypes';
import { ServiceCategories } from './settings/ServiceCategories';
import TicketTypes from './settings/TicketTypes';
import TicketClassifications from './settings/TicketClassifications';
import TicketStatuses from './settings/TicketStatuses';
import PatientTypes from './settings/PatientTypes';
import SLASettings from './settings/SLASettings';
import RolesPermissions from './settings/RolesPermissions';

type TabType = 'units' | 'unit-types' | 'service-categories' | 'ticket-types' | 'ticket-classifications' | 'ticket-statuses' | 'patient-types' | 'sla-settings' | 'roles-permissions';

const MasterDataUnified: React.FC = () => {
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
        { id: 'ticket-statuses', name: 'Status Tiket', icon: 'flag' }
    ];

    const systemTabs = [
        { id: 'roles-permissions', name: 'Peran & Akses', icon: 'admin_panel_settings' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'units':
                return <UnitsManagement />;
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
            default:
                return <UnitsManagement />;
        }
    };

    const getCurrentTabName = () => {
        const allTabs = [...organizationTabs, ...ticketTabs, ...systemTabs];
        return allTabs.find(tab => tab.id === activeTab)?.name || 'Unit Kerja';
    };

    return (
        <div className="flex h-screen w-full">
            {/* Sidebar */}
            <aside className="w-[280px] bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 z-30 transition-all">
                <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <span className="material-symbols-outlined text-[20px]">local_hospital</span>
                        </div>
                        <h1 className="text-lg font-bold tracking-tight">CMS Admin</h1>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
                    {/* Navigation */}
                    <div>
                        <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Layanan Publik</h3>
                        <nav className="flex flex-col gap-1">
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="/dashboard">
                                <span className="material-symbols-outlined">dashboard</span>
                                <span className="text-sm font-medium">Dashboard</span>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="/tickets">
                                <span className="material-symbols-outlined">inbox</span>
                                <span className="text-sm font-medium">Keluhan</span>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="/reports">
                                <span className="material-symbols-outlined">analytics</span>
                                <span className="text-sm font-medium">Analitik</span>
                            </a>
                        </nav>
                    </div>

                    {/* Master Data Section */}
                    <div>
                        <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Manajemen</h3>
                        <nav className="flex flex-col gap-1">
                            <div className="flex flex-col rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                                <button 
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="flex items-center justify-between w-full gap-3 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary font-variation-settings-'FILL'1">database</span>
                                        <span className="text-sm">Master Data</span>
                                    </div>
                                    <span className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                
                                {isExpanded && (
                                    <div className="flex flex-col py-2">
                                        {/* Organization & Services */}
                                        <div className="px-4 py-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Organisasi & Layanan
                                        </div>
                                        {organizationTabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as TabType)}
                                                className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-colors ${
                                                    activeTab === tab.id
                                                        ? 'submenu-item-active text-primary bg-primary/8 font-semibold'
                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                                }`}
                                            >
                                                <span className={`size-1.5 rounded-full ${
                                                    activeTab === tab.id ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                                }`}></span>
                                                {tab.name}
                                            </button>
                                        ))}

                                        {/* Tickets & SLA */}
                                        <div className="px-4 py-1.5 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Tiket & SLA
                                        </div>
                                        {ticketTabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as TabType)}
                                                className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-colors ${
                                                    activeTab === tab.id
                                                        ? 'submenu-item-active text-primary bg-primary/8 font-semibold'
                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                                }`}
                                            >
                                                <span className={`size-1.5 rounded-full ${
                                                    activeTab === tab.id ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                                }`}></span>
                                                {tab.name}
                                            </button>
                                        ))}

                                        {/* System */}
                                        <div className="px-4 py-1.5 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Sistem
                                        </div>
                                        {systemTabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as TabType)}
                                                className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-colors ${
                                                    activeTab === tab.id
                                                        ? 'submenu-item-active text-primary bg-primary/8 font-semibold'
                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                                }`}
                                            >
                                                <span className={`size-1.5 rounded-full ${
                                                    activeTab === tab.id ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                                }`}></span>
                                                {tab.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mt-1" href="/settings">
                                <span className="material-symbols-outlined">settings</span>
                                <span className="text-sm font-medium">Pengaturan Sistem</span>
                            </a>
                        </nav>
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <div className="size-10 rounded-full bg-slate-200 bg-cover bg-center ring-2 ring-white dark:ring-slate-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDhZWFLhjM26KGl8PZ-bgMlD2i-WuJg_0wfxqZ_0Hx4iouJVl_RBYuVGf-SGeZoox_u5G4q8Zo55URHEFZP_vCGvAwV0A_ug5og6CUTQf0tLmQ2Y1zQ1nGGo6I8oDU0c-jUS5GGHr1PMjM2l3eMZ1dKn5CN5zQwa-SYQIrhyudyHO676rMo8bbqIKs0SLoKFTHySO60vLvMx9-xhhGRitkSRlINSzCd-5wcsx59Vxf_IqjJd3sdKKKF0DUVbbiI5CKvnnSyrDuBPuE6')"}}></div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">Admin User</span>
                            <span className="text-xs text-slate-500 truncate">System Administrator</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 ml-auto text-sm">unfold_more</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-8 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <a className="hover:text-primary transition-colors" href="/settings">Pengaturan</a>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="hover:text-primary transition-colors cursor-pointer">Master Data</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium">{getCurrentTabName()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                        </button>
                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <span className="material-symbols-outlined">help</span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <span className="material-symbols-outlined">dark_mode</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {renderTabContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MasterDataUnified;