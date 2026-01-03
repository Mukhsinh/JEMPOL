import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextOptimized';

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

  // Show timeout message after 10 seconds
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 10000);

      return () => clearTimeout(timeout);
    } else {
      setShowTimeoutMessage(false);
    }
  }, [isLoading]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-600 dark:text-slate-400">Memverifikasi akses...</p>
          <div className="text-xs text-slate-500 mt-2">
            Jika loading terlalu lama, silakan refresh halaman
          </div>
          {showTimeoutMessage && (
            <div className="text-xs text-orange-500 mt-2 text-center max-w-md">
              ⚠️ Proses verifikasi memakan waktu lebih lama dari biasanya. 
              Ini bisa terjadi karena koneksi internet yang lambat atau server sedang sibuk.
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
