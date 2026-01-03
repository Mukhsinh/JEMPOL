import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PublicSurveyForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const qrCode = searchParams.get('qr') || searchParams.get('qrCode');

    // State for form data
    const [formData, setFormData] = useState({
        unit_tujuan: 'Poli Penyakit Dalam - Gedung A', // Default or from QR
        service_type: '',
        full_name: '',
        is_anonymous: false,
        phone: '',
        email: '',
        job: '',
        provinsi: '',
        kota_kabupaten: '',
        kecamatan: '',
        kelurahan: '',
        age: '',
        gender: '',
        q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '',
        overall_satisfaction: '',
        suggestions: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
        setIsLoading(true);

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

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Gagal mengirim survei');
            }

            setIsSubmitted(true);
            window.scrollTo(0, 0);

        } catch (error: any) {
            console.error('Error submitting survey:', error);
            setError(error.message || 'Terjadi kesalahan saat mengirim survei');
            window.scrollTo(0, 0);
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

    const questions = [
        { id: 'q1', code: 'U1', title: 'Persyaratan', text: 'Bagaimana pendapat Anda tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?' },
        { id: 'q2', code: 'U2', title: 'Prosedur', text: 'Bagaimana kemudahan prosedur pelayanan di unit ini?' },
        { id: 'q3', code: 'U3', title: 'Waktu Pelayanan', text: 'Bagaimana kecepatan waktu dalam memberikan pelayanan?' },
        { id: 'q4', code: 'U4', title: 'Biaya / Tarif', text: 'Bagaimana kewajaran biaya/tarif dalam pelayanan?' },
        { id: 'q5', code: 'U5', title: 'Produk Spesifikasi', text: 'Bagaimana kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?' },
        { id: 'q6', code: 'U6', title: 'Kompetensi', text: 'Bagaimana kompetensi/kemampuan petugas dalam pelayanan?' },
        { id: 'q7', code: 'U7', title: 'Perilaku', text: 'Bagaimana perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?' },
        { id: 'q8', code: 'U8', title: 'Pengaduan', text: 'Bagaimana kualitas penanganan pengaduan, saran dan masukan?' }
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-main antialiased min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark shadow-sm">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-2xl">local_hospital</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight text-text-main dark:text-white">Sistem Pengaduan RSUD</h1>
                            <p className="text-xs text-text-sub font-medium">Layanan Publik Terintegrasi</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-text-main dark:text-white">
                            <span className="material-symbols-outlined">language</span>
                        </button>
                        <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-text-main dark:text-white">
                            <span className="material-symbols-outlined">help</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow w-full max-w-[960px] mx-auto px-4 py-8 md:px-8">
                <div className="mb-8 space-y-4">
                    <div className="space-y-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                            Edisi 2024
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-text-main dark:text-white">Survei Kepuasan Masyarakat (SKM)</h2>
                        <p className="text-lg text-text-sub dark:text-gray-400 max-w-2xl">
                            Partisipasi Anda sangat berharga bagi kami. Bantu kami meningkatkan kualitas pelayanan kesehatan RSUD dengan mengisi survei singkat ini secara objektif.
                        </p>
                    </div>
                    <div className="pt-2">
                        <details className="group border border-border-light dark:border-border-dark rounded-xl bg-surface-light dark:bg-surface-dark overflow-hidden transition-all duration-300">
                            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-text-sub">gavel</span>
                                    <span className="text-sm font-semibold text-text-main dark:text-white">Dasar Hukum & Kerahasiaan Data</span>
                                </div>
                                <span className="material-symbols-outlined text-text-sub transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="px-4 pb-4 pt-0 text-sm text-text-sub dark:text-gray-400 border-t border-transparent group-open:border-border-light dark:group-open:border-border-dark">
                                <div className="mt-3 space-y-2">
                                    <p>Survei ini dilaksanakan berdasarkan Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.</p>
                                    <p className="font-medium text-primary">Privasi Anda terjaga. Data yang dikumpulkan hanya digunakan untuk keperluan evaluasi dan peningkatan layanan.</p>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-600">error</span>
                        <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <section className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 p-6 flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm text-primary">
                            <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">Unit Tujuan (Otomatis)</label>
                            <div className="text-xl font-bold text-text-main dark:text-white flex items-center gap-2">
                                <span>{formData.unit_tujuan}</span>
                                <span className="material-symbols-outlined text-green-500 text-lg" title="Terverifikasi">verified</span>
                            </div>
                            <p className="text-sm text-text-sub">Unit terdeteksi otomatis dari kode QR lokasi.</p>
                            <input type="hidden" name="unit_tujuan" value={formData.unit_tujuan} />
                        </div>
                    </section>

                    <section className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary">
                                <span className="material-symbols-outlined text-sm font-bold">person</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-main dark:text-white">Data Responden</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-text-main dark:text-white">Jenis Layanan yang Diterima <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['rawat_jalan', 'rawat_inap', 'darurat', 'lainnya'].map((type) => (
                                        <label key={type} className="cursor-pointer relative">
                                            <input
                                                type="radio"
                                                name="service_type"
                                                value={type}
                                                checked={formData.service_type === type}
                                                onChange={(e) => handleRadioChange('service_type', e.target.value)}
                                                className="custom-radio sr-only"
                                            />
                                            <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all h-full ${formData.service_type === type ? 'border-primary bg-primary/5 text-primary' : 'border-border-light dark:border-border-dark bg-white dark:bg-surface-dark hover:border-primary/50'}`}>
                                                <div className={`radio-dot w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${formData.service_type === type ? 'border-primary bg-primary shadow-[0_0_0_3px_rgba(19,127,236,0.2)]' : 'border-gray-300 dark:border-gray-600 bg-transparent'}`}></div>
                                                <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <hr className="border-border-light dark:border-border-dark" />
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-bold text-text-main dark:text-white" htmlFor="full_name">Nama Lengkap</label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_anonymous"
                                            checked={formData.is_anonymous}
                                            onChange={handleInputChange}
                                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                        />
                                        <span className="ml-2 text-sm text-text-sub">Kirim sebagai Anonim</span>
                                    </label>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-sub">badge</span>
                                    <input
                                        type="text"
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        disabled={formData.is_anonymous}
                                        placeholder="Masukkan nama lengkap Anda"
                                        className="w-full pl-10 rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary focus:ring-primary/20 text-sm h-11 disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-text-main dark:text-white" htmlFor="phone">Nomor HP (WhatsApp) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-sub">smartphone</span>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="08xxxxxxxxxx"
                                            className="w-full pl-10 rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary focus:ring-primary/20 text-sm h-11"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-text-main dark:text-white" htmlFor="email">Email <span className="text-text-sub font-normal">(Opsional)</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-sub">mail</span>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="contoh@email.com"
                                            className="w-full pl-10 rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary focus:ring-primary/20 text-sm h-11"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="block text-sm font-bold text-text-main dark:text-white" htmlFor="job">Pekerjaan <span className="text-text-sub font-normal">(Opsional)</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-sub">work</span>
                                        <input
                                            type="text"
                                            id="job"
                                            name="job"
                                            value={formData.job}
                                            onChange={handleInputChange}
                                            placeholder="PNS, Swasta, Wiraswasta, dll"
                                            className="w-full pl-10 rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary focus:ring-primary/20 text-sm h-11"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-text-main dark:text-white">Alamat Domisili</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <select
                                        name="provinsi"
                                        value={formData.provinsi}
                                        onChange={handleInputChange}
                                        className="rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary focus:ring-primary/20 text-sm h-11 text-text-main dark:text-white"
                                    >
                                        <option value="">Pilih Provinsi</option>
                                        <option value="Jawa Tengah">Jawa Tengah</option>
                                        <option value="Jawa Barat">Jawa Barat</option>
                                        <option value="Jawa Timur">Jawa Timur</option>
                                        <option value="DKI Jakarta">DKI Jakarta</option>
                                        <option value="DI Yogyakarta">DI Yogyakarta</option>
                                    </select>
                                    <select
                                        name="kota_kabupaten"
                                        value={formData.kota_kabupaten}
                                        onChange={handleInputChange}
                                        className="rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary focus:ring-primary/20 text-sm h-11 text-text-main dark:text-white"
                                    >
                                        <option value="">Pilih Kota/Kabupaten</option>
                                        <option value="Kota Semarang">Kota Semarang</option>
                                        <option value="Kabupaten Semarang">Kabupaten Semarang</option>
                                    </select>
                                    <select
                                        name="kecamatan"
                                        value={formData.kecamatan}
                                        onChange={handleInputChange}
                                        className="rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary focus:ring-primary/20 text-sm h-11 text-text-main dark:text-white"
                                    >
                                        <option value="">Pilih Kecamatan</option>
                                    </select>
                                    <select
                                        name="kelurahan"
                                        value={formData.kelurahan}
                                        onChange={handleInputChange}
                                        className="rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:border-primary focus:ring-primary/20 text-sm h-11 text-text-main dark:text-white"
                                    >
                                        <option value="">Pilih Kelurahan/Desa</option>
                                    </select>
                                </div>
                            </div>
                            <hr className="border-border-light dark:border-border-dark" />
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-text-main dark:text-white">Usia Responden</label>
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
                                                <span className="inline-flex px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-sm font-medium text-text-sub peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all">
                                                    {range}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-text-main dark:text-white">Jenis Kelamin</label>
                                    <div className="flex gap-3">
                                        <label className="flex-1 cursor-pointer relative">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="male"
                                                checked={formData.gender === 'male'}
                                                onChange={(e) => handleRadioChange('gender', e.target.value)}
                                                className="custom-radio sr-only"
                                            />
                                            <div className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all ${formData.gender === 'male' ? 'border-primary bg-primary/5 text-primary' : 'border-border-light dark:border-border-dark bg-white dark:bg-surface-dark hover:border-primary/50'}`}>
                                                <span className="material-symbols-outlined text-text-sub">male</span>
                                                <span className="text-sm font-medium">Laki-laki</span>
                                            </div>
                                        </label>
                                        <label className="flex-1 cursor-pointer relative">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="female"
                                                checked={formData.gender === 'female'}
                                                onChange={(e) => handleRadioChange('gender', e.target.value)}
                                                className="custom-radio sr-only"
                                            />
                                            <div className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all ${formData.gender === 'female' ? 'border-primary bg-primary/5 text-primary' : 'border-border-light dark:border-border-dark bg-white dark:bg-surface-dark hover:border-primary/50'}`}>
                                                <span className="material-symbols-outlined text-text-sub">female</span>
                                                <span className="text-sm font-medium">Perempuan</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary">
                                    <span className="material-symbols-outlined text-sm font-bold">analytics</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-text-main dark:text-white">Penilaian Layanan</h3>
                                    <p className="text-xs text-text-sub">Beri penilaian dari 1 (Sangat Buruk) hingga 5 (Sangat Baik)</p>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-border-light dark:divide-border-dark">
                            {questions.map((q) => (
                                <div key={q.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex-1">
                                            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">{q.code} - {q.title}</span>
                                            <p className="text-sm font-medium text-text-main dark:text-white leading-relaxed">{q.text}</p>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 md:gap-4 min-w-[320px]">
                                            {[1, 2, 3, 4, 5].map((val) => {
                                                const colors = ['text-red-600', 'text-orange-500', 'text-yellow-400', 'text-green-500', 'text-blue-600'];
                                                const bgColors = ['bg-red-50', 'bg-orange-50', 'bg-yellow-50', 'bg-green-50', 'bg-blue-50'];
                                                const borderColors = ['border-red-500/50', 'border-orange-500/50', 'border-yellow-400/50', 'border-green-500/50', 'border-blue-600/50'];
                                                const icons = ['sentiment_very_dissatisfied', 'sentiment_dissatisfied', 'sentiment_neutral', 'sentiment_satisfied', 'sentiment_very_satisfied'];

                                                const isChecked = (formData as any)[q.id] === val.toString();

                                                return (
                                                    <label key={val} className="cursor-pointer group relative flex flex-col items-center">
                                                        <input
                                                            type="radio"
                                                            name={q.id}
                                                            value={val}
                                                            checked={isChecked}
                                                            onChange={(e) => handleRadioChange(q.id, e.target.value)}
                                                            className="rating-input sr-only"
                                                        />
                                                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full border flex items-center justify-center transition-all duration-300 ${isChecked ? `${borderColors[val - 1]} ${bgColors[val - 1]} ${colors[val - 1]} shadow-lg` : 'border-gray-200 bg-white dark:bg-surface-dark text-gray-300 group-hover:bg-gray-50'}`}>
                                                            <span className={`rating-icon material-symbols-outlined text-3xl md:text-4xl transition-transform duration-200 ${isChecked ? 'scale-110' : ''}`}>{icons[val - 1]}</span>
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
                        <div className="md:col-span-12 bg-white dark:bg-surface-dark rounded-2xl p-6 md:p-8 border border-border-light dark:border-border-dark shadow-md relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 pointer-events-none"></div>
                            <div className="relative z-10 text-center mb-10">
                                <h3 className="text-2xl font-black text-text-main dark:text-white mb-2">Kepuasan Keseluruhan Layanan</h3>
                                <p className="text-text-sub dark:text-gray-400">Secara umum, bagaimana tingkat kepuasan Anda terhadap pelayanan kami?</p>
                            </div>
                            <div className="relative z-10 flex flex-wrap justify-center gap-4 md:gap-10">
                                {[
                                    { val: 'sangat_tidak_puas', label: 'Sangat Buruk', icon: 'sentiment_very_dissatisfied', color: 'red' },
                                    { val: 'tidak_puas', label: 'Buruk', icon: 'sentiment_dissatisfied', color: 'orange' },
                                    { val: 'kurang_puas', label: 'Cukup', icon: 'sentiment_neutral', color: 'yellow' },
                                    { val: 'puas', label: 'Baik', icon: 'sentiment_satisfied', color: 'green' },
                                    { val: 'sangat_puas', label: 'Sangat Baik', icon: 'sentiment_very_satisfied', color: 'blue' }
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
                                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isChecked ? `border-${item.color}-500/50 bg-${item.color}-50 text-${item.color}-600 shadow-xl` : 'border-gray-100 bg-white dark:bg-surface-dark text-gray-300 group-hover:bg-gray-50'}`}>
                                                <span className="rating-icon material-symbols-outlined text-4xl md:text-5xl">{item.icon}</span>
                                            </div>
                                            <span className={`text-xs font-bold transition-colors ${isChecked ? `text-${item.color}-600` : 'text-gray-400 group-hover:text-gray-500'}`}>{item.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="md:col-span-12 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-text-main dark:text-white mb-2" htmlFor="suggestions">Saran dan Keluhan</label>
                                <textarea
                                    id="suggestions"
                                    name="suggestions"
                                    value={formData.suggestions}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Tuliskan saran atau keluhan Anda di sini untuk perbaikan pelayanan kami..."
                                    className="w-full rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-gray-400 text-sm p-4"
                                ></textarea>
                            </div>
                            <div className="pt-4 border-t border-border-light dark:border-border-dark">
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2" htmlFor="date">Tanggal Survei</label>
                                <div className="relative max-w-sm">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-sub text-lg">calendar_today</span>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white focus:border-primary focus:ring-primary/20 text-sm h-11"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4 pb-12">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 group transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
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

            <footer className="bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark mt-auto py-8">
                <div className="max-w-[960px] mx-auto px-4 md:px-8 text-center">
                    <div className="flex justify-center items-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">apartment</span>
                        </div>
                        <span className="text-sm font-semibold text-text-main dark:text-white">RSUD Kabupaten</span>
                    </div>
                    <p className="text-xs text-text-sub">
                        © 2024 RSUD Kabupaten. Hak Cipta Dilindungi Undang-undang.<br />
                        Sistem Survei Kepuasan Masyarakat Elektronik (e-SKM) v2.0
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PublicSurveyForm;