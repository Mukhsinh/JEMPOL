import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

interface AppSettings {
    app_name: string;
    institution_name: string;
    logo_url: string;
}

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
    const [isTicketsOpen, setIsTicketsOpen] = useState(false);
    const [isSurveyOpen, setIsSurveyOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [appSettings, setAppSettings] = useState<AppSettings>({
        app_name: 'Sistem Pengaduan',
        institution_name: 'Rumah Sakit',
        logo_url: ''
    });

    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const isMasterDataActive = () => {
        return location.pathname.startsWith('/master-data');
    };

    const isTicketsActive = () => {
        return location.pathname.startsWith('/tickets');
    };

    const isSurveyActive = () => {
        return location.pathname.startsWith('/survey');
    };

    const isSettingsActive = () => {
        return location.pathname.startsWith('/settings');
    };

    // Auto-open dropdown if user is on respective pages
    useEffect(() => {
        if (isMasterDataActive()) {
            setIsMasterDataOpen(true);
        }
        if (isTicketsActive()) {
            setIsTicketsOpen(true);
        }
        if (isSurveyActive()) {
            setIsSurveyOpen(true);
        }
        if (isSettingsActive()) {
            setIsSettingsOpen(true);
        }
    }, [location.pathname]);

    // Fetch app settings from database
    useEffect(() => {
        const fetchAppSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('app_settings')
                    .select('setting_key, setting_value')
                    .in('setting_key', ['app_name', 'institution_name', 'logo_url']);

                if (error) {
                    console.error('Error fetching app settings:', error);
                    return;
                }

                if (data) {
                    const settings: Partial<AppSettings> = {};
                    data.forEach((item: { setting_key: string; setting_value: string }) => {
                        if (item.setting_key === 'app_name') settings.app_name = item.setting_value;
                        if (item.setting_key === 'institution_name') settings.institution_name = item.setting_value;
                        if (item.setting_key === 'logo_url') settings.logo_url = item.setting_value;
                    });
                    setAppSettings(prev => ({ ...prev, ...settings }));
                }
            } catch (err) {
                console.error('Error loading app settings:', err);
            }
        };

        fetchAppSettings();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 flex-shrink-0 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col h-full transition-colors duration-200 z-20">
            {/* Brand - Fixed at top */}
            <div className="flex-shrink-0 p-4 pb-2">
                <div className="flex items-center gap-3 px-2">
                    <div className="bg-primary/10 flex items-center justify-center rounded-lg h-10 w-10 shrink-0 overflow-hidden">
                        {appSettings.logo_url ? (
                            <img src={appSettings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <span className="material-symbols-outlined text-primary text-2xl">local_hospital</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight">{appSettings.institution_name || 'Rumah Sakit'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{appSettings.app_name || 'Sistem Manajemen'}</p>
                    </div>
                </div>
            </div>

            {/* Navigation - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 sidebar-scroll">
                <nav className="flex flex-col gap-1">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive('/')
                            ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        <p className="text-sm font-medium">Dasbor</p>
                    </Link>

                    <div className="pt-2 pb-1">
                        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Layanan Publik</p>
                    </div>

                    <Link
                        to="/ticket-tracker"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/ticket-tracker')
                            ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="material-symbols-outlined">search</span>
                        <p className="text-sm font-medium">Lacak Tiket</p>
                    </Link>

                    <div className="pt-2 pb-1">
                        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Operasional</p>
                    </div>

                    {/* Tickets Dropdown */}
                    <div className="mb-2">
                        <button
                            onClick={() => setIsTicketsOpen(!isTicketsOpen)}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${isTicketsActive()
                                ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">confirmation_number</span>
                                <p className="text-sm font-medium">Tickets</p>
                            </div>
                            <span className={`material-symbols-outlined text-sm transition-transform ${isTicketsOpen ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        </button>

                        {/* Tickets Submenu */}
                        {isTicketsOpen && (
                            <div className="mt-2 ml-6 flex flex-col gap-1">
                                <Link
                                    to="/tickets"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/tickets'
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Semua Tiket</p>
                                </Link>
                                
                                <Link
                                    to="/tickets/create/internal"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/tickets/create/internal')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Buat Tiket Internal</p>
                                </Link>
                                
                                <Link
                                    to="/tickets/tiket-eksternal"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/tickets/tiket-eksternal')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Tiket Eksternal</p>
                                </Link>
                                
                                <Link
                                    to="/tickets/qr-management"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/tickets/qr-management')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">QR Code Management</p>
                                </Link>
                                
                                <Link
                                    to="/tickets/escalation"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/tickets/escalation')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Eskalasi</p>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Survey Dropdown */}
                    <div className="mb-2">
                        <button
                            onClick={() => setIsSurveyOpen(!isSurveyOpen)}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${isSurveyActive()
                                ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">sentiment_satisfied</span>
                                <p className="text-sm font-medium">Survei Kepuasan</p>
                            </div>
                            <span className={`material-symbols-outlined text-sm transition-transform ${isSurveyOpen ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        </button>

                        {/* Survey Submenu */}
                        {isSurveyOpen && (
                            <div className="mt-2 ml-6 flex flex-col gap-1">
                                <Link
                                    to="/survey"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/survey'
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Survei Kepuasan</p>
                                </Link>
                                
                                <Link
                                    to="/survey/report"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/survey/report')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Laporan Survei</p>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 pb-1">
                        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Manajemen</p>
                    </div>

                    {/* Master Data Dropdown */}
                    <div className="mb-2">
                        <button
                            onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${isMasterDataActive()
                                ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">database</span>
                                <p className="text-sm font-medium">Master Data</p>
                            </div>
                            <span className={`material-symbols-outlined text-sm transition-transform ${isMasterDataOpen ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        </button>

                        {/* Master Data Submenu */}
                        {isMasterDataOpen && (
                            <div className="mt-2 ml-6 flex flex-col gap-1">
                                <Link
                                    to="/master-data/units"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/master-data/units')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Unit Kerja</p>
                                </Link>
                                
                                <Link
                                    to="/master-data/unit-types"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/master-data/unit-types')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Tipe Unit Kerja</p>
                                </Link>
                                
                                <Link
                                    to="/master-data/service-categories"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/master-data/service-categories')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Kategori Layanan</p>
                                </Link>
                                
                                <Link
                                    to="/master-data/ticket-types"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/master-data/ticket-types')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Tipe Tiket</p>
                                </Link>
                                
                                <Link
                                    to="/master-data/ticket-statuses"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/master-data/ticket-statuses')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Status Tiket</p>
                                </Link>
                                
                                <Link
                                    to="/master-data/patient-types"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/master-data/patient-types')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Jenis Pasien</p>
                                </Link>
                                
                                <Link
                                    to="/master-data/sla-settings"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/master-data/sla-settings')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    <p className="text-sm font-medium">Pengaturan SLA</p>
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link
                        to="/reports"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/reports')
                            ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="material-symbols-outlined">assessment</span>
                        <p className="text-sm font-medium">Laporan & Analitik</p>
                    </Link>

                    <Link
                        to="/users"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/users')
                            ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="material-symbols-outlined">group</span>
                        <p className="text-sm font-medium">Pengguna</p>
                    </Link>

                    <Link
                        to="/realtime-notification"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/realtime-notification')
                            ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        <p className="text-sm font-medium">Notifikasi</p>
                    </Link>

                    <div className="pt-2 pb-1">
                        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dokumentasi</p>
                    </div>

                    <Link
                        to="/buku-petunjuk"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/buku-petunjuk')
                            ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="material-symbols-outlined">menu_book</span>
                        <p className="text-sm font-medium">Buku Petunjuk</p>
                    </Link>

                    {/* Settings Dropdown */}
                    <div className="mb-2">
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${isSettingsActive()
                                ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">settings</span>
                                <p className="text-sm font-medium">Pengaturan</p>
                            </div>
                            <span className={`material-symbols-outlined text-sm transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        </button>

                        {/* Settings Submenu */}
                        {isSettingsOpen && (
                            <div className="mt-2 ml-6 flex flex-col gap-1">
                                <Link
                                    to="/settings/app"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/settings/app')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-green-500">tune</span>
                                    <p className="text-sm font-medium">Pengaturan Aplikasi</p>
                                </Link>
                                
                                <Link
                                    to="/settings/roles-permissions"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/settings/roles-permissions')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-blue-500">security</span>
                                    <p className="text-sm font-medium">Peran & Hak Akses</p>
                                </Link>
                                
                                <Link
                                    to="/settings/response-templates"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/settings/response-templates')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-slate-600">chat</span>
                                    <p className="text-sm font-medium">Template Respon</p>
                                </Link>
                                
                                <Link
                                    to="/settings/ai-trust"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/settings/ai-trust')
                                        ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-purple-500">psychology</span>
                                    <p className="text-sm font-medium">Pengaturan Kepercayaan AI</p>
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </div>

            {/* Profile - Fixed at bottom */}
            <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group relative">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full h-9 w-9 ring-2 ring-slate-100 dark:ring-slate-700 bg-slate-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-500">person</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{user?.full_name || user?.username || 'Admin'}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate capitalize">{user?.role || 'Admin'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="ml-auto p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title="Keluar"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}