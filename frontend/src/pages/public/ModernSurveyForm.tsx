import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UnitInfo {
  id: string;
  name: string;
  code: string;
}

// Modern Mobile Survey Form - Single Page, Minimal Steps
const ModernSurveyForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Get unit info from QR code params
  const qrToken = searchParams.get('qr') || searchParams.get('token') || '';
  const unitId = searchParams.get('unit_id') || searchParams.get('unit') || '';
  const unitName = decodeURIComponent(searchParams.get('unit_name') || searchParams.get('name') || '');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [unitInfo, setUnitInfo] = useState<UnitInfo | null>(null);

  // Form state - simplified
  const [phone, setPhone] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState('');

  const questions = [
    { id: 'q1', label: 'Persyaratan', icon: '📋' },
    { id: 'q2', label: 'Prosedur', icon: '📝' },
    { id: 'q3', label: 'Waktu', icon: '⏱️' },
    { id: 'q4', label: 'Biaya', icon: '💰' },
    { id: 'q5', label: 'Produk', icon: '📦' },
    { id: 'q6', label: 'Kompetensi', icon: '👨‍⚕️' },
    { id: 'q7', label: 'Perilaku', icon: '😊' },
    { id: 'q8', label: 'Pengaduan', icon: '📞' }
  ];

  useEffect(() => {
    loadUnitInfo();
  }, [qrToken, unitId]);

  const loadUnitInfo = async () => {
    setLoading(true);
    try {
      // If we have unit info from params, use it
      if (unitId && unitName) {
        setUnitInfo({ id: unitId, name: unitName, code: '' });
        setLoading(false);
        return;
      }

      // Try to get unit info from QR token
      if (qrToken) {
        const res = await fetch(`/api/public/qr-codes/validate/${qrToken}`);
        if (res.ok) {
          const data = await res.json();
          if (data.data?.unit_id) {
            // Fetch unit details
            const unitRes = await fetch('/api/public/units');
            if (unitRes.ok) {
              const units = await unitRes.json();
              const unitsArray = Array.isArray(units) ? units : (units.data || []);
              const unit = unitsArray.find((u: any) => u.id === data.data.unit_id);
              if (unit) {
                setUnitInfo(unit);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Error loading unit info:', e);
    }
    setLoading(false);
  };

  const handleRating = (questionId: string, value: number) => {
    setRatings(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!phone) {
      setError('Mohon isi nomor HP');
      return;
    }

    if (Object.keys(ratings).length < 4) {
      setError('Mohon isi minimal 4 penilaian');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/public/surveys', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          unit_id: unitInfo?.id || unitId,
          visitor_phone: phone,
          q1_score: ratings.q1,
          q2_score: ratings.q2,
          q3_score: ratings.q3,
          q4_score: ratings.q4,
          q5_score: ratings.q5,
          q6_score: ratings.q6,
          q7_score: ratings.q7,
          q8_score: ratings.q8,
          overall_score: overallRating || undefined,
          comments: comment,
          qr_code: qrToken,
          source: 'qr_code'
        })
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers.get('content-type'));

      // Cek apakah response adalah JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error(`Server mengembalikan response yang tidak valid (${response.status}). Silakan coba lagi.`);
      }

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengirim survei');
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Memuat...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-5xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Terima Kasih!</h2>
          <p className="text-gray-500 mb-6">Survei Anda telah berhasil dikirim. Masukan Anda sangat berharga bagi kami.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            Isi Survei Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-emerald-600">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">Survei Kepuasan</h1>
            <p className="text-white/80 text-sm">Berikan penilaian Anda</p>
          </div>
        </div>

        {/* Unit Info Card */}
        {unitInfo && (
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-xl">🏥</span>
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-xs">Unit Layanan</p>
              <p className="text-white font-bold">{unitInfo.name}</p>
            </div>
            <span className="text-green-300 text-xl">✓</span>
          </div>
        )}
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-t-[2rem] min-h-[calc(100vh-180px)] px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <p className="text-red-600 text-sm flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400">✕</button>
          </div>
        )}

        {/* Phone Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nomor HP (WhatsApp) *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
            className="w-full px-4 py-4 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-teal-500 focus:ring-0 text-lg transition-colors"
          />
        </div>

        {/* Quick Rating Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Penilaian Layanan</h3>
          <div className="grid grid-cols-2 gap-3">
            {questions.map((q) => (
              <div key={q.id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{q.icon}</span>
                  <span className="text-xs font-medium text-gray-600">{q.label}</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRating(q.id, star)}
                      className="flex-1 py-2 transition-all"
                    >
                      <span className={`text-xl ${
                        (ratings[q.id] || 0) >= star 
                          ? 'text-amber-400 drop-shadow' 
                          : 'text-gray-300'
                      }`}>★</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Rating */}
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 text-center">Kepuasan Keseluruhan</h3>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setOverallRating(star)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <span className={`text-4xl ${
                  overallRating >= star 
                    ? 'text-amber-400 drop-shadow-lg' 
                    : 'text-gray-300'
                }`}>★</span>
              </button>
            ))}
          </div>
          {overallRating > 0 && (
            <p className="text-center mt-2 text-sm font-medium text-gray-600">
              {overallRating <= 2 ? '😔 Kurang Puas' : 
               overallRating === 3 ? '🙂 Cukup Puas' : 
               overallRating === 4 ? '😊 Puas' : '🤩 Sangat Puas'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Saran & Masukan (Opsional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tuliskan saran Anda..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 focus:border-teal-500 focus:ring-0 resize-none transition-colors"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-teal-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Mengirim...
            </>
          ) : (
            <>
              <span>Kirim Survei</span>
              <span className="text-xl">📤</span>
            </>
          )}
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Survei ini bersifat anonim dan digunakan untuk meningkatkan kualitas layanan
        </p>
      </div>
    </div>
  );
};

export default ModernSurveyForm;
