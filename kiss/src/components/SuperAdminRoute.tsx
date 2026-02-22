import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SuperAdminRouteProps {
  children: ReactNode;
}

/**
 * Route protection untuk halaman yang hanya bisa diakses oleh superadmin
 */
function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { isAuthenticated, isSuperAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-600 dark:text-slate-400">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check superadmin requirement
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center max-w-md p-8">
          <div className="mb-6">
            <span className="material-symbols-outlined text-red-500 text-6xl">block</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Akses Ditolak</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            Halaman ini hanya dapat diakses oleh Super Admin.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default SuperAdminRoute;
