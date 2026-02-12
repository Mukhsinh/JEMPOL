import React from 'react';
import RolesPermissions from '../settings/RolesPermissions';

const RolesPermissionsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Peran & Akses</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Kelola peran pengguna dan hak akses dalam sistem
                    </p>
                </div>
            </div>
            <RolesPermissions />
        </div>
    );
};

export default RolesPermissionsPage;