import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClientOptimized';

interface ResolvedTicket {
    id: string;
    ticket_number: string;
    title: string;
    status: string;
    resolved_at: string;
    units?: { name: string } | null;
    service_categories?: { name: string } | null;
}

const SurveyLanding = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [tickets, setTickets] = useState<ResolvedTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [ticketNumber, setTicketNumber] = useState('');
    const [error, setError] = useState('');

    // Check if coming from success redirect
    const surveySuccess = searchParams.get('survey') === 'success';

    useEffect(() => {
        loadResolvedTickets();
    }, []);

    const loadResolvedTickets = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('tickets')
                .select(`
                    id,
                    ticket_number,
                    title,
                    status,
                    resolved_at,
                    units (name),
                    service_categories (name)
                `)
                .eq('status', 'resolved')
                .not('resolved_at', 'is', null)
                .order('resolved_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            
            // Transform data to match interface
            const transformedData = (data || []).map(ticket => ({
                ...ticket,
                units: ticket.units ? ticket.units[0] : null,
                service_categories: ticket.service_categories ? ticket.service_categories[0] : null
            }));
            
            setTickets(transformedData);
        } catch (error) {
            console.error('Error loading tickets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTicketSearch = async () => {
        if (!ticketNumber.trim()) {
            setError('Mohon masukkan nomor tiket');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from('tickets')
                .select('id, ticket_number, status, resolved_at')
                .eq('ticket_number', ticketNumber.trim())
                .single();

            if (error || !data) {
                setError('Tiket tidak ditemukan');
                return;
            }

            if (data.status !== 'resolved') {
                setError('Survei hanya dapat diisi untuk tiket yang sudah diselesaikan');
                return;
            }

            // Redirect to survey form
            navigate(`/survey/form?ticketId=${data.id}`);
        } catch (error) {
            setError('Terjadi kesalahan saat mencari tiket');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTicketSelect = (ticketId: string) => {
        navigate(`/survey/form?ticketId=${ticketId}`);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <div className="bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white">Survei Kepuasan</h1>
                            <p className="text-sm text-slate-500 font-medium">Berikan penilaian terhadap layanan yang telah Anda terima</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-[960px] mx-auto px-4 py-8 md:px-8">
                {/* Success Message */}
                {surveySuccess && (
                    <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600">
                                <span className="material-symbols-outlined text-2xl">check_circle</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Survei Berhasil Dikirim!</h3>
                                <p className="text-green-700 dark:text-green-300">Terima kasih atas feedback Anda. Penilaian Anda sangat membantu kami untuk meningkatkan kualitas layanan.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Introduction */}
                <div className="text-center space-y-4 mb-8">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        Akses Survei Kepuasan
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Pilih tiket yang sudah diselesaikan untuk memberikan penilaian terhadap layanan yang Anda terima.
                    </p>
                </div>

                {/* Ticket Search */}
                <section className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Cari Tiket Anda</h3>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Masukkan nomor tiket (contoh: TKT-2024-0001)"
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-slate-400 text-sm p-4"
                                value={ticketNumber}
                                onChange={(e) => setTicketNumber(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleTicketSearch()}
                            />
                            {error && (
                                <p className="text-red-600 text-sm mt-2">{error}</p>
                            )}
                        </div>
                        <button
                            onClick={handleTicketSearch}
                            disabled={isLoading}
                            className="px-6 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Mencari...</span>
                                </>
                            ) : (
                                <>
                                    <span>Cari Tiket</span>
                                    <span className="material-symbols-outlined">search</span>
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* Recent Resolved Tickets */}
                <section className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tiket yang Baru Diselesaikan</h3>
                        <p className="text-sm text-slate-500 mt-1">Pilih tiket untuk mengisi survei kepuasan</p>
                    </div>
                    
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-slate-600 dark:text-slate-400">Memuat tiket...</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-slate-400 text-2xl">inbox</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tidak Ada Tiket</h4>
                                <p className="text-slate-600 dark:text-slate-400">Belum ada tiket yang diselesaikan untuk survei.</p>
                            </div>
                        ) : (
                            tickets.map((ticket) => (
                                <div key={ticket.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {ticket.ticket_number}
                                                </h4>
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                    Diselesaikan
                                                </span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 mb-2">{ticket.title}</p>
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                                {ticket.units && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">business</span>
                                                        {ticket.units.name}
                                                    </span>
                                                )}
                                                {ticket.service_categories && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">category</span>
                                                        {ticket.service_categories.name}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                                    Diselesaikan: {new Date(ticket.resolved_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleTicketSelect(ticket.id)}
                                            className="ml-4 px-4 py-2 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <span>Isi Survei</span>
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 mt-auto py-8">
                <div className="max-w-[960px] mx-auto px-4 md:px-8 text-center">
                    <p className="text-xs text-slate-500">
                        © 2024 Sistem Pengaduan Terintegrasi. Hak Cipta Dilindungi Undang-undang.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default SurveyLanding;