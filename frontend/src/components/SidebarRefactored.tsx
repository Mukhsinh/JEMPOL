import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  children?: NavigationItem[];
}

const navigationConfig: NavigationItem[] = [
  {
    path: '/',
    label: 'Dasbor',
    icon: 'dashboard'
  },
  {
    path: '/ticket-tracker',
    label: 'Lacak Tiket',
    icon: 'search'
  },
  {
    path: '/tickets',
    label: 'Tickets',
    icon: 'confirmation_number',
    children: [
      { path: '/tickets', label: 'Semua Tiket', icon: '' },
      { path: '/tickets/create/internal', label: 'Buat Tiket Internal', icon: '' },
      { path: '/tickets/tiket-eksternal', label: 'Tiket Eksternal', icon: '' },
      { path: '/tickets/qr-management', label: 'QR Code Management', icon: '' },
      { path: '/tickets/ai-escalation', label: 'AI Driven Eskalasi', icon: '' },
      { path: '/tickets/escalation', label: 'Eskalasi', icon: '' }
    ]
  },
  {
    path: '/survey',
    label: 'Survei Kepuasan',
    icon: 'sentiment_satisfied',
    children: [
      { path: '/survey', label: 'Survei Kepuasan', icon: '' },
      { path: '/survey/report', label: 'Laporan Survei', icon: '' }
    ]
  },
  {
    path: '/master-data',
    label: 'Master Data',
    icon: 'database',
    children: [
      { path: '/master-data/units', label: 'Unit Kerja', icon: '' },
      { path: '/master-data/unit-types', label: 'Tipe Unit Kerja', icon: '' },
      { path: '/master-data/service-categories', label: 'Kategori Layanan', icon: '' },
      { path: '/master-data/ticket-types', label: 'Tipe Tiket', icon: '' },
      { path: '/master-data/ticket-classifications', label: 'Klasifikasi Tiket', icon: '' },
      { path: '/master-data/ticket-statuses', label: 'Status Tiket', icon: '' },
      { path: '/master-data/patient-types', label: 'Jenis Pasien', icon: '' },
      { path: '/master-data/sla-settings', label: 'Pengaturan SLA', icon: '' },
      { path: '/master-data/roles-permissions', label: 'Peran & Akses', icon: '' }
    ]
  },
  {
    path: '/reports',
    label: 'Laporan & Analitik',
    icon: 'assessment'
  },
  {
    path: '/users',
    label: 'Pengguna',
    icon: 'group'
  },
  {
    path: '/realtime-notification',
    label: 'Notifikasi',
    icon: 'notifications'
  },
  {
    path: '/buku-petunjuk',
    label: 'Buku Petunjuk',
    icon: 'menu_book'
  },
  {
    path: '/settings',
    label: 'Pengaturan',
    icon: 'settings',
    children: [
      { path: '/settings/app', label: 'Pengaturan Aplikasi', icon: 'settings_applications' },
      { path: '/settings/roles-permissions', label: 'Peran & Hak Akses', icon: 'security' },
      { path: '/settings/response-templates', label: 'Template Respon', icon: 'chat' },
      { path: '/settings/ai-trust', label: 'Pengaturan Kepercayaan AI', icon: 'psychology' }
    ]
  }
];

export default function SidebarRefactored() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isParentActive = (item: NavigationItem) => {
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return isActive(item.path);
  };

  const toggleDropdown = (path: string) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(path)) {
      newOpenDropdowns.delete(path);
    } else {
      newOpenDropdowns.add(path);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  // Auto-open dropdown if user is on respective pages
  useEffect(() => {
    navigationConfig.forEach(item => {
      if (item.children && isParentActive(item)) {
        setOpenDropdowns(prev => new Set([...prev, item.path]));
      }
    });
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavigationItem = (item: NavigationItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.path);
    const isDropdownOpen = openDropdowns.has(item.path);

    if (hasChildren) {
      return (
        <div key={item.path} className="mb-2">
          <button
            onClick={() => toggleDropdown(item.path)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isParentActive(item)
                ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">{item.icon}</span>
              <p className="text-sm font-medium">{item.label}</p>
            </div>
            <span className={`material-symbols-outlined text-sm transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}>
              expand_more
            </span>
          </button>

          {isDropdownOpen && (
            <div className="mt-2 ml-6 flex flex-col gap-1">
              {item.children?.map(child => (
                <Link
                  key={child.path}
                  to={child.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(child.path)
                      ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                  <p className="text-sm font-medium">{child.label}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          isChild ? 'ml-6' : ''
        } ${
          isItemActive
            ? 'bg-primary text-white shadow-md shadow-blue-500/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        {isChild ? (
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
        ) : (
          <span className="material-symbols-outlined">{item.icon}</span>
        )}
        <p className="text-sm font-medium">{item.label}</p>
      </Link>
    );
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col h-full transition-colors duration-200 z-20">
      {/* Brand - Fixed at top */}
      <div className="flex-shrink-0 p-4 pb-2">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-primary/10 flex items-center justify-center rounded-lg h-10 w-10 shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">local_hospital</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight">
              Rumah Sakit Kota
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
              Sistem Manajemen
            </p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 sidebar-scroll">
        <nav className="flex flex-col gap-1">
          {/* Public Services Section */}
          <div className="pt-2 pb-1">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Layanan Publik
            </p>
          </div>
          {navigationConfig.slice(0, 2).map(item => renderNavigationItem(item))}

          {/* Operations Section */}
          <div className="pt-2 pb-1">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Operasional
            </p>
          </div>
          {navigationConfig.slice(2, 4).map(item => renderNavigationItem(item))}

          {/* Management Section */}
          <div className="pt-2 pb-1">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Manajemen
            </p>
          </div>
          {navigationConfig.slice(4, 8).map(item => renderNavigationItem(item))}

          {/* Documentation Section */}
          <div className="pt-2 pb-1">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dokumentasi
            </p>
          </div>
          {navigationConfig.slice(8, 9).map(item => renderNavigationItem(item))}

          {/* Settings Section */}
          {navigationConfig.slice(9).map(item => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Profile - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group relative">
          <div className="bg-center bg-no-repeat bg-cover rounded-full h-9 w-9 ring-2 ring-slate-100 dark:ring-slate-700 bg-slate-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-500">person</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-slate-900 dark:text-white text-sm font-medium truncate">
              {user?.full_name || user?.username || 'Admin'}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs truncate capitalize">
              {user?.role || 'Admin'}
            </p>
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