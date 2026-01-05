import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { masterDataService, TicketType, ServiceCategory } from '../../services/masterDataService';
import unitService, { Unit } from '../../services/unitService';

const CreateInternalTicket = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Ambil parameter dari URL (dari QR Landing)
    const unitIdFromUrl = searchParams.get('unit_id');
    const unitNameFromUrl = searchParams.get('unit_name');
    const qrCodeFromUrl = searchParams.get('qr_code');
    
    const [units, setUnits] = useState<Unit[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unitLocked, setUnitLocked] = useState(!!unitIdFromUrl);

    // Form State
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [priority, setPriority] = useState('medium');
    const [unitId, setUnitId] = useState(unitIdFromUrl || '');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        fetchMasterData();
    }, []);

    // Set unit dari URL jika ada
    useEffect(() => {
        if (unitIdFromUrl) {
            setUnitId(unitIdFromUrl);
            setUnitLocked(true);
        }
    }, [unitIdFromUrl]);

    const fetchMasterData = async () => {
        try {
            // Fetch units
            const unitsData = await unitService.getUnits();
            setUnits(unitsData?.units || []);

            // Fetch service categories
            const categoriesData = await masterDataService.getServiceCategories();
            setCategories(categoriesData || []);

            // Fetch ticket types
            const ticketTypesData = await masterDataService.getTicketTypes();
            setTicketTypes(ticketTypesData || []);
        } catch (error) {
            console.error('Error fetching master data:', error);
            setError('Gagal memuat data master. Silakan refresh halaman.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async () => {
        if (!title || !categoryId || !priority || !unitId || !type || !description) {
            setError('Harap isi semua field yang diperlukan.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const ticketData = {
                type,
                category_id: categoryId,
                title,
                description,
                unit_id: unitId,
                priority,
            };

            const response = await complaintService.createTicket(ticketData);
            
            if (response.success) {
                navigate('/tickets');
            } else {
                setError(response.error || 'Gagal membuat tiket');
            }
        } catch (err: any) {
            console.error('Error creating ticket:', err);
            setError(err.message || 'Terjadi kesalahan saat membuat tiket');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Priority options in Indonesian
    const priorityOptions = [
        { value: 'low', label: 'Rendah', color: '#10B981' },
        { value: 'medium', label: 'Sedang', color: '#F59E0B' },
        { value: 'high', label: 'Tinggi', color: '#EF4444' },
        { value: 'critical', label: 'Kritis', color: '#DC2626' }
    ];

    return (
        <>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                <Link to="/tickets" className="hover:text-primary transition-colors">Tiket</Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">Buat Tiket Internal</span>
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Buat Tiket Baru</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Catat masalah atau permintaan baru atas nama departemen atau pasien.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                        <span className="material-symbols-outlined text-red-600">error</span>
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-slate-900 dark:text-white">Informasi Tiket</h3>
                    </div>

                    <div className="p-6 flex flex-col gap-6">
                        {/* Title */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Judul <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Ringkasan singkat masalah..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Type */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipe <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        <option value="" disabled>Pilih tipe...</option>
                                        {ticketTypes.map(ticketType => (
                                            <option key={ticketType.id} value={ticketType.code.toLowerCase()}>
                                                {ticketType.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategori <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                    >
                                        <option value="" disabled>Pilih kategori...</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Priority */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prioritas <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        {priorityOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {/* Unit */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Unit <span className="text-red-500">*</span>
                                    {unitLocked && (
                                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                                            <span className="material-symbols-outlined text-xs">lock</span>
                                            Otomatis dari QR
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <select
                                        className={`w-full appearance-none px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${unitLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                                        value={unitId}
                                        onChange={(e) => setUnitId(e.target.value)}
                                        disabled={unitLocked}
                                    >
                                        <option value="" disabled>Pilih unit...</option>
                                        {units.map(unit => (
                                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi <span className="text-red-500">*</span></label>
                            <textarea
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-32 resize-none"
                                placeholder="Berikan informasi detail tentang masalah..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                            <p className="text-xs text-slate-500">Harap sertakan detail lokasi spesifik dan kode error yang relevan.</p>
                        </div>

                        {/* Attachments */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lampiran</label>
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group relative">
                                <input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">cloud_upload</span>
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {files.length > 0 ? `${files.length} file terpilih` : 'Klik untuk upload atau drag and drop'}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG atau GIF (maks. 10MB)</p>
                            </div>
                            {files.length > 0 && (
                                <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                    {files.map((f, i) => <li key={i}>{f.name} ({(f.size / 1024).toFixed(1)} KB)</li>)}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
                        <Link to="/tickets" className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            Batal
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[20px]">send</span>
                            {isSubmitting ? 'Membuat...' : 'Buat Tiket'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="h-10"></div>
        </>
    );
};

export default CreateInternalTicket;