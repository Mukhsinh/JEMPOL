import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { submitSurveyDirectly } from '../../utils/surveyFallback';

interface AppSettings {
    app_footer?: string;
    institution_name?: string;
    institution_address?: string;
    contact_phone?: string;
    contact_email?: string;
}

interface Unit {
    id: string;
    name: string;
    code: string;
    is_active?: boolean;
}

const PublicSurveyForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const qrCode = searchParams.get('qr') || searchParams.get('qrCode') || searchParams.get('qr_code');
    const unitIdFromUrl = searchParams.get('unit_id');
    const unitNameFromUrl = searchParams.get('unit_name');

    // State for form data
    const [formData, setFormData] = useState({
        unit_tujuan: unitNameFromUrl ? decodeURIComponent(unitNameFromUrl) : '',
        unit_id: unitIdFromUrl || '',
        service_type: '',
        full_name: '',
        is_anonymous: false,
        phone: '',
        email: '',
        job: '',
        education: '',
        patient_type: '',
        provinsi: '',
        kota_kabupaten: '',
        kecamatan: '',
        kelurahan: '',
        age: '',
        gender: '',
        // 9 Unsur dengan 3 indikator masing-masing (27 indikator total)
        u1_i1: '', u1_i2: '', u1_i3: '', // Persyaratan
        u2_i1: '', u2_i2: '', u2_i3: '', // Prosedur
        u3_i1: '', u3_i2: '', u3_i3: '', // Waktu Pelayanan
        u4_i1: '', u4_i2: '', u4_i3: '', // Biaya/Tarif
        u5_i1: '', u5_i2: '', u5_i3: '', // Produk Layanan
        u6_i1: '', u6_i2: '', u6_i3: '', // Kompetensi Pelaksana
        u7_i1: '', u7_i2: '', u7_i3: '', // Perilaku Pelaksana
        u8_i1: '', u8_i2: '', u8_i3: '', // Sarana dan Prasarana
        u9_i1: '', u9_i2: '', u9_i3: '', // Penanganan Pengaduan
        overall_satisfaction: '',
        suggestions: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [appSettings, setAppSettings] = useState<AppSettings>({});
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(true);

    useEffect(() => {
        loadAppSettings();
        loadUnits();
    }, []);

    const loadAppSettings = async () => {
        try {
            const res = await fetch('/api/app-settings/public');
            if (res.ok) {
                const r = await res.json();
                if (r.success && r.data) {
                    const settings: AppSettings = {};
                    r.data.forEach((item: { setting_key: string; setting_value: string }) => {
                        settings[item.setting_key as keyof AppSettings] = item.setting_value;
                    });
                    setAppSettings(settings);
                }
            }
        } catch (e) {
            console.error('Error loading app settings:', e);
        }
    };

    const loadUnits = async () => {
        setLoadingUnits(true);
        try {
            const res = await fetch('/api/public/units');
            if (res.ok) {
                const r = await res.json();
                const unitsData = Array.isArray(r) ? r : (r.data || []);
                const activeUnits = unitsData.filter((u: Unit) => u.is_active !== false);
                setUnits(activeUnits);
                
                // Jika ada unit dari URL, set nama unit
                if (unitIdFromUrl && activeUnits.length > 0) {
                    const selectedUnit = activeUnits.find((u: Unit) => u.id === unitIdFromUrl);
                    if (selectedUnit) {
                        setFormData(prev => ({
                            ...prev,
                            unit_tujuan: selectedUnit.name,
                            unit_id: selectedUnit.id
                        }));
                    }
                }
            }
        } catch (e) {
            console.error('Error loading units:', e);
        } finally {
            setLoadingUnits(false);
        }
    };

    // Update unit jika ada dari URL
    useEffect(() => {
        if (unitNameFromUrl) {
            setFormData(prev => ({
                ...prev,
                unit_tujuan: decodeURIComponent(unitNameFromUrl),
                unit_id: unitIdFromUrl || ''
            }));
        }
    }, [unitIdFromUrl, unitNameFromUrl]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        // Jika yang diubah adalah unit_id, update juga unit_tujuan
        if (name === 'unit_id') {
            const selectedUnit = units.find(u => u.id === value);
            setFormData(prev => ({
                ...prev,
                unit_id: value,
                unit_tujuan: selectedUnit ? selectedUnit.name : ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleRadioChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Validasi unit
        if (!formData.unit_id) {
            setError('Silakan pilih unit layanan terlebih dahulu');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        // Validasi service type
        if (!formData.service_type) {
            setError('Silakan pilih jenis layanan terlebih dahulu');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        // Validasi phone
        if (!formData.phone) {
            setError('Nomor HP wajib diisi');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        setIsLoading(true);

        try {
            // Coba gunakan backend API terlebih dahulu
            try {
                const response = await fetch('/api/public/survey/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        qr_code: qrCode
                    })
                });

                // Cek apakah response adalah JSON
                const contentType = response.headers.get('content-type');
                let result;
                
                if (contentType && contentType.includes('application/json')) {
                    result = await response.json();
                } else {
                    const text = await response.text();
                    console.error('Response bukan JSON:', text);
                    throw new Error('Server mengembalikan response yang tidak valid. Silakan coba lagi.');
                }

                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Gagal mengirim survei');
                }

                setIsSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (backendError: any) {
                console.warn('⚠️ Backend tidak tersedia, menggunakan Supabase langsung:', backendError.message);
                
                // Fallback: Gunakan Supabase client langsung
                const result = await submitSurveyDirectly({
                    ...formData,
                    qr_code: qrCode
                });
                
                if (result.success) {
                    setIsSubmitted(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    throw new Error('Gagal mengirim survei');
                }
            }

        } catch (error: any) {
            console.error('Error submitting survey:', error);
            setError(error.message || 'Terjadi kesalahan saat mengirim survei');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center font-display">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-3xl font-black text-text-main dark:text-white mb-3">Terima Kasih!</h2>
                    <p className="text-lg text-text-sub dark:text-gray-400 mb-8 leading-relaxed">
                        Survei Anda telah berhasil dikirim. Masukan Anda sangat berharga bagi peningkatan kualitas layanan kami.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                setIsSubmitted(false);
                                setFormData(prev => ({
                                    ...prev,
                                    service_type: '',
                                    full_name: '',
                                    is_anonymous: false,
                                    phone: '',
                                    email: '',
                                    job: '',
                                    age: '',
                                    gender: '',
                                    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '',
                                    overall_satisfaction: '',
                                    suggestions: ''
                                }));
                                window.scrollTo(0, 0);
                            }}
                            className="w-full px-6 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all"
                        >
                            Isi Survei Lagi
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full px-6 py-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-main dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 9 Unsur Layanan dengan 3 Indikator masing-masing
    const serviceElements = [
        {
            id: 'u1',
            code: 'U1',
            title: 'Persyaratan',
            icon: '📋',
            indicators: [
                { id: 'u1_i1', text: 'Persyaratan pelayanan yang diinformasikan jelas dan mudah dipahami' },
                { id: 'u1_i2', text: 'Persyaratan pelayanan mudah dipenuhi oleh pengguna layanan' },
                { id: 'u1_i3', text: 'Persyaratan pelayanan sesuai dengan jenis layanan yang diberikan' }
            ]
        },
        {
            id: 'u2',
            code: 'U2',
            title: 'Prosedur',
            icon: '📝',
            indicators: [
                { id: 'u2_i1', text: 'Prosedur atau alur pelayanan diinformasikan dengan jelas' },
                { id: 'u2_i2', text: 'Prosedur pelayanan mudah diikuti oleh pengguna layanan' },
                { id: 'u2_i3', text: 'Pelaksanaan pelayanan sesuai dengan prosedur yang telah ditetapkan' }
            ]
        },
        {
            id: 'u3',
            code: 'U3',
            title: 'Waktu Pelayanan',
            icon: '⏱️',
            indicators: [
                { id: 'u3_i1', text: 'Informasi mengenai jangka waktu pelayanan disampaikan dengan jelas' },
                { id: 'u3_i2', text: 'Pelayanan diselesaikan sesuai dengan standar waktu pelayanan' },
                { id: 'u3_i3', text: 'Tidak terdapat keterlambatan pelayanan tanpa alasan yang jelas' }
            ]
        },
        {
            id: 'u4',
            code: 'U4',
            title: 'Biaya/Tarif',
            icon: '💰',
            indicators: [
                { id: 'u4_i1', text: 'Informasi biaya atau tarif pelayanan disampaikan secara jelas' },
                { id: 'u4_i2', text: 'Biaya yang dibayarkan sesuai dengan ketentuan yang berlaku' },
                { id: 'u4_i3', text: 'Tidak terdapat pungutan di luar biaya/tarif resmi' }
            ]
        },
        {
            id: 'u5',
            code: 'U5',
            title: 'Produk Layanan',
            icon: '📦',
            indicators: [
                { id: 'u5_i1', text: 'Hasil pelayanan yang diterima sesuai dengan ketentuan yang ditetapkan' },
                { id: 'u5_i2', text: 'Produk pelayanan diterima secara lengkap dan benar' },
                { id: 'u5_i3', text: 'Kualitas produk pelayanan sesuai standar pelayanan' }
            ]
        },
        {
            id: 'u6',
            code: 'U6',
            title: 'Kompetensi Pelaksana',
            icon: '👨‍⚕️',
            indicators: [
                { id: 'u6_i1', text: 'Petugas memiliki pengetahuan yang memadai dalam memberikan pelayanan' },
                { id: 'u6_i2', text: 'Petugas memiliki keterampilan yang baik dalam melayani pengguna' },
                { id: 'u6_i3', text: 'Petugas mampu memberikan pelayanan secara profesional' }
            ]
        },
        {
            id: 'u7',
            code: 'U7',
            title: 'Perilaku Pelaksana',
            icon: '😊',
            indicators: [
                { id: 'u7_i1', text: 'Petugas bersikap sopan dan ramah dalam memberikan pelayanan' },
                { id: 'u7_i2', text: 'Petugas memberikan pelayanan dengan sikap membantu' },
                { id: 'u7_i3', text: 'Petugas melayani tanpa membedakan latar belakang pengguna' }
            ]
        },
        {
            id: 'u8',
            code: 'U8',
            title: 'Sarana dan Prasarana',
            icon: '🏥',
            indicators: [
                { id: 'u8_i1', text: 'Sarana dan prasarana pelayanan tersedia dengan memadai' },
                { id: 'u8_i2', text: 'Sarana dan prasarana pelayanan dalam kondisi baik dan layak digunakan' },
                { id: 'u8_i3', text: 'Lingkungan pelayanan bersih, nyaman, dan aman' }
            ]
        },
        {
            id: 'u9',
            code: 'U9',
            title: 'Penanganan Pengaduan',
            icon: '📞',
            indicators: [
                { id: 'u9_i1', text: 'Tersedia sarana pengaduan yang mudah diakses pengguna layanan' },
                { id: 'u9_i2', text: 'Pengaduan ditindaklanjuti dengan cepat dan jelas' },
                { id: 'u9_i3', text: 'Pengguna mendapatkan informasi hasil penanganan pengaduan' }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 font-['Inter',sans-serif] overflow-y-auto">
            {/* Decorative Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
            </div>

            {/* Simple Mobile Header - Modern */}
            <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 flex-shrink-0 sticky top-0">
                <div className="max-w-lg mx-auto px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <span className="material-symbols-outlined text-white text-xl">rate_review</span>
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Survei Kepuasan
                        </h1>
                    </div>
                </div>
            </header>

            <main className="relative z-10 w-full max-w-lg mx-auto px-5 py-6 pb-24">{/* Tambah padding bottom untuk scroll */}
                {error && (
                    <div className="mb-6 bg-rose-50/90 backdrop-blur-xl border-2 border-rose-200 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
                        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-white text-xl">error</span>
                        </div>
                        <p className="text-rose-700 text-sm font-medium flex-1">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <section className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/30 text-white">
                                <span className="material-symbols-outlined text-3xl">location_on</span>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Pilih Unit Layanan *</label>
                                <p className="text-xs text-gray-500 mb-3">Pilih unit yang ingin Anda nilai</p>
                            </div>
                        </div>
                        
                        {formData.unit_id && formData.unit_tujuan ? (
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border-2 border-emerald-200">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-500 text-2xl">verified</span>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-600">Unit Terverifikasi</p>
                                        <p className="text-lg font-bold text-gray-900">{formData.unit_tujuan}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">apartment</span>
                                    <select
                                        name="unit_id"
                                        value={formData.unit_id}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loadingUnits}
                                        className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">-- Pilih Unit Layanan --</option>
                                        {loadingUnits ? (
                                            <option value="" disabled>Memuat data unit...</option>
                                        ) : units.length === 0 ? (
                                            <option value="" disabled>Tidak ada unit tersedia</option>
                                        ) : (
                                            units.map(unit => (
                                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                                            ))
                                        )}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                </div>
                                {units.length === 0 && !loadingUnits && (
                                    <button
                                        type="button"
                                        onClick={loadUnits}
                                        className="w-full mt-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">refresh</span>
                                        <span>Muat Ulang Data Unit</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </section>

                    <section className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100/50 bg-gradient-to-br from-gray-50/50 to-white flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                                <span className="material-symbols-outlined text-white text-xl">person</span>
                            </div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Data Responden</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-800 mb-3">Jenis Layanan yang Diterima <span className="text-rose-500">*</span></label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['rawat_jalan', 'rawat_inap', 'darurat', 'lainnya'].map((type) => (
                                        <label key={type} className="cursor-pointer relative group">
                                            <input
                                                type="radio"
                                                name="service_type"
                                                value={type}
                                                checked={formData.service_type === type}
                                                onChange={(e) => handleRadioChange('service_type', e.target.value)}
                                                className="custom-radio sr-only"
                                            />
                                            <div className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all h-full shadow-sm ${formData.service_type === type ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 shadow-lg shadow-emerald-500/20' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'}`}>
                                                <div className={`radio-dot w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${formData.service_type === type ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]' : 'border-gray-300 bg-transparent'}`}></div>
                                                <span className="text-sm font-bold capitalize">{type.replace('_', ' ')}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <hr className="border-gray-100/50" />
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-bold text-gray-800" htmlFor="full_name">Nama Lengkap</label>
                                    <label className="inline-flex items-center cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="is_anonymous"
                                            checked={formData.is_anonymous}
                                            onChange={handleInputChange}
                                            className="rounded-lg border-gray-300 text-emerald-500 focus:ring-emerald-500/20 h-5 w-5 cursor-pointer"
                                        />
                                        <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Kirim sebagai Anonim</span>
                                    </label>
                                </div>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-emerald-500 transition-colors">badge</span>
                                    <input
                                        type="text"
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        disabled={formData.is_anonymous}
                                        placeholder="Masukkan nama lengkap Anda"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base shadow-sm disabled:opacity-50 disabled:bg-gray-50"
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-800" htmlFor="phone">Nomor HP (WhatsApp) <span className="text-rose-500">*</span></label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-emerald-500 transition-colors">smartphone</span>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="08xxxxxxxxxx"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-800" htmlFor="email">Email <span className="text-gray-500 font-normal">(Opsional)</span></label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-emerald-500 transition-colors">mail</span>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="contoh@email.com"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-800" htmlFor="job">Pekerjaan <span className="text-gray-500 font-normal">(Opsional)</span></label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-emerald-500 transition-colors">work</span>
                                        <input
                                            type="text"
                                            id="job"
                                            name="job"
                                            value={formData.job}
                                            onChange={handleInputChange}
                                            placeholder="PNS, Swasta, Wiraswasta, dll"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-800" htmlFor="education">Pendidikan Terakhir <span className="text-gray-500 font-normal">(Opsional)</span></label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">school</span>
                                        <select
                                            id="education"
                                            name="education"
                                            value={formData.education}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">Pilih Pendidikan</option>
                                            <option value="SD">SD</option>
                                            <option value="SMP">SMP</option>
                                            <option value="SMA/SMK">SMA/SMK</option>
                                            <option value="D1/D2/D3">D1/D2/D3</option>
                                            <option value="D4/S1">D4/S1</option>
                                            <option value="S2">S2</option>
                                            <option value="S3">S3</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-800" htmlFor="patient_type">Jenis Pasien <span className="text-gray-500 font-normal">(Opsional)</span></label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">medical_information</span>
                                        <select
                                            id="patient_type"
                                            name="patient_type"
                                            value={formData.patient_type}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">Pilih Jenis Pasien</option>
                                            <option value="BPJS">BPJS</option>
                                            <option value="Umum">Umum</option>
                                            <option value="Asuransi">Asuransi</option>
                                            <option value="Perusahaan">Perusahaan</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-800 mb-3">Alamat Domisili</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">location_city</span>
                                        <select
                                            name="provinsi"
                                            value={formData.provinsi}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">Pilih Provinsi</option>
                                            <option value="Jawa Tengah">Jawa Tengah</option>
                                            <option value="Jawa Barat">Jawa Barat</option>
                                            <option value="Jawa Timur">Jawa Timur</option>
                                            <option value="DKI Jakarta">DKI Jakarta</option>
                                            <option value="DI Yogyakarta">DI Yogyakarta</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">apartment</span>
                                        <select
                                            name="kota_kabupaten"
                                            value={formData.kota_kabupaten}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">Pilih Kota/Kabupaten</option>
                                            <option value="Kota Semarang">Kota Semarang</option>
                                            <option value="Kabupaten Semarang">Kabupaten Semarang</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">signpost</span>
                                        <select
                                            name="kecamatan"
                                            value={formData.kecamatan}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">Pilih Kecamatan</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">home</span>
                                        <select
                                            name="kelurahan"
                                            value={formData.kelurahan}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">Pilih Kelurahan/Desa</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>
                            <hr className="border-gray-100/50" />
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-800 mb-3">Usia Responden</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['< 20 Th', '20 - 40 Th', '41 - 60 Th', '> 60 Th'].map((range) => (
                                            <label key={range} className="cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="age"
                                                    value={range}
                                                    checked={formData.age === range}
                                                    onChange={(e) => handleRadioChange('age', e.target.value)}
                                                    className="peer sr-only"
                                                />
                                                <span className="inline-flex px-5 py-3 rounded-xl border-2 border-gray-200 bg-white text-base font-bold text-gray-600 peer-checked:bg-gradient-to-br peer-checked:from-emerald-500 peer-checked:to-teal-500 peer-checked:text-white peer-checked:border-emerald-500 peer-checked:shadow-lg peer-checked:shadow-emerald-500/30 transition-all hover:border-gray-300">
                                                    {range}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-800 mb-3">Jenis Kelamin</label>
                                    <div className="flex gap-3">
                                        <label className="flex-1 cursor-pointer relative group">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="male"
                                                checked={formData.gender === 'male'}
                                                onChange={(e) => handleRadioChange('gender', e.target.value)}
                                                className="custom-radio sr-only"
                                            />
                                            <div className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all shadow-sm ${formData.gender === 'male' ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 shadow-lg shadow-emerald-500/20' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'}`}>
                                                <span className="material-symbols-outlined text-2xl">male</span>
                                                <span className="text-base font-bold">Laki-laki</span>
                                            </div>
                                        </label>
                                        <label className="flex-1 cursor-pointer relative group">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="female"
                                                checked={formData.gender === 'female'}
                                                onChange={(e) => handleRadioChange('gender', e.target.value)}
                                                className="custom-radio sr-only"
                                            />
                                            <div className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all shadow-sm ${formData.gender === 'female' ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 shadow-lg shadow-emerald-500/20' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'}`}>
                                                <span className="material-symbols-outlined text-2xl">female</span>
                                                <span className="text-base font-bold">Perempuan</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100/50 bg-gradient-to-br from-gray-50/50 to-white">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                                    <span className="material-symbols-outlined text-white text-xl">analytics</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Penilaian Unsur Layanan</h3>
                                    <p className="text-xs text-gray-500">Beri penilaian untuk setiap indikator dari 1 (Sangat Tidak Setuju) hingga 5 (Sangat Setuju)</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100/50">
                            {serviceElements.map((element, idx) => (
                                <div key={element.id} className="p-6 hover:bg-gradient-to-br hover:from-emerald-50/30 hover:to-teal-50/30 transition-all">
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-2xl">
                                            {element.icon}
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{element.code}</span>
                                            <h4 className="text-lg font-bold text-gray-800">{element.title}</h4>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {element.indicators.map((indicator, indicatorIdx) => (
                                            <div key={indicator.id} className="bg-gray-50/50 rounded-xl p-4">
                                                <p className="text-sm font-medium text-gray-700 mb-3 leading-relaxed">
                                                    <span className="inline-block w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center mr-2">{indicatorIdx + 1}</span>
                                                    {indicator.text}
                                                </p>
                                                <div className="flex items-center justify-between gap-2">
                                                    {[1, 2, 3, 4, 5].map((val) => {
                                                        const colors = ['text-rose-600', 'text-orange-500', 'text-amber-400', 'text-emerald-500', 'text-teal-600'];
                                                        const bgColors = ['bg-rose-50', 'bg-orange-50', 'bg-amber-50', 'bg-emerald-50', 'bg-teal-50'];
                                                        const borderColors = ['border-rose-500', 'border-orange-500', 'border-amber-400', 'border-emerald-500', 'border-teal-600'];
                                                        const shadowColors = ['shadow-rose-500/30', 'shadow-orange-500/30', 'shadow-amber-400/30', 'shadow-emerald-500/30', 'shadow-teal-600/30'];
                                                        const icons = ['sentiment_very_dissatisfied', 'sentiment_dissatisfied', 'sentiment_neutral', 'sentiment_satisfied', 'sentiment_very_satisfied'];

                                                        const isChecked = (formData as any)[indicator.id] === val.toString();

                                                        return (
                                                            <label key={val} className="cursor-pointer group relative flex flex-col items-center flex-1">
                                                                <input
                                                                    type="radio"
                                                                    name={indicator.id}
                                                                    value={val}
                                                                    checked={isChecked}
                                                                    onChange={(e) => handleRadioChange(indicator.id, e.target.value)}
                                                                    className="rating-input sr-only"
                                                                />
                                                                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isChecked ? `${borderColors[val - 1]} ${bgColors[val - 1]} ${colors[val - 1]} shadow-lg ${shadowColors[val - 1]}` : 'border-gray-200 bg-white text-gray-300 group-hover:bg-gray-50 group-hover:border-gray-300'}`}>
                                                                    <span className={`rating-icon material-symbols-outlined text-2xl transition-transform duration-200 ${isChecked ? 'scale-110' : ''}`}>{icons[val - 1]}</span>
                                                                </div>
                                                                <span className={`text-[10px] font-medium mt-1 ${isChecked ? colors[val - 1] : 'text-gray-400'}`}>{val}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="grid md:grid-cols-12 gap-6">
                        <div className="md:col-span-12 bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/50 shadow-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-orange-50/50 to-rose-50/50 pointer-events-none"></div>
                            <div className="relative z-10 text-center mb-10">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                    <span className="material-symbols-outlined text-white text-3xl">star</span>
                                </div>
                                <h3 className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">Kepuasan Keseluruhan Layanan</h3>
                                <p className="text-gray-600">Secara umum, bagaimana tingkat kepuasan Anda terhadap pelayanan kami?</p>
                            </div>
                            <div className="relative z-10 flex flex-wrap justify-center gap-4 md:gap-10">
                                {[
                                    { val: 'sangat_tidak_puas', label: 'Sangat Buruk', icon: 'sentiment_very_dissatisfied', color: 'rose', gradient: 'from-rose-400 to-red-500' },
                                    { val: 'tidak_puas', label: 'Buruk', icon: 'sentiment_dissatisfied', color: 'orange', gradient: 'from-orange-400 to-amber-500' },
                                    { val: 'kurang_puas', label: 'Cukup', icon: 'sentiment_neutral', color: 'amber', gradient: 'from-amber-400 to-yellow-500' },
                                    { val: 'puas', label: 'Baik', icon: 'sentiment_satisfied', color: 'emerald', gradient: 'from-emerald-400 to-green-500' },
                                    { val: 'sangat_puas', label: 'Sangat Baik', icon: 'sentiment_very_satisfied', color: 'teal', gradient: 'from-teal-400 to-cyan-500' }
                                ].map((item) => {
                                    const isChecked = formData.overall_satisfaction === item.val;
                                    return (
                                        <label key={item.val} className="cursor-pointer group flex flex-col items-center gap-3">
                                            <input
                                                type="radio"
                                                name="overall_satisfaction"
                                                value={item.val}
                                                checked={isChecked}
                                                onChange={(e) => handleRadioChange('overall_satisfaction', e.target.value)}
                                                className="rating-input sr-only"
                                            />
                                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isChecked ? `border-${item.color}-500 bg-gradient-to-br ${item.gradient} text-white shadow-2xl shadow-${item.color}-500/40` : 'border-gray-200 bg-white text-gray-300 group-hover:bg-gray-50 group-hover:border-gray-300'}`}>
                                                <span className="rating-icon material-symbols-outlined text-4xl md:text-5xl">{item.icon}</span>
                                            </div>
                                            <span className={`text-xs font-bold transition-colors ${isChecked ? `text-${item.color}-600` : 'text-gray-400 group-hover:text-gray-500'}`}>{item.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="md:col-span-12 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2" htmlFor="suggestions">
                                    <span className="material-symbols-outlined text-emerald-500">edit_note</span>
                                    Saran dan Keluhan
                                </label>
                                <textarea
                                    id="suggestions"
                                    name="suggestions"
                                    value={formData.suggestions}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Tuliskan saran atau keluhan Anda di sini untuk perbaikan pelayanan kami..."
                                    className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base resize-none shadow-sm"
                                ></textarea>
                            </div>
                            <div className="pt-4 border-t border-gray-100/50">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3" htmlFor="date">Tanggal Survei</label>
                                <div className="relative max-w-sm group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-emerald-500 transition-colors">calendar_today</span>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4 pb-12">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-lg shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-lg flex items-center justify-center gap-3 group"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                                    <span>Mengirim Survei...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">send</span>
                                    <span>Kirim Survei</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>

            <footer className="relative z-10 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 py-6 px-4">
                <div className="max-w-lg mx-auto text-center space-y-2">
                    {appSettings.institution_name && (
                        <p className="text-sm font-bold text-gray-800">{appSettings.institution_name}</p>
                    )}
                    {appSettings.institution_address && (
                        <p className="text-xs text-gray-500">{appSettings.institution_address}</p>
                    )}
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                        {appSettings.contact_phone && (
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">call</span>
                                {appSettings.contact_phone}
                            </span>
                        )}
                        {appSettings.contact_email && (
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">mail</span>
                                {appSettings.contact_email}
                            </span>
                        )}
                    </div>
                    {appSettings.app_footer && (
                        <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">{appSettings.app_footer}</p>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default PublicSurveyForm;