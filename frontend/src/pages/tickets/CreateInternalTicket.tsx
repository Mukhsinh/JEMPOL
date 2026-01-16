import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { masterDataService, TicketType, ServiceCategory } from '../../services/masterDataService';
import unitService, { Unit } from '../../services/unitService';

const CreateInternalTicket = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const unitIdFromUrl = searchParams.get('unit_id');
    
    const [units, setUnits] = useState<Unit[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unitLocked, setUnitLocked] = useState(!!unitIdFromUrl);

    // Form State
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [priority, setPriority] = useState('medium');
    const [unitId, setUnitId] = useState(unitIdFromUrl || '');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchMasterData();
    }, []);

    useEffect(() => {
        if (unitIdFromUrl) {
            setUnitId(unitIdFromUrl);
            setUnitLocked(true);
        }
    }, [unitIdFromUrl]);

    const fetchMasterData = async () => {
        setIsLoading(true);
        try {
            // Fetch units
            try {
                const unitsResponse: any = await unitService.getUnits();
                let unitsArray: Unit[] = [];
                if (Array.isArray(unitsResponse)) {
                    unitsArray = unitsResponse;
                } else if (unitsResponse && Array.isArray(unitsResponse.units)) {
                    unitsArray = unitsResponse.units;
                } else if (unitsResponse && unitsResponse.data && Array.isArray(unitsResponse.data)) {
                    unitsArray = unitsResponse.data;
                } else if (unitsResponse && typeof unitsResponse === 'object') {
                    const possibleArrays = Object.values(unitsResponse).filter(v => Array.isArray(v));
                    if (possibleArrays.length > 0) {
                        unitsArray = possibleArrays[0] as Unit[];
                    }
                }
                setUnits(Array.isArray(unitsArray) ? unitsArray : []);
            } catch (unitError) {
                console.error('Error fetching units:', unitError);
                setUnits([]);
            }

            // Fetch service categories
            try {
                const categoriesResponse: any = await masterDataService.getServiceCategories();
                let categoriesArray: ServiceCategory[] = [];
                if (Array.isArray(categoriesResponse)) {
                    categoriesArray = categoriesResponse;
                } else if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
                    categoriesArray = categoriesResponse.data;
                } else if (categoriesResponse && Array.isArray(categoriesResponse.categories)) {
                    categoriesArray = categoriesResponse.categories;
                } else if (categoriesResponse && typeof categoriesResponse === 'object') {
                    const possibleArrays = Object.values(categoriesResponse).filter(v => Array.isArray(v));
                    if (possibleArrays.length > 0) {
                        categoriesArray = possibleArrays[0] as ServiceCategory[];
                    }
                }
                setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
            } catch (catError) {
                console.error('Error fetching categories:', catError);
                setCategories([]);
            }

            // Fetch ticket types
            try {
                const ticketTypesResponse: any = await masterDataService.getTicketTypes();
                let ticketTypesArray: TicketType[] = [];
                if (Array.isArray(ticketTypesResponse)) {
                    ticketTypesArray = ticketTypesResponse;
                } else if (ticketTypesResponse && Array.isArray(ticketTypesResponse.data)) {
                    ticketTypesArray = ticketTypesResponse.data;
                } else if (ticketTypesResponse && Array.isArray(ticketTypesResponse.ticketTypes)) {
                    ticketTypesArray = ticketTypesResponse.ticketTypes;
                } else if (ticketTypesResponse && typeof ticketTypesResponse === 'object') {
                    const possibleArrays = Object.values(ticketTypesResponse).filter(v => Array.isArray(v));
                    if (possibleArrays.length > 0) {
                        ticketTypesArray = possibleArrays[0] as TicketType[];
                    }
                }
                setTicketTypes(Array.isArray(ticketTypesArray) ? ticketTypesArray : []);
            } catch (typeError) {
                console.error('Error fetching ticket types:', typeError);
                setTicketTypes([]);
            }
        } catch (error) {
            console.error('Error fetching master data:', error);
            setError('Gagal memuat data master. Silakan refresh halaman.');
        } finally {
            setIsLoading(false);
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

    const priorityOptions = [
        { value: 'low', label: 'Rendah', color: 'bg-emerald-500', icon: 'arrow_downward' },
        { value: 'medium', label: 'Sedang', color: 'bg-amber-500', icon: 'remove' },
        { value: 'high', label: 'Tinggi', color: 'bg-orange-500', icon: 'arrow_upward' },
        { value: 'critical', label: 'Kritis', color: 'bg-red-500', icon: 'priority_high' }
    ];

    const selectedPriority = priorityOptions.find(p => p.value === priority);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 -m-6 md:-m-8 p-4 md:p-6">
            {/* Header Card */}
            <div className="max-w-2xl mx-auto mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Buat Tiket Baru</h1>
                            <p className="text-blue-100 text-sm mt-1">Catat masalah atau permintaan baru</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="max-w-2xl mx-auto">
                {isLoading ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400">Memuat data...</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
                        {/* Error Alert */}
                        {error && (
                            <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        )}

                        <div className="p-6 space-y-5">
                            {/* Judul */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-lg text-blue-500">title</span>
                                    Judul Tiket
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-0 transition-all"
                                    placeholder="Ringkasan singkat masalah..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Tipe & Kategori */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-lg text-purple-500">category</span>
                                        Tipe
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none px-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent rounded-xl text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-0 transition-all cursor-pointer"
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                        >
                                            <option value="">Pilih tipe...</option>
                                            {(Array.isArray(ticketTypes) ? ticketTypes : []).map(ticketType => (
                                                <option key={ticketType.id} value={ticketType.code.toLowerCase()}>
                                                    {ticketType.name}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-lg text-teal-500">folder</span>
                                        Kategori
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none px-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent rounded-xl text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-0 transition-all cursor-pointer"
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                        >
                                            <option value="">Pilih kategori...</option>
                                            {(Array.isArray(categories) ? categories : []).map(category => (
                                                <option key={category.id} value={category.id}>{category.name}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {/* Prioritas */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-lg text-orange-500">flag</span>
                                    Prioritas
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {priorityOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setPriority(option.value)}
                                            className={`relative p-3 rounded-xl border-2 transition-all ${
                                                priority === option.value
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className={`w-8 h-8 ${option.color} rounded-lg flex items-center justify-center`}>
                                                    <span className="material-symbols-outlined text-white text-lg">{option.icon}</span>
                                                </div>
                                                <span className={`text-xs font-medium ${
                                                    priority === option.value 
                                                        ? 'text-blue-700 dark:text-blue-300' 
                                                        : 'text-slate-600 dark:text-slate-400'
                                                }`}>
                                                    {option.label}
                                                </span>
                                            </div>
                                            {priority === option.value && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-xs">check</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Unit */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-lg text-indigo-500">apartment</span>
                                    Unit
                                    <span className="text-red-500">*</span>
                                    {unitLocked && (
                                        <span className="ml-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">lock</span>
                                            Terkunci
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <select
                                        className={`w-full appearance-none px-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent rounded-xl text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-0 transition-all ${
                                            unitLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                                        }`}
                                        value={unitId}
                                        onChange={(e) => setUnitId(e.target.value)}
                                        disabled={unitLocked}
                                    >
                                        <option value="">Pilih unit...</option>
                                        {(Array.isArray(units) ? units : []).map(unit => (
                                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-lg text-cyan-500">description</span>
                                    Deskripsi
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-0 transition-all resize-none"
                                    rows={4}
                                    placeholder="Berikan informasi detail tentang masalah yang dialami..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    Sertakan detail lokasi, waktu kejadian, dan kode error jika ada
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => navigate('/tickets')}
                                className="flex-1 sm:flex-none px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-xl">send</span>
                                {isSubmitting ? 'Mengirim...' : 'Kirim Tiket'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateInternalTicket;
