import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import assignmentService, { TicketDetail } from '../../services/assignmentService';

export default function TiketEskalasiDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [sending, setSending] = useState(false);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [selectedUnit, setSelectedUnit] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [ticketData, unitsData] = await Promise.all([
        assignmentService.getTicketDetail(id),
        assignmentService.getUnits()
      ]);
      setTicket(ticketData);
      setUnits(unitsData);
      if (ticketData?.unit_id) setSelectedUnit(ticketData.unit_id);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSendResponse = async () => {
    if (!responseText.trim() || !id) return;
    try {
      setSending(true);
      const success = await assignmentService.respondToTicket(id, responseText);
      if (success) {
        setResponseText('');
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    const success = await assignmentService.updateTicketStatus(id, newStatus);
    if (success) fetchData();
  };

  const handleEscalate = async (toRole: string) => {
    if (!id) return;
    const success = await assignmentService.escalateTicket(id, toRole, 'Eskalasi untuk tindakan lebih lanjut');
    if (success) navigate('/assignment/tiket-eskalasi');
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
  const formatTime = (d: string) => d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';

  const getPriorityStyle = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'text-red-600 bg-red-50 dark:bg-red-900/30',
      high: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
      medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30',
      low: 'text-green-600 bg-green-50 dark:bg-green-900/30'
    };
    const labels: Record<string, string> = { critical: 'Kritis', high: 'Tinggi', medium: 'Sedang', low: 'Rendah' };
    return { style: styles[priority] || styles.medium, label: labels[priority] || priority };
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; dot: string }> = {
      open: { bg: 'bg-blue-50 dark:bg-blue-900/10', dot: 'bg-blue-500' },
      in_progress: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', dot: 'bg-yellow-500' },
      escalated: { bg: 'bg-red-50 dark:bg-red-900/10', dot: 'bg-red-500' },
      resolved: { bg: 'bg-green-50 dark:bg-green-900/10', dot: 'bg-green-500' },
      closed: { bg: 'bg-slate-50 dark:bg-slate-700', dot: 'bg-slate-500' }
    };
    const labels: Record<string, string> = { open: 'Terbuka', in_progress: 'Diproses', escalated: 'Dieskalasi', resolved: 'Selesai', closed: 'Ditutup' };
    return { ...styles[status] || styles.open, label: labels[status] || status };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">error</span>
        <p className="text-slate-500">Tiket tidak ditemukan</p>
        <Link to="/assignment/tiket-eskalasi" className="mt-4 text-primary hover:underline">Kembali ke daftar tiket</Link>
      </div>
    );
  }

  const priorityInfo = getPriorityStyle(ticket.priority);
  const statusInfo = getStatusStyle(ticket.status);
