import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireSuperAdmin = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isSuperAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const [showRefreshButton, setShowRefreshButton] = useState(false);

  // Show timeout message after 5 seconds, refresh button after 8 seconds
  useEffect(() => {
    if (isLoading) {
      const timeoutMessage = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 5000);

      const refreshButton = setTimeout(() => {
        setShowRefreshButton(true);
      }, 8000);

      return () => {
        clearTimeout(timeoutMessage);
        clearTimeout(refreshButton);
      };
    } else {
      setShowTimeoutMessage(false);
      setShowRefreshButton(false);
    }
  }, [isLoading]);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-600 dark:text-slate-400">Memverifikasi akses...</p>
          
          {showTimeoutMessage && (
            <div className="text-sm text-orange-600 dark:text-orange-400 mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              ⚠️ Proses verifikasi memakan waktu lebih lama dari biasanya.
              <br />
              Ini bisa terjadi karena koneksi internet yang lambat.
            </div>
          )}
          
          {showRefreshButton && (
            <div className="mt-4 space-y-2">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Refresh Halaman
              </button>
              <p className="text-xs text-slate-500">
                Atau coba buka di tab baru jika masalah berlanjut
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirements
  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
          <p className="text-slate-600 dark:text-slate-400">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <p className="text-sm text-slate-500 mt-2">Diperlukan akses Super Admin.</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
          <p className="text-slate-600 dark:text-slate-400">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <p className="text-sm text-slate-500 mt-2">Diperlukan akses Admin.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
