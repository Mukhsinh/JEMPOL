import React from 'react';
import UnitsManagementDirect from '../settings/UnitsManagementDirect';

const UnitsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Unit Kerja</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Kelola semua organisasi, hierarki, dan detail unit kerja dalam sistem rumah sakit
                    </p>
                </div>
            </div>
            <UnitsManagementDirect embedded={true} />
        </div>
    );
};

export default UnitsPage;