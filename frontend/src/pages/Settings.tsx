import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import RolesPermissions from './settings/RolesPermissions';
import ResponseTemplates from './settings/ResponseTemplates';
import { AITrustSettings } from './settings/AITrustSettings';

type TabType = 'roles-permissions' | 'response-templates' | 'ai-trust';

const Settings: React.FC = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<TabType>('roles-permissions');

    // Set active tab based on current route
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/settings/roles-permissions')) {
            setActiveTab('roles-permissions');
        } else if (path.includes('/settings/response-templates')) {
            setActiveTab('response-templates');
        } else if (path.includes('/settings/ai-trust')) {
            setActiveTab('ai-trust');
        } else {
            // Default to roles-permissions if just /settings
            setActiveTab('roles-permissions');
        }
    }, [location.pathname]);

    const tabs = [
        { id: 'roles-permissions', name: 'Peran & Hak Akses', icon: 'admin_panel_settings' },
        { id: 'response-templates', name: 'Template Respon', icon: 'chat' },
        { id: 'ai-trust', name: 'Pengaturan Kepercayaan AI', icon: 'psychology' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'roles-permissions':
                return <RolesPermissions />;
            case 'response-templates':
                return <ResponseTemplates />;
            case 'ai-trust':
                return <AITrustSettings />;
            default:
                return <RolesPermissions />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900">
            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0 z-20 shadow-sm">
                <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-lg">settings</span>
                        </div>
                        <h1 className="text-lg font-bold tracking-tight">Pengaturan</h1>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
                    <div>
                        <h3 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Navigasi</h3>
                        <nav className="flex flex-col gap-1">
                            <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" href="/dashboard">
                                <span className="material-symbols-outlined text-lg">dashboard</span>
                                <span className="text-sm font-medium">Dashboard</span>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" href="/tickets">
                                <span className="material-symbols-outlined text-lg">inbox</span>
                                <span className="text-sm font-medium">Keluhan</span>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" href="/reports">
                                <span className="material-symbols-outlined text-lg">analytics</span>
                                <span className="text-sm font-medium">Laporan</span>
                            </a>
                            <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" href="/master-data">
                                <span className="material-symbols-outlined text-lg">storage</span>
                                <span className="text-sm font-medium">Master Data</span>
                            </a>
                        </nav>
                    </div>
                    
                    <div>
                        <h3 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pengaturan Sistem</h3>
                        <nav className="flex flex-col gap-1">
                            {tabs.map((tab) => (
                                <Link
                                    key={tab.id}
                                    to={`/settings/${tab.id}`}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-left w-full ${
                                        activeTab === tab.id
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-lg ${
                                        activeTab === tab.id 
                                            ? 'font-variation-settings-\'FILL\'1' 
                                            : 'group-hover:text-primary transition-colors'
                                    }`}>
                                        {tab.icon}
                                    </span>
                                    <span className={`text-sm ${
                                        activeTab === tab.id ? 'font-semibold' : 'font-medium'
                                    }`}>
                                        {tab.name}
                                    </span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">person</span>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">Admin User</span>
                            <span className="text-xs text-slate-500 truncate">System Administrator</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Pengaturan</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                            {tabs.find(tab => tab.id === activeTab)?.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <span className="material-symbols-outlined">help</span>
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <span className="material-symbols-outlined">dark_mode</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="min-h-full">
                        {renderTabContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;