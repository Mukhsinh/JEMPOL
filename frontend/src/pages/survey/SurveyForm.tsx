import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

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

// Survey questions based on SKM (Survei Kepuasan Masyarakat)
const surveyQuestions = [
    { id: 'q1', code: 'U1', title: 'Persyaratan', text: 'Bagaimana pendapat Anda tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?' },
    { id: 'q2', code: 'U2', title: 'Prosedur', text: 'Bagaimana kemudahan prosedur pelayanan di unit ini?' },
    { id: 'q3', code: 'U3', title: 'Waktu Pelayanan', text: 'Bagaimana kecepatan waktu dalam memberikan pelayanan?' },
    { id: 'q4', code: 'U4', title: 'Biaya / Tarif', text: 'Bagaimana kewajaran biaya/tarif dalam pelayanan?' },
    { id: 'q5', code: 'U5', title: 'Produk Spesifikasi', text: 'Bagaimana kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?' },
    { id: 'q6', code: 'U6', title: 'Kompetensi', text: 'Bagaimana kompetensi/kemampuan petugas dalam pelayanan?' },
    { id: 'q7', code: 'U7', title: 'Perilaku', text: 'Bagaimana perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?' },
    { id: 'q8', code: 'U8', title: 'Pengaduan', text: 'Bagaimana kualitas penanganan pengaduan, saran dan masukan?' }
];

const SurveyForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const qrToken = searchParams.get('qr') || searchParams.get('token');
    const [isLoading, setIsLoading] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
    const [detectedUnit, setDetectedUnit] = useState<Unit | null>(null);
    
    const [formData, setFormData] = useState({
        // Service type
        service_type: '',
        // Reporter info
        full_name: '',
        phone: '',
        email: '',
        job: '',
        is_anonymous: false,
        // Address
        province: '',
        city: '',
        district: '',
        village: '',
        // Demographics
        age: '',
        gender: '',
        // Survey ratings (q1-q8)
        q1: '',
        q2: '',
        q3: '',
        q4: '',
        q5: '',
        q6: '',
        q7: '',
        q8: '',
        // Overall satisfaction
        overall_satisfaction: '',
        // Comments
        suggestions: '',
        // Unit
        unit_id: ''
    });

    // Load master data
    useEffect(() => {
        loadMasterData();
    }, []);

    // Detect unit from QR token
    useEffect(() => {
        if (qrToken) {
            detectUnitFromQR();
        }
    }, [qrToken, units]);

    const loadMasterData = async () => {
        try {
            setIsLoading(true);
            
            const unitsResponse = await fetch('/api/public/units');
            if (unitsResponse.ok) {
                const unitsResult = await unitsResponse.json();
                setUnits(unitsResult.data || []);
            }

            const categoriesResponse = await fetch('/api/public/service-categories');
            if (categoriesResponse.ok) {
                const categoriesResult = await categoriesResponse.json();
                setServiceCategories(categoriesResult.data || []);
            }
        } catch (error) {
            console.error('Error loading master data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const detectUnitFromQR = async () => {
        if (qrToken && units.length > 0) {
            // Try to detect unit from QR token
            try {
                const response = await fetch(`/api/public/qr-codes/validate/${qrToken}`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.data?.unit_id) {
                        const unit = units.find(u => u.id === result.data.unit_id);
                        if (unit) {
                            setDetectedUnit(unit);
                            setFormData(prev => ({ ...prev, unit_id: unit.id }));
                        }
                    }
                }
            } catch (error) {
                console.error('Error validating QR:', error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.phone) {
            alert('Mohon isi nomor HP (WhatsApp)');
            return;
        }

        // Validate at least one rating
        const hasRating = formData.q1 || formData.q2 || formData.q3 || formData.q4 || 
                          formData.q5 || formData.q6 || formData.q7 || formData.q8 || 
                          formData.overall_satisfaction;
        
        if (!hasRating) {
            alert('Mohon berikan minimal satu penilaian');
            return;
        }

        setIsLoading(true);

        try {
            const surveyData = {
                // Service info
                service_type: formData.service_type,
                unit_id: formData.unit_id || detectedUnit?.id,
                // Reporter info
                reporter_name: formData.is_anonymous ? null : formData.full_name || null,
                reporter_email: formData.is_anonymous ? null : formData.email || null,
                reporter_phone: formData.is_anonymous ? null : formData.phone || null,
                job: formData.job || null,
                is_anonymous: formData.is_anonymous,
                // Demographics
                age_range: formData.age || null,
                gender: formData.gender || null,
                // Address
                province: formData.province || null,
                city: formData.city || null,
                district: formData.district || null,
                village: formData.village || null,
                // Survey ratings
                q1_score: formData.q1 ? parseInt(formData.q1) : null,
                q2_score: formData.q2 ? parseInt(formData.q2) : null,
                q3_score: formData.q3 ? parseInt(formData.q3) : null,
                q4_score: formData.q4 ? parseInt(formData.q4) : null,
                q5_score: formData.q5 ? parseInt(formData.q5) : null,
                q6_score: formData.q6 ? parseInt(formData.q6) : null,
                q7_score: formData.q7 ? parseInt(formData.q7) : null,
                q8_score: formData.q8 ? parseInt(formData.q8) : null,
                overall_satisfaction: formData.overall_satisfaction || null,
                // Comments
                comments: formData.suggestions || null,
                // QR token
                qr_token: qrToken
            };

            const response = await fetch('/api/public/surveys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(surveyData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Gagal mengirim survei');
            }

            alert('Survei berhasil dikirim! Terima kasih atas partisipasi Anda.');
            navigate('/survey?survey=success');

        } catch (error: any) {
            console.error('Error submitting survey:', error);
            alert('Terjadi kesalahan: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Rating component with emoji icons
    const RatingOption = ({ questionId, value, icon, label }: { questionId: string; value: number; icon: string; label: string }) => {
        const isSelected = formData[questionId as keyof typeof formData] === value.toString();
        
        return (
            <label className="cursor-pointer group relative flex flex-col items-center gap-1 min-w-[60px]">
                <input
                    className="sr-only"
                    name={questionId}
                    type="radio"
                    value={value}
                    checked={isSelected}
                    onChange={(e) => handleInputChange(questionId, e.target.value)}
                />
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full border flex items-center justify-center transition-all duration-300 shadow-sm
                    ${isSelected 
                        ? 'bg-yellow-50 border-yellow-400 text-yellow-600' 
                        : 'border-gray-200 bg-white text-gray-300 group-hover:bg-yellow-50'
                    }`}>
                    <span className={`material-symbols-outlined text-3xl md:text-4xl transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}
                          style={{ fontVariationSettings: isSelected ? "'FILL' 1, 'wght' 700" : "'FILL' 1, 'wght' 500", color: '#FFC107' }}>
                        {icon}
                    </span>
                </div>
                <span className={`text-[10px] md:text-xs text-center font-medium transition-all ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                    {label}
                </span>
            </label>
        );
    };

    if (isLoading && units.length === 0) {
        return (
            <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec] mx-auto mb-4"></div>
                    <p className="text-slate-600">Memuat form survei...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6f7f8] flex flex-col font-['Public_Sans',sans-serif]">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e7edf3] shadow-sm">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#137fec]/10 text-[#137fec]">
                            <span className="material-symbols-outlined text-2xl">local_hospital</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight text-[#0d141b]">Sistem Pengaduan RSUD</h1>
                            <p className="text-xs text-[#4c739a] font-medium">Layanan Publik Terintegrasi</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#f6f7f8] hover:bg-gray-200 transition-colors text-[#0d141b]">
                            <span className="material-symbols-outlined">language</span>
                        </button>
                        <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#f6f7f8] hover:bg-gray-200 transition-colors text-[#0d141b]">
                            <span className="material-symbols-outlined">help</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-[960px] mx-auto px-4 py-8 md:px-8">
                {/* Page Header */}
                <div className="mb-8 space-y-4">
                    <div className="space-y-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Edisi 2024
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0d141b]">
                            Survei Kepuasan Masyarakat (SKM)
                        </h2>
                        <p className="text-lg text-[#4c739a] max-w-2xl">
                            Partisipasi Anda sangat berharga bagi kami. Bantu kami meningkatkan kualitas pelayanan kesehatan RSUD dengan mengisi survei singkat ini secara objektif.
                        </p>
                    </div>
                    
                    {/* Legal Info Accordion */}
                    <div className="pt-2">
                        <details className="group border border-[#e7edf3] rounded-xl bg-white overflow-hidden transition-all duration-300">
                            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#4c739a]">gavel</span>
                                    <span className="text-sm font-semibold text-[#0d141b]">Dasar Hukum & Kerahasiaan Data</span>
                                </div>
                                <span className="material-symbols-outlined text-[#4c739a] transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="px-4 pb-4 pt-0 text-sm text-[#4c739a] border-t border-transparent group-open:border-[#e7edf3]">
                                <div className="mt-3 space-y-2">
                                    <p>Survei ini dilaksanakan berdasarkan Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.</p>
                                    <p className="font-medium text-[#137fec]">Privasi Anda terjaga. Data yang dikumpulkan hanya digunakan untuk keperluan evaluasi dan peningkatan layanan.</p>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Unit Detection Section */}
                    {detectedUnit && (
                        <section className="bg-blue-50/50 rounded-2xl border border-blue-100 p-6 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-[#137fec]">
                                <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#137fec] mb-1">Unit Tujuan (Otomatis)</label>
                                <div className="text-xl font-bold text-[#0d141b] flex items-center gap-2">
                                    <span>{detectedUnit.name}</span>
                                    <span className="material-symbols-outlined text-green-500 text-lg" title="Terverifikasi">verified</span>
                                </div>
                                <p className="text-sm text-[#4c739a]">Unit terdeteksi otomatis dari kode QR lokasi.</p>
                            </div>
                        </section>
                    )}

    // Load master data
    useEffect(() => {
        loadMasterData();
    }, []);

    const loadMasterData = async () => {
        try {
            setIsLoading(true);
            
            const unitsResponse = await fetch('/api/public/units');
            if (unitsResponse.ok) {
                const unitsResult = await unitsResponse.json();
                setUnits(unitsResult.data || []);
            }

            const categoriesResponse = await fetch('/api/public/service-categories');
            if (categoriesResponse.ok) {
                const categoriesResult = await categoriesResponse.json();
                setServiceCategories(categoriesResult.data || []);
            }
        } catch (error) {
            console.error('Error loading master data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.phone) {
            alert('Mohon isi nomor HP (WhatsApp)');
            return;
        }

        setIsLoading(true);

        try {
            const surveyData = {
                service_type: formData.service_type,
                reporter_name: formData.is_anonymous ? null : formData.full_name || null,
                reporter_phone: formData.phone,
                reporter_email: formData.is_anonymous ? null : formData.email || null,
                job: formData.job,
                province: formData.province,
                city: formData.city,
                district: formData.district,
                village: formData.village,
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
                comments: formData.suggestions || null,
                is_anonymous: formData.is_anonymous,
                qr_token: qrToken,
                unit_id: formData.unit_id || unitFromQR
            };

            const response = await fetch('/api/public/surveys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(surveyData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Gagal mengirim survei');

            alert('Survei berhasil dikirim! Terima kasih atas partisipasi Anda.');
            navigate('/survey?survey=success');
        } catch (error: any) {
            console.error('Error submitting survey:', error);
            alert('Terjadi kesalahan: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

                    {/* Data Responden Section */}
                    <section className="bg-white rounded-2xl border border-[#e7edf3] shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-[#e7edf3] bg-gray-50/50 flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#137fec]/20 text-[#137fec]">
                                <span className="material-symbols-outlined text-sm font-bold">person</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#0d141b]">Data Responden</h3>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Service Type */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-[#0d141b]">
                                    Jenis Layanan yang Diterima <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { value: 'rawat_jalan', label: 'Rawat Jalan' },
                                        { value: 'rawat_inap', label: 'Rawat Inap' },
                                        { value: 'darurat', label: 'IGD / Darurat' },
                                        { value: 'lainnya', label: 'Lainnya' }
                                    ].map((option) => (
                                        <label key={option.value} className="cursor-pointer relative">
                                            <input
                                                className="sr-only peer"
                                                name="service_type"
                                                type="radio"
                                                value={option.value}
                                                checked={formData.service_type === option.value}
                                                onChange={(e) => handleInputChange('service_type', e.target.value)}
                                            />
                                            <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[#e7edf3] bg-white hover:border-[#137fec]/50 transition-all h-full peer-checked:border-[#137fec] peer-checked:bg-[#137fec]/5 peer-checked:text-[#137fec]">
                                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-transparent flex-shrink-0 transition-all peer-checked:border-[#137fec] peer-checked:bg-[#137fec]"></div>
                                                <span className="text-sm font-medium">{option.label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-[#e7edf3]" />

                            {/* Name and Anonymous */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-bold text-[#0d141b]" htmlFor="full_name">Nama Lengkap</label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            className="rounded border-gray-300 text-[#137fec] focus:ring-[#137fec] h-4 w-4"
                                            type="checkbox"
                                            checked={formData.is_anonymous}
                                            onChange={(e) => handleInputChange('is_anonymous', e.target.checked)}
                                        />
                                        <span className="ml-2 text-sm text-[#4c739a]">Kirim sebagai Anonim</span>
                                    </label>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">badge</span>
                                    <input
                                        className="w-full pl-10 rounded-xl border-[#e7edf3] bg-[#f6f7f8] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11"
                                        id="full_name"
                                        type="text"
                                        placeholder="Masukkan nama lengkap Anda"
                                        value={formData.full_name}
                                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                                        disabled={formData.is_anonymous}
                                    />
                                </div>
                            </div>

                            {/* Phone and Email */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-[#0d141b]" htmlFor="phone">
                                        Nomor HP (WhatsApp) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">smartphone</span>
                                        <input
                                            className="w-full pl-10 rounded-xl border-[#e7edf3] bg-[#f6f7f8] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11"
                                            id="phone"
                                            type="tel"
                                            placeholder="08xxxxxxxxxx"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-[#0d141b]" htmlFor="email">
                                        Email <span className="text-[#4c739a] font-normal">(Opsional)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">mail</span>
                                        <input
                                            className="w-full pl-10 rounded-xl border-[#e7edf3] bg-[#f6f7f8] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11"
                                            id="email"
                                            type="email"
                                            placeholder="contoh@email.com"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="block text-sm font-bold text-[#0d141b]" htmlFor="job">
                                        Pekerjaan <span className="text-[#4c739a] font-normal">(Opsional)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">work</span>
                                        <input
                                            className="w-full pl-10 rounded-xl border-[#e7edf3] bg-[#f6f7f8] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11"
                                            id="job"
                                            type="text"
                                            placeholder="PNS, Swasta, Wiraswasta, dll"
                                            value={formData.job}
                                            onChange={(e) => handleInputChange('job', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-[#0d141b]">Alamat Domisili</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <select
                                        className="rounded-xl border-[#e7edf3] bg-[#f6f7f8] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11 text-[#0d141b]"
                                        value={formData.province}
                                        onChange={(e) => handleInputChange('province', e.target.value)}
                                    >
                                        <option value="">Pilih Provinsi</option>
                                        <option value="jt">Jawa Tengah</option>
                                        <option value="jb">Jawa Barat</option>
                                        <option value="ji">Jawa Timur</option>
                                        <option value="dki">DKI Jakarta</option>
                                    </select>
                                    <select
                                        className="rounded-xl border-[#e7edf3] bg-[#f6f7f8] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11 text-[#0d141b]"
                                        value={formData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                    >
                                        <option value="">Pilih Kota/Kabupaten</option>
                                    </select>
                                    <select
                                        className="rounded-xl border-[#e7edf3] bg-[#f6f7f8] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11 text-[#0d141b]"
                                        value={formData.district}
                                        onChange={(e) => handleInputChange('district', e.target.value)}
                                    >
                                        <option value="">Pilih Kecamatan</option>
                                    </select>
                                    <select
                                        className="rounded-xl border-[#e7edf3] bg-[#f6f7f8] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11 text-[#0d141b]"
                                        value={formData.village}
                                        onChange={(e) => handleInputChange('village', e.target.value)}
                                    >
                                        <option value="">Pilih Kelurahan/Desa</option>
                                    </select>
                                </div>
                            </div>

                            <hr className="border-[#e7edf3]" />

                            {/* Age and Gender */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-[#0d141b]">Usia Responden</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['< 20 Th', '20 - 40 Th', '41 - 60 Th', '> 60 Th'].map((age) => (
                                            <label key={age} className="cursor-pointer group">
                                                <input
                                                    className="peer sr-only"
                                                    name="age"
                                                    type="radio"
                                                    value={age}
                                                    checked={formData.age === age}
                                                    onChange={(e) => handleInputChange('age', e.target.value)}
                                                />
                                                <span className="inline-flex px-4 py-2 rounded-lg border border-[#e7edf3] bg-white text-sm font-medium text-[#4c739a] peer-checked:bg-[#137fec] peer-checked:text-white peer-checked:border-[#137fec] transition-all">
                                                    {age}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-[#0d141b]">Jenis Kelamin</label>
                                    <div className="flex gap-3">
                                        <label className="flex-1 cursor-pointer relative">
                                            <input
                                                className="sr-only peer"
                                                name="gender"
                                                type="radio"
                                                value="male"
                                                checked={formData.gender === 'male'}
                                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                            />
                                            <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-[#e7edf3] bg-white hover:border-[#137fec]/50 transition-all peer-checked:border-[#137fec] peer-checked:bg-[#137fec]/5 peer-checked:text-[#137fec]">
                                                <span className="material-symbols-outlined text-[#4c739a]">male</span>
                                                <span className="text-sm font-medium">Laki-laki</span>
                                            </div>
                                        </label>
                                        <label className="flex-1 cursor-pointer relative">
                                            <input
                                                className="sr-only peer"
                                                name="gender"
                                                type="radio"
                                                value="female"
                                                checked={formData.gender === 'female'}
                                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                            />
                                            <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-[#e7edf3] bg-white hover:border-[#137fec]/50 transition-all peer-checked:border-[#137fec] peer-checked:bg-[#137fec]/5 peer-checked:text-[#137fec]">
                                                <span className="material-symbols-outlined text-[#4c739a]">female</span>
                                                <span className="text-sm font-medium">Perempuan</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-[960px] mx-auto px-4 py-8 md:px-8">
                {/* Page Header */}
                <div className="mb-8 space-y-4">
                    <div className="space-y-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">Edisi 2024</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0d141b] dark:text-white">Survei Kepuasan Masyarakat (SKM)</h2>
                        <p className="text-lg text-[#4c739a] dark:text-gray-400 max-w-2xl">Partisipasi Anda sangat berharga bagi kami. Bantu kami meningkatkan kualitas pelayanan kesehatan RSUD dengan mengisi survei singkat ini secara objektif.</p>
                    </div>
                    <div className="pt-2">
                        <details className="group border border-[#e7edf3] dark:border-[#2a3b4d] rounded-xl bg-white dark:bg-[#1a2632] overflow-hidden transition-all duration-300">
                            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#4c739a]">gavel</span>
                                    <span className="text-sm font-semibold text-[#0d141b] dark:text-white">Dasar Hukum & Kerahasiaan Data</span>
                                </div>
                                <span className="material-symbols-outlined text-[#4c739a] transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="px-4 pb-4 pt-0 text-sm text-[#4c739a] dark:text-gray-400 border-t border-transparent group-open:border-[#e7edf3] dark:group-open:border-[#2a3b4d]">
                                <div className="mt-3 space-y-2">
                                    <p>Survei ini dilaksanakan berdasarkan Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.</p>
                                    <p className="font-medium text-[#137fec]">Privasi Anda terjaga. Data yang dikumpulkan hanya digunakan untuk keperluan evaluasi dan peningkatan layanan.</p>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Unit Section */}
                    <section className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 p-6 flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-[#1a2632] rounded-xl shadow-sm text-[#137fec]">
                            <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[#137fec] mb-1">Unit Tujuan</label>
                            {unitFromQR ? (
                                <div className="text-xl font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                                    <span>{units.find(u => u.id === unitFromQR)?.name || 'Unit Terdeteksi'}</span>
                                    <span className="material-symbols-outlined text-green-500 text-lg" title="Terverifikasi">verified</span>
                                </div>
                            ) : (
                                <select
                                    className="w-full rounded-xl border-[#e7edf3] dark:border-[#2a3b4d] bg-white dark:bg-[#101922] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11 text-[#0d141b] dark:text-white"
                                    value={formData.unit_id}
                                    onChange={(e) => handleInputChange('unit_id', e.target.value)}
                                >
                                    <option value="">Pilih Unit Layanan</option>
                                    {units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                                    ))}
                                </select>
                            )}
                            <p className="text-sm text-[#4c739a]">{unitFromQR ? 'Unit terdeteksi otomatis dari kode QR lokasi.' : 'Pilih unit layanan yang ingin Anda nilai.'}</p>
                        </div>
                    </section>

                    {/* Penilaian Layanan Section */}
                    <section className="bg-white rounded-2xl border border-[#e7edf3] shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-[#e7edf3] bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#137fec]/20 text-[#137fec]">
                                    <span className="material-symbols-outlined text-sm font-bold">analytics</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#0d141b]">Penilaian Layanan</h3>
                                    <p className="text-xs text-[#4c739a]">Beri penilaian dari 1 (Sangat Buruk) hingga 5 (Sangat Baik)</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="divide-y divide-[#e7edf3]">
                            {surveyQuestions.map((question) => (
                                <div key={question.id} className="p-6 hover:bg-gray-50/30 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex-1">
                                            <span className="text-xs font-bold text-[#137fec] uppercase tracking-wider mb-1 block">
                                                {question.code} - {question.title}
                                            </span>
                                            <p className="text-sm font-medium text-[#0d141b] leading-relaxed">{question.text}</p>
                                        </div>
                                        <div className="flex flex-col items-center w-full md:w-auto">
                                            <div className="flex items-center justify-between gap-3 md:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                                <RatingOption questionId={question.id} value={1} icon="sentiment_very_dissatisfied" label="Sangat Buruk" />
                                                <RatingOption questionId={question.id} value={2} icon="sentiment_dissatisfied" label="Buruk" />
                                                <RatingOption questionId={question.id} value={3} icon="sentiment_neutral" label="Cukup" />
                                                <RatingOption questionId={question.id} value={4} icon="sentiment_satisfied" label="Baik" />
                                                <RatingOption questionId={question.id} value={5} icon="sentiment_very_satisfied" label="Sangat Baik" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Overall Satisfaction Section */}
                    <section className="grid md:grid-cols-12 gap-6">
                        <div className="md:col-span-12 bg-white rounded-2xl p-6 md:p-8 border border-[#e7edf3] shadow-md relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 pointer-events-none"></div>
                            <div className="relative z-10 text-center mb-10">
                                <h3 className="text-2xl font-black text-[#0d141b] mb-2">Kepuasan Keseluruhan Layanan</h3>
                                <p className="text-[#4c739a]">Secara umum, bagaimana tingkat kepuasan Anda terhadap pelayanan kami?</p>
                            </div>
                            <div className="relative z-10 flex flex-wrap justify-center gap-4 md:gap-8">
                                {[
                                    { value: 'sangat_tidak_puas', icon: 'sentiment_very_dissatisfied', label: 'Sangat Buruk' },
                                    { value: 'tidak_puas', icon: 'sentiment_dissatisfied', label: 'Buruk' },
                                    { value: 'kurang_puas', icon: 'sentiment_neutral', label: 'Cukup' },
                                    { value: 'puas', icon: 'sentiment_satisfied', label: 'Baik' },
                                    { value: 'sangat_puas', icon: 'sentiment_very_satisfied', label: 'Sangat Baik' }
                                ].map((option) => {
                                    const isSelected = formData.overall_satisfaction === option.value;
                                    return (
                                        <label key={option.value} className="cursor-pointer group flex flex-col items-center gap-3">
                                            <input
                                                className="sr-only"
                                                name="overall_satisfaction"
                                                type="radio"
                                                value={option.value}
                                                checked={isSelected}
                                                onChange={(e) => handleInputChange('overall_satisfaction', e.target.value)}
                                            />
                                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm
                                                ${isSelected 
                                                    ? 'bg-yellow-50 border-yellow-400' 
                                                    : 'border-gray-100 bg-white group-hover:bg-yellow-50'
                                                }`}>
                                                <span className="material-symbols-outlined text-4xl md:text-5xl"
                                                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 500", color: '#FFC107' }}>
                                                    {option.icon}
                                                </span>
                                            </div>
                                            <span className={`text-sm font-bold text-center transition-colors mt-1 ${isSelected ? 'text-[#0d141b]' : 'text-[#4c739a] group-hover:text-[#0d141b]'}`}>
                                                {option.label.split(' ').map((word, i) => (
                                                    <span key={i}>{word}<br/></span>
                                                ))}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="md:col-span-12 bg-white rounded-2xl border border-[#e7edf3] p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-[#0d141b] mb-2" htmlFor="suggestions">
                                    Saran dan Keluhan
                                </label>
                                <textarea
                                    className="w-full rounded-xl border-[#e7edf3] bg-[#f6f7f8] text-[#0d141b] focus:border-[#137fec] focus:ring-[#137fec]/20 placeholder:text-gray-400 text-sm p-4"
                                    id="suggestions"
                                    placeholder="Tuliskan saran atau keluhan Anda di sini untuk perbaikan pelayanan kami..."
                                    rows={4}
                                    value={formData.suggestions}
                                    onChange={(e) => handleInputChange('suggestions', e.target.value)}
                                />
                            </div>
                            <div className="pt-4 border-t border-[#e7edf3]">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-2">
                                    Tanggal Survei
                                </label>
                                <div className="relative max-w-sm">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-lg">calendar_today</span>
                                    <input
                                        className="w-full pl-10 rounded-lg border-[#e7edf3] bg-[#f6f7f8] text-[#0d141b] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11"
                                        type="date"
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 pb-12">
                        <button
                            className="w-full md:w-auto px-8 py-3 bg-[#137fec] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-[#137fec]/30 transition-all flex items-center justify-center gap-2 group transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Mengirim...</span>
                                </>
                            ) : (
                                <>
                                    <span>Kirim Survei</span>
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-[#e7edf3] mt-auto py-8">
                <div className="max-w-[960px] mx-auto px-4 md:px-8 text-center">
                    <div className="flex justify-center items-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">apartment</span>
                        </div>
                        <span className="text-sm font-semibold text-[#0d141b]">RSUD Kabupaten</span>
                    </div>
                    <p className="text-xs text-[#4c739a]">
                        © 2024 RSUD Kabupaten. Hak Cipta Dilindungi Undang-undang.<br/>
                        Sistem Survei Kepuasan Masyarakat Elektronik (e-SKM) v2.0
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default SurveyForm;

                    {/* Data Responden Section */}
                    <section className="bg-white dark:bg-[#1a2632] rounded-2xl border border-[#e7edf3] dark:border-[#2a3b4d] shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-[#e7edf3] dark:border-[#2a3b4d] bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#137fec]/20 text-[#137fec]">
                                <span className="material-symbols-outlined text-sm font-bold">person</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#0d141b] dark:text-white">Data Responden</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Jenis Layanan */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-[#0d141b] dark:text-white">Jenis Layanan yang Diterima <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['rawat_jalan', 'rawat_inap', 'darurat', 'lainnya'].map((type) => (
                                        <label key={type} className="cursor-pointer relative">
                                            <input className="custom-radio sr-only" name="service_type" type="radio" value={type} checked={formData.service_type === type} onChange={(e) => handleInputChange('service_type', e.target.value)} />
                                            <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border ${formData.service_type === type ? 'border-[#137fec] bg-[#137fec]/5' : 'border-[#e7edf3] dark:border-[#2a3b4d]'} bg-white dark:bg-[#1a2632] hover:border-[#137fec]/50 transition-all h-full`}>
                                                <div className={`radio-dot w-4 h-4 rounded-full border-2 ${formData.service_type === type ? 'border-[#137fec] bg-[#137fec]' : 'border-gray-300 dark:border-gray-600'} flex-shrink-0 transition-all`}></div>
                                                <span className="text-sm font-medium">{type === 'rawat_jalan' ? 'Rawat Jalan' : type === 'rawat_inap' ? 'Rawat Inap' : type === 'darurat' ? 'IGD / Darurat' : 'Lainnya'}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-[#e7edf3] dark:border-[#2a3b4d]" />

                            {/* Nama dan Anonim */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-bold text-[#0d141b] dark:text-white" htmlFor="full_name">Nama Lengkap</label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input className="rounded border-gray-300 text-[#137fec] focus:ring-[#137fec] h-4 w-4" type="checkbox" checked={formData.is_anonymous} onChange={(e) => handleInputChange('is_anonymous', e.target.checked)} />
                                        <span className="ml-2 text-sm text-[#4c739a]">Kirim sebagai Anonim</span>
                                    </label>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">badge</span>
                                    <input className="w-full pl-10 rounded-xl border-[#e7edf3] dark:border-[#2a3b4d] bg-[#f6f7f8] dark:bg-[#101922] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11" id="full_name" placeholder="Masukkan nama lengkap Anda" type="text" value={formData.full_name} onChange={(e) => handleInputChange('full_name', e.target.value)} disabled={formData.is_anonymous} />
                                </div>
                            </div>

                            {/* Phone dan Email */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-[#0d141b] dark:text-white" htmlFor="phone">Nomor HP (WhatsApp) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">smartphone</span>
                                        <input className="w-full pl-10 rounded-xl border-[#e7edf3] dark:border-[#2a3b4d] bg-[#f6f7f8] dark:bg-[#101922] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11" id="phone" placeholder="08xxxxxxxxxx" required type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-[#0d141b] dark:text-white" htmlFor="email">Email <span className="text-[#4c739a] font-normal">(Opsional)</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">mail</span>
                                        <input className="w-full pl-10 rounded-xl border-[#e7edf3] dark:border-[#2a3b4d] bg-[#f6f7f8] dark:bg-[#101922] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11" id="email" placeholder="contoh@email.com" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="block text-sm font-bold text-[#0d141b] dark:text-white" htmlFor="job">Pekerjaan <span className="text-[#4c739a] font-normal">(Opsional)</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">work</span>
                                        <input className="w-full pl-10 rounded-xl border-[#e7edf3] dark:border-[#2a3b4d] bg-[#f6f7f8] dark:bg-[#101922] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11" id="job" placeholder="PNS, Swasta, Wiraswasta, dll" type="text" value={formData.job} onChange={(e) => handleInputChange('job', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Alamat Domisili */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-[#0d141b] dark:text-white">Alamat Domisili</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <select className="rounded-xl border-[#e7edf3] dark:border-[#2a3b4d] bg-[#f6f7f8] dark:bg-[#101922] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11 text-[#0d141b] dark:text-white" value={formData.province} onChange={(e) => handleInputChange('province', e.target.value)}>
                                        <option value="">Pilih Provinsi</option>
                                        <option value="jt">Jawa Tengah</option>
                                        <option value="jb">Jawa Barat</option>
                                        <option value="ji">Jawa Timur</option>
                                    </select>
                                    <select className="rounded-xl border-[#e7edf3] dark:border-[#2a3b4d] bg-[#f6f7f8] dark:bg-[#101922] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11 text-[#0d141b] dark:text-white" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)}>
                                        <option value="">Pilih Kota/Kabupaten</option>
                                    </select>
                                    <select className="rounded-xl border-[#e7edf3] dark:border-[#2a3b4d] bg-[#f6f7f8] dark:bg-[#101922] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11 text-[#0d141b] dark:text-white" value={formData.district} onChange={(e) => handleInputChange('district', e.target.value)}>
                                        <option value="">Pilih Kecamatan</option>
                                    </select>
                                    <select className="rounded-xl border-[#e7edf3] dark:border-[#2a3b4d] bg-[#f6f7f8] dark:bg-[#101922] focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11 text-[#0d141b] dark:text-white" value={formData.village} onChange={(e) => handleInputChange('village', e.target.value)}>
                                        <option value="">Pilih Kelurahan/Desa</option>
                                    </select>
                                </div>
                            </div>

                            <hr className="border-[#e7edf3] dark:border-[#2a3b4d]" />

                            {/* Usia dan Jenis Kelamin */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-[#0d141b] dark:text-white">Usia Responden</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['< 20 Th', '20 - 40 Th', '41 - 60 Th', '> 60 Th'].map((age) => (
                                            <label key={age} className="cursor-pointer group">
                                                <input className="peer sr-only" name="age" type="radio" value={age} checked={formData.age === age} onChange={(e) => handleInputChange('age', e.target.value)} />
                                                <span className={`inline-flex px-4 py-2 rounded-lg border ${formData.age === age ? 'bg-[#137fec] text-white border-[#137fec]' : 'border-[#e7edf3] dark:border-[#2a3b4d] bg-white dark:bg-[#1a2632] text-[#4c739a]'} text-sm font-medium transition-all`}>{age}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-[#0d141b] dark:text-white">Jenis Kelamin</label>
                                    <div className="flex gap-3">
                                        <label className="flex-1 cursor-pointer relative">
                                            <input className="custom-radio sr-only" name="gender" type="radio" value="male" checked={formData.gender === 'male'} onChange={(e) => handleInputChange('gender', e.target.value)} />
                                            <div className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border ${formData.gender === 'male' ? 'border-[#137fec] bg-[#137fec]/5' : 'border-[#e7edf3] dark:border-[#2a3b4d]'} bg-white dark:bg-[#1a2632] hover:border-[#137fec]/50 transition-all`}>
                                                <span className="material-symbols-outlined text-[#4c739a]">male</span>
                                                <span className="text-sm font-medium">Laki-laki</span>
                                            </div>
                                        </label>
                                        <label className="flex-1 cursor-pointer relative">
                                            <input className="custom-radio sr-only" name="gender" type="radio" value="female" checked={formData.gender === 'female'} onChange={(e) => handleInputChange('gender', e.target.value)} />
                                            <div className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border ${formData.gender === 'female' ? 'border-[#137fec] bg-[#137fec]/5' : 'border-[#e7edf3] dark:border-[#2a3b4d]'} bg-white dark:bg-[#1a2632] hover:border-[#137fec]/50 transition-all`}>
                                                <span className="material-symbols-outlined text-[#4c739a]">female</span>
                                                <span className="text-sm font-medium">Perempuan</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Penilaian Layanan Section */}
                    <section className="bg-white dark:bg-[#1a2632] rounded-2xl border border-[#e7edf3] dark:border-[#2a3b4d] shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-[#e7edf3] dark:border-[#2a3b4d] bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#137fec]/20 text-[#137fec]">
                                    <span className="material-symbols-outlined text-sm font-bold">analytics</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#0d141b] dark:text-white">Penilaian Layanan</h3>
                                    <p className="text-xs text-[#4c739a]">Beri penilaian dari 1 (Sangat Buruk) hingga 5 (Sangat Baik)</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-[#e7edf3] dark:divide-[#2a3b4d]">
                            {surveyQuestions.map((q) => (
                                <div key={q.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex-1">
                                            <span className="text-xs font-bold text-[#137fec] uppercase tracking-wider mb-1 block">{q.code} - {q.title}</span>
                                            <p className="text-sm font-medium text-[#0d141b] dark:text-white leading-relaxed">{q.text}</p>
                                        </div>
                                        <div className="flex flex-col items-center w-full md:w-auto">
                                            <div className="flex items-center justify-between gap-3 md:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                                <RatingOption questionId={q.id} value={1} icon="sentiment_very_dissatisfied" label="Sangat Buruk" />
                                                <RatingOption questionId={q.id} value={2} icon="sentiment_dissatisfied" label="Buruk" />
                                                <RatingOption questionId={q.id} value={3} icon="sentiment_neutral" label="Cukup" />
                                                <RatingOption questionId={q.id} value={4} icon="sentiment_satisfied" label="Baik" />
                                                <RatingOption questionId={q.id} value={5} icon="sentiment_very_satisfied" label="Sangat Baik" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Kepuasan Keseluruhan Section */}
                    <section className="grid md:grid-cols-12 gap-6">
                        <div className="md:col-span-12 bg-white dark:bg-[#1a2632] rounded-2xl p-6 md:p-8 border border-[#e7edf3] dark:border-[#2a3b4d] shadow-md relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10 pointer-events-none"></div>
                            <div className="relative z-10 text-center mb-10">
                                <h3 className="text-2xl font-black text-[#0d141b] dark:text-white mb-2">Kepuasan Keseluruhan Layanan</h3>
                                <p className="text-[#4c739a] dark:text-gray-400">Secara umum, bagaimana tingkat kepuasan Anda terhadap pelayanan kami?</p>
                            </div>
                            <div className="relative z-10 flex flex-wrap justify-center gap-4 md:gap-8">
                                {[
                                    { value: 'sangat_tidak_puas', icon: 'sentiment_very_dissatisfied', label: 'Sangat Buruk' },
                                    { value: 'tidak_puas', icon: 'sentiment_dissatisfied', label: 'Buruk' },
                                    { value: 'kurang_puas', icon: 'sentiment_neutral', label: 'Cukup' },
                                    { value: 'puas', icon: 'sentiment_satisfied', label: 'Baik' },
                                    { value: 'sangat_puas', icon: 'sentiment_very_satisfied', label: 'Sangat Baik' }
                                ].map((item) => (
                                    <label key={item.value} className="cursor-pointer group flex flex-col items-center gap-3">
                                        <input className="rating-input sr-only" name="overall_satisfaction" type="radio" value={item.value} checked={formData.overall_satisfaction === item.value} onChange={(e) => handleInputChange('overall_satisfaction', e.target.value)} />
                                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 ${formData.overall_satisfaction === item.value ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100'} bg-white dark:bg-[#1a2632] flex items-center justify-center transition-all duration-300 group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/10 shadow-sm`}>
                                            <span className={`material-symbols-outlined text-4xl md:text-5xl ${formData.overall_satisfaction === item.value ? 'text-yellow-500' : 'text-yellow-400'}`} style={{ fontVariationSettings: formData.overall_satisfaction === item.value ? "'FILL' 1, 'wght' 700" : "'FILL' 1, 'wght' 500" }}>{item.icon}</span>
                                        </div>
                                        <span className={`text-sm font-bold ${formData.overall_satisfaction === item.value ? 'text-[#0d141b] dark:text-white' : 'text-[#4c739a]'} group-hover:text-[#0d141b] transition-colors mt-1 text-center`}>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Saran dan Keluhan */}
                        <div className="md:col-span-12 bg-white dark:bg-[#1a2632] rounded-2xl border border-[#e7edf3] dark:border-[#2a3b4d] p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-[#0d141b] dark:text-white mb-2" htmlFor="suggestions">Saran dan Keluhan</label>
                                <textarea className="w-full rounded-xl border-[#e7edf3] dark:border-[#2a3b4d] bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-white focus:border-[#137fec] focus:ring-[#137fec]/20 placeholder:text-gray-400 text-sm p-4" id="suggestions" placeholder="Tuliskan saran atau keluhan Anda di sini untuk perbaikan pelayanan kami..." rows={4} value={formData.suggestions} onChange={(e) => handleInputChange('suggestions', e.target.value)}></textarea>
                            </div>
                            <div className="pt-4 border-t border-[#e7edf3] dark:border-[#2a3b4d]">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-2" htmlFor="date">Tanggal Survei</label>
                                <div className="relative max-w-sm">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-lg">calendar_today</span>
                                    <input className="w-full pl-10 rounded-lg border-[#e7edf3] dark:border-[#2a3b4d] bg-[#f6f7f8] dark:bg-[#101922] text-[#0d141b] dark:text-white focus:border-[#137fec] focus:ring-[#137fec]/20 text-sm h-11" id="date" type="date" value={formData.survey_date} onChange={(e) => handleInputChange('survey_date', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 pb-12">
                        <button className="w-full md:w-auto px-8 py-3 bg-[#137fec] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-[#137fec]/30 transition-all flex items-center justify-center gap-2 group transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Mengirim...</span>
                                </>
                            ) : (
                                <>
                                    <span>Kirim Survei</span>
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-[#1a2632] border-t border-[#e7edf3] dark:border-[#2a3b4d] mt-auto py-8">
                <div className="max-w-[960px] mx-auto px-4 md:px-8 text-center">
                    <div className="flex justify-center items-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">apartment</span>
                        </div>
                        <span className="text-sm font-semibold text-[#0d141b] dark:text-white">RSUD Kabupaten</span>
                    </div>
                    <p className="text-xs text-[#4c739a]">© 2024 RSUD Kabupaten. Hak Cipta Dilindungi Undang-undang.<br/>Sistem Survei Kepuasan Masyarakat Elektronik (e-SKM) v2.0</p>
                </div>
            </footer>
        </div>
    );
};

export default SurveyForm;
