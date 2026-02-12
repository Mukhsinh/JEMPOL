import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { masterDataService, TicketType, ServiceCategory } from '../../services/masterDataService';
import unitService, { Unit } from '../../services/unitService';

const InternalTicketForm: React.FC = () => {
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
  const [charCount, setCharCount] = useState(0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        alert(`Tiket berhasil dibuat! Nomor tiket: ${response.data?.ticket_number || 'N/A'}`);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Memuat formulir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 font-sans">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-rose-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-rose-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header Modern */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 sticky top-0">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="material-symbols-outlined text-white text-xl">confirmation_number</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              Buat Tiket Baru
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            {/* Error Alert */}
            {error && (
              <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-orange-500">description</span>
                <h3 className="text-gray-800 text-base font-bold">Detail Tiket</h3>
              </div>

              {/* Judul */}
              <div>
                <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                  Judul Tiket <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors">title</span>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base shadow-sm"
                    placeholder="Ringkasan singkat masalah..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Tipe & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                    Tipe <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors pointer-events-none">category</span>
                    <select
                      className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      required
                    >
                      <option value="">Pilih tipe...</option>
                      {(Array.isArray(ticketTypes) ? ticketTypes : []).map(ticketType => (
                        <option key={ticketType.id} value={ticketType.code.toLowerCase()}>
                          {ticketType.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors pointer-events-none">folder</span>
                    <select
                      className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm cursor-pointer"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                    >
                      <option value="">Pilih kategori...</option>
                      {(Array.isArray(categories) ? categories : []).map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Prioritas */}
              <div>
                <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                  Prioritas <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {priorityOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPriority(option.value)}
                      className={`relative p-3 rounded-xl border-2 transition-all ${
                        priority === option.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-8 h-8 ${option.color} rounded-lg flex items-center justify-center`}>
                          <span className="material-symbols-outlined text-white text-lg">{option.icon}</span>
                        </div>
                        <span className={`text-xs font-medium ${
                          priority === option.value 
                            ? 'text-orange-700' 
                            : 'text-gray-600'
                        }`}>
                          {option.label}
                        </span>
                      </div>
                      {priority === option.value && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-xs">check</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit */}
              <div>
                <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                  Unit <span className="text-rose-500">*</span>
                  {unitLocked && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">lock</span>
                      Terkunci
                    </span>
                  )}
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors pointer-events-none">apartment</span>
                  <select
                    className={`w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base appearance-none shadow-sm ${
                      unitLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                    }`}
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    disabled={unitLocked}
                    required
                  >
                    <option value="">Pilih unit...</option>
                    {(Array.isArray(units) ? units : []).map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="text-gray-800 text-sm font-bold mb-2.5 block">
                  Deskripsi Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <textarea
                    className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all text-base resize-none shadow-sm"
                    rows={5}
                    maxLength={2000}
                    placeholder="Jelaskan detail laporan Anda di sini..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setCharCount(e.target.value.length);
                    }}
                    required
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">Maksimal 2000 karakter</span>
                  <span className={`text-xs font-medium ${charCount > 1800 ? 'text-rose-500' : 'text-gray-500'}`}>
                    {charCount}/2000
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white border-t border-gray-100/50">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white font-bold text-lg shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-lg flex items-center justify-center gap-3 group"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                    <span>Mengirim Tiket...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">send</span>
                    <span>Kirim Tiket</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/tickets')}
                className="w-full mt-3 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">close</span>
                Batal
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-gray-400">
              Tiket Anda akan diproses dalam 1x24 jam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternalTicketForm;
