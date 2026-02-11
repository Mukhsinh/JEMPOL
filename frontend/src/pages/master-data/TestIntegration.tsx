import React, { useState, useEffect } from 'react';
import { masterDataService } from '../../services/masterDataService';
import { unitService } from '../../services/unitService';
import { supabase } from '../../utils/supabaseClient';

const TestIntegration: React.FC = () => {
    const [results, setResults] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const testAllEndpoints = async () => {
        setLoading(true);
        const testResults: any = {};

        try {
            // Test Units
            console.log('🧪 Testing Units...');
            const unitsResponse = await unitService.getUnits({});
            testResults.units = {
                success: true,
                count: unitsResponse.units?.length || 0,
                data: unitsResponse.units?.slice(0, 3)
            };
        } catch (error: any) {
            testResults.units = { success: false, error: error.message };
        }

        try {
            // Test Patient Types
            console.log('🧪 Testing Patient Types...');
            const patientTypes = await masterDataService.getPatientTypes();
            testResults.patientTypes = {
                success: true,
                count: patientTypes.length,
                data: patientTypes.slice(0, 3)
            };
        } catch (error: any) {
            testResults.patientTypes = { success: false, error: error.message };
        }

        try {
            // Test Service Categories
            console.log('🧪 Testing Service Categories...');
            const serviceCategories = await masterDataService.getServiceCategories();
            testResults.serviceCategories = {
                success: true,
                count: serviceCategories.length,
                data: serviceCategories.slice(0, 3)
            };
        } catch (error: any) {
            testResults.serviceCategories = { success: false, error: error.message };
        }

        try {
            // Test Ticket Classifications
            console.log('🧪 Testing Ticket Classifications...');
            const ticketClassifications = await masterDataService.getTicketClassifications();
            testResults.ticketClassifications = {
                success: true,
                count: ticketClassifications.length,
                data: ticketClassifications.slice(0, 3)
            };
        } catch (error: any) {
            testResults.ticketClassifications = { success: false, error: error.message };
        }

        try {
            // Test SLA Settings - Direct Supabase
            console.log('🧪 Testing SLA Settings (Direct Supabase)...');
            const { data, error } = await supabase
                .from('sla_settings')
                .select('*')
                .limit(3);
            
            if (error) throw error;
            
            testResults.slaSettings = {
                success: true,
                count: data?.length || 0,
                data: data
            };
        } catch (error: any) {
            testResults.slaSettings = { success: false, error: error.message };
        }

        setResults(testResults);
        setLoading(false);
    };

    useEffect(() => {
        testAllEndpoints();
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Test Integrasi Master Data
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Verifikasi koneksi ke Supabase dan data master
                    </p>
                </div>
                <button
                    onClick={testAllEndpoints}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Testing...' : 'Test Ulang'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(results).map(([key, value]: [string, any]) => (
                    <div
                        key={key}
                        className={`p-4 rounded-lg border ${
                            value.success
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                            <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                    value.success
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}
                            >
                                {value.success ? '✓ Success' : '✗ Failed'}
                            </span>
                        </div>
                        
                        {value.success ? (
                            <div className="space-y-2">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Jumlah data: <strong>{value.count}</strong>
                                </p>
                                {value.data && value.data.length > 0 && (
                                    <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded text-xs">
                                        <pre className="overflow-auto max-h-32">
                                            {JSON.stringify(value.data[0], null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Error: {value.error}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}
        </div>
    );
};

export default TestIntegration;
