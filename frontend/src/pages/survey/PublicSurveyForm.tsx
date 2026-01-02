import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface SurveyFormData {
    overall_score: string;
    response_time_score: string;
    solution_quality_score: string;
    staff_courtesy_score: string;
    comments: string;
    unit_id?: string;
    service_category?: string;
    visitor_name?: string;
    visitor_email?: string;
    visitor_phone?: string;
}

const PublicSurveyForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const qrCode = searchParams.get('qr') || searchParams.get('qrCode');
    const unitId = searchParams.get('unit');
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [units, setUnits] = useState<any[]>([]);
    const [serviceCategories, setServiceCategories] = useState<any[]>([]);
    
    const [formData, setFormData] = useState<SurveyFormData>({
        overall_score: '',
        response_time_score: '',
        solution_quality_score: '',
        staff_courtesy_score: '',
        comments: '',
        unit_id: unitId || '',
        service_category: '',
        visitor_name: '',
        visitor_email: '',
        visitor_phone: ''
    });

    useEffect(() => {
        loadMasterData();
    }, []);

    const loadMasterData = async () => {
        try {
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
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Validasi minimal satu rating diisi
        const hasRating = formData.overall_score || formData.response_time_score || 
                          formData.solution_quality_score || formData.staff_courtesy_score;
        
        if (!hasRating) {
            setError('Mohon berikan minimal satu penilaian');
            return;
        }

        setIsLoading(true);

        try {
            const surveyData = {
                overall_score: formData.overall_score ? parseInt(formData.overall_score) : null,
                response_time_score: formData.response_time_score ? parseInt(formData.response_time_score) : null,
                solution_quality_score: formData.solution_quality_score ? parseInt(formData.solution_quality_score) : null,
                staff_courtesy_score: formData.staff_courtesy_score ? parseInt(formData.staff_courtesy_score) : null,
                comments: formData.comments || null,
                unit_id: formData.unit_id || null,
                service_category: formData.service_category || null,
                visitor_name: formData.visitor_name || null,
                visitor_email: formData.visitor_email || null,
                visitor_phone: formData.visitor_phone || null,
                qr_code: qrCode,
                source: 'public_survey'
            };

            const response = await fetch('/api/public/survey/submit', {
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

            setIsSubmitted(true);
            
            // Reset form
            setFormData({
                overall_score: '',
                response_time_score: '',
                solution_quality_score: '',
                staff_courtesy_score: '',
                comments: '',
                unit_id: unitId || '',
                service_category: '',
                visitor_name: '',
                visitor_email: '',
                visitor_phone: ''
            });

        } catch (error: any) {
            console.error('Error submitting survey:', error);
            setError(error.message || 'Terjadi kesalahan saat mengirim survei');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof SurveyFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const RatingButton = ({ questionId, value }: { questionId: keyof SurveyFormData; value: number }) => {
        const isSelected = formData[questionId] === value.toString();
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

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Survei Berhasil Dikirim!</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Terima kasih atas feedback Anda. Penilaian Anda sangat membantu kami untuk meningkatkan kualitas layanan.
                    </p>
                    <div className="space-y-3">
                        <button 
                            onClick={() => {
                                setIsSubmitted(false);
                                setFormData({
                                    overall_score: '',
                                    response_time_score: '',
                                    solution_quality_score: '',
                                    staff_courtesy_score: '',
                                    comments: '',
                                    unit_id: unitId || '',
                                    service_category: '',
                                    visitor_name: '',
                                    visitor_email: '',
                                    visitor_phone: ''
                                });
                            }}
                            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            Isi Survei Lagi
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className="w-full px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
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
                            <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">Survei Kepuasan Layanan</h1>
                            <p className="text-xs text-slate-500 font-medium">Sistem Pengaduan Terintegrasi</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-[960px] mx-auto px-4 py-8 md:px-8">
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

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-red-600">error</span>
                                <p className="text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Visitor Information (Optional) */}
                    <section className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Informasi Pengunjung (Opsional)</h3>
                            <p className="text-sm text-slate-500 mt-1">Informasi ini akan membantu kami memberikan layanan yang lebih baik</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-slate-400 text-sm p-3"
                                        placeholder="Masukkan nama lengkap Anda"
                                        value={formData.visitor_name}
                                        onChange={(e) => handleInputChange('visitor_name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-slate-400 text-sm p-3"
                                        placeholder="email@example.com"
                                        value={formData.visitor_email}
                                        onChange={(e) => handleInputChange('visitor_email', e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Nomor Telepon
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 placeholder:text-slate-400 text-sm p-3"
                                        placeholder="08xxxxxxxxxx"
                                        value={formData.visitor_phone}
                                        onChange={(e) => handleInputChange('visitor_phone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Unit/Bagian Layanan
                                    </label>
                                    <select
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 text-sm p-3"
                                        value={formData.unit_id}
                                        onChange={(e) => handleInputChange('unit_id', e.target.value)}
                                    >
                                        <option value="">Pilih Unit/Bagian</option>
                                        {units.map((unit) => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Kategori Layanan
                                </label>
                                <select
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20 text-sm p-3"
                                    value={formData.service_category}
                                    onChange={(e) => handleInputChange('service_category', e.target.value)}
                                >
                                    <option value="">Pilih Kategori Layanan</option>
                                    {serviceCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                                            Bagaimana penilaian Anda terhadap kecepatan respon dan penanganan layanan?
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
                                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Kualitas Layanan</h4>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            Bagaimana penilaian Anda terhadap kualitas layanan yang diberikan?
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

export default PublicSurveyForm;