import React from 'react';
import SLASettings from '../settings/SLASettings';
import SLASettingsSimple from '../../components/SLASettingsSimple';
import SLADebug from '../../components/SLADebug';

const SLASettingsPage: React.FC = () => {
    // Add debug mode check
    const isDebugMode = window.location.search.includes('debug=true');
    const useSimpleMode = window.location.search.includes('simple=true');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan SLA</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Kelola Service Level Agreement (SLA) untuk tiket dalam sistem
                    </p>
                    {(isDebugMode || useSimpleMode) && (
                        <div className="mt-2 text-sm text-blue-600">
                            Mode: {isDebugMode ? 'Debug' : ''} {useSimpleMode ? 'Simple' : 'Normal'}
                            {' | '}
                            <a href="?simple=true" className="underline">Simple Mode</a>
                            {' | '}
                            <a href="?debug=true" className="underline">Debug Mode</a>
                            {' | '}
                            <a href="?" className="underline">Normal Mode</a>
                        </div>
                    )}
                </div>
            </div>
            
            {isDebugMode && <SLADebug />}
            
            {useSimpleMode ? <SLASettingsSimple /> : <SLASettings />}
        </div>
    );
};

export default SLASettingsPage;