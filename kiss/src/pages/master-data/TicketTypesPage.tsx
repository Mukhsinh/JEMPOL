import React from 'react';
import TicketTypes from '../settings/TicketTypes';

const TicketTypesPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tipe Tiket</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Kelola tipe-tipe tiket yang tersedia dalam sistem
                    </p>
                </div>
            </div>
            <TicketTypes />
        </div>
    );
};

export default TicketTypesPage;