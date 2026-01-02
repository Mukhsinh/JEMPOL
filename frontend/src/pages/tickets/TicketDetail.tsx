import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { Database } from '../../types/supabase';

type Ticket = Database['public']['Tables']['tickets']['Row'] & {
    unit?: { name: string; code: string };
    category?: { name: string };
    assigned_user?: { full_name: string };
};
type Response = Database['public']['Tables']['ticket_responses']['Row'] & {
    responder?: { full_name: string };
};
type Attachment = Database['public']['Tables']['ticket_attachments']['Row'];

const TicketDetail = () => {
    const { id } = useParams();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [responses, setResponses] = useState<Response[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [aiInsights] = useState({
        classification: ['Keluhan', 'Urgensi Tinggi', 'Unit Sanitasi'],
        confidence: 95,
        recommendations: [
            'Kirim tim pembersih segera (risiko SLA).',
            'Panggilan tindak lanjut dalam 2 jam untuk konfirmasi penyelesaian.',
            'Catat insiden untuk tinjauan sanitasi mingguan.'
        ]
    });

    useEffect(() => {
        if (id) {
            fetchTicketData();
            fetchAvailableUsers();
        }
    }, [id]);

    const fetchAvailableUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, full_name, email, role')
                .eq('is_active', true)
                .order('full_name');
            
            if (error) throw error;
            setAvailableUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchTicketData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Ticket Details with relations
            const { data: ticketData, error: ticketError } = await supabase
                .from('tickets')
                .select(`
                    *,
                    unit:units(name, code),
                    category:service_categories(name),
                    assigned_user:users!assigned_to(full_name)
                `)
                .eq('id', id)
                .single();

            if (ticketError) throw ticketError;
            setTicket(ticketData);

            // 2. Fetch Responses with responder info
            const { data: responseData, error: responseError } = await supabase
                .from('ticket_responses')
                .select(`
                    *,
                    responder:users(full_name)
                `)
                .eq('ticket_id', id)
                .order('created_at', { ascending: false });

            if (responseError) throw responseError;
            setResponses(responseData || []);

            // 3. Fetch Attachments
            const { data: attachmentData, error: attachmentError } = await supabase
                .from('ticket_attachments')
                .select('*')
                .eq('ticket_id', id);

            if (attachmentError) throw attachmentError;
            setAttachments(attachmentData || []);

        } catch (error) {
            console.error('Error fetching ticket data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendReply = async (isInternal: boolean = false) => {
        if (!replyText.trim() || !ticket) return;
        setIsSubmitting(true);

        try {
            // Get current user (assuming authenticated)
            const { data: { user } } = await supabase.auth.getUser();

            // Insert response
            const { error: responseError } = await supabase
                .from('ticket_responses')
                .insert({
                    ticket_id: ticket.id,
                    responder_id: user?.id || null,
                    message: replyText,
                    response_type: isInternal ? 'comment' : 'resolution',
                    is_internal: isInternal
                });

            if (responseError) throw responseError;

            // Update ticket first_response_at if this is the first response
            if (!ticket.first_response_at) {
                await supabase
                    .from('tickets')
                    .update({ 
                        first_response_at: new Date().toISOString(),
                        status: 'in_progress'
                    })
                    .eq('id', ticket.id);
            }

            // Clear input and refresh
            setReplyText('');
            fetchTicketData();
            alert('Balasan berhasil dikirim!');

        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Gagal mengirim balasan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolveTicket = async () => {
        if (!ticket) return;
        
        if (!confirm('Apakah Anda yakin ingin menyelesaikan tiket ini?')) return;
        
        try {
            const { error } = await supabase
                .from('tickets')
                .update({ 
                    status: 'resolved',
                    resolved_at: new Date().toISOString()
                })
                .eq('id', ticket.id);

            if (error) throw error;
            
            // Add system response for resolution
            await supabase
                .from('ticket_responses')
                .insert({
                    ticket_id: ticket.id,
                    responder_id: null,
                    message: 'Tiket telah diselesaikan oleh sistem.',
                    response_type: 'status_update',
                    is_internal: false
                });
            
            fetchTicketData();
            alert('Tiket berhasil diselesaikan!');
        } catch (error) {
            console.error('Error resolving ticket:', error);
            alert('Gagal menyelesaikan tiket.');
        }
    };

    const handleEscalateTicket = async () => {
        if (!ticket) return;
        
        if (!confirm('Apakah Anda yakin ingin melakukan eskalasi tiket ini?')) return;
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const { error } = await supabase
                .from('tickets')
                .update({ status: 'escalated' })
                .eq('id', ticket.id);

            if (error) throw error;
            
            // Add escalation log
            await supabase
                .from('ticket_escalations')
                .insert({
                    ticket_id: ticket.id,
                    from_user_id: user?.id || null,
                    from_role: 'staff',
                    to_role: 'supervisor',
                    reason: 'Eskalasi manual oleh petugas',
                    escalation_type: 'manual'
                });
            
            // Add system response for escalation
            await supabase
                .from('ticket_responses')
                .insert({
                    ticket_id: ticket.id,
                    responder_id: null,
                    message: 'Tiket telah dieskalasi ke tingkat yang lebih tinggi.',
                    response_type: 'escalation',
                    is_internal: false
                });
            
            fetchTicketData();
            alert('Tiket berhasil dieskalasi!');
        } catch (error) {
            console.error('Error escalating ticket:', error);
            alert('Gagal melakukan eskalasi tiket.');
        }
    };

    const handleAssignTicket = async () => {
        if (!ticket || !selectedUserId) return;
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const selectedUser = availableUsers.find(u => u.id === selectedUserId);
            
            const { error } = await supabase
                .from('tickets')
                .update({ 
                    assigned_to: selectedUserId,
                    status: ticket.status === 'open' ? 'in_progress' : ticket.status
                })
                .eq('id', ticket.id);

            if (error) throw error;
            
            // Add system response for assignment
            await supabase
                .from('ticket_responses')
                .insert({
                    ticket_id: ticket.id,
                    responder_id: user?.id || null,
                    message: `Tiket telah ditugaskan kepada ${selectedUser?.full_name || 'pengguna yang dipilih'}.`,
                    response_type: 'status_update',
                    is_internal: false
                });
            
            setShowAssignModal(false);
            setSelectedUserId('');
            fetchTicketData();
            alert('Tiket berhasil ditugaskan!');
        } catch (error) {
            console.error('Error assigning ticket:', error);
            alert('Gagal menugaskan tiket.');
        }
    };

    const getSLATimeRemaining = () => {
        if (!ticket?.sla_deadline) return null;
        
        const now = new Date();
        const deadline = new Date(ticket.sla_deadline);
        const diff = deadline.getTime() - now.getTime();
        
        if (diff <= 0) return { hours: 0, minutes: 0, isOverdue: true };
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return { hours, minutes, isOverdue: false };
    };

    const getSentimentColor = (score: number | null) => {
        if (!score) return 'text-gray-500';
        if (score > 0.3) return 'text-green-500';
        if (score < -0.3) return 'text-red-500';
        return 'text-yellow-500';
    };

    const getSentimentLabel = (score: number | null) => {
        if (!score) return 'Neutral';
        if (score > 0.3) return 'Positive';
        if (score < -0.3) return 'Negative';
        return 'Neutral';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Memuat detail tiket...</p>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">error_outline</span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tiket Tidak Ditemukan</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Tiket yang Anda cari tidak ada.</p>
                    <Link to="/tickets" className="text-primary hover:underline">← Kembali ke Daftar Tiket</Link>
                </div>
            </div>
        );
    }

    const slaTime = getSLATimeRemaining();

    return (
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-20 scrollbar-hide">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                {/* Breadcrumbs & Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Link to="/" className="text-[#4c739a] font-medium hover:text-primary transition-colors">Beranda</Link>
                        <span className="material-symbols-outlined text-[#4c739a] text-[16px]">chevron_right</span>
                        <Link to="/tickets" className="text-[#4c739a] font-medium hover:text-primary transition-colors">Tiket</Link>
                        <span className="material-symbols-outlined text-[#4c739a] text-[16px]">chevron_right</span>
                        <span className="text-[#0d141b] dark:text-white font-medium">Tiket #{ticket.ticket_number}</span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#e7edf3] dark:border-slate-800 pb-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-[#0d141b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                                Tiket #{ticket.ticket_number}: {ticket.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-[#4c739a]">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                    Dibuat {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('id-ID') : 'Tidak diketahui'} • {ticket.created_at ? new Date(ticket.created_at).toLocaleTimeString('id-ID') : 'Tidak diketahui'}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">apartment</span>
                                    Unit: {ticket.unit?.name || 'Unit Tidak Diketahui'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={handleResolveTicket}
                                className="flex items-center gap-2 h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                <span>Selesaikan</span>
                            </button>
                            <button 
                                onClick={handleEscalateTicket}
                                className="flex items-center gap-2 h-10 px-4 bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white text-sm font-bold rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">warning</span>
                                <span>Eskalasi</span>
                            </button>
                            <button 
                                onClick={() => setShowAssignModal(true)}
                                className="flex items-center gap-2 h-10 px-4 bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white text-sm font-bold rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">person_add</span>
                                <span>Tugaskan</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* AI Analysis & Insights */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border-l-4 border-indigo-500 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/30 dark:to-slate-800 px-6 py-4 border-b border-indigo-100 dark:border-slate-700 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-300">
                                        <span className="material-symbols-outlined text-[24px]">psychology</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">Analisis & Wawasan AI</h3>
                                        <p className="text-xs text-[#4c739a] dark:text-indigo-200">Didukung oleh GovAI Engine v2.4</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                                        Analisis Selesai
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-2">Hasil Klasifikasi</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {aiInsights.classification.map((tag, index) => (
                                                <span key={index} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    index === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                    index === 1 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                }`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between items-end mb-1">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4c739a]">Skor Kepercayaan AI</h4>
                                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{aiInsights.confidence}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                            <div className="bg-indigo-500 h-3 rounded-full relative" style={{width: `${aiInsights.confidence}%`}}>
                                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-[#4c739a] mt-1.5 italic">Kepercayaan tinggi berdasarkan pencocokan pola gambar dan kepadatan kata kunci.</p>
                                    </div>
                                </div>
                                
                                <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900/30 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300">
                                            <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                                            <h4 className="text-sm font-bold">Tindakan yang Disarankan</h4>
                                        </div>
                                        <ul className="space-y-2.5">
                                            {aiInsights.recommendations.map((rec, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm text-[#0d141b] dark:text-slate-200">
                                                    <span className="material-symbols-outlined text-[16px] text-indigo-500 mt-0.5">check_small</span>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-800/30 flex gap-2">
                                        <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 flex items-center gap-1 transition-colors">
                                            Terapkan Semua Rekomendasi 
                                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-[#0d141b] dark:text-white mb-4">Deskripsi</h3>
                            <p className="text-[#4c739a] dark:text-slate-300 leading-relaxed mb-6">{ticket.description}</p>
                            
                            {attachments.length > 0 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {attachments.map((attachment) => (
                                        <div key={attachment.id} className="flex-none w-32 h-32 rounded-lg bg-gray-100 dark:bg-slate-700 overflow-hidden relative group cursor-pointer border border-[#e7edf3] dark:border-slate-600">
                                            <div className="bg-cover bg-center w-full h-full hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-500">description</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Activity History */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-[#0d141b] dark:text-white mb-6">Riwayat Aktivitas</h3>
                            
                            <div className="relative pl-8 border-l border-[#e7edf3] dark:border-slate-700 space-y-8">
                                {responses.map((response) => (
                                    <div key={response.id} className="relative group">
                                        <div className="absolute -left-[39px] top-1 h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-600 border-4 border-white dark:border-slate-800"></div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-[#0d141b] dark:text-white">
                                                    {response.responder?.full_name || 'System'}
                                                </span>
                                                <span className="text-xs text-[#4c739a]">
                                                    {response.created_at ? new Date(response.created_at).toLocaleString() : 'Unknown'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[#4c739a] dark:text-slate-300">{response.message}</p>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Ticket Created Entry */}
                                <div className="relative group">
                                    <div className="absolute -left-[39px] top-1 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 border-4 border-white dark:border-slate-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[10px] text-green-600 dark:text-green-300">add</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-[#0d141b] dark:text-white">Tiket Dibuat</span>
                                            <span className="text-xs text-[#4c739a]">
                                                {ticket.created_at ? new Date(ticket.created_at).toLocaleString('id-ID') : 'Tidak diketahui'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#4c739a] dark:text-slate-300">
                                            Dikirim melalui {ticket.source === 'qr_code' ? 'Kode QR' : 'Web'} oleh {ticket.submitter_name || 'Pengguna Tamu'}.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Reply Box */}
                            <div className="mt-8 pt-6 border-t border-[#e7edf3] dark:border-slate-700">
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-bold text-[#0d141b] dark:text-white">Tambah Catatan Internal atau Balasan</h4>
                                        <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">auto_awesome</span> 
                                            Masukkan Saran AI
                                        </button>
                                    </div>
                                    <div className="bg-[#f6f7f8] dark:bg-slate-900 rounded-lg p-3">
                                        <textarea 
                                            className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 min-h-[100px] text-[#0d141b] dark:text-white placeholder-[#4c739a] resize-none"
                                            placeholder="Ketik balasan Anda di sini..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                            <div className="flex gap-2">
                                                <button className="p-1 text-[#4c739a] hover:text-primary rounded">
                                                    <span className="material-symbols-outlined text-[20px]">attach_file</span>
                                                </button>
                                                <button className="p-1 text-[#4c739a] hover:text-primary rounded">
                                                    <span className="material-symbols-outlined text-[20px]">format_bold</span>
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => handleSendReply(false)}
                                                disabled={isSubmitting || !replyText.trim()}
                                                className="bg-primary hover:bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Balasan'}</span>
                                                <span className="material-symbols-outlined text-[16px]">send</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Ticket Details */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 p-5 shadow-sm flex flex-col gap-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#4c739a] mb-1">Detail Tiket</h3>
                            <div className="grid grid-cols-2 gap-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-[#4c739a]">Status</span>
                                    <div className="inline-flex items-center gap-2">
                                        <span className={`h-2.5 w-2.5 rounded-full ${
                                            ticket.status === 'open' ? 'bg-blue-500 animate-pulse' :
                                            ticket.status === 'in_progress' ? 'bg-yellow-500 animate-pulse' :
                                            ticket.status === 'resolved' ? 'bg-green-500' :
                                            'bg-gray-500'
                                        }`}></span>
                                        <span className="text-sm font-medium text-[#0d141b] dark:text-white capitalize">
                                            {ticket.status ? ticket.status.replace('_', ' ') : 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-[#4c739a]">Prioritas</span>
                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md w-fit ${
                                        ticket.priority === 'high' || ticket.priority === 'critical' 
                                            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                                            : ticket.priority === 'medium'
                                            ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
                                            : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                    }`}>
                                        <span className="material-symbols-outlined text-[16px]">priority_high</span>
                                        <span className="text-sm font-bold capitalize">{ticket.priority}</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-1 col-span-2">
                                    <span className="text-xs text-[#4c739a]">Unit yang Ditugaskan</span>
                                    <select className="form-select text-sm border-[#e7edf3] dark:border-slate-600 bg-[#f6f7f8] dark:bg-slate-700 rounded-lg py-2 pl-3 pr-8 focus:border-primary focus:ring-0 text-[#0d141b] dark:text-white">
                                        <option>{ticket.unit?.name || 'Belum Ditugaskan'}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SLA Timer */}
                        {slaTime && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#4c739a]">timer</span> 
                                        Timer SLA
                                    </h3>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        slaTime.isOverdue 
                                            ? 'text-red-600 bg-red-100 dark:bg-red-900/30'
                                            : slaTime.hours < 2
                                            ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
                                            : 'text-green-600 bg-green-100 dark:bg-green-900/30'
                                    }`}>
                                        {slaTime.isOverdue ? 'Terlambat' : 'Hampir Terlambat'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-2xl font-black text-[#0d141b] dark:text-white">
                                        {slaTime.isOverdue ? 'Terlambat' : `${slaTime.hours.toString().padStart(2, '0')}j ${slaTime.minutes.toString().padStart(2, '0')}m`}
                                    </span>
                                    <span className="text-xs text-[#4c739a]">
                                        {slaTime.isOverdue ? 'melewati batas waktu' : 'tersisa'}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                    <div className={`h-2.5 rounded-full ${
                                        slaTime.isOverdue ? 'bg-red-500' : 
                                        slaTime.hours < 2 ? 'bg-orange-500' : 'bg-green-500'
                                    }`} style={{width: slaTime.isOverdue ? '100%' : '75%'}}></div>
                                </div>
                                <p className="text-xs text-[#4c739a] mt-2">
                                    Target penyelesaian: {ticket.sla_deadline ? new Date(ticket.sla_deadline).toLocaleString('id-ID') : 'Tidak ada batas waktu'}
                                </p>
                            </div>
                        )}

                        {/* Customer Sentiment */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-[#0d141b] dark:text-white">Sentimen Pelanggan</h3>
                                <span className="material-symbols-outlined text-[#4c739a]">sentiment_dissatisfied</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 flex-none">
                                    <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                        <path className="text-gray-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                                        <path className={getSentimentColor(ticket.sentiment_score)} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="80, 100" strokeWidth="4"></path>
                                    </svg>
                                    <div className={`absolute inset-0 flex items-center justify-center font-bold text-sm ${getSentimentColor(ticket.sentiment_score)}`}>
                                        {ticket.sentiment_score ? ticket.sentiment_score.toFixed(1) : '0.0'}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${getSentimentColor(ticket.sentiment_score)}`}>
                                        {getSentimentLabel(ticket.sentiment_score)}
                                    </span>
                                    <span className="text-xs text-[#4c739a] leading-tight">
                                        Bahasa pengguna menunjukkan sentimen {getSentimentLabel(ticket.sentiment_score).toLowerCase()}.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reporter Info */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-[#0d141b] dark:text-white mb-4">Info Pelapor</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[#4c739a] dark:text-white font-bold text-sm">
                                    {ticket.submitter_name ? ticket.submitter_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AN'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#0d141b] dark:text-white">
                                        {ticket.submitter_name || 'Anonim'}
                                    </p>
                                    <p className="text-xs text-[#4c739a]">
                                        {ticket.is_anonymous ? 'Pelapor Anonim' : 'Pelapor Publik'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {ticket.submitter_email && (
                                    <a className="flex items-center gap-3 text-sm text-[#4c739a] hover:text-primary transition-colors" href={`mailto:${ticket.submitter_email}`}>
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                        {ticket.submitter_email}
                                    </a>
                                )}
                                {ticket.submitter_phone && (
                                    <a className="flex items-center gap-3 text-sm text-[#4c739a] hover:text-primary transition-colors" href={`tel:${ticket.submitter_phone}`}>
                                        <span className="material-symbols-outlined text-[18px]">call</span>
                                        {ticket.submitter_phone}
                                    </a>
                                )}
                                <div className="flex items-center gap-3 text-sm text-[#4c739a]">
                                    <span className="material-symbols-outlined text-[18px]">history</span>
                                    <span>Pelapor pertama kali</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">Tugaskan Tiket</h3>
                            <button 
                                onClick={() => setShowAssignModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#0d141b] dark:text-white mb-2">
                                Pilih Pengguna
                            </label>
                            <select 
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full border border-[#e7edf3] dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-3 py-2 text-[#0d141b] dark:text-white focus:border-primary focus:ring-0"
                            >
                                <option value="">Pilih pengguna...</option>
                                {availableUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name} ({user.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowAssignModal(false)}
                                className="flex-1 px-4 py-2 border border-[#e7edf3] dark:border-slate-600 text-[#0d141b] dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleAssignTicket}
                                disabled={!selectedUserId}
                                className="flex-1 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Tugaskan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketDetail;
