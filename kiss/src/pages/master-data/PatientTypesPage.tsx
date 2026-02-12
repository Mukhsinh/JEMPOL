import React from 'react';
import PatientTypes from '../settings/PatientTypes';

const PatientTypesPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Jenis Pasien</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Kelola jenis-jenis pasien yang tersedia dalam sistem
                    </p>
                </div>
            </div>
            <PatientTypes />
        </div>
    );
};

export default PatientTypesPage;