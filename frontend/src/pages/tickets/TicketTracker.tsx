

import { useState } from 'react';
import { complaintService } from '../../services/complaintService';

interface PublicTicket {
    id: string;
    ticket_number: string;
    type: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    resolved_at?: string;
    units?: { name: string; code: string };
    service_categories?: { name: string };
    ticket_responses?: Array<{
        id: string;
        message: string;
        response_type: string;
        created_at: string;
    }>;
}

const TicketTracker = () => {
    const [ticketNumber, setTicketNumber] = useState('');
    const [ticket, setTicket] = useState<PublicTicket | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketNumber.trim()) return;

        setLoading(true);
        setError('');
        setTicket(null);
        setSearched(true);

        try {
            const response = await complaintService.getPublicTicket(ticketNumber);
            if (response.success) {
                setTicket(response.data);
            } else {
                setError(response.error || 'Tiket tidak ditemukan. Mohon periksa kembali nomor tiket Anda.');
            }
        } catch (err: any) {
            console.error('Error fetching ticket:', err);
            setError('Tiket tidak ditemukan. Mohon periksa kembali nomor tiket Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#0d141b] dark:text-white flex flex-col min-h-screen overflow-x-hidden">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2634] px-4 py-3 md:px-10 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="size-8 text-primary">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_6_319)">
                                <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
                            </g>
                            <defs>
                                <clipPath id="clip0_6_319"><rect fill="white" height="48" width="48"></rect></clipPath>
                            </defs>
                        </svg>
                    </div>
                    <h2 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">Portal Layanan Publik</h2>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                    <div className="hidden md:flex items-center gap-6">
                        <a className="text-[#0d141b] dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium leading-normal" href="/">Beranda</a>
                        <a className="text-[#0d141b] dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium leading-normal" href="#">Panduan</a>
                        <a className="text-[#0d141b] dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium leading-normal" href="#">Kontak</a>
                    </div>
                    <a href="/login" className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors">
                        <span className="truncate">Masuk Petugas</span>
                    </a>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center">
                {/* Hero Search Section */}
                <section className="w-full bg-gradient-to-b from-[#eef4fa] to-background-light dark:from-[#15202b] dark:to-background-dark py-12 md:py-20 px-4 flex justify-center">
                    <div className="w-full max-w-4xl flex flex-col items-center text-center gap-8">
                        <div className="flex flex-col gap-3">
                            <h1 className="text-[#0d141b] dark:text-white text-3xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                                Layanan Pelacakan Tiket Terpadu
                            </h1>
                            <p className="text-[#4c739a] dark:text-gray-400 text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto">
                                Pantau status aduan Anda secara real-time. Masukkan nomor tiket unik Anda untuk melihat perkembangan terbaru penanganan laporan.
                            </p>
                        </div>
                        <div className="w-full max-w-xl mx-auto relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-blue-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                            <form onSubmit={handleSearch} className="relative flex flex-col md:flex-row h-auto md:h-16 w-full rounded-xl bg-white dark:bg-[#1e2936] shadow-lg p-1">
                                <div className="flex w-full items-center px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700">
                                    <span className="material-symbols-outlined text-[#4c739a] mr-3">search</span>
                                    <input
                                        className="w-full bg-transparent border-none p-0 text-[#0d141b] dark:text-white placeholder:text-[#94a3b8] focus:ring-0 text-base"
                                        placeholder="Nomor Tiket (Contoh: TKT-2024-0001)"
                                        value={ticketNumber}
                                        onChange={(e) => setTicketNumber(e.target.value)}
                                    />
                                </div>
                                <div className="p-1 md:w-auto w-full">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto h-12 px-6 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md disabled:opacity-70"
                                    >
                                        {loading ? (
                                            <span>Mencari...</span>
                                        ) : (
                                            <>
                                                <span>Lacak Tiket</span>
                                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#4c739a] dark:text-gray-500 bg-white/50 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                            <span className="material-symbols-outlined text-[16px]">lock</span>
                            <span>Data sensitif disembunyikan untuk menjaga privasi Anda</span>
                        </div>
                    </div>
                </section>

                {/* Status Result Section */}
                {searched && !loading && (
                    <section className="w-full max-w-5xl px-4 pb-20 -mt-8">
                        {error ? (
                            <div className="bg-white dark:bg-[#1a2634] rounded-xl shadow p-8 text-center border border-red-100 dark:border-red-900/30">
                                <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error_outline</span>
                                <h3 className="text-xl font-bold text-[#0d141b] dark:text-white mb-2">Tiket Tidak Ditemukan</h3>
                                <p className="text-[#4c739a] dark:text-gray-400">{error}</p>
                            </div>
                        ) : ticket ? (
                            <div className="bg-white dark:bg-[#1a2634] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 overflow-hidden">
                                {/* Card Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-slate-100 dark:border-slate-700 gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-xl font-bold text-[#0d141b] dark:text-white">Detail Status Tiket</h2>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-green-100 text-green-700' :
                                                ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p className="text-[#4c739a] dark:text-gray-400 text-sm">
                                            Dibuat pada: {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-[#4c739a] dark:text-gray-400 uppercase font-semibold tracking-wider">Nomor Referensi</span>
                                        <span className="text-lg font-mono font-bold text-[#0d141b] dark:text-white selection:bg-primary selection:text-white">#{ticket.ticket_number}</span>
                                    </div>
                                </div>

                                {/* Ticket Details */}
                                <div className="p-6 md:p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-sm font-bold text-[#0d141b] dark:text-white mb-4">Informasi Aduan</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs text-[#4c739a] dark:text-gray-500 mb-1">Judul</p>
                                                    <p className="text-base font-medium text-[#0d141b] dark:text-white">{ticket.title}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#4c739a] dark:text-gray-500 mb-1">Deskripsi</p>
                                                    <p className="text-sm text-[#0d141b] dark:text-gray-300 leading-relaxed">{ticket.description || '-'}</p>
                                                </div>
                                                {ticket.ticket_responses && ticket.ticket_responses.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-[#4c739a] dark:text-gray-500 mb-2">Respon Terbaru</p>
                                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
                                                            <p className="text-sm text-[#0d141b] dark:text-gray-300">{ticket.ticket_responses[0].message}</p>
                                                            <p className="text-xs text-[#4c739a] dark:text-gray-500 mt-1">
                                                                {new Date(ticket.ticket_responses[0].created_at).toLocaleDateString('id-ID')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 border border-slate-100 dark:border-slate-700">
                                            <h3 className="text-sm font-bold text-[#0d141b] dark:text-white mb-4 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-400">info</span>
                                                Status & Metadata
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-[#4c739a] dark:text-gray-500 mb-1">Prioritas</p>
                                                    <p className="text-sm font-medium text-[#0d141b] dark:text-white capitalize">{ticket.priority}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#4c739a] dark:text-gray-500 mb-1">Kategori</p>
                                                    <p className="text-sm font-medium text-[#0d141b] dark:text-white">{ticket.service_categories?.name || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#4c739a] dark:text-gray-500 mb-1">Unit</p>
                                                    <p className="text-sm font-medium text-[#0d141b] dark:text-white">{ticket.units?.name || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#4c739a] dark:text-gray-500 mb-1">Tipe</p>
                                                    <p className="text-sm font-medium text-[#0d141b] dark:text-white capitalize">{ticket.type}</p>
                                                </div>
                                                {ticket.resolved_at && (
                                                    <div className="col-span-2">
                                                        <p className="text-xs text-[#4c739a] dark:text-gray-500 mb-1">Diselesaikan pada</p>
                                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                                            {new Date(ticket.resolved_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </section>
                )}

                {/* Help/FAQ Section Teaser */}
                <section className="w-full max-w-4xl px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-white dark:bg-[#1a2634] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                            <span className="material-symbols-outlined">help</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#0d141b] dark:text-white">Butuh Bantuan?</h4>
                            <p className="text-xs text-[#4c739a] dark:text-gray-400">Hubungi call center 112</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-white dark:bg-[#1a2634] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                            <span className="material-symbols-outlined">chat</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#0d141b] dark:text-white">Live Chat</h4>
                            <p className="text-xs text-[#4c739a] dark:text-gray-400">Senin - Jumat, 08:00 - 16:00</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-white dark:bg-[#1a2634] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#0d141b] dark:text-white">Panduan Pengaduan</h4>
                            <p className="text-xs text-[#4c739a] dark:text-gray-400">Pelajari alur penyelesaian</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-[#1a2634] border-t border-slate-200 dark:border-slate-800 py-8 px-4 md:px-10 mt-auto">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[#4c739a] dark:text-gray-500 text-sm">
                        © 2023 Sistem Manajemen Pengaduan Terpadu. Pemerintah Kota Jakarta.
                    </p>
                    <div className="flex gap-6">
                        <a className="text-[#4c739a] dark:text-gray-500 text-sm hover:text-primary transition-colors" href="#">Kebijakan Privasi</a>
                        <a className="text-[#4c739a] dark:text-gray-500 text-sm hover:text-primary transition-colors" href="#">Syarat & Ketentuan</a>
                        <a className="text-[#4c739a] dark:text-gray-500 text-sm hover:text-primary transition-colors" href="#">Aksesibilitas</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TicketTracker;
