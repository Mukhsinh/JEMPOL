import React, { useState, useEffect } from 'react';
import slaService from '../services/slaService';

const SLADebug: React.FC = () => {
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        debugSLASettings();
    }, []);

    const debugSLASettings = async () => {
        const debug: any = {
            timestamp: new Date().toISOString(),
            apiBaseUrl: (window as any).location.origin,
            currentPath: window.location.pathname
        };

        try {
            // Test API connection
            debug.apiTest = 'Testing API connection...';
            const slaData = await slaService.getSLASettings();
            debug.slaData = {
                success: true,
                count: slaData.length,
                sample: slaData.slice(0, 2)
            };
        } catch (error: any) {
            debug.slaData = {
                success: false,
                error: error.message
            };
        }

        try {
            // Test dropdown data
            const [unitTypes, serviceCategories, patientTypes] = await Promise.all([
                slaService.getUnitTypes(),
                slaService.getServiceCategories(),
                slaService.getPatientTypes()
            ]);

            debug.dropdownData = {
                unitTypes: { count: unitTypes.length, success: true },
                serviceCategories: { count: serviceCategories.length, success: true },
                patientTypes: { count: patientTypes.length, success: true }
            };
        } catch (error: any) {
            debug.dropdownData = {
                error: error.message,
                success: false
            };
        }

        // Test localStorage
        debug.localStorage = {
            token: localStorage.getItem('token') ? 'Present' : 'Missing',
            user: localStorage.getItem('user') ? 'Present' : 'Missing'
        };

        setDebugInfo(debug);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">SLA Debug - Loading...</h3>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">SLA Settings Debug Info</h3>
            <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
            </pre>
            <div className="mt-4 space-x-2">
                <button 
                    onClick={debugSLASettings}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Refresh Debug
                </button>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    Reload Page
                </button>
            </div>
        </div>
    );
};

export default SLADebug;