import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// import complaintService from '../../services/complaintService';

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

const SurveyForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const qrToken = searchParams.get('qr') || searchParams.get('token');
    const [isLoading, setIsLoading] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
    const [formData, setFormData] = useState({
        // Survey ratings
        overall_score: '',
        response_time_score: '',
        solution_quality_score: '',
        staff_courtesy_score: '',
        comments: '',
        // Service info
        unit_id: '',
        service_category_id: '',
        service_description: '',
        // Reporter info (optional)
        reporter_name: '',
        reporter_email: '',
        reporter_phone: '',
        is_anonymous: false
    });

    // Load master data
    useEffect(() => {
        loadMasterData();
    }, []);

    const loadMasterData = async () => {
        try {
            setIsLoading(true);
            
            // Load units
            const unitsResponse = await fetch('/api/public/units');
            if (unitsResponse.ok) {
                const unitsResult = await unitsResponse.json();
                setUnits(unitsResult.data || []);
            }

            // Load service categories
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
        
        // Validasi minimal satu rating diisi
        const hasRating = formData.overall_score || formData.response_time_score || 
                          formData.solution_quality_score || formData.staff_courtesy_score;
        
        if (!hasRating) {
            alert('Mohon berikan minimal satu penilaian');
            return;
        }

        // Validasi unit dan kategori layanan
        if (!formData.unit_id) {
            alert('Mohon pilih unit/bagian yang memberikan layanan');
            return;
        }

        if (!formData.service_category_id) {
            alert('Mohon pilih kategori layanan');
            return;
        }

        if (!formData.service_description.trim()) {
            alert('Mohon deskripsikan layanan yang Anda terima');
            return;
        }

        setIsLoading(true);

        try {
            const surveyData = {
                // Survey ratings
                overall_score: formData.overall_score ? parseInt(formData.overall_score) : null,
                response_time_score: formData.response_time_score ? parseInt(formData.response_time_score) : null,
                solution_quality_score: formData.solution_quality_score ? parseInt(formData.solution_quality_score) : null,
                staff_courtesy_score: formData.staff_courtesy_score ? parseInt(formData.staff_courtesy_score) : null,
                comments: formData.comments || null,
                // Service info
                unit_id: formData.unit_id,
                service_category_id: formData.service_category_id,
                service_description: formData.service_description,
                // Reporter info
                reporter_name: formData.is_anonymous ? null : formData.reporter_name || null,
                reporter_email: formData.is_anonymous ? null : formData.reporter_email || null,
                reporter_phone: formData.is_anonymous ? null : formData.reporter_phone || null,
                is_anonymous: formData.is_anonymous,
                // QR token if available
                qr_token: qrToken
            };

            // Submit survey directly without ticket dependency
            const response = await fetch('/api/public/surveys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(surveyData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Gagal mengirim survei');
            }

            alert('Survei berhasil dikirim! Terima kasih atas feedback Anda.');
            
            // Reset form
            setFormData({
                overall_score: '',
                response_time_score: '',
                solution_quality_score: '',
                staff_courtesy_score: '',
                comments: '',
                unit_id: '',
                service_category_id: '',
                service_description: '',
                reporter_name: '',
                reporter_email: '',
                reporter_phone: '',
                is_anonymous: false
            });

            // Redirect to success page
            navigate('/survey?survey=success');

        } catch (error: any) {
            console.error('Error submitting survey:', error);
            alert('Terjadi kesalahan: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const RatingButton = ({ questionId, value }: { questionId: string; value: number }) => {
        const isSelected = formData[questionId as keyof typeof formData] === value.toString();
        const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-green-600'];
        const icons = ['sentiment_very_dissatisfied', 'sentiment_dissatisfied', 'sentiment_neutral', 'sentiment_satisfied', 'sentiment_very_satisfied'];

        return (
            <label className="cursor-pointer group relative z-10">
                <input
                    className="peer sr-only"
                    name={questionId}
                    type="radio"
                    value={value}
                    checked={isSelected}
                    onChange={(e) => handleInputChange(questionId, e.target.value)}
                />
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-gray-400 bg-transparent peer-checked:bg-white peer-checked:${colors[value - 1]} peer-checked:shadow-sm transition-all hover:bg-white/50`}>
                    <span className={`material-symbols-outlined text-lg ${isSelected ? colors[value - 1] : ''}`}>{icons[value - 1]}</span>
                </div>
            </label>
        );
    };

    if (isLoading && units.length === 0) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Memuat form survei...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <div className="bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">Survei Kepuasan</h1>
                            <p className="text-xs text-slate-500 font-medium">Sistem Pengaduan Terintegrasi</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-[960px] mx-auto px-4 py-8 md:px-8">
                {/* QR Code Info */}
                {qrToken && (
                    <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600">
                                <span className="material-symbols-outlined text-2xl">qr_code</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Akses melalui QR Code</h3>
                                <p className="text-blue-700 dark:text-blue-300">Anda mengakses survei ini melalui QR Code. Silakan isi form di bawah ini.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Survey Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Introduction */}
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            Survei Kepuasan Layanan
                        </h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Bantuan Anda sangat berharga untuk meningkatkan kualitas pelayanan kami. 
                            Mohon berikan penilaian yang objektif terhadap layanan yang telah Anda terima.
                        </p>
                    </div>

                    {/* Service Information */}
                    <section className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Informasi Layanan</h3>
                            <p className="text-sm text-slate-500 mt-1">Mohon isi informasi tentang layanan yang Anda terima</p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Unit Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                    Unit/Bagian yang Memberikan Layanan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 text-sm p-4"
                                    value={formData.unit_id}
                                    onChange={(e) => handleInputChange('unit_id', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Unit/Bagian</option>
                                    {units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Service Category Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                    Kategori Layanan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 text-sm p-4"
                                    value={formData.service_category_id}
                                    onChange={(e) => handleInputChange('service_category_id', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Kategori Layanan</option>
                                    {serviceCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Service Description */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                    Deskripsi Layanan yang Diterima <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-slate-400 text-sm p-4"
                                    placeholder="Jelaskan layanan apa yang Anda terima (contoh: Pendaftaran rawat jalan, Konsultasi dokter, dll.)"
                                    rows={3}
                                    value={formData.service_description}
                                    onChange={(e) => handleInputChange('service_description', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Reporter Information */}
                    <section className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Informasi Pelapor</h3>
                            <p className="text-sm text-slate-500 mt-1">Opsional - Anda dapat mengisi survei secara anonim</p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Anonymous Option */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_anonymous"
                                    className="w-4 h-4 text-primary bg-slate-50 border-slate-300 rounded focus:ring-primary focus:ring-2"
                                    checked={formData.is_anonymous}
                                    onChange={(e) => handleInputChange('is_anonymous', e.target.checked.toString())}
                                />
                                <label htmlFor="is_anonymous" className="text-sm font-medium text-slate-900 dark:text-white">
                                    Kirim survei secara anonim (tanpa identitas)
                                </label>
                            </div>

                            {!formData.is_anonymous && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Reporter Name */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                            Nama Lengkap
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-slate-400 text-sm p-4"
                                            placeholder="Masukkan nama lengkap Anda"
                                            value={formData.reporter_name}
                                            onChange={(e) => handleInputChange('reporter_name', e.target.value)}
                                        />
                                    </div>

                                    {/* Reporter Email */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-slate-400 text-sm p-4"
                                            placeholder="contoh@email.com"
                                            value={formData.reporter_email}
                                            onChange={(e) => handleInputChange('reporter_email', e.target.value)}
                                        />
                                    </div>

                                    {/* Reporter Phone */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                            Nomor Telepon
                                        </label>
                                        <input
                                            type="tel"
                                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-slate-400 text-sm p-4"
                                            placeholder="08xxxxxxxxxx"
                                            value={formData.reporter_phone}
                                            onChange={(e) => handleInputChange('reporter_phone', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Rating Questions */}
                    <section className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Penilaian Layanan</h3>
                            <p className="text-sm text-slate-500 mt-1">Beri penilaian dari 1 (Sangat Buruk) hingga 5 (Sangat Baik)</p>
                        </div>
                        
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {/* Overall Score */}
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Penilaian Keseluruhan</h4>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            Secara keseluruhan, bagaimana tingkat kepuasan Anda terhadap layanan yang diberikan?
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 md:gap-4 min-w-[280px]">
                                        <span className="text-xs font-bold text-slate-400">1</span>
                                        <div className="flex flex-1 justify-between bg-slate-100 dark:bg-slate-800 rounded-full p-1">
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <RatingButton key={value} questionId="overall_score" value={value} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">5</span>
                                    </div>
                                </div>
                            </div>

                            {/* Response Time Score */}
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Kecepatan Respon</h4>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            Bagaimana penilaian Anda terhadap kecepatan respon dan penanganan tiket?
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 md:gap-4 min-w-[280px]">
                                        <span className="text-xs font-bold text-slate-400">1</span>
                                        <div className="flex flex-1 justify-between bg-slate-100 dark:bg-slate-800 rounded-full p-1">
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <RatingButton key={value} questionId="response_time_score" value={value} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">5</span>
                                    </div>
                                </div>
                            </div>

                            {/* Solution Quality Score */}
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Kualitas Solusi</h4>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            Bagaimana penilaian Anda terhadap kualitas solusi yang diberikan?
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 md:gap-4 min-w-[280px]">
                                        <span className="text-xs font-bold text-slate-400">1</span>
                                        <div className="flex flex-1 justify-between bg-slate-100 dark:bg-slate-800 rounded-full p-1">
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <RatingButton key={value} questionId="solution_quality_score" value={value} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">5</span>
                                    </div>
                                </div>
                            </div>

                            {/* Staff Courtesy Score */}
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Keramahan Petugas</h4>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            Bagaimana penilaian Anda terhadap keramahan dan profesionalitas petugas?
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 md:gap-4 min-w-[280px]">
                                        <span className="text-xs font-bold text-slate-400">1</span>
                                        <div className="flex flex-1 justify-between bg-slate-100 dark:bg-slate-800 rounded-full p-1">
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <RatingButton key={value} questionId="staff_courtesy_score" value={value} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Comments Section */}
                    <section className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                                    Komentar dan Saran (Opsional)
                                </label>
                                <textarea
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-slate-400 text-sm p-4"
                                    placeholder="Berikan komentar, saran, atau masukan untuk perbaikan layanan kami..."
                                    rows={4}
                                    value={formData.comments}
                                    onChange={(e) => handleInputChange('comments', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 pb-12">
                        <button
                            className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 group transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
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
            <footer className="bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 mt-auto py-8">
                <div className="max-w-[960px] mx-auto px-4 md:px-8 text-center">
                    <p className="text-xs text-slate-500">
                        © 2024 Sistem Pengaduan Terintegrasi. Hak Cipta Dilindungi Undang-undang.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default SurveyForm;