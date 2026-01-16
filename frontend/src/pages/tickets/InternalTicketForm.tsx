import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

interface AppSettings {
  app_name: string;
  app_footer: string;
  institution_name: string;
  institution_address: string;
  contact_email: string;
  contact_phone: string;
  logo_url: string;
}

interface Unit {
  id: string;
  name: string;
  code: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  code: string;
}

interface TicketType {
  id: string;
  name: string;
  code: string;
  default_priority: string;
}

interface PatientType {
  id: string;
  name: string;
  code: string;
}

interface FormData {
  title: string;
  description: string;
  type: string;
  category_id: string;
  unit_id: string;
  priority: string;
  patient_type_id: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string;
  submitter_address: string;
  is_anonymous: boolean;
}

const InternalTicketForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'information',
    category_id: '',
    unit_id: '',
    priority: 'medium',
    patient_type_id: '',
    submitter_name: '',
    submitter_email: '',
    submitter_phone: '',
    submitter_address: '',
    is_anonymous: false
  });

  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [patientTypes, setPatientTypes] = useState<PatientType[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    app_name: 'Sistem Pengaduan',
    app_footer: '',
    institution_name: '',
    institution_address: '',
    contact_email: '',
    contact_phone: '',
    logo_url: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'identity' | 'ticket'>('identity');

  useEffect(() => {
    fetchMasterData();
    fetchAppSettings();
  }, []);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const { data: unitsData } = await supabase.from('units').select('id, name, code').eq('is_active', true).order('name');
      const { data: categoriesData } = await supabase.from('service_categories').select('id, name, code').eq('is_active', true).order('name');
      const { data: ticketTypesData } = await supabase.from('ticket_types').select('id, name, code, default_priority').eq('is_active', true).order('name');
      const { data: patientTypesData } = await supabase.from('patient_types').select('id, name, code').eq('is_active', true).order('name');
      setUnits(unitsData || []);
      setCategories(categoriesData || []);
      setTicketTypes(ticketTypesData || []);
      setPatientTypes(patientTypesData || []);
    } catch (err) {
      console.error('Error fetching master data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppSettings = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['app_name', 'app_footer', 'institution_name', 'institution_address', 'contact_email', 'contact_phone', 'logo_url']);
      if (data) {
        const settings: Partial<AppSettings> = {};
        data.forEach((item: { setting_key: string; setting_value: string }) => {
          (settings as any)[item.setting_key] = item.setting_value || '';
        });
        setAppSettings(prev => ({ ...prev, ...settings }));
      }
    } catch (err) {
      console.error('Error fetching app settings:', err);
    }
  };

  const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TKT-${year}${month}${day}-${random}`;
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'type') {
      const selectedType = ticketTypes.find(t => t.code === value);
      if (selectedType?.default_priority) {
        setFormData(prev => ({ ...prev, priority: selectedType.default_priority }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const newTicketNumber = generateTicketNumber();
      const ticketData = {
        ticket_number: newTicketNumber,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category_id: formData.category_id || null,
        unit_id: formData.unit_id || null,
        priority: formData.priority,
        submitter_name: formData.is_anonymous ? 'Anonim' : formData.submitter_name,
        submitter_email: formData.is_anonymous ? null : formData.submitter_email,
        submitter_phone: formData.is_anonymous ? null : formData.submitter_phone,
        submitter_address: formData.is_anonymous ? null : formData.submitter_address,
        is_anonymous: formData.is_anonymous,
        status: 'open',
        source: 'web',
        created_at: new Date().toISOString()
      };
      const { error: insertError } = await supabase.from('tickets').insert([ticketData]);
      if (insertError) throw insertError;
      setTicketNumber(newTicketNumber);
      setSuccess(true);
      setFormData({
        title: '', description: '', type: 'information', category_id: '', unit_id: '',
        priority: 'medium', patient_type_id: '', submitter_name: '', submitter_email: '',
        submitter_phone: '', submitter_address: '', is_anonymous: false
      });
    } catch (err: any) {
      setError(err.message || 'Gagal membuat tiket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewTicket = () => {
    setSuccess(false);
    setTicketNumber('');
    setActiveSection('identity');
  };

  const canProceedToTicket = formData.is_anonymous || (formData.submitter_name.trim() !== '');

  // Loading State - Modern Mobile Style
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 animate-pulse"></div>
          </div>
          <p className="text-white/80 text-sm font-medium">Memuat formulir...</p>
        </div>
      </div>
    );
  }

  // Success State - Modern Mobile Style
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            {/* Success Animation */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 animate-ping"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30"></div>
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-2">Berhasil Terkirim!</h2>
            <p className="text-white/60 text-center text-sm mb-6">Tiket Anda telah berhasil dibuat</p>
            
            {/* Ticket Number Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-white/20">
              <p className="text-white/60 text-xs text-center mb-2 uppercase tracking-wider">Nomor Tiket</p>
              <p className="text-3xl font-mono font-bold text-center bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                {ticketNumber}
              </p>
              <p className="text-white/40 text-xs text-center mt-3">Simpan nomor ini untuk melacak status</p>
            </div>
            
            <button onClick={handleNewTicket}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold text-base shadow-xl shadow-emerald-500/30 active:scale-[0.98] transition-all">
              Buat Tiket Baru
            </button>
          </div>
        </div>
        
        {/* Minimal Footer */}
        <div className="py-4 text-center">
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} {appSettings.institution_name || appSettings.app_name}</p>
        </div>
      </div>
    );
  }

  // Main Form - Ultra Modern Mobile App Style
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col">
      {/* Floating Header */}
      <header className="sticky top-0 z-50 px-4 pt-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-5 py-4 border border-white/20 shadow-xl">
          <div className="flex items-center gap-4">
            {appSettings.logo_url ? (
              <img src={appSettings.logo_url} alt="Logo" className="h-11 w-11 rounded-xl object-contain bg-white/10 p-1" />
            ) : (
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-bold text-lg truncate">{appSettings.institution_name || 'Sistem Pengaduan'}</h1>
              <p className="text-blue-300/80 text-xs">Tiket Internal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setActiveSection('identity')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeSection === 'identity' 
                ? 'bg-white text-slate-900 shadow-lg shadow-white/20' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              activeSection === 'identity' ? 'bg-blue-500 text-white' : 'bg-white/20'
            }`}>1</span>
            Identitas
          </button>
          <div className="w-8 h-0.5 bg-white/20 rounded-full"></div>
          <button onClick={() => canProceedToTicket && setActiveSection('ticket')}
            disabled={!canProceedToTicket}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeSection === 'ticket' 
                ? 'bg-white text-slate-900 shadow-lg shadow-white/20' 
                : canProceedToTicket 
                  ? 'bg-white/10 text-white/60 hover:bg-white/20' 
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              activeSection === 'ticket' ? 'bg-blue-500 text-white' : 'bg-white/20'
            }`}>2</span>
            Detail Tiket
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-6 overflow-y-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 backdrop-blur-xl rounded-2xl border border-red-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Identity */}
          {activeSection === 'identity' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Anonymous Toggle - Modern Card */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20">
                <label className="flex items-center gap-4 cursor-pointer">
                  <div className={`relative w-14 h-8 rounded-full transition-all duration-300 ${formData.is_anonymous ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-white/20'}`}>
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${formData.is_anonymous ? 'left-7' : 'left-1'}`}></div>
                  </div>
                  <input type="checkbox" checked={formData.is_anonymous} onChange={(e) => handleChange('is_anonymous', e.target.checked)} className="sr-only" />
                  <div>
                    <p className="text-white font-medium">Lapor Anonim</p>
                    <p className="text-white/50 text-xs">Identitas Anda akan dirahasiakan</p>
                  </div>
                </label>
              </div>

              {!formData.is_anonymous && (
                <div className="space-y-4">
                  {/* Name Input - Floating Label Style */}
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                    <div className="px-5 pt-4 pb-1">
                      <label className="text-blue-300/80 text-xs font-medium uppercase tracking-wider">Nama Lengkap *</label>
                    </div>
                    <input type="text" value={formData.submitter_name} onChange={(e) => handleChange('submitter_name', e.target.value)}
                      required={!formData.is_anonymous} placeholder="Masukkan nama lengkap Anda"
                      className="w-full px-5 pb-4 pt-1 bg-transparent text-white placeholder-white/30 text-base focus:outline-none" />
                  </div>

                  {/* Email & Phone Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                      <div className="px-4 pt-3 pb-1">
                        <label className="text-blue-300/80 text-[10px] font-medium uppercase tracking-wider">Email</label>
                      </div>
                      <input type="email" value={formData.submitter_email} onChange={(e) => handleChange('submitter_email', e.target.value)}
                        placeholder="email@contoh.com" className="w-full px-4 pb-3 pt-1 bg-transparent text-white placeholder-white/30 text-sm focus:outline-none" />
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                      <div className="px-4 pt-3 pb-1">
                        <label className="text-blue-300/80 text-[10px] font-medium uppercase tracking-wider">No. Telepon</label>
                      </div>
                      <input type="tel" value={formData.submitter_phone} onChange={(e) => handleChange('submitter_phone', e.target.value)}
                        placeholder="08xxxxxxxxxx" className="w-full px-4 pb-3 pt-1 bg-transparent text-white placeholder-white/30 text-sm focus:outline-none" />
                    </div>
                  </div>

                  {/* Patient Type - Modern Select */}
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                    <div className="px-5 pt-4 pb-1">
                      <label className="text-blue-300/80 text-xs font-medium uppercase tracking-wider">Jenis Pasien</label>
                    </div>
                    <select value={formData.patient_type_id} onChange={(e) => handleChange('patient_type_id', e.target.value)}
                      className="w-full px-5 pb-4 pt-1 bg-transparent text-white text-base focus:outline-none appearance-none cursor-pointer">
                      <option value="" className="bg-slate-800">Pilih jenis pasien</option>
                      {patientTypes.map(pt => (<option key={pt.id} value={pt.id} className="bg-slate-800">{pt.name}</option>))}
                    </select>
                  </div>

                  {/* Address */}
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                    <div className="px-5 pt-4 pb-1">
                      <label className="text-blue-300/80 text-xs font-medium uppercase tracking-wider">Alamat</label>
                    </div>
                    <textarea value={formData.submitter_address} onChange={(e) => handleChange('submitter_address', e.target.value)}
                      rows={2} placeholder="Masukkan alamat lengkap"
                      className="w-full px-5 pb-4 pt-1 bg-transparent text-white placeholder-white/30 text-base focus:outline-none resize-none" />
                  </div>
                </div>
              )}

              {/* Next Button */}
              <button type="button" onClick={() => setActiveSection('ticket')} disabled={!canProceedToTicket}
                className="w-full py-4 mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-semibold text-base shadow-xl shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Lanjutkan
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>
          )}

          {/* Section 2: Ticket Details */}
          {activeSection === 'ticket' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Back Button */}
              <button type="button" onClick={() => setActiveSection('identity')}
                className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-2 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Kembali
              </button>

              {/* Ticket Type & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                  <div className="px-4 pt-3 pb-1">
                    <label className="text-blue-300/80 text-[10px] font-medium uppercase tracking-wider">Jenis Tiket *</label>
                  </div>
                  <select value={formData.type} onChange={(e) => handleChange('type', e.target.value)} required
                    className="w-full px-4 pb-3 pt-1 bg-transparent text-white text-sm focus:outline-none appearance-none cursor-pointer">
                    <option value="information" className="bg-slate-800">Informasi</option>
                    <option value="complaint" className="bg-slate-800">Pengaduan</option>
                    <option value="suggestion" className="bg-slate-800">Saran</option>
                    <option value="satisfaction" className="bg-slate-800">Kepuasan</option>
                  </select>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                  <div className="px-4 pt-3 pb-1">
                    <label className="text-blue-300/80 text-[10px] font-medium uppercase tracking-wider">Prioritas</label>
                  </div>
                  <select value={formData.priority} onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full px-4 pb-3 pt-1 bg-transparent text-white text-sm focus:outline-none appearance-none cursor-pointer">
                    <option value="low" className="bg-slate-800">🟢 Rendah</option>
                    <option value="medium" className="bg-slate-800">🟡 Sedang</option>
                    <option value="high" className="bg-slate-800">🟠 Tinggi</option>
                    <option value="critical" className="bg-slate-800">🔴 Kritis</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                <div className="px-5 pt-4 pb-1">
                  <label className="text-blue-300/80 text-xs font-medium uppercase tracking-wider">Kategori Layanan *</label>
                </div>
                <select value={formData.category_id} onChange={(e) => handleChange('category_id', e.target.value)} required
                  className="w-full px-5 pb-4 pt-1 bg-transparent text-white text-base focus:outline-none appearance-none cursor-pointer">
                  <option value="" className="bg-slate-800">Pilih kategori</option>
                  {categories.map(cat => (<option key={cat.id} value={cat.id} className="bg-slate-800">{cat.name}</option>))}
                </select>
              </div>

              {/* Unit */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                <div className="px-5 pt-4 pb-1">
                  <label className="text-blue-300/80 text-xs font-medium uppercase tracking-wider">Unit Tujuan *</label>
                </div>
                <select value={formData.unit_id} onChange={(e) => handleChange('unit_id', e.target.value)} required
                  className="w-full px-5 pb-4 pt-1 bg-transparent text-white text-base focus:outline-none appearance-none cursor-pointer">
                  <option value="" className="bg-slate-800">Pilih unit</option>
                  {units.map(unit => (<option key={unit.id} value={unit.id} className="bg-slate-800">{unit.name}</option>))}
                </select>
              </div>

              {/* Title */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                <div className="px-5 pt-4 pb-1">
                  <label className="text-blue-300/80 text-xs font-medium uppercase tracking-wider">Judul Tiket *</label>
                </div>
                <input type="text" value={formData.title} onChange={(e) => handleChange('title', e.target.value)}
                  required placeholder="Ringkasan singkat masalah Anda"
                  className="w-full px-5 pb-4 pt-1 bg-transparent text-white placeholder-white/30 text-base focus:outline-none" />
              </div>

              {/* Description */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                <div className="px-5 pt-4 pb-1">
                  <label className="text-blue-300/80 text-xs font-medium uppercase tracking-wider">Deskripsi *</label>
                </div>
                <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)}
                  required rows={4} placeholder="Jelaskan detail masalah atau permintaan Anda..."
                  className="w-full px-5 pb-4 pt-1 bg-transparent text-white placeholder-white/30 text-base focus:outline-none resize-none" />
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={submitting}
                className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold text-base shadow-xl shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    Kirim Tiket
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </main>

      {/* Minimal Footer - No Phone */}
      <footer className="py-4 text-center">
        <p className="text-white/30 text-xs">© {new Date().getFullYear()} {appSettings.institution_name || appSettings.app_name}</p>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default InternalTicketForm;
