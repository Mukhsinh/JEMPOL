import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import AppFooter from '../../components/AppFooter';

interface Unit {
  id: string;
  name: string;
  code: string;
}

interface AppSettings {
  app_name: string;
  app_footer: string;
  institution_name: string;
  contact_phone: string;
  logo_url: string;
}

const surveyQuestions = [
  { id: 'q1', code: 'U1', title: 'Persyaratan', text: 'Kesesuaian persyaratan pelayanan' },
  { id: 'q2', code: 'U2', title: 'Prosedur', text: 'Kemudahan prosedur pelayanan' },
  { id: 'q3', code: 'U3', title: 'Waktu', text: 'Kecepatan waktu pelayanan' },
  { id: 'q4', code: 'U4', title: 'Biaya', text: 'Kewajaran biaya/tarif' },
  { id: 'q5', code: 'U5', title: 'Produk', text: 'Kesesuaian produk pelayanan' },
  { id: 'q6', code: 'U6', title: 'Kompetensi', text: 'Kompetensi petugas' },
  { id: 'q7', code: 'U7', title: 'Perilaku', text: 'Kesopanan petugas' },
  { id: 'q8', code: 'U8', title: 'Pengaduan', text: 'Penanganan pengaduan' }
];

const ratingOptions = [
  { value: 1, emoji: '😞', label: 'Sangat Tidak Puas', color: 'from-red-400 to-red-500', bgColor: 'bg-red-100' },
  { value: 2, emoji: '😕', label: 'Tidak Puas', color: 'from-orange-400 to-orange-500', bgColor: 'bg-orange-100' },
  { value: 3, emoji: '😐', label: 'Cukup Puas', color: 'from-yellow-400 to-yellow-500', bgColor: 'bg-yellow-100' },
  { value: 4, emoji: '😊', label: 'Puas', color: 'from-green-400 to-green-500', bgColor: 'bg-green-100' },
  { value: 5, emoji: '😍', label: 'Sangat Puas', color: 'from-emerald-400 to-emerald-500', bgColor: 'bg-emerald-100' }
];

const SurveyForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qrToken = searchParams.get('qr') || searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitFromQR, setUnitFromQR] = useState<string | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    app_name: 'Survei Kepuasan',
    app_footer: '',
    institution_name: 'RSUD',
    contact_phone: '',
    logo_url: ''
  });
  const [formData, setFormData] = useState({
    service_type: '',
    full_name: '',
    phone: '',
    email: '',
    is_anonymous: false,
    age: '',
    gender: '',
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '',
    overall_satisfaction: '',
    suggestions: '',
    unit_id: ''
  });

  useEffect(() => {
    loadMasterData();
    loadAppSettings();
  }, []);

  useEffect(() => {
    if (qrToken && units.length > 0) {
      detectUnitFromQR();
    }
  }, [qrToken, units]);

  const loadAppSettings = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value');
      
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item: { setting_key: string; setting_value: string }) => {
          map[item.setting_key] = item.setting_value || '';
        });
        setAppSettings({
          app_name: map.app_name || 'Survei Kepuasan',
          app_footer: map.app_footer || '',
          institution_name: map.institution_name || 'RSUD',
          contact_phone: map.contact_phone || '',
          logo_url: map.logo_url || ''
        });
      }
    } catch (e) {
      console.error('Error loading app settings:', e);
    }
  };

  const loadMasterData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/public/units');
      if (res.ok) {
        const r = await res.json();
        // Handle both formats: { data: [...] } or direct array
        const unitsData = Array.isArray(r) ? r : (r.data || []);
        // Filter only active units
        const activeUnits = unitsData.filter((u: any) => u.is_active !== false);
        setUnits(activeUnits);
      }
    } catch (e) {
      console.error('Error loading units:', e);
    }
    setIsLoading(false);
  };

  const detectUnitFromQR = async () => {
    try {
      const res = await fetch('/api/public/qr-codes/validate/' + qrToken);
      if (res.ok) {
        const r = await res.json();
        if (r.data && r.data.unit_id) {
          setUnitFromQR(r.data.unit_id);
          setFormData(p => ({ ...p, unit_id: r.data.unit_id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi minimal
    if (!formData.phone) {
      alert('Mohon isi nomor HP');
      return;
    }

    // Validasi unit
    if (!formData.unit_id && !unitFromQR) {
      alert('Mohon pilih unit tujuan');
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        unit_id: formData.unit_id || unitFromQR,
        service_type: formData.service_type || 'rawat_jalan',
        reporter_name: formData.is_anonymous ? null : formData.full_name,
        reporter_phone: formData.phone,
        reporter_email: formData.is_anonymous ? null : formData.email,
        is_anonymous: formData.is_anonymous,
        age_range: formData.age || null,
        gender: formData.gender || null,
        // Skor 8 pertanyaan
        q1_score: formData.q1 ? parseInt(formData.q1) : null,
        q2_score: formData.q2 ? parseInt(formData.q2) : null,
        q3_score: formData.q3 ? parseInt(formData.q3) : null,
        q4_score: formData.q4 ? parseInt(formData.q4) : null,
        q5_score: formData.q5 ? parseInt(formData.q5) : null,
        q6_score: formData.q6 ? parseInt(formData.q6) : null,
        q7_score: formData.q7 ? parseInt(formData.q7) : null,
        q8_score: formData.q8 ? parseInt(formData.q8) : null,
        overall_satisfaction: formData.overall_satisfaction || null,
        comments: formData.suggestions || null,
        qr_token: qrToken || null,
        phone: formData.phone,
        source: qrToken ? 'qr_code' : 'web'
      };

      console.log('📤 Mengirim data survey:', data);

      const res = await fetch('/api/public/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      console.log('📥 Response dari server:', result);

      if (!res.ok) {
        throw new Error(result.error || 'Gagal mengirim survei');
      }

      if (result.success) {
        alert('✅ Survei berhasil dikirim! Terima kasih atas partisipasi Anda.');
        // Reset form
        setFormData({
          service_type: '',
          full_name: '',
          phone: '',
          email: '',
          is_anonymous: false,
          age: '',
          gender: '',
          q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '',
          overall_satisfaction: '',
          suggestions: '',
          unit_id: unitFromQR || ''
        });
        // Redirect ke halaman sukses atau reload
        setTimeout(() => {
          window.location.href = '/form/survey?success=true';
        }, 1500);
      } else {
        throw new Error(result.error || 'Gagal mengirim survei');
      }
    } catch (err) {
      console.error('❌ Error submit survey:', err);
      alert('Error: ' + (err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim survei'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (f: string, v: string | boolean) => {
    setFormData(p => ({ ...p, [f]: v }));
  };

  if (isLoading && units.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-lg mx-auto w-full px-4 py-6 pb-24">
        {/* Unit Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📍</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Unit Tujuan</p>
              {unitFromQR ? (
                <p className="text-lg font-bold text-gray-800">{units.find(u => u.id === unitFromQR)?.name}</p>
              ) : (
                <select
                  className="w-full mt-1 text-sm border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 bg-transparent font-medium text-gray-800 py-1"
                  value={formData.unit_id}
                  onChange={e => handleChange('unit_id', e.target.value)}
                >
                  <option value="">Pilih Unit</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Type */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">🏥</span> Jenis Layanan
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'rawat_jalan', label: 'Rawat Jalan', icon: '🚶' },
                { value: 'rawat_inap', label: 'Rawat Inap', icon: '🛏️' },
                { value: 'darurat', label: 'IGD', icon: '🚑' },
                { value: 'lainnya', label: 'Lainnya', icon: '📋' }
              ].map(type => (
                <label key={type.value} className="cursor-pointer">
                  <input
                    className="sr-only peer"
                    name="service_type"
                    type="radio"
                    value={type.value}
                    checked={formData.service_type === type.value}
                    onChange={e => handleChange('service_type', e.target.value)}
                  />
                  <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-gray-100 bg-gray-50 transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50">
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{type.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Respondent Data */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-lg">👤</span> Data Responden
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-gray-600">Nama</label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_anonymous}
                      onChange={e => handleChange('is_anonymous', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-xs text-gray-500">Anonim</span>
                  </label>
                </div>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Nama Anda"
                  value={formData.full_name}
                  onChange={e => handleChange('full_name', e.target.value)}
                  disabled={formData.is_anonymous}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">HP *</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500"
                    type="tel"
                    required
                    placeholder="08xxx"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Email</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500"
                    type="email"
                    placeholder="email"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span className="text-xl">⭐</span> Penilaian
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {surveyQuestions.map((q, idx) => (
                <div key={q.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-gray-700">{q.text}</p>
                  </div>
                  <div className="flex justify-between gap-2 pl-9">
                    {ratingOptions.map(rating => (
                      <label key={rating.value} className="cursor-pointer flex-1">
                        <input
                          className="sr-only peer"
                          name={q.id}
                          type="radio"
                          value={rating.value}
                          checked={formData[q.id as keyof typeof formData] === rating.value.toString()}
                          onChange={e => handleChange(q.id, e.target.value)}
                        />
                        <div className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                          formData[q.id as keyof typeof formData] === rating.value.toString() 
                            ? `border-transparent ${rating.bgColor} scale-105 shadow-md` 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}>
                          <span className={`text-3xl mb-1 transition-all ${
                            formData[q.id as keyof typeof formData] === rating.value.toString() 
                              ? 'grayscale-0' 
                              : 'grayscale opacity-50'
                          }`}>
                            {rating.emoji}
                          </span>
                          <span className={`text-[9px] font-semibold text-center leading-tight ${
                            formData[q.id as keyof typeof formData] === rating.value.toString()
                              ? 'text-gray-800'
                              : 'text-gray-400'
                          }`}>
                            {rating.label}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">💬</span> Saran
            </h3>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Saran Anda..."
              value={formData.suggestions}
              onChange={e => handleChange('suggestions', e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Mengirim...' : 'Kirim Survei'} 📤
          </button>
        </form>
      </main>

      {/* Footer */}
      <AppFooter variant="compact" />
    </div>
  );
};

export default SurveyForm;
