import React from 'react';
import TicketClassifications from '../settings/TicketClassifications';

const TicketClassificationsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Klasifikasi Tiket</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Kelola klasifikasi tiket berdasarkan kategori dan prioritas
                    </p>
                </div>
            </div>
            <TicketClassifications />
        </div>
    );
};

export default TicketClassificationsPage;