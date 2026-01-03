import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContextOptimized';
import { authService } from '../services/authService';

export default function AuthDebug() {
    const [debugInfo, setDebugInfo] = useState<any>({});
    const { user, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await authService.getToken();
                const userData = authService.getUser();
                const isAuth = await authService.isAuthenticated();
                
                setDebugInfo({
                    user,
                    isAuthenticated,
                    isLoading,
                    token: token ? token.substring(0, 50) + '...' : null,
                    userData,
                    isAuth,
                    localStorage: {
                        adminUser: localStorage.getItem('adminUser'),
                        adminToken: localStorage.getItem('adminToken')
                    }
                });
            } catch (error) {
                setDebugInfo({
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };

        checkAuth();
    }, [user, isAuthenticated, isLoading]);

    return (
        <div className="p-4 bg-gray-100 border rounded">
            <h3 className="font-bold mb-2">Auth Debug Info</h3>
            <pre className="text-xs overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
            </pre>
        </div>
    );
}