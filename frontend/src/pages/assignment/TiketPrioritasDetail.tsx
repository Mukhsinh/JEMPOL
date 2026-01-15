import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import assignmentService, { AssignmentTicket, TicketResponse } from '../../services/assignmentService';

export default function TiketPrioritasDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<AssignmentTicket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [ticketData, responsesData, unitsData] = await Promise.all([
        assignmentService.getTicketDetail(id),
        assignmentService.getTicketResponses(id),
        assignmentService.getUnits()
      ]);
      setTicket(ticketData);
      setResponses(responsesData);
      setUnits(unitsData);
      if (ticketData?.unit_id) setSelectedUnit(ticketData.unit_id);
    } catch (error) {
      console.error('Error fetching ticket detail:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSendResponse = async () => {
    if (!responseText.trim() || !id) return;
    setSubmitting(true);
    const success = await assignmentService.respondToTicket(id, responseText);
    if (success) { setResponseText(''); fetchData(); }
    setSubmitting(false);
  };

  const handleCloseTicket = async () => {
    if (!id) return;
    setSubmitting(true);
    const success = await assignmentService.closeTicket(id);
    if (success) navigate('/assignment/tiket-prioritas');
    setSubmitting(false);
  };

  const handleEscalate = async () => {
    if (!id) return;
    setSubmitting(true);
    const success = await assignmentService.escalateTicket(id, 'director', 'Eskalasi ke Direktur untuk keputusan strategis');
    if (success) navigate('/assignment/tiket-prioritas');
    setSubmitting(false);
  };


  const formatTime = (d: string) => d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const calculateSLA = () => {
    if (!ticket?.sla_deadline) return { hours: 0, minutes: 0, percentage: 100, isBreached: false };
    const now = new Date();
    const deadline = new Date(ticket.sla_deadline);
    const created = new Date(ticket.created_at);
    const total = deadline.getTime() - created.getTime();
    const remaining = deadline.getTime() - now.getTime();
    const percentage = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
    return { 
      hours: Math.abs(Math.floor(remaining / (1000 * 60 * 60))), 
      minutes: Math.abs(Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))), 
      percentage, 
      isBreached: remaining < 0 
    };
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
        <Link to="/assignment/tiket-prioritas" className="mt-4 text-primary hover:underline">Kembali</Link>
      </div>
    );
  }

  const sla = calculateSLA();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">