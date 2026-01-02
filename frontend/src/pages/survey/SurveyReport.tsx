import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

interface SurveyData {
    id: string;
    ticket_id: string;
    overall_score: number | null;
    response_time_score: number | null;
    solution_quality_score: number | null;
    staff_courtesy_score: number | null;
    comments: string | null;
    submitted_at: string;
    tickets: {
        ticket_number: string;
        title: string;
        units: { name: string } | null;
        service_categories: { name: string } | null;
    } | null;
}

interface SurveyStats {
    totalResponses: number;
    averageOverallScore: number;
    averageResponseTimeScore: number;
    averageSolutionQualityScore: number;
    averageStaffCourtesyScore: number;
    responseRate: number;
}

const SurveyReport = () => {
    const [surveys, setSurveys] = useState<SurveyData[]>([]);
    const [stats, setStats] = useState<SurveyStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [units, setUnits] = useState<Array<{id: string, name: string}>>([]);
    const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
    const [filters, setFilters] = useState({
        period: 'current_month',
        unit: 'all',
        category: 'all'
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadSurveyData();
    }, [filters]);

    const loadInitialData = async () => {
        try {
            // Load units and categories for filters
            const [unitsResult, categoriesResult] = await Promise.all([
                supabase.from('units').select('id, name').eq('is_active', true),
                supabase.from('service_categories').select('id, name').eq('is_active', true)
            ]);

            if (unitsResult.data) setUnits(unitsResult.data);
            if (categoriesResult.data) setCategories(categoriesResult.data);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    };

    const loadSurveyData = async () => {
        try {
            setIsLoading(true);
            
            // Build query with joins
            let query = supabase
                .from('satisfaction_surveys')
                .select(`
                    *,
                    tickets!inner(
                        ticket_number,
                        title,
                        type,
                        units(name),
                        service_categories(name)
                    )
                `);

            // Apply date filters
            const now = new Date();
            if (filters.period === 'current_month') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                query = query.gte('submitted_at', startOfMonth.toISOString());
            } else if (filters.period === 'last_month') {
                const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                query = query
                    .gte('submitted_at', startOfLastMonth.toISOString())
                    .lte('submitted_at', endOfLastMonth.toISOString());
            } else if (filters.period === 'current_year') {
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                query = query.gte('submitted_at', startOfYear.toISOString());
            }

            // Apply unit filter
            if (filters.unit !== 'all') {
                query = query.eq('tickets.unit_id', filters.unit);
            }

            // Apply category filter  
            if (filters.category !== 'all') {
                query = query.eq('tickets.category_id', filters.category);
            }

            const { data, error } = await query.order('submitted_at', { ascending: false });

            if (error) throw error;

            setSurveys(data || []);
            calculateStats(data || []);
        } catch (error) {
            console.error('Error loading survey data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (surveyData: SurveyData[]) => {
        if (surveyData.length === 0) {
            setStats({ 
                totalResponses: 0, 
                averageOverallScore: 0, 
                averageResponseTimeScore: 0,
                averageSolutionQualityScore: 0,
                averageStaffCourtesyScore: 0,
                responseRate: 0 
            });
            return;
        }

        const totalResponses = surveyData.length;
        
        // Calculate averages for each score type
        const totalOverallScore = surveyData.reduce((sum, survey) => sum + (survey.overall_score || 0), 0);
        const totalResponseTimeScore = surveyData.reduce((sum, survey) => sum + (survey.response_time_score || 0), 0);
        const totalSolutionQualityScore = surveyData.reduce((sum, survey) => sum + (survey.solution_quality_score || 0), 0);
        const totalStaffCourtesyScore = surveyData.reduce((sum, survey) => sum + (survey.staff_courtesy_score || 0), 0);

        const averageOverallScore = totalOverallScore / totalResponses;
        const averageResponseTimeScore = totalResponseTimeScore / totalResponses;
        const averageSolutionQualityScore = totalSolutionQualityScore / totalResponses;
        const averageStaffCourtesyScore = totalStaffCourtesyScore / totalResponses;

        setStats({
            totalResponses,
            averageOverallScore: Math.round(averageOverallScore * 10) / 10,
            averageResponseTimeScore: Math.round(averageResponseTimeScore * 10) / 10,
            averageSolutionQualityScore: Math.round(averageSolutionQualityScore * 10) / 10,
            averageStaffCourtesyScore: Math.round(averageStaffCourtesyScore * 10) / 10,
            responseRate: 92 // Mock data - could be calculated from tickets vs surveys ratio
        });
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        loadSurveyData();
    };

    const getScoreDistribution = () => {
        if (surveys.length === 0) return [];
        
        const distribution = [
            { label: 'Sangat Puas (5)', count: 0, color: 'bg-emerald-500' },
            { label: 'Puas (4)', count: 0, color: 'bg-primary' },
            { label: 'Cukup (3)', count: 0, color: 'bg-yellow-400' },
            { label: 'Kurang Puas (2)', count: 0, color: 'bg-orange-500' },
            { label: 'Tidak Puas (1)', count: 0, color: 'bg-red-500' }
        ];

        surveys.forEach(survey => {
            const score = survey.overall_score || 0;
            if (score >= 1 && score <= 5) {
                distribution[5 - score].count++;
            }
        });

        return distribution.map(item => ({
            ...item,
            percentage: Math.round((item.count / surveys.length) * 100)
        }));
    };

    const getSentimentAnalysis = (comments: string) => {
        if (!comments) return { type: 'neutral', confidence: 0 };
        
        // Simple sentiment analysis based on keywords
        const positiveWords = ['baik', 'bagus', 'puas', 'senang', 'ramah', 'cepat', 'profesional'];
        const negativeWords = ['buruk', 'lambat', 'tidak', 'kurang', 'jelek', 'lama', 'kecewa'];
        
        const words = comments.toLowerCase().split(' ');
        let positiveCount = 0;
        let negativeCount = 0;
        
        words.forEach(word => {
            if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
            if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
        });
        
        if (positiveCount > negativeCount) {
            return { type: 'positive', confidence: Math.min(95, 60 + (positiveCount * 10)) };
        } else if (negativeCount > positiveCount) {
            return { type: 'negative', confidence: Math.min(95, 60 + (negativeCount * 10)) };
        }
        
        return { type: 'neutral', confidence: 70 };
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 md:p-8 space-y-8">
            {/* Page Heading & Filters */}
            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
                <div className="flex flex-col gap-2 max-w-2xl">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Laporan Survey Kepuasan Masyarakat</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-relaxed">Analisis komprehensif kepuasan pasien dan masyarakat terhadap layanan publik, termasuk wawasan berbasis AI.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center justify-center gap-2 h-10 px-4 bg-surface-light dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">print</span>
                        <span>Cetak</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 h-10 px-4 bg-surface-light dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        <span>Unduh PDF</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <label className="flex flex-col flex-1 w-full min-w-[200px]">
                        <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Periode Waktu</span>
                        <div className="relative">
                            <select
                                className="w-full appearance-none h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                value={filters.period}
                                onChange={(e) => handleFilterChange('period', e.target.value)}
                            >
                                <option value="current_month">Bulan Ini (Desember 2024)</option>
                                <option value="last_month">Bulan Lalu (November 2024)</option>
                                <option value="current_year">Tahun Ini (2024)</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
                        </div>
                    </label>
                    <label className="flex flex-col flex-1 w-full min-w-[200px]">
                        <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Unit Layanan</span>
                        <div className="relative">
                            <select
                                className="w-full appearance-none h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                value={filters.unit}
                                onChange={(e) => handleFilterChange('unit', e.target.value)}
                            >
                                <option value="all">Semua Unit</option>
                                {units.map(unit => (
                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
                        </div>
                    </label>
                    <label className="flex flex-col flex-1 w-full min-w-[200px]">
                        <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Kategori Layanan</span>
                        <div className="relative">
                            <select
                                className="w-full appearance-none h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <option value="all">Semua Kategori</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
                        </div>
                    </label>
                    <button
                        onClick={applyFilters}
                        className="h-11 px-6 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold shadow-sm shadow-primary/30 transition-all flex items-center justify-center gap-2 min-w-[140px]"
                    >
                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                        Terapkan Filter
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1 */}
                <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-36 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-primary">groups</span>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Responden</p>
                        <p className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">{stats?.totalResponses || 0}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 self-start px-2 py-1 rounded text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        <span>+12% vs bulan lalu</span>
                    </div>
                </div>

                {/* KPI 2 */}
                <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-36 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-primary">sentiment_satisfied</span>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Rata-rata Kepuasan</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">{stats?.averageOverallScore || 0}</p>
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/ 5</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 self-start px-2 py-1 rounded text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        <span>+0.3 poin</span>
                    </div>
                </div>

                {/* KPI 3 */}
                <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-36 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-primary">speed</span>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Waktu Respon</p>
                        <p className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">{stats?.averageResponseTimeScore || 0}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 self-start px-2 py-1 rounded text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">arrow_upward</span>
                        <span>Baik</span>
                    </div>
                </div>

                {/* KPI 4 */}
                <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-36 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-primary">rate_review</span>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Kualitas Solusi</p>
                        <p className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">{stats?.averageSolutionQualityScore || 0}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 self-start px-2 py-1 rounded text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        <span>+0.2 poin</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tren Kepuasan Bulanan</h3>
                        <button className="text-primary text-sm font-medium hover:underline">Lihat Detail</button>
                    </div>
                    {/* Simulated Chart */}
                    <div className="h-64 w-full relative">
                        {/* Y Axis Labels */}
                        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-slate-400 font-medium">
                            <span>100</span>
                            <span>75</span>
                            <span>50</span>
                            <span>25</span>
                            <span>0</span>
                        </div>
                        {/* Chart Area */}
                        <div className="ml-10 h-full pb-8 border-l border-b border-slate-200 dark:border-slate-700 relative">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
                                <div className="w-full h-px bg-transparent"></div>
                            </div>
                            {/* The Line SVG */}
                            <svg className="absolute inset-0 w-full h-[calc(100%-2rem)]" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#137fec" stopOpacity="0.2"></stop>
                                        <stop offset="100%" stopColor="#137fec" stopOpacity="0"></stop>
                                    </linearGradient>
                                </defs>
                                <path d="M0,80 Q50,70 100,50 T200,60 T300,30 T400,40 T500,20 T600,25" fill="url(#gradient)" stroke="none"></path>
                                <path d="M0,80 Q50,70 100,50 T200,60 T300,30 T400,40 T500,20 T600,25" fill="none" stroke="#137fec" strokeLinecap="round" strokeWidth="3"></path>
                                {/* Dots */}
                                <circle className="hover:r-6 transition-all cursor-pointer" cx="100" cy="50" fill="#137fec" r="4"></circle>
                                <circle className="hover:r-6 transition-all cursor-pointer" cx="200" cy="60" fill="#137fec" r="4"></circle>
                                <circle className="hover:r-6 transition-all cursor-pointer" cx="300" cy="30" fill="#137fec" r="4"></circle>
                                <circle className="hover:r-6 transition-all cursor-pointer" cx="400" cy="40" fill="#137fec" r="4"></circle>
                                <circle className="hover:r-6 transition-all cursor-pointer" cx="500" cy="20" fill="#137fec" r="4"></circle>
                            </svg>
                        </div>
                        {/* X Axis Labels */}
                        <div className="absolute left-10 right-0 bottom-0 h-8 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
                            <span>Jul</span>
                            <span>Ags</span>
                            <span>Sep</span>
                            <span>Okt</span>
                            <span>Nov</span>
                            <span>Des</span>
                        </div>
                    </div>
                </div>

                {/* Distribution Chart */}
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Distribusi Nilai Survey</h3>
                        <button className="text-primary text-sm font-medium hover:underline">Lihat Detail</button>
                    </div>
                    <div className="flex flex-col gap-5 h-64 justify-center">
                        {/* Bar Item */}
                        {getScoreDistribution().map((item) => (
                            <div key={item.label} className="flex items-center gap-4">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 w-24">{item.label}</span>
                                <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white w-10 text-right">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/50 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex flex-col gap-3 max-w-xs">
                        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                            <span className="material-symbols-outlined animate-pulse">auto_awesome</span>
                            <h3 className="text-lg font-bold">Analisis AI Insight</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            AI kami telah menganalisis <span className="font-bold">342 komentar</span> dari responden bulan ini. Berikut adalah ringkasan sentimen utama.
                        </p>
                        <button className="mt-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group w-fit">
                            Lihat Laporan Lengkap
                            <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                        </button>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Positive Card */}
                        <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-lg border border-white/50 dark:border-slate-700 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="size-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">thumb_up</span>
                                </div>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Sentimen Positif Utama</span>
                            </div>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                    Keramahan perawat di Poli Anak sangat diapresiasi.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                    Kebersihan ruang tunggu IGD meningkat signifikan.
                                </li>
                            </ul>
                        </div>
                        {/* Negative Card */}
                        <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-lg border border-white/50 dark:border-slate-700 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="size-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">thumb_down</span>
                                </div>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Area Perlu Perbaikan</span>
                            </div>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-orange-500 shrink-0"></span>
                                    Waktu tunggu pengambilan obat di Farmasi &gt; 45 menit.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="mt-1.5 size-1.5 rounded-full bg-orange-500 shrink-0"></span>
                                    Kesulitan parkir mobil pada jam sibuk (09:00 - 11:00).
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Feedback Table */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Umpan Balik Terbaru</h3>
                    <div className="flex gap-2">
                        <input
                            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Cari responden..."
                            type="text"
                        />
                        <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">sort</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">ID & Tanggal</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Unit Layanan</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Rating</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400 min-w-[300px]">Komentar</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Analisis Sentimen</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : surveys.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data survey untuk periode yang dipilih
                                    </td>
                                </tr>
                            ) : (
                                surveys.map((survey) => {
                                    const sentiment = getSentimentAnalysis(survey.comments || '');
                                    const formatDate = (dateString: string) => {
                                        const date = new Date(dateString);
                                        return date.toLocaleDateString('id-ID', { 
                                            day: 'numeric', 
                                            month: 'short', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        });
                                    };

                                    return (
                                        <tr key={survey.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900 dark:text-white">
                                                        {survey.tickets?.ticket_number || 'N/A'}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {formatDate(survey.submitted_at)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                    {survey.tickets?.units?.name || 'Unit Tidak Diketahui'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex text-yellow-400">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <span 
                                                            key={i} 
                                                            className={`material-symbols-outlined text-[18px] ${
                                                                i <= (survey.overall_score || 0) ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'
                                                            }`}
                                                        >
                                                            star
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300 max-w-xs">
                                                <div className="truncate">
                                                    {survey.comments || 'Tidak ada komentar'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                                                    sentiment.type === 'positive' 
                                                        ? 'text-emerald-600 dark:text-emerald-400' 
                                                        : sentiment.type === 'negative'
                                                        ? 'text-orange-600 dark:text-orange-400'
                                                        : 'text-yellow-600 dark:text-yellow-400'
                                                }`}>
                                                    <span className={`size-2 rounded-full ${
                                                        sentiment.type === 'positive' 
                                                            ? 'bg-emerald-500' 
                                                            : sentiment.type === 'negative'
                                                            ? 'bg-orange-500'
                                                            : 'bg-yellow-500'
                                                    }`}></span>
                                                    {sentiment.type === 'positive' ? 'Positif' : sentiment.type === 'negative' ? 'Negatif' : 'Netral'} ({sentiment.confidence}%)
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-400 hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined">more_vert</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Menampilkan {surveys.length} dari {surveys.length} data
                    </span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm disabled:opacity-50" disabled>Prev</button>
                        <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 bg-primary text-white text-sm">1</button>
                        <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center pb-8 pt-4 text-slate-400 dark:text-slate-600 text-xs">
                © 2024 Sistem Informasi Manajemen Rumah Sakit. Dilindungi Undang-Undang.
            </div>
        </div>
    );
};

export default SurveyReport;
