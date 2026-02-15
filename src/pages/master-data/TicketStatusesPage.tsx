import React from 'react';
import TicketStatuses from '../settings/TicketStatuses';

const TicketStatusesPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Status Tiket</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Kelola status tiket yang tersedia dalam sistem
                    </p>
                </div>
            </div>
            <TicketStatuses />
        </div>
    );
};

export default TicketStatusesPage;