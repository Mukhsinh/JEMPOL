import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PublicSurveyLanding = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const qrCode = searchParams.get('qr') || searchParams.get('qrCode');
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSurveyStats();
    }, []);

    const loadSurveyStats = async () => {
        try {
            const response = await fetch('/api/public/survey/stats');
            if (response.ok) {
                const result = await response.json();
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error loading survey stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartSurvey = () => {
        const params = new URLSearchParams();
        if (qrCode) {
            params.set('qr', qrCode);
        }
        navigate(`/survey/public?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                            <span className="material-symbols-outlined text-2xl">poll</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold leading-tight text-slate-900 dark:text-white">Survei Kepuasan</h1>
                            <p className="text-sm text-slate-500 font-medium">Sistem Pengaduan Terintegrasi</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 py-12 md:px-8">
                {/* Hero Section */}
                <div className="text-center space-y-6 mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-6">
                        <span className="material-symbols-outlined text-4xl">sentiment_satisfied</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                        Survei Kepuasan Layanan
                    </h2>
                    
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Bantuan Anda sangat berharga untuk meningkatkan kualitas pelayanan kami. 
                        Mohon luangkan waktu sebentar untuk memberikan penilaian terhadap layanan yang telah Anda terima.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                        <button
                            onClick={handleStartSurvey}
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-3 group transform hover:scale-105"
                        >
                            <span className="material-symbols-outlined">rate_review</span>
                            <span>Mulai Survei</span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                        
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">schedule</span>
                            <span>Hanya membutuhkan 2-3 menit</span>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                {stats && !isLoading && (
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 mb-16">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Statistik Kepuasan Layanan</h3>
                            <p className="text-slate-600 dark:text-slate-400">Berdasarkan {stats.total_surveys} survei yang telah terkumpul</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">thumb_up</span>
                                </div>
                                <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-1">
                                    {stats.satisfaction_rate}%
                                </div>
                                <div className="text-sm font-medium text-green-700 dark:text-green-300">Tingkat Kepuasan</div>
                            </div>

                            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">star</span>
                                </div>
                                <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">
                                    {stats.average_overall}/5
                                </div>
                                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Rating Keseluruhan</div>
                            </div>

                            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">speed</span>
                                </div>
                                <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">
                                    {stats.average_response_time}/5
                                </div>
                                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Kecepatan Respon</div>
                            </div>

                            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl border border-orange-200 dark:border-orange-800">
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">support_agent</span>
                                </div>
                                <div className="text-3xl font-black text-orange-600 dark:text-orange-400 mb-1">
                                    {stats.average_staff_courtesy}/5
                                </div>
                                <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Keramahan Petugas</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="text-center p-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-white text-2xl">timer</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cepat & Mudah</h3>
                        <p className="text-slate-600 dark:text-slate-400">Survei dapat diselesaikan dalam 2-3 menit dengan antarmuka yang sederhana dan intuitif.</p>
                    </div>

                    <div className="text-center p-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-white text-2xl">security</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aman & Anonim</h3>
                        <p className="text-slate-600 dark:text-slate-400">Data Anda aman dan identitas dapat dijaga kerahasiaannya sesuai keinginan Anda.</p>
                    </div>

                    <div className="text-center p-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-white text-2xl">trending_up</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Dampak Nyata</h3>
                        <p className="text-slate-600 dark:text-slate-400">Feedback Anda langsung membantu kami meningkatkan kualitas layanan untuk semua.</p>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-12 text-white">
                    <h3 className="text-3xl font-bold mb-4">Siap Memberikan Penilaian?</h3>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Setiap penilaian Anda sangat berarti bagi kami untuk terus memberikan pelayanan terbaik.
                    </p>
                    <button
                        onClick={handleStartSurvey}
                        className="px-10 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 mx-auto group transform hover:scale-105"
                    >
                        <span className="material-symbols-outlined">rate_review</span>
                        <span>Mulai Survei Sekarang</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 mt-auto py-8">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center">
                    <p className="text-sm text-slate-500">
                        © 2024 Sistem Pengaduan Terintegrasi. Hak Cipta Dilindungi Undang-undang.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PublicSurveyLanding;