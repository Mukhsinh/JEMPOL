import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface Unit {
  id: string;
  name: string;
  code: string;
}

const surveyQuestions = [
  { id: 'q1', code: 'U1', text: 'Bagaimana kesesuaian persyaratan pelayanan?' },
  { id: 'q2', code: 'U2', text: 'Bagaimana kemudahan prosedur pelayanan?' },
  { id: 'q3', code: 'U3', text: 'Bagaimana kecepatan waktu pelayanan?' },
  { id: 'q4', code: 'U4', text: 'Bagaimana kewajaran biaya/tarif?' },
  { id: 'q5', code: 'U5', text: 'Bagaimana kesesuaian produk pelayanan?' },
  { id: 'q6', code: 'U6', text: 'Bagaimana kompetensi petugas?' },
  { id: 'q7', code: 'U7', text: 'Bagaimana kesopanan petugas?' },
  { id: 'q8', code: 'U8', text: 'Bagaimana penanganan pengaduan?' }
];

const SurveyForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qrToken = searchParams.get('qr') || searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitFromQR, setUnitFromQR] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    service_type: '',
    full_name: '',
    phone: '',
    email: '',
    is_anonymous: false,
    age: '',
    gender: '',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: '',
    q8: '',
    overall_satisfaction: '',
    suggestions: '',
    unit_id: ''
  });

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (qrToken && units.length > 0) {
      detectUnitFromQR();
    }
  }, [qrToken, units]);


  const loadMasterData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/public/units');
      if (res.ok) {
        const r = await res.json();
        setUnits(r.data || []);
      }
    } catch (e) {
      console.error(e);
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
    if (!formData.phone) {
      alert('Mohon isi nomor HP');
      return;
    }
    setIsLoading(true);
    try {
      const data = {
        service_type: formData.service_type,
        reporter_name: formData.is_anonymous ? null : formData.full_name,
        reporter_phone: formData.phone,
        reporter_email: formData.is_anonymous ? null : formData.email,
        age_range: formData.age,
        gender: formData.gender,
        q1_score: formData.q1 ? parseInt(formData.q1) : null,
        q2_score: formData.q2 ? parseInt(formData.q2) : null,
        q3_score: formData.q3 ? parseInt(formData.q3) : null,
        q4_score: formData.q4 ? parseInt(formData.q4) : null,
        q5_score: formData.q5 ? parseInt(formData.q5) : null,
        q6_score: formData.q6 ? parseInt(formData.q6) : null,
        q7_score: formData.q7 ? parseInt(formData.q7) : null,
        q8_score: formData.q8 ? parseInt(formData.q8) : null,
        overall_satisfaction: formData.overall_satisfaction,
        comments: formData.suggestions,
        is_anonymous: formData.is_anonymous,
        qr_token: qrToken,
        unit_id: formData.unit_id || unitFromQR
      };
      const res = await fetch('/api/public/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Gagal');
      alert('Survei berhasil dikirim!');
      navigate('/survey?survey=success');
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown'));
    }
    setIsLoading(false);
  };

  const handleChange = (f: string, v: string | boolean) => {
    setFormData(p => ({ ...p, [f]: v }));
  };

  if (isLoading && units.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-bold">Survei Kepuasan RSUD</h1>
        </div>
      </header>
      <main className="flex-grow max-w-3xl mx-auto w-full p-4">
        <h2 className="text-2xl font-bold mb-6">Survei Kepuasan Masyarakat</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white rounded-xl border p-4">
            <label className="text-xs font-bold text-blue-600">Unit Tujuan</label>
            {unitFromQR ? (
              <p className="font-bold">{units.find(u => u.id === unitFromQR)?.name}</p>
            ) : (
              <select
                className="w-full mt-2 rounded-lg border p-2"
                value={formData.unit_id}
                onChange={e => handleChange('unit_id', e.target.value)}
              >
                <option value="">Pilih Unit</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}
          </section>
          <section className="bg-white rounded-xl border p-4 space-y-4">
            <h3 className="font-bold">Data Responden</h3>
            <div className="grid grid-cols-2 gap-2">
              {['rawat_jalan', 'rawat_inap', 'darurat', 'lainnya'].map(t => (
                <label key={t} className="cursor-pointer">
                  <input
                    className="sr-only"
                    type="radio"
                    name="service_type"
                    value={t}
                    checked={formData.service_type === t}
                    onChange={e => handleChange('service_type', e.target.value)}
                  />
                  <div className={`p-2 rounded-lg border text-center text-sm ${formData.service_type === t ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    {t === 'rawat_jalan' ? 'Rawat Jalan' : t === 'rawat_inap' ? 'Rawat Inap' : t === 'darurat' ? 'IGD' : 'Lainnya'}
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between">
              <label className="text-sm font-medium">Nama</label>
              <label className="text-xs">
                <input
                  type="checkbox"
                  checked={formData.is_anonymous}
                  onChange={e => handleChange('is_anonymous', e.target.checked)}
                  className="mr-1"
                />
                Anonim
              </label>
            </div>
            <input
              className="w-full rounded-lg border p-2"
              placeholder="Nama"
              value={formData.full_name}
              onChange={e => handleChange('full_name', e.target.value)}
              disabled={formData.is_anonymous}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">HP *</label>
                <input
                  className="w-full rounded-lg border p-2"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  className="w-full rounded-lg border p-2"
                  type="email"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </div>
            </div>
          </section>
          <section className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold">Penilaian</h3>
            </div>
            <div className="divide-y">
              {surveyQuestions.map(q => (
                <div key={q.id} className="p-4">
                  <p className="text-xs text-blue-600 font-bold">{q.code}</p>
                  <p className="text-sm mb-2">{q.text}</p>
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map(val => (
                      <label key={val} className="cursor-pointer">
                        <input
                          className="sr-only"
                          name={q.id}
                          type="radio"
                          value={val}
                          checked={formData[q.id as keyof typeof formData] === val.toString()}
                          onChange={e => handleChange(q.id, e.target.value)}
                        />
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${formData[q.id as keyof typeof formData] === val.toString() ? 'bg-yellow-50 border-yellow-400' : 'border-gray-200'}`}>
                          <span className="text-lg">{val}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-white rounded-xl border p-4">
            <label className="text-sm font-medium">Saran</label>
            <textarea
              className="w-full rounded-lg border p-2 mt-2"
              rows={3}
              value={formData.suggestions}
              onChange={e => handleChange('suggestions', e.target.value)}
            />
          </section>
          <button
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Mengirim...' : 'Kirim Survei'}
          </button>
        </form>
      </main>
      <footer className="bg-white border-t p-4 text-center text-xs text-gray-500">
        © 2024 RSUD - e-SKM
      </footer>
    </div>
  );
};

export default SurveyForm;
