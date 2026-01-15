import { useState, useEffect } from 'react';
import { complaintService, Unit } from '../services/complaintService';
import { ticketActionService, EscalateTicketData, RespondTicketData } from '../services/ticketActionService';

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  ticketNumber: string;
  currentUnitId?: string;
  onSuccess: () => void;
}

interface ResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  ticketNumber: string;
  onSuccess: () => void;
}

// Modal Eskalasi Tiket
export function EscalationModal({ isOpen, onClose, ticketId, ticketNumber, currentUnitId, onSuccess }: EscalationModalProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<EscalateTicketData>({
    to_unit_id: '',
    cc_unit_ids: [],
    reason: '',
    notes: '',
    priority: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchUnits();
    }
  }, [isOpen]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await complaintService.getUnits();
      if (response.success) {
        // Filter out current unit
        const filteredUnits = (response.data || []).filter((u: Unit) => u.id !== currentUnitId && u.is_active);
        setUnits(filteredUnits);
      }
    } catch (err) {
      console.error('Error fetching units:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.to_unit_id) {
      setError('Pilih unit tujuan eskalasi');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Alasan eskalasi wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const result = await ticketActionService.escalateTicket(ticketId, formData);
      if (result.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          to_unit_id: '',
          cc_unit_ids: [],
          reason: '',
          notes: '',
          priority: ''
        });
      } else {
        setError(result.error || 'Gagal melakukan eskalasi');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCCChange = (unitId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      cc_unit_ids: checked 
        ? [...(prev.cc_unit_ids || []), unitId]
        : (prev.cc_unit_ids || []).filter(id => id !== unitId)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Eskalasi Tiket</h2>
              <p className="text-sm text-slate-500 mt-1">Tiket: {ticketNumber}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Unit Tujuan */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Unit Tujuan Eskalasi <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.to_unit_id}
              onChange={(e) => setFormData(prev => ({ ...prev, to_unit_id: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={loading}
            >
              <option value="">-- Pilih Unit Tujuan --</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name} ({unit.code})</option>
              ))}
            </select>
          </div>

          {/* Unit Tembusan */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tembusan (CC) - Opsional
            </label>
            <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg p-3 space-y-2">
              {units.filter(u => u.id !== formData.to_unit_id).map(unit => (
                <label key={unit.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.cc_unit_ids?.includes(unit.id) || false}
                    onChange={(e) => handleCCChange(unit.id, e.target.checked)}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{unit.name} ({unit.code})</span>
                </label>
              ))}
            </div>
            {formData.cc_unit_ids && formData.cc_unit_ids.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">{formData.cc_unit_ids.length} unit dipilih sebagai tembusan</p>
            )}
          </div>

          {/* Alasan Eskalasi */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Alasan Eskalasi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Jelaskan alasan eskalasi tiket ini..."
            />
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Catatan Tambahan
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Catatan tambahan untuk unit tujuan..."
            />
          </div>

          {/* Prioritas Baru */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Ubah Prioritas (Opsional)
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">-- Tidak Mengubah --</option>
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
              <option value="critical">Kritis</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  <span>Eskalasi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Respon Tiket
export function ResponseModal({ isOpen, onClose, ticketId, ticketNumber, onSuccess }: ResponseModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RespondTicketData>({
    message: '',
    is_internal: false,
    mark_resolved: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.message.trim()) {
      setError('Pesan respon wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const result = await ticketActionService.respondTicket(ticketId, formData);
      if (result.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          message: '',
          is_internal: false,
          mark_resolved: false
        });
      } else {
        setError(result.error || 'Gagal menambahkan respon');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-xl w-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Respon Tiket</h2>
              <p className="text-sm text-slate-500 mt-1">Tiket: {ticketNumber}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Pesan Respon */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Pesan Respon <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={5}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Tulis respon atau solusi untuk tiket ini..."
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_internal}
                onChange={(e) => setFormData(prev => ({ ...prev, is_internal: e.target.checked }))}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Catatan Internal</span>
                <p className="text-xs text-slate-500">Hanya terlihat oleh staff, tidak terlihat oleh pelapor</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.mark_resolved}
                onChange={(e) => setFormData(prev => ({ ...prev, mark_resolved: e.target.checked }))}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tandai Selesai</span>
                <p className="text-xs text-slate-500">Tiket akan ditandai sebagai selesai setelah respon ini</p>
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                formData.mark_resolved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-blue-600'
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    {formData.mark_resolved ? 'check_circle' : 'send'}
                  </span>
                  <span>{formData.mark_resolved ? 'Selesaikan' : 'Kirim Respon'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default { EscalationModal, ResponseModal };

// Modal Close Tiket - untuk menyelesaikan tiket setelah respon/eskalasi ditindaklanjuti
interface CloseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  ticketNumber: string;
  onSuccess: () => void;
}

export function CloseTicketModal({ isOpen, onClose, ticketId, ticketNumber, onSuccess }: CloseTicketModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resolution.trim()) {
      setError('Catatan penyelesaian wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const result = await ticketActionService.respondTicket(ticketId, {
        message: resolution,
        is_internal: false,
        mark_resolved: true
      });
      if (result.success) {
        onSuccess();
        onClose();
        setResolution('');
      } else {
        setError(result.error || 'Gagal menyelesaikan tiket');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-xl w-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Selesaikan Tiket</h2>
              <p className="text-sm text-slate-500 mt-1">Tiket: {ticketNumber}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">info</span>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Konfirmasi Penyelesaian</p>
                <p>Dengan menyelesaikan tiket ini, status akan berubah menjadi "Selesai" dan tidak dapat diubah kembali. Pastikan semua respon dan eskalasi telah ditindaklanjuti.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Catatan Penyelesaian <span className="text-red-500">*</span>
            </label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Jelaskan bagaimana tiket ini diselesaikan..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Selesaikan Tiket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Feedback/Balasan Respon
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  ticketNumber: string;
  responseId: string;
  onSuccess: () => void;
}

export function FeedbackModal({ isOpen, onClose, ticketId, ticketNumber, responseId, onSuccess }: FeedbackModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!feedback.trim()) {
      setError('Pesan balasan wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const result = await ticketActionService.respondTicket(ticketId, {
        message: `[Balasan untuk respon sebelumnya]\n\n${feedback}`,
        is_internal: isInternal,
        mark_resolved: false
      });
      if (result.success) {
        onSuccess();
        onClose();
        setFeedback('');
        setIsInternal(false);
      } else {
        setError(result.error || 'Gagal mengirim balasan');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-xl w-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Balas Respon</h2>
              <p className="text-sm text-slate-500 mt-1">Tiket: {ticketNumber}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Pesan Balasan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Tulis balasan atau feedback untuk respon ini..."
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Catatan Internal</span>
              <p className="text-xs text-slate-500">Hanya terlihat oleh staff, tidak terlihat oleh pelapor</p>
            </div>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Kirim Balasan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
