import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { submitSurveyDirectly } from '../../utils/surveyFallback';
import { wilayahIndonesia, getKecamatanByKabupaten } from '../../data/wilayahIndonesia';

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
        provinsi: 'Jawa Tengah',
        kota_kabupaten: '',
        kecamatan: '',
        alamat_detail: '',
        age: '',
        gender: '',
        // 11 Unsur Survei IKM (1 pertanyaan per unsur)
        q1: '', // U1 - Persyaratan
        q2: '', // U2 - Prosedur
        q3: '', // U3 - Waktu Pelayanan
        q4: '', // U4 - Biaya/Tarif
        q5: '', // U5 - Produk Layanan
        q6: '', // U6 - Kompetensi Pelaksana
        q7: '', // U7 - Perilaku Pelaksana
        q8: '', // U8 - Sarana dan Prasarana
        q9: '', // U9 - Penanganan Pengaduan
        q10: '', // U10 - Transparansi
        q11: '', // U11 - Integritas
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
    const [kecamatanList, setKecamatanList] = useState<any[]>([]);

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
        } 
        // Jika yang diubah adalah kota_kabupaten, update kecamatan list dan simpan nama
        else if (name === 'kota_kabupaten') {
            const selectedKabupaten = wilayahIndonesia.find(k => k.nama === value);
            setKecamatanList(selectedKabupaten?.kecamatan || []);
            setFormData(prev => ({
                ...prev,
                kota_kabupaten: value,
                kecamatan: '',
                provinsi: 'Jawa Tengah'
            }));
        }
        // Jika yang diubah adalah kecamatan, simpan nama
        else if (name === 'kecamatan') {
            setFormData(prev => ({
                ...prev,
                kecamatan: value
            }));
        }
        else {
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
                                    // Reset 11 pertanyaan survei
                                    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', 
                                    q7: '', q8: '', q9: '', q10: '', q11: '',
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

    // 11 Unsur Survei IKM (1 pertanyaan per unsur) - 4 Alternatif Jawaban dengan Label Spesifik
    const serviceElements = [
        {
            id: 'q1',
            code: 'U1',
            title: 'Persyaratan',
            icon: '📋',
            emoji: ['😞', '😕', '🙂', '😊'],
            text: 'Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?',
            options: [
                { value: 1, label: 'Tidak Sesuai', emoji: '😞' },
                { value: 2, label: 'Kurang Sesuai', emoji: '😕' },
                { value: 3, label: 'Sesuai', emoji: '🙂' },
                { value: 4, label: 'Sangat Sesuai', emoji: '😊' }
            ]
        },
        {
            id: 'q2',
            code: 'U2',
            title: 'Prosedur',
            icon: '📝',
            emoji: ['😞', '😕', '🙂', '😊'],
            text: 'Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?',
            options: [
                { value: 1, label: 'Tidak Mudah', emoji: '😞' },
                { value: 2, label: 'Kurang Mudah', emoji: '😕' },
                { value: 3, label: 'Mudah', emoji: '🙂' },
                { value: 4, label: 'Sangat Mudah', emoji: '😊' }
            ]
        },
        {
            id: 'q3',
            code: 'U3',
            title: 'Waktu Pelayanan',
            icon: '⏱️',
            emoji: ['😞', '😕', '🙂', '😊'],
            text: 'Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?',
            options: [
                { value: 1, label: 'Tidak Cepat', emoji: '😞' },
                { value: 2, label: 'Kurang Cepat', emoji: '😕' },
                { value: 3, label: 'Cepat', emoji: '🙂' },
                { value: 4, label: 'Sangat Cepat', emoji: '😊' }
            ]
        },
        {
            id: 'q4',
            code: 'U4',
            title: 'Biaya/Tarif',
            icon: '🏷️',
            emoji: ['😞', '😕', '🙂', '😊'],
            text: 'Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan?',
            options: [
                { value: 1, label: 'Sangat Mahal', emoji: '😞' },
                { value: 2, label: 'Cukup Mahal', emoji: '😕' },
                { value: 3, label: 'Murah', emoji: '🙂' },
                { value: 4, label: 'Gratis', emoji: '😊' }
            ]
        },
        {
            id: 'q5',
            code: 'U5',
            title: 'Produk Spesifikasi Jenis Layanan',
            icon: '📦',
            emoji: ['😞', '😕', '🙂', '😊'],
            text: 'Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?',
            options: [
                { value: 1, label: 'Tidak Sesuai', emoji: '😞' },
                { value: 2, label: 'Kurang Sesuai', emoji: '😕' },
                { value: 3, label: 'Sesuai', emoji: '🙂' },
                { value: 4, label: 'Sangat Sesuai', emoji: '😊' }
            ]
        },
        {
            id: 'q6',
            code: 'U6',
            title: 'Kompetensi Pelaksana',
            icon: '👨‍⚕️',
            emoji: ['😞', '😕', '🙂', '😊'],
            text: 'Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?',
            options: [
                { value: 1, label: 'Tidak Kompeten', emoji: '😞' },
                { value: 2, label: 'Kurang Kompeten', emoji: '😕' },
                { value: 3, label: 'Kompeten', emoji: '🙂' },
                { value: 4, label: 'Sangat Kompeten', emoji: '😊' }
            ]
        },
        {
            id: 'q7',
            code: 'U7',
            title: 'Perilaku Pelaksana',
            icon: '😊',
            emoji: ['😞', '😕', '🙂', '😊'],
            text: 'Bagaimana pendapat Saudara perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?',
            options: [
                { value: 1, label: 'Tidak Sopan dan Ramah', emoji: '😞' },
                { value: 2, label: 'Kurang Sopan dan Ramah', emoji: '😕' },
                { value: 3, label: 'Sopan dan Ramah', emoji: '🙂' },
                { value: 4, label: 'Sangat Sopan dan Ramah', emoji: '😊' }
            ]
        },
        {
            id: 'q8',
            code: 'U8',
            title: 'Sarana dan Prasarana',
            icon: '🏥',
            emoji: ['😞', '😕', '🙂', '😊'],
            text: 'Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?',
            options: [
                { value: 1, label: 'Buruk', emoji: '😞' },
                { value: 2, label: 'Cukup Baik', emoji: '😕' },
                { value: 3, label: 'Baik', emoji: '🙂' },
                { value: 4, label: 'Sangat Baik', emoji: '😊' }
            ]
        },
        {
            id: 'q9',
            code: 'U9',
            title: 'Penanganan Pengaduan',
            icon: '📞',
            emoji: ['😞', '😕', '🙂', '😊'],
            text: 'Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan?',
            options: [
                { value: 1, label: 'Tidak Ada', emoji: '😞' },
                { value: 2, label: 'Ada Tetapi Tidak Berfungsi', emoji: '😕' },
                { value: 3, label: 'Berfungsi Kurang Maksimal', emoji: '🙂' },
                { value: 4, label: 'Dikelola dengan Baik', emoji: '😊' }
            ]
        },
        {
            id: 'q10',
            code: 'U10',
            title: 'Transparansi Pelayanan',
            icon: '🔍',
            emoji: ['😞', '😕', '🙂', '😊'],
            text: 'Bagaimana pendapat Saudara tentang transparansi pelayanan yang diberikan? (kecukupan informasi mengenai persyaratan, biaya, waktu pelayanan, prosedur dan sebagainya)',
            options: [
                { value: 1, label: 'Tidak Transparan', emoji: '😞' },
                { value: 2, label: 'Kurang Transparan', emoji: '😕' },
                { value: 3, label: 'Transparan', emoji: '🙂' },
                { value: 4, label: 'Sangat Transparan', emoji: '😊' }
            ]
        },
        {
            id: 'q11',
            code: 'U11',
            title: 'Integritas Petugas Pelayanan',
            icon: '✅',
            emoji: ['😞', '😕', '🙂', '😊'],
            text: 'Bagaimana pendapat Saudara tentang integritas petugas pelayanan? (terkait suap, pungutan liar, gratifikasi, dan sebagainya)',
            options: [
                { value: 1, label: 'Petugas Tidak Berintegritas', emoji: '😞' },
                { value: 2, label: 'Petugas Kurang Berintegritas', emoji: '😕' },
                { value: 3, label: 'Petugas Berintegritas', emoji: '🙂' },
                { value: 4, label: 'Petugas Sangat Berintegritas', emoji: '😊' }
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
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-800" htmlFor="phone">Nomor HP (WhatsApp) <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-emerald-500 transition-colors">phone</span>
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
                            <hr className="border-gray-100/50" />
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-800" htmlFor="age">Usia <span className="text-rose-500">*</span></label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">cake</span>
                                        <select
                                            id="age"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">Pilih Rentang Usia</option>
                                            <option value="Kurang dari 20 Tahun">Kurang dari 20 Tahun</option>
                                            <option value="20 - 40 Tahun">20 - 40 Tahun</option>
                                            <option value="41 - 60 Tahun">41 - 60 Tahun</option>
                                            <option value="Lebih dari 60 Tahun">Lebih dari 60 Tahun</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-800 mb-3">Jenis Kelamin <span className="text-rose-500">*</span></label>
                                    <div className="flex gap-3">
                                        {[
                                            { value: 'Laki-laki', icon: '👨', label: 'Laki-laki' },
                                            { value: 'Perempuan', icon: '👩', label: 'Perempuan' }
                                        ].map((option) => (
                                            <label key={option.value} className="cursor-pointer group flex-1">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={option.value}
                                                    checked={formData.gender === option.value}
                                                    onChange={(e) => handleRadioChange('gender', e.target.value)}
                                                    required
                                                    className="peer sr-only"
                                                />
                                                <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.gender === option.value ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'}`}>
                                                    <span className="text-xl">{option.icon}</span>
                                                    <span className="text-sm font-bold">{option.label}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <hr className="border-gray-100/50" />
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-800" htmlFor="education">Pendidikan Terakhir <span className="text-rose-500">*</span></label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">school</span>
                                        <select
                                            id="education"
                                            name="education"
                                            value={formData.education}
                                            onChange={handleInputChange}
                                            required
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
                                    <label className="block text-sm font-bold text-gray-800" htmlFor="job">Pekerjaan <span className="text-rose-500">*</span></label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">work</span>
                                        <select
                                            id="job"
                                            name="job"
                                            value={formData.job}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">Pilih Pekerjaan</option>
                                            <option value="PNS">PNS</option>
                                            <option value="TNI/Polri">TNI/Polri</option>
                                            <option value="Swasta">Swasta</option>
                                            <option value="Wiraswasta">Wiraswasta</option>
                                            <option value="Petani">Petani</option>
                                            <option value="Nelayan">Nelayan</option>
                                            <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                                            <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                                            <option value="Pensiunan">Pensiunan</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>
                            <hr className="border-gray-100/50" />
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-800 mb-3">Alamat Domisili <span className="text-rose-500">*</span></label>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Kabupaten/Kota */}
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">apartment</span>
                                        <select
                                            name="kota_kabupaten"
                                            value={formData.kota_kabupaten}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">Pilih Kabupaten/Kota</option>
                                            {wilayahIndonesia.map((kab) => (
                                                <option key={kab.id} value={kab.nama}>{kab.nama}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>

                                    {/* Kecamatan */}
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">signpost</span>
                                        <select
                                            name="kecamatan"
                                            value={formData.kecamatan}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.kota_kabupaten}
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Pilih Kecamatan</option>
                                            {kecamatanList.map((kec) => (
                                                <option key={kec.id} value={kec.nama}>{kec.nama}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>

                                {/* Alamat Detail (Manual Input) */}
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-4 text-gray-400 text-xl group-focus-within:text-emerald-500 transition-colors">home</span>
                                    <textarea
                                        name="alamat_detail"
                                        value={formData.alamat_detail}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Masukkan alamat lengkap (Nama Jalan, RT/RW, Kelurahan/Desa)"
                                        rows={3}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base shadow-sm resize-none"
                                    />
                                </div>
                            </div>
                            <hr className="border-gray-100/50" />
                            <div className="grid md:grid-cols-1 gap-6">
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
                            <hr className="border-gray-100/50" />
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-800 mb-3">Alamat Domisili <span className="text-rose-500">*</span></label>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Kabupaten/Kota */}
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">apartment</span>
                                        <select
                                            name="kota_kabupaten"
                                            value={formData.kota_kabupaten}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">Pilih Kabupaten/Kota</option>
                                            {wilayahIndonesia.map((kab) => (
                                                <option key={kab.id} value={kab.nama}>{kab.nama}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>

                                    {/* Kecamatan */}
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none group-focus-within:text-emerald-500 transition-colors">signpost</span>
                                        <select
                                            name="kecamatan"
                                            value={formData.kecamatan}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!formData.kota_kabupaten}
                                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Pilih Kecamatan</option>
                                            {kecamatanList.map((kec) => (
                                                <option key={kec.id} value={kec.nama}>{kec.nama}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>

                                {/* Alamat Detail (Manual Input) */}
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-4 text-gray-400 text-xl group-focus-within:text-emerald-500 transition-colors">home</span>
                                    <textarea
                                        name="alamat_detail"
                                        value={formData.alamat_detail}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Masukkan alamat lengkap (Nama Jalan, RT/RW, Kelurahan/Desa)"
                                        rows={3}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-base shadow-sm resize-none"
                                    />
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
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Penilaian 11 Unsur Layanan IKM</h3>
                                    <p className="text-xs text-gray-500">Pilih salah satu jawaban untuk setiap pertanyaan (U1 - U11)</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100/50">
                            {serviceElements.map((element, idx) => (
                                <div key={element.id} className="p-6 hover:bg-gradient-to-br hover:from-emerald-50/30 hover:to-teal-50/30 transition-all">
                                    <div className="flex items-start gap-3 mb-4 pb-3 border-b border-gray-100">
                                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                                                <span className="text-lg font-bold text-emerald-600">{idx + 1}</span>
                                            </div>
                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{element.code}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-bold text-gray-800 mb-1">{element.title}</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">{element.text}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="pl-14">
                                        <div className="grid grid-cols-2 gap-3">
                                            {element.options.map((option) => {
                                                const isChecked = (formData as any)[element.id] === option.value.toString();

                                                return (
                                                    <label key={option.value} className="cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={element.id}
                                                            value={option.value}
                                                            checked={isChecked}
                                                            onChange={(e) => handleRadioChange(element.id, e.target.value)}
                                                            required
                                                            className="sr-only peer"
                                                        />
                                                        <div className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all ${
                                                            isChecked 
                                                                ? 'border-emerald-500 bg-emerald-50 scale-[1.02] shadow-lg' 
                                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                                        }`}>
                                                            <span className="text-3xl flex-shrink-0">{option.emoji}</span>
                                                            <span className={`text-xs font-bold leading-tight text-left flex-1 ${
                                                                isChecked
                                                                    ? 'text-emerald-700'
                                                                    : 'text-gray-700'
                                                            }`}>
                                                                {option.label}
                                                            </span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
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
                            disabled={isLoading || !formData.unit_id || !formData.service_type}
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
                                    <span>Lanjutkan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>

            {/* Footer dihapus sesuai permintaan */}
        </div>
    );
};

export default PublicSurveyForm;