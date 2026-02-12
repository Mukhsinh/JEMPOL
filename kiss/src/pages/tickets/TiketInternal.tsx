import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { downloadInternalTicketPDF } from '../../utils/pdfGenerator';

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

interface AppSettings {
  app_name: string;
  app_footer: string;
  institution_name: string;
  institution_address: string;
  contact_email: string;
  contact_phone: string;
  logo_url: string;
}

interface FormData {
  type: string;
  category_id: string;
  unit_id: string;
  priority: string;
  title: string;
  description: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string;
  submitter_address: string;
  is_anonymous: boolean;
}

const TiketInternal: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [submittedTicketData, setSubmittedTicketData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Master Data
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    app_name: 'Sistem Pengaduan',
    app_footer: '',
    institution_name: '',
    institution_address: '',
    contact_email: '',
    contact_phone: '',
    logo_url: ''
  });

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    type: 'information',
    category_id: '',
    unit_id: '',
    priority: 'medium',
    title: '',
    description: '',
    submitter_name: user?.full_name || '',
    submitter_email: user?.email || '',
    submitter_phone: '',
    submitter_address: '',
    is_anonymous: false
  });

  const priorities = [
    { value: 'low', label: 'Rendah', color: 'bg-green-500', icon: 'arrow_downward' },
    { value: 'medium', label: 'Sedang', color: 'bg-yellow-500', icon: 'remove' },
    { value: 'high', label: 'Tinggi', color: 'bg-orange-500', icon: 'arrow_upward' },
    { value: 'critical', label: 'Kritis', color: 'bg-red-500', icon: 'priority_high' }
  ];

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        submitter_name: user.full_name || '',
        submitter_email: user.email || ''
      }));
    }
  }, [user]);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch units
      const { data: unitsData } = await supabase
        .from('units')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      // Fetch service categories
      const { data: categoriesData } = await supabase
        .from('service_categories')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      // Fetch app settings
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['app_name', 'app_footer', 'institution_name', 'institution_address', 'contact_email', 'contact_phone', 'logo_url']);

      if (unitsData) setUnits(unitsData);
      if (categoriesData) setCategories(categoriesData);

      if (settingsData) {
        const settings: Partial<AppSettings> = {};
        settingsData.forEach((item: { setting_key: string; setting_value: string }) => {
          (settings as any)[item.setting_key] = item.setting_value || '';
        });
        setAppSettings(prev => ({ ...prev, ...settings }));
      }
    } catch (err: any) {
      setError('Gagal memuat data master');
      console.error('Error fetching master data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INT-${year}${month}${day}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const ticketNum = generateTicketNumber();
      const now = new Date();
      const slaDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 jam

      const { error: insertError } = await supabase
        .from('tickets')
        .insert({
          ticket_number: ticketNum,
          type: formData.type,
          category_id: formData.category_id || null,
          unit_id: formData.unit_id,
          priority: formData.priority,
          title: formData.title,
          description: formData.description,
          submitter_name: formData.is_anonymous ? 'Anonim' : formData.submitter_name,
          submitter_email: formData.is_anonymous ? null : formData.submitter_email,
          submitter_phone: formData.is_anonymous ? null : formData.submitter_phone,
          submitter_address: formData.is_anonymous ? null : formData.submitter_address,
          is_anonymous: formData.is_anonymous,
          status: 'open',
          source: 'web',
          sla_deadline: slaDeadline.toISOString(),
          created_by: user?.id || null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Simpan data tiket untuk PDF
      const selectedUnit = units.find(u => u.id === formData.unit_id);
      const selectedCategory = categories.find(c => c.id === formData.category_id);
      
      setSubmittedTicketData({
        ticket_number: ticketNum,
        title: formData.title,
        description: formData.description,
        category: selectedCategory?.name || '-',
        priority: formData.priority,
        unit_name: selectedUnit?.name || '-',
        reporter_name: formData.is_anonymous ? 'Anonim' : formData.submitter_name,
        reporter_email: formData.is_anonymous ? null : formData.submitter_email,
        reporter_phone: formData.is_anonymous ? null : formData.submitter_phone,
        reporter_address: formData.is_anonymous ? null : formData.submitter_address,
        created_at: now.toISOString(),
        type: 'internal'
      });

      setTicketNumber(ticketNum);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat tiket');
      console.error('Error creating ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setTicketNumber('');
    setSubmittedTicketData(null);
    setFormData({
      type: 'information',
      category_id: '',
      unit_id: '',
      priority: 'medium',
      title: '',
      description: '',
      submitter_name: user?.full_name || '',
      submitter_email: user?.email || '',
      submitter_phone: '',
      submitter_address: '',
      is_anonymous: false
    });
  };

  const handleDownloadPDF = () => {
    if (submittedTicketData) {
      downloadInternalTicketPDF({
        ticket_number: submittedTicketData.ticket_number,
        reporter_name: submittedTicketData.reporter_name,
        reporter_email: submittedTicketData.reporter_email || '-',
        reporter_phone: submittedTicketData.reporter_phone || '-',
        reporter_address: submittedTicketData.unit_name,
        category: submittedTicketData.category,
        priority: submittedTicketData.priority,
        title: submittedTicketData.title,
        description: submittedTicketData.description,
        unit_name: submittedTicketData.unit_name,
        created_at: submittedTicketData.created_at || new Date().toISOString(),
        type: 'internal'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Success Screen
  if (submitted) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <span className="material-symbols-outlined text-white text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tiket Berhasil Dibuat!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Tiket Anda telah berhasil dikirim dan akan segera diproses</p>
          
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 mb-6 text-white">
            <p className="text-white/80 text-sm mb-1">Nomor Tiket</p>
            <p className="text-3xl font-bold tracking-wider">{ticketNumber}</p>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Simpan nomor tiket ini untuk melacak status pengaduan Anda
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleDownloadPDF}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">download</span>
              Unduh Tiket (PDF)
            </button>
            
            <div className="flex gap-3">
              <button 
                onClick={resetForm}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Buat Tiket Baru
              </button>
              <button 
                onClick={() => window.location.href = '/tickets'}
                className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">list</span>
                Lihat Daftar Tiket
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {appSettings.app_footer && <p className="mb-1">{appSettings.app_footer}</p>}
          <p>{appSettings.institution_name}</p>
          {appSettings.institution_address && <p className="text-xs mt-1">{appSettings.institution_address}</p>}
        </footer>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">assignment_add</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tiket Internal</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Buat tiket baru untuk pelaporan internal</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
        {/* Data Pelapor */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Data Pelapor
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="submitter_name"
                value={formData.submitter_name}
                onChange={handleInputChange}
                required
                disabled={formData.is_anonymous}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
                placeholder="Masukkan nama lengkap"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="submitter_email"
                value={formData.submitter_email}
                onChange={handleInputChange}
                required
                disabled={formData.is_anonymous}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor Telepon
              </label>
              <input
                type="tel"
                name="submitter_phone"
                value={formData.submitter_phone}
                onChange={handleInputChange}
                disabled={formData.is_anonymous}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat
              </label>
              <input
                type="text"
                name="submitter_address"
                value={formData.submitter_address}
                onChange={handleInputChange}
                disabled={formData.is_anonymous}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
                placeholder="Alamat lengkap"
              />
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="mt-4 flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_anonymous"
                checked={formData.is_anonymous}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
            </label>
            <span className="text-sm text-slate-600 dark:text-slate-400">Kirim sebagai anonim</span>
          </div>
        </div>

        {/* Detail Tiket */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">description</span>
            Detail Tiket
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jenis Tiket */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Jenis Tiket <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="information">Permintaan Informasi</option>
                <option value="complaint">Pengaduan</option>
                <option value="suggestion">Saran</option>
                <option value="satisfaction">Kepuasan</option>
              </select>
            </div>

            {/* Unit Tujuan */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Unit Tujuan <span className="text-red-500">*</span>
              </label>
              <select
                name="unit_id"
                value={formData.unit_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Pilih Unit Tujuan</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>

            {/* Kategori Layanan */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori Layanan
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Pilih Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Prioritas */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Prioritas <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {priorities.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                    className={`p-2.5 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      formData.priority === p.value
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${p.color}`}></div>
                    <span className={`text-xs font-medium ${
                      formData.priority === p.value ? 'text-primary' : 'text-slate-600 dark:text-slate-400'
                    }`}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Judul */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Judul Tiket <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Ringkasan singkat masalah atau permintaan"
            />
          </div>

          {/* Deskripsi */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Deskripsi Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={5}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Jelaskan secara detail masalah atau permintaan Anda..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Mengirim...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">send</span>
                Kirim Tiket
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            {appSettings.logo_url && (
              <img src={appSettings.logo_url} alt="Logo" className="h-8 w-auto" />
            )}
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">{appSettings.institution_name || 'Instansi'}</p>
              {appSettings.app_footer && <p className="text-xs">{appSettings.app_footer}</p>}
            </div>
          </div>
          <div className="text-center md:text-right">
            {appSettings.institution_address && <p className="text-xs">{appSettings.institution_address}</p>}
            <div className="flex items-center justify-center md:justify-end gap-4 mt-1">
              {appSettings.contact_email && (
                <span className="flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-sm">email</span>
                  {appSettings.contact_email}
                </span>
              )}
              {appSettings.contact_phone && (
                <span className="flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-sm">phone</span>
                  {appSettings.contact_phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TiketInternal;
