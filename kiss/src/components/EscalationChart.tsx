import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface EscalationChartProps {
    filters?: {
        dateRange?: string;
        unit_id?: string;
        userUnitId?: string;
        hasGlobalAccess?: boolean;
    };
    onFilterChange?: (filter: 'incoming' | 'outgoing' | 'all') => void;
}

interface EscalationData {
    incoming: number;
    outgoing: number;
}

const EscalationChart: React.FC<EscalationChartProps> = ({ filters, onFilterChange }) => {
    const [data, setData] = useState<EscalationData>({ incoming: 0, outgoing: 0 });
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'incoming' | 'outgoing' | 'all'>('all');
    const { userUnitId, hasGlobalAccess } = useAuth();

    useEffect(() => {
        const fetchEscalationData = async () => {
            setLoading(true);
            try {
                let incoming = 0;
                let outgoing = 0;

                const effectiveUnitId = filters?.userUnitId || userUnitId;
                const effectiveHasGlobalAccess = filters?.hasGlobalAccess ?? hasGlobalAccess;

                if (effectiveUnitId && !effectiveHasGlobalAccess) {
                    // Eskalasi masuk ke unit ini
                    const { count: incomingCount } = await supabase
                        .from('ticket_escalations')
                        .select('*', { count: 'exact', head: true })
                        .eq('to_unit_id', effectiveUnitId);
                    
                    incoming = incomingCount || 0;

                    // Eskalasi keluar dari unit ini
                    const { data: unitTickets } = await supabase
                        .from('tickets')
                        .select('id')
                        .eq('unit_id', effectiveUnitId);
                    
                    if (unitTickets && unitTickets.length > 0) {
                        const ticketIds = unitTickets.map((t: any) => t.id);
                        const { count: outgoingCount } = await supabase
                            .from('ticket_escalations')
                            .select('*', { count: 'exact', head: true })
                            .in('ticket_id', ticketIds);
                        
                        outgoing = outgoingCount || 0;
                    }
                } else if (filters?.unit_id && filters.unit_id !== 'all') {
                    // Untuk admin yang memilih unit tertentu
                    const { count: incomingCount } = await supabase
                        .from('ticket_escalations')
                        .select('*', { count: 'exact', head: true })
                        .eq('to_unit_id', filters.unit_id);
                    
                    incoming = incomingCount || 0;

                    const { data: unitTickets } = await supabase
                        .from('tickets')
                        .select('id')
                        .eq('unit_id', filters.unit_id);
                    
                    if (unitTickets && unitTickets.length > 0) {
                        const ticketIds = unitTickets.map((t: any) => t.id);
                        const { count: outgoingCount } = await supabase
                            .from('ticket_escalations')
                            .select('*', { count: 'exact', head: true })
                            .in('ticket_id', ticketIds);
                        
                        outgoing = outgoingCount || 0;
                    }
                } else if (effectiveHasGlobalAccess) {
                    // Untuk superadmin, hitung semua eskalasi
                    const { count: totalEscalations } = await supabase
                        .from('ticket_escalations')
                        .select('*', { count: 'exact', head: true });
                    
                    incoming = totalEscalations || 0;
                    outgoing = totalEscalations || 0;
                }

                setData({ incoming, outgoing });
            } catch (error) {
                console.error('Error fetching escalation data:', error);
                setData({ incoming: 0, outgoing: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchEscalationData();
    }, [filters, userUnitId, hasGlobalAccess]);

    const maxValue = Math.max(data.incoming, data.outgoing, 1);

    const handleFilterClick = (filter: 'incoming' | 'outgoing' | 'all') => {
        setActiveFilter(filter);
        if (onFilterChange) {
            onFilterChange(filter);
        }
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grafik Eskalasi</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Eskalasi masuk dan keluar</p>
                </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => handleFilterClick('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        activeFilter === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    Semua
                </button>
                <button
                    onClick={() => handleFilterClick('incoming')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        activeFilter === 'incoming'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    Eskalasi Masuk
                </button>
                <button
                    onClick={() => handleFilterClick('outgoing')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        activeFilter === 'outgoing'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    Eskalasi Keluar
                </button>
            </div>
            
            {loading ? (
                <div className="h-48 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Memuat data...</p>
                    </div>
                </div>
            ) : (
                <div className="h-48 flex flex-col justify-end">
                    <div className="flex items-end justify-around h-full gap-8 px-4">
                        {/* Eskalasi Masuk */}
                        {(activeFilter === 'all' || activeFilter === 'incoming') && (
                            <div className="flex flex-col items-center gap-2 flex-1 max-w-[120px] group">
                                <span className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                    {data.incoming}
                                </span>
                                <div 
                                    className="w-full rounded-t-lg bg-indigo-500 hover:bg-indigo-600 transition-all duration-500 cursor-pointer relative min-h-[30px]"
                                    style={{ 
                                        height: `${maxValue > 0 ? Math.max((data.incoming / maxValue) * 100, 15) : 15}%`
                                    }}
                                    title={`Eskalasi Masuk: ${data.incoming} tiket`}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {data.incoming} Tiket Masuk
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[24px]">call_received</span>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1 leading-tight">
                                        Eskalasi dari<br/>Unit Lain
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Eskalasi Keluar */}
                        {(activeFilter === 'all' || activeFilter === 'outgoing') && (
                            <div className="flex flex-col items-center gap-2 flex-1 max-w-[120px] group">
                                <span className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                    {data.outgoing}
                                </span>
                                <div 
                                    className="w-full rounded-t-lg bg-amber-500 hover:bg-amber-600 transition-all duration-500 cursor-pointer relative min-h-[30px]"
                                    style={{ 
                                        height: `${maxValue > 0 ? Math.max((data.outgoing / maxValue) * 100, 15) : 15}%`
                                    }}
                                    title={`Eskalasi Keluar: ${data.outgoing} tiket`}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {data.outgoing} Tiket Keluar
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[24px]">call_made</span>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1 leading-tight">
                                        Eskalasi ke<br/>Unit Lain
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EscalationChart;
