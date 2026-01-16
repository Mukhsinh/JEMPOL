import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { ticketActionService, TicketEscalation, EscalationUnit } from '../../services/ticketActionService';
import { EscalationModal, ResponseModal, CloseTicketModal, FeedbackModal } from '../../components/TicketActionModals';

interface TicketResponse {
  id: string;
  message: string;
  is_internal: boolean;
  response_type: string;
  created_at: string;
  updated_at?: string;
  responder?: {
    full_name: string;
    role: string;
  };
  feedback?: {
    id: string;
    message: string;
    created_at: string;
    responder?: {
      full_name: string;
      role: string;
    };
  }[];
}

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  first_response_at?: string;
  sla_deadline?: string;
  unit_id?: string;
  category_id?: string;
  submitter_name?: string;
  submitter_email?: string;
  submitter_phone?: string;
  is_flagged?: boolean;
  flag_reason?: string;
  flagged_at?: string;
  escalated_to_units?: string[];
  cc_units?: string[];
  units?: {
    name: string;
    code: string;
    contact_email?: string;
    contact_phone?: string;
  };
  service_categories?: {
    name: string;
    description?: string;
  };
  ticket_responses?: TicketResponse[];
  ticket_attachments?: any[];
}

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [escalations, setEscalations] = useState<TicketEscalation[]>([]);
  const [escalationUnits, setEscalationUnits] = useState<EscalationUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [escalationModal, setEscalationModal] = useState(false);
  const [responseModal, setResponseModal] = useState(false);
  const [closeTicketModal, setCloseTicketModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; responseId: string }>({ isOpen: false, responseId: '' });

  // Validasi UUID - pastikan id adalah UUID yang valid, bukan route path
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  useEffect(() => {
    if (id) {
      // Jika id bukan UUID valid, redirect ke halaman tickets
      if (!isValidUUID(id)) {
        console.warn('Invalid ticket ID format:', id);
        setError('ID tiket tidak valid');
        setLoading(false);
        return;
      }
      fetchTicketData();
    }
  }, [id]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch ticket details
      const ticketResponse = await complaintService.getTicket(id!);
      if (ticketResponse.success) {
        setTicket(ticketResponse.data);
      } else {
        setError(ticketResponse.error || 'Gagal mengambil data tiket');
        return;
      }

      // Fetch escalation history
      const escalationsResponse = await ticketActionService.getTicketEscalations(id!);
      if (escalationsResponse.success) {
        setEscalations(escalationsResponse.data);
      }

      // Fetch escalation units
      const unitsResponse = await ticketActionService.getTicketEscalationUnits(id!);
      if (unitsResponse.success) {
        setEscalationUnits(unitsResponse.data);
      }

    } catch (err: any) {
      console.error('Error fetching ticket details:', err);
      setError(err.message || 'Gagal mengambil data tiket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'escalated': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'open': 'Baru', 'in_progress': 'Diproses', 'escalated': 'Eskalasi', 
      'resolved': 'Selesai', 'closed': 'Ditutup'
    };
    return map[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const map: Record<string, string> = {
      'low': 'Rendah', 'medium': 'Sedang', 'high': 'Tinggi', 'critical': 'Kritis'
    };
    return map[priority] || priority;
  };

  const getEscalationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getEscalationStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'pending': 'Menunggu', 'received': 'Diterima', 'completed': 'Selesai'
    };
    return map[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-slate-500">Memuat data tiket...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="material-symbols-outlined text-red-500 text-4xl mb-2">error</span>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/tickets')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Kembali ke Daftar Tiket
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <span className="material-symbols-outlined text-slate-400 text-6xl mb-4">search_off</span>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Tiket Tidak Ditemukan</h3>
        <p className="text-slate-500 mb-4">Tiket yang Anda cari tidak ditemukan atau telah dihapus.</p>
        <button
          onClick={() => navigate('/tickets')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
        >
          Kembali ke Daftar Tiket
        </button>
      </div>
    );
  }

  const isOverSLA = ticket.sla_deadline && new Date(ticket.sla_deadline) < new Date() && ticket.status !== 'resolved' && ticket.status !== 'closed';
  const canTakeAction = ticket.status !== 'resolved' && ticket.status !== 'closed';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tickets')}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{ticket.ticket_number}</h1>
              {ticket.is_flagged && (
                <span className="material-symbols-outlined text-red-500" title={ticket.flag_reason || 'Ditandai'}>flag</span>
              )}
              {isOverSLA && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">SLA Terlewat</span>
              )}
            </div>
            <p className="text-slate-500 text-sm">Dibuat: {new Date(ticket.created_at).toLocaleString('id-ID')}</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canTakeAction && (
            <>
              <button
                onClick={() => setResponseModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">reply</span>
                <span>Respon</span>
              </button>
              <button
                onClick={() => setEscalationModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                <span>Eskalasi</span>
              </button>
            </>
          )}
          {/* Tombol Close - hanya tampil jika tiket sudah ada respon atau eskalasi dan belum selesai */}
          {canTakeAction && ((ticket.ticket_responses && ticket.ticket_responses.length > 0) || escalations.length > 0) && (
            <button
              onClick={() => setCloseTicketModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Selesai</span>
            </button>
          )}
          {/* Flag Status Tiket - Hijau jika selesai, Merah jika belum */}
          <div
            className={`p-2 rounded-lg ${
              ticket.status === 'resolved' || ticket.status === 'closed'
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-red-500 bg-red-50'
            }`}
            title={ticket.status === 'resolved' || ticket.status === 'closed' ? 'Tiket Selesai' : 'Tiket Belum Selesai'}
          >
            <span className="material-symbols-outlined">flag</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">{ticket.title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                  {getStatusLabel(ticket.status)}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(ticket.priority)}`}>
                  {getPriorityLabel(ticket.priority)}
                </span>
                {ticket.units && (
                  <span className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full">
                    {ticket.units.name}
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-sm font-medium text-slate-500 mb-2">Deskripsi</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{ticket.description || 'Tidak ada deskripsi'}</p>
            </div>
          </div>

          {/* Escalation Info - Show if escalated */}
          {(ticket.status === 'escalated' || escalations.length > 0) && (
            <div className="bg-orange-50 rounded-xl border border-orange-200 overflow-hidden">
              <div className="p-4 border-b border-orange-200 bg-orange-100/50">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-600">trending_up</span>
                  <h3 className="font-semibold text-orange-800">Informasi Eskalasi</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {/* Escalation Units */}
                {escalationUnits.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-orange-700 mb-2">Unit Tujuan Eskalasi</h4>
                    <div className="space-y-2">
                      {escalationUnits.map((eu) => (
                        <div key={eu.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-2">
                            {eu.is_primary ? (
                              <span className="material-symbols-outlined text-orange-600 text-[18px]">star</span>
                            ) : (
                              <span className="material-symbols-outlined text-slate-400 text-[18px]">content_copy</span>
                            )}
                            <span className="font-medium text-slate-700">{eu.units?.name || 'Unit'}</span>
                            {eu.is_cc && <span className="text-xs text-slate-500">(Tembusan)</span>}
                          </div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getEscalationStatusColor(eu.status)}`}>
                            {getEscalationStatusLabel(eu.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Escalation History */}
                {escalations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-orange-700 mb-2">Riwayat Eskalasi</h4>
                    <div className="space-y-3">
                      {escalations.map((esc) => (
                        <div key={esc.id} className="bg-white p-4 rounded-lg border border-orange-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-slate-700">
                                Dieskalasi ke: {esc.to_unit?.name || 'Unit'}
                              </p>
                              <p className="text-xs text-slate-500">
                                Oleh: {esc.from_user?.full_name || 'System'} • {new Date(esc.escalated_at).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-2"><strong>Alasan:</strong> {esc.reason}</p>
                          {esc.notes && <p className="text-sm text-slate-500"><strong>Catatan:</strong> {esc.notes}</p>}
                          {esc.cc_units && esc.cc_units.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-orange-100">
                              <p className="text-xs text-slate-500">
                                Tembusan: {esc.cc_units.map(u => u.name).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Flag Info - Show if flagged */}
          {ticket.is_flagged && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-red-600">flag</span>
                <h3 className="font-semibold text-red-800">Tiket Ditandai</h3>
              </div>
              <p className="text-sm text-red-700">{ticket.flag_reason || 'Ditandai untuk perhatian khusus'}</p>
              {ticket.flagged_at && (
                <p className="text-xs text-red-500 mt-1">
                  Ditandai pada: {new Date(ticket.flagged_at).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          )}

          {/* Responses */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Riwayat Respon</h3>
              <span className="text-sm text-slate-500">{ticket.ticket_responses?.length || 0} respon</span>
            </div>
            <div className="divide-y divide-slate-100">
              {ticket.ticket_responses && ticket.ticket_responses.length > 0 ? (
                ticket.ticket_responses.map((response) => (
                  <div key={response.id} className={`p-4 ${response.is_internal ? 'bg-amber-50' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">{response.responder?.full_name || 'Staff'}</p>
                          <p className="text-xs text-slate-500">{response.responder?.role || 'Staff'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {/* Tanggal dan Jam Lengkap */}
                        <p className="text-xs text-slate-600 font-medium">
                          {new Date(response.created_at).toLocaleDateString('id-ID', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs text-slate-500">
                          Pukul {new Date(response.created_at).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                        <div className="flex items-center gap-2 mt-1 justify-end">
                          {response.is_internal && (
                            <span className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-0.5 rounded">Internal</span>
                          )}
                          {response.response_type === 'resolution' && (
                            <span className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-0.5 rounded">Resolusi</span>
                          )}
                          {response.response_type === 'escalation' && (
                            <span className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-0.5 rounded">Eskalasi</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 whitespace-pre-wrap ml-10 mb-3">{response.message}</p>
                    
                    {/* Tombol Feedback/Balasan */}
                    {canTakeAction && (
                      <div className="ml-10 mt-2">
                        <button
                          onClick={() => setFeedbackModal({ isOpen: true, responseId: response.id })}
                          className="flex items-center gap-1 text-xs text-primary hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">reply</span>
                          <span>Balas Respon</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">chat_bubble_outline</span>
                  <p>Belum ada respon</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Detail Tiket</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Kategori Layanan</p>
                <p className="text-sm font-medium text-slate-700">{ticket.service_categories?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Unit Kerja</p>
                <p className="text-sm font-medium text-slate-700">{ticket.units?.name || '-'}</p>
                {ticket.units?.code && <p className="text-xs text-slate-400">Kode: {ticket.units.code}</p>}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Batas SLA</p>
                <p className={`text-sm font-medium ${isOverSLA ? 'text-red-600' : 'text-slate-700'}`}>
                  {ticket.sla_deadline ? new Date(ticket.sla_deadline).toLocaleString('id-ID') : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Respon Pertama</p>
                <p className="text-sm font-medium text-slate-700">
                  {ticket.first_response_at ? new Date(ticket.first_response_at).toLocaleString('id-ID') : '-'}
                </p>
              </div>
              {ticket.resolved_at && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Diselesaikan</p>
                  <p className="text-sm font-medium text-emerald-600">
                    {new Date(ticket.resolved_at).toLocaleString('id-ID')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submitter Info */}
          {(ticket.submitter_name || ticket.submitter_email || ticket.submitter_phone) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Informasi Pelapor</h3>
              </div>
              <div className="p-4 space-y-3">
                {ticket.submitter_name && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">person</span>
                    <span className="text-sm text-slate-700">{ticket.submitter_name}</span>
                  </div>
                )}
                {ticket.submitter_email && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">email</span>
                    <a href={`mailto:${ticket.submitter_email}`} className="text-sm text-primary hover:underline">
                      {ticket.submitter_email}
                    </a>
                  </div>
                )}
                {ticket.submitter_phone && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">phone</span>
                    <a href={`tel:${ticket.submitter_phone}`} className="text-sm text-primary hover:underline">
                      {ticket.submitter_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unit Contact - Terintegrasi dengan Data Master */}
          {ticket.units && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Kontak Unit</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">business</span>
                  <span className="text-sm font-medium text-slate-700">{ticket.units.name}</span>
                </div>
                {ticket.units.code && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">tag</span>
                    <span className="text-sm text-slate-600">Kode: {ticket.units.code}</span>
                  </div>
                )}
                {ticket.units.contact_email && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">email</span>
                    <a href={`mailto:${ticket.units.contact_email}`} className="text-sm text-primary hover:underline">
                      {ticket.units.contact_email}
                    </a>
                  </div>
                )}
                {ticket.units.contact_phone && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">phone</span>
                    <a href={`tel:${ticket.units.contact_phone}`} className="text-sm text-primary hover:underline">
                      {ticket.units.contact_phone}
                    </a>
                  </div>
                )}
                {!ticket.units.contact_email && !ticket.units.contact_phone && (
                  <p className="text-sm text-slate-400 italic">Kontak unit belum tersedia</p>
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          {ticket.ticket_attachments && ticket.ticket_attachments.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Lampiran</h3>
              </div>
              <div className="p-4 space-y-2">
                {ticket.ticket_attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-400">attach_file</span>
                    <span className="text-sm text-primary hover:underline truncate">{attachment.file_name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EscalationModal
        isOpen={escalationModal}
        onClose={() => setEscalationModal(false)}
        ticketId={ticket.id}
        ticketNumber={ticket.ticket_number}
        currentUnitId={ticket.unit_id}
        onSuccess={fetchTicketData}
      />
      <ResponseModal
        isOpen={responseModal}
        onClose={() => setResponseModal(false)}
        ticketId={ticket.id}
        ticketNumber={ticket.ticket_number}
        onSuccess={fetchTicketData}
      />
      <CloseTicketModal
        isOpen={closeTicketModal}
        onClose={() => setCloseTicketModal(false)}
        ticketId={ticket.id}
        ticketNumber={ticket.ticket_number}
        onSuccess={fetchTicketData}
      />
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ isOpen: false, responseId: '' })}
        ticketId={ticket.id}
        ticketNumber={ticket.ticket_number}
        responseId={feedbackModal.responseId}
        onSuccess={fetchTicketData}
      />
    </div>
  );
};

export default TicketDetail;
