import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Database } from '../types/supabase';

type NotificationSettingsData = Database['public']['Tables']['pengaturan_notifikasi']['Row'];

const NotificationSettings = () => {
    const [settings, setSettings] = useState<Partial<NotificationSettingsData>>({
        email_notif: true,
        wa_notif: false,
        web_push_notif: true,
        tiket_masuk: true,
        eskalasi: true,
        sla_warning: true,
        respon_baru: true,
        tiket_selesai: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [realTimeSubscription, setRealTimeSubscription] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
        fetchNotifications();
        setupRealTimeSubscription();
        
        return () => {
            if (realTimeSubscription) {
                realTimeSubscription.unsubscribe();
            }
        };
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            const { data, error } = await supabase
                .from('pengaturan_notifikasi')
                .select('*')
                .eq('pengguna_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
                console.error('Error fetching settings:', error);
            }

            if (data) {
                setSettings(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error fetching notifications:', error);
            } else {
                setNotifications(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const setupRealTimeSubscription = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const subscription = supabase
                .channel('notifications')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('Real-time notification:', payload);
                        fetchNotifications(); // Refresh notifications
                        
                        // Show browser notification if enabled
                        if (settings.web_push_notif && 'Notification' in window) {
                            if (Notification.permission === 'granted') {
                                const notificationData = payload.new as any;
                                new Notification('Notifikasi Baru', {
                                    body: notificationData?.message || notificationData?.title || 'Anda memiliki notifikasi baru',
                                    icon: '/favicon.ico'
                                });
                            }
                        }
                    }
                )
                .subscribe();

            setRealTimeSubscription(subscription);
        } catch (error) {
            console.error('Error setting up real-time subscription:', error);
        }
    };

    const handleToggle = (key: keyof NotificationSettingsData) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setMessage({ type: 'success', text: 'Izin notifikasi browser telah diberikan!' });
            }
        }
    };

    const handleSave = async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('pengaturan_notifikasi')
                .upsert({
                    pengguna_id: userId,
                    ...settings,
                    diperbarui_pada: new Date().toISOString()
                }, { onConflict: 'pengguna_id' });

            if (error) throw error;
            
            // Request browser notification permission if web push is enabled
            if (settings.web_push_notif) {
                await requestNotificationPermission();
            }
            
            setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
        } catch (error: any) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: `Gagal menyimpan pengaturan: ${error.message}` });
        } finally {
            setIsSaving(false);
        }
    };

    const markNotificationAsRead = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;
            fetchNotifications(); // Refresh notifications
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Memuat pengaturan notifikasi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Pesan Notifikasi */}
            {message && (
                <div className={`p-4 rounded-lg border ${
                    message.type === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                }`}>
                    <div className="flex items-center justify-between">
                        <span>{message.text}</span>
                        <button 
                            onClick={() => setMessage(null)}
                            className="ml-4 text-current hover:opacity-70"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Header Halaman */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-[#0d141b] dark:text-white">Pengaturan Notifikasi Real-time</h1>
                <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl">
                    Sesuaikan cara dan waktu Anda menerima pemberitahuan real-time untuk Sistem Manajemen Keluhan.
                    Pastikan saluran prioritas tinggi diaktifkan untuk peringatan SLA.
                </p>
            </div>

            {/* Notifikasi Terbaru */}
            <div className="rounded-xl border border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-[#182430] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">Notifikasi Terbaru</h3>
                    <button
                        onClick={fetchNotifications}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Muat Ulang
                    </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                            Belum ada notifikasi
                        </p>
                    ) : (
                        notifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`p-3 rounded-lg border ${notification.is_read ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-[#0d141b] dark:text-white">{notification.title}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notification.message}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                            {new Date(notification.created_at).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <button
                                            onClick={() => markNotificationAsRead(notification.id)}
                                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            Tandai Dibaca
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Pengaturan Global */}
            <div className="rounded-xl border border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-[#182430] p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center size-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined">notifications_off</span>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-base font-bold text-[#0d141b] dark:text-white">Jangan Ganggu</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Jeda semua notifikasi non-kritis selama 24 jam.</p>
                        </div>
                    </div>
                    {/* Toggle Switch (Mock functionality for DND as it's not in schema yet) */}
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input className="sr-only peer" type="checkbox" value="" disabled />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary opacity-50 cursor-not-allowed"></div>
                    </label>
                </div>
            </div>

            {/* Konfigurasi Saluran */}
            <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold text-[#0d141b] dark:text-white px-1">Saluran Notifikasi</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Saluran Email */}
                    <div className="flex flex-col justify-between rounded-xl border border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-[#182430] p-5 shadow-sm">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="material-symbols-outlined text-slate-400">mail</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Email</span>
                                <span className={`ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${settings.email_notif ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400'}`}>
                                    {settings.email_notif ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-[#0d141b] dark:text-white truncate">Email Utama</p>
                            <p className="text-xs text-slate-500 mt-1">Terima notifikasi melalui email</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Aktifkan</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    className="sr-only peer"
                                    type="checkbox"
                                    checked={settings.email_notif || false}
                                    onChange={() => handleToggle('email_notif')}
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                    {/* Saluran Web Push */}
                    <div className="flex flex-col justify-between rounded-xl border border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-[#182430] p-5 shadow-sm">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="material-symbols-outlined text-slate-400">laptop_chromebook</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Web Push</span>
                                <span className={`ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${settings.web_push_notif ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400'}`}>
                                    {settings.web_push_notif ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-[#0d141b] dark:text-white">Notifikasi Browser</p>
                            <p className="text-xs text-slate-500 mt-1">Chrome, Firefox, Edge</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Aktifkan</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    className="sr-only peer"
                                    type="checkbox"
                                    checked={settings.web_push_notif || false}
                                    onChange={() => handleToggle('web_push_notif')}
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                    {/* Saluran WhatsApp */}
                    <div className="flex flex-col justify-between rounded-xl border border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-[#182430] p-5 shadow-sm">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="material-symbols-outlined text-slate-400">chat</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">WhatsApp</span>
                                <span className={`ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${settings.wa_notif ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400'}`}>
                                    {settings.wa_notif ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-[#0d141b] dark:text-white">Peringatan WhatsApp</p>
                            <p className="text-xs text-slate-500 mt-1">Terima peringatan instan</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Aktifkan</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    className="sr-only peer"
                                    type="checkbox"
                                    checked={settings.wa_notif || false}
                                    onChange={() => handleToggle('wa_notif')}
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matriks Pemicu Notifikasi */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-bold text-[#0d141b] dark:text-white">Pemicu Notifikasi</h2>
                    <button
                        onClick={() => setSettings({
                            email_notif: true,
                            wa_notif: false,
                            web_push_notif: true,
                            tiket_masuk: true,
                            eskalasi: true,
                            sla_warning: true,
                            respon_baru: true,
                            tiket_selesai: true
                        })}
                        className="text-sm text-primary font-medium hover:underline"
                    >
                        Reset ke default
                    </button>
                </div>
                <div className="rounded-xl border border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-[#182430] overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-[#1f2d3a] border-b border-[#e7edf3] dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/2">Jenis Kejadian</th>
                                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Aktifkan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e7edf3] dark:divide-slate-800">
                            {/* Tiket Masuk */}
                            <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#0d141b] dark:text-white">Tiket Masuk</span>
                                        <span className="text-xs text-slate-500 mt-0.5">Ketika keluhan baru terdaftar di departemen Anda.</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <label className="relative inline-flex items-center cursor-pointer justify-center">
                                        <input
                                            className="sr-only peer"
                                            type="checkbox"
                                            checked={settings.tiket_masuk || false}
                                            onChange={() => handleToggle('tiket_masuk')}
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </td>
                            </tr>
                            {/* Eskalasi */}
                            <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#0d141b] dark:text-white">Eskalasi</span>
                                        <span className="text-xs text-slate-500 mt-0.5">Ketika tiket dieskalasi ke prioritas lebih tinggi atau manajemen.</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <label className="relative inline-flex items-center cursor-pointer justify-center">
                                        <input
                                            className="sr-only peer"
                                            type="checkbox"
                                            checked={settings.eskalasi || false}
                                            onChange={() => handleToggle('eskalasi')}
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </td>
                            </tr>
                            {/* Peringatan SLA (Critical) */}
                            <tr className="group bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">warning</span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-red-700 dark:text-red-400">Peringatan SLA</span>
                                            <span className="text-xs text-slate-500 mt-0.5">Kritis: Ketika tiket akan melanggar perjanjian tingkat layanan.</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <label className="relative inline-flex items-center cursor-pointer justify-center">
                                        <input
                                            className="sr-only peer"
                                            type="checkbox"
                                            checked={settings.sla_warning || false}
                                            onChange={() => handleToggle('sla_warning')}
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </td>
                            </tr>
                            {/* Respon Baru */}
                            <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#0d141b] dark:text-white">Respon Baru</span>
                                        <span className="text-xs text-slate-500 mt-0.5">Ketika pengguna atau admin lain membalas tiket.</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <label className="relative inline-flex items-center cursor-pointer justify-center">
                                        <input
                                            className="sr-only peer"
                                            type="checkbox"
                                            checked={settings.respon_baru || false}
                                            onChange={() => handleToggle('respon_baru')}
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </td>
                            </tr>
                            {/* Tiket Selesai */}
                            <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#0d141b] dark:text-white">Tiket Selesai</span>
                                        <span className="text-xs text-slate-500 mt-0.5">Ketika tiket ditandai sebagai selesai dan ditutup.</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <label className="relative inline-flex items-center cursor-pointer justify-center">
                                        <input
                                            className="sr-only peer"
                                            type="checkbox"
                                            checked={settings.tiket_selesai || false}
                                            onChange={() => handleToggle('tiket_selesai')}
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Aksi */}
            <div className="sticky bottom-4 z-20 flex items-center justify-end gap-3 rounded-xl bg-white/80 dark:bg-[#182430]/80 p-4 shadow-lg backdrop-blur-md border border-[#e7edf3] dark:border-slate-800">
                <button
                    onClick={fetchSettings}
                    className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                    Batalkan Perubahan
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
            </div>
        </div>
    );
};

export default NotificationSettings;