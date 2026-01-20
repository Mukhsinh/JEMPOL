import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface AppSettings {
  app_name?: string;
  app_logo?: string;
  app_footer?: string;
  institution_name?: string;
  institution_address?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
}

const PublicSurveyLanding = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const qrCode = searchParams.get('qr') || searchParams.get('qrCode');
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [appSettings, setAppSettings] = useState<AppSettings>({});

    useEffect(() => {
        loadSurveyStats();
        loadAppSettings();
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

    const loadSurveyStats = async () => {
        try {
            const response = await fetch('/api/public/surveys/stats');
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
        navigate(`/form/survey?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col font-['Inter',sans-serif]">
            {/* Main Content - Mobile App Style */}
            <main className="flex-grow w-full max-w-lg mx-auto px-5 py-8">
                {/* Hero Section */}
                <div className="text-center space-y-5 mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30 mb-4">
                        <span className="material-symbols-outlined text-4xl">sentiment_satisfied</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800">
                        Survei Kepuasan Layanan
                    </h2>

                    <p className="text-gray-500 leading-relaxed">
                        Bantuan Anda sangat berharga untuk meningkatkan kualitas pelayanan kami.
                    </p>

                    <button
                        onClick={handleStartSurvey}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">rate_review</span>
                        <span>Mulai Survei</span>
                    </button>

                    <div className="text-sm text-gray-400 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">schedule</span>
                        <span>Hanya 2-3 menit</span>
                    </div>
                </div>

                {/* Statistics Section */}
                {stats && !isLoading && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-1 text-center">Statistik Kepuasan</h3>
                        <p className="text-xs text-gray-400 text-center mb-6">{stats.total_surveys} survei terkumpul</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-2xl">
                                <div className="text-2xl font-bold text-green-600 mb-1">{stats.satisfaction_rate}%</div>
                                <div className="text-xs text-green-700">Kepuasan</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-2xl">
                                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.average_overall}/5</div>
                                <div className="text-xs text-blue-700">Rating</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-2xl">
                                <div className="text-2xl font-bold text-purple-600 mb-1">{stats.average_response_time}/5</div>
                                <div className="text-xs text-purple-700">Kecepatan</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-2xl">
                                <div className="text-2xl font-bold text-orange-600 mb-1">{stats.average_staff_courtesy}/5</div>
                                <div className="text-xs text-orange-700">Keramahan</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features */}
                <div className="space-y-4 mb-8">
                    {[
                        { icon: 'timer', color: 'blue', title: 'Cepat & Mudah', desc: 'Selesai dalam 2-3 menit' },
                        { icon: 'security', color: 'green', title: 'Aman & Anonim', desc: 'Data Anda terjaga kerahasiaannya' },
                        { icon: 'trending_up', color: 'purple', title: 'Dampak Nyata', desc: 'Feedback Anda membantu peningkatan layanan' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                                <span className={`material-symbols-outlined text-${item.color}-600`}>{item.icon}</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">{item.title}</h4>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-6 px-4">
                <div className="max-w-lg mx-auto text-center space-y-3">
                    {appSettings.institution_name && (
                        <p className="text-sm font-semibold text-gray-700">{appSettings.institution_name}</p>
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

export default PublicSurveyLanding;
