import React, { useState, useEffect } from 'react';
import { surveyService } from '../../services/surveyService';
import AppFooter from '../../components/AppFooter';

interface SurveyStats {
  total_surveys: number;
  total_responses: number;
  average_completion_rate: number;
  active_surveys: number;
  ikm_score?: number;
  nps_score?: number;
  response_rate?: number;
  average_q1?: number;
  average_q2?: number;
  average_q3?: number;
  average_q4?: number;
  average_q5?: number;
  average_q6?: number;
  average_q7?: number;
  average_q8?: number;
}

interface SurveyResponse {
  id: string;
  date: string;
  unit: string;
  unit_id: string;
  service_type: string;
  visitor_name: string | null;
  visitor_phone: string;
  is_anonymous: boolean;
  age_range: string;
  gender: string;
  q1_score: number | null;
  q2_score: number | null;
  q3_score: number | null;
  q4_score: number | null;
  q5_score: number | null;
  q6_score: number | null;
  q7_score: number | null;
  q8_score: number | null;
  overall_score: number | null;
  comments: string | null;
  average_rating: number;
}

interface UnitIKM {
  unit_id: string;
  unit_name: string;
  total_responses: number;
  average_score: number;
  ikm_score: number;
}

interface AddressStats {
  name: string;
  count: number;
  percentage: number;
}

interface Unit {
  id: string;
  name: string;
  code: string;
}

const surveyQuestions = [
  { code: 'U1', title: 'Persyaratan', key: 'q1_score' },
  { code: 'U2', title: 'Prosedur', key: 'q2_score' },
  { code: 'U3', title: 'Waktu', key: 'q3_score' },
  { code: 'U4', title: 'Biaya', key: 'q4_score' },
  { code: 'U5', title: 'Produk', key: 'q5_score' },
  { code: 'U6', title: 'Kompetensi', key: 'q6_score' },
  { code: 'U7', title: 'Perilaku', key: 'q7_score' },
  { code: 'U8', title: 'Pengaduan', key: 'q8_score' }
];

const SurveyReport: React.FC = () => {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [unitIKM, setUnitIKM] = useState<UnitIKM[]>([]);
  const [addressStats, setAddressStats] = useState<AddressStats[]>([]);
  const [addressGroupBy, setAddressGroupBy] = useState<'kabupaten_kota' | 'kecamatan' | 'kelurahan'>('kabupaten_kota');
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ period: 'this_month', unit: 'all' });
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { 
    fetchUnits();
  }, []);

  useEffect(() => { 
    fetchSurveyData(); 
  }, [dateRange, filters.unit]);

  useEffect(() => {
    fetchAddressStats();
  }, [dateRange, filters.unit, addressGroupBy]);

  const fetchUnits = async () => {
    try {
      const unitService = (await import('../../services/unitService')).default;
      const result = await unitService.getUnits();
      setUnits(result.units);
    } catch (err) {
      console.error('Error fetching units:', err);
    }
  };

  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        start_date: dateRange.start,
        end_date: dateRange.end,
        unit_id: filters.unit !== 'all' ? filters.unit : undefined
      };

      // Fetch semua data menggunakan surveyService
      const [statsData, responsesData, ikmData] = await Promise.all([
        surveyService.getStats(params).catch(err => {
          console.warn('Stats fetch failed:', err);
          return {
            total_surveys: 0,
            total_responses: 0,
            average_completion_rate: 0,
            active_surveys: 0,
            ikm_score: 0,
            nps_score: 0,
            response_rate: 100
          };
        }),
        surveyService.getResponses(params).catch(err => {
          console.warn('Responses fetch failed:', err);
          return [];
        }),
        surveyService.getIKMByUnit(params).catch(err => {
          console.warn('IKM fetch failed:', err);
          return [];
        })
      ]);

      setStats(statsData);
      setResponses(responsesData);
      setUnitIKM(ikmData);
    } catch (err: any) {
      console.error('Error fetching survey data:', err);
      setError(err.message || 'Gagal mengambil data survei');
    } finally { 
      setLoading(false); 
    }
  };

  const fetchAddressStats = async () => {
    try {
      const params = {
        start_date: dateRange.start,
        end_date: dateRange.end,
        unit_id: filters.unit !== 'all' ? filters.unit : undefined,
        group_by: addressGroupBy
      };
      
      const addressData = await surveyService.getAddressStats(params);
      setAddressStats(addressData);
    } catch (err: any) {
      console.error('Error fetching address stats:', err);
      setAddressStats([]);
    }
  };

  const handleExportReport = async (format: 'pdf' | 'print') => {
    try {
      if (format === 'print') {
        window.print();
      } else {
        // TODO: Implement PDF export
        alert('Fitur export PDF akan segera tersedia');
      }
    } catch (err: any) { 
      setError(err.message); 
    }
  };

  const handleApplyFilter = () => {
    const end = new Date();
    let start = new Date();
    if (filters.period === 'last_month') start.setMonth(start.getMonth() - 1);
    else if (filters.period === 'this_year') start = new Date(end.getFullYear(), 0, 1);
    else start = new Date(end.getFullYear(), end.getMonth(), 1);
    setDateRange({ start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] });
  };

  const renderStars = (rating: number) => (
    <div className="flex text-yellow-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`material-symbols-outlined text-[18px] ${star <= rating ? '' : 'text-slate-300'}`} style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
    </div>
  );

  const getSentiment = (rating: number) => {
    if (rating >= 4) return { text: 'Positif', bg: 'bg-emerald-500', textColor: 'text-emerald-600' };
    if (rating >= 3) return { text: 'Netral', bg: 'bg-yellow-500', textColor: 'text-yellow-600' };
    return { text: 'Negatif', bg: 'bg-orange-500', textColor: 'text-orange-600' };
  };

  // const getServiceTypeLabel = (type: string) => {
  //   const labels: Record<string, string> = {
  //     'rawat_jalan': 'Rawat Jalan',
  //     'rawat_inap': 'Rawat Inap',
  //     'darurat': 'IGD',
  //     'lainnya': 'Lainnya'
  //   };
  //   return labels[type] || type || '-';
  // };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Calculate distribution from actual data
  const calculateDistribution = () => {
    if (responses.length === 0) return [];
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    responses.forEach(r => {
      const avg = Math.round(r.average_rating);
      if (avg >= 1 && avg <= 5) dist[avg as keyof typeof dist]++;
    });
    const total = responses.length;
    return [
      { label: 'Sangat Puas', pct: Math.round((dist[5] / total) * 100), color: 'bg-emerald-500' },
      { label: 'Puas', pct: Math.round((dist[4] / total) * 100), color: 'bg-[#137fec]' },
      { label: 'Cukup', pct: Math.round((dist[3] / total) * 100), color: 'bg-yellow-400' },
      { label: 'Kurang Puas', pct: Math.round((dist[2] / total) * 100), color: 'bg-orange-500' },
      { label: 'Tidak Puas', pct: Math.round((dist[1] / total) * 100), color: 'bg-red-500' }
    ];
  };

  // Filter responses based on search
  const filteredResponses = responses.filter(r => 
    (r.comments?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     r.unit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     r.visitor_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#137fec]"></div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#f6f7f8]">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">Laporan Survey Kepuasan Masyarakat</h1>
          <p className="text-slate-500 text-base">Analisis komprehensif kepuasan pasien dan masyarakat terhadap layanan publik.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleExportReport('print')} className="flex items-center gap-2 h-10 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold hover:bg-slate-50">
            <span className="material-symbols-outlined text-[20px]">print</span>Cetak
          </button>
          <button onClick={() => handleExportReport('pdf')} className="flex items-center gap-2 h-10 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold hover:bg-slate-50">
            <span className="material-symbols-outlined text-[20px]">download</span>Unduh PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <label className="flex flex-col flex-1 min-w-[200px]">
            <span className="text-slate-700 text-xs font-semibold uppercase mb-2">Periode Waktu</span>
            <select className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={filters.period} onChange={(e) => setFilters({...filters, period: e.target.value})}>
              <option value="this_month">Bulan Ini</option>
              <option value="last_month">Bulan Lalu</option>
              <option value="this_year">Tahun Ini</option>
            </select>
          </label>
          <label className="flex flex-col flex-1 min-w-[200px]">
            <span className="text-slate-700 text-xs font-semibold uppercase mb-2">Unit Kerja</span>
            <select className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={filters.unit} onChange={(e) => setFilters({...filters, unit: e.target.value})}>
              <option value="all">Semua Unit</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </label>
          <button onClick={handleApplyFilter} className="h-11 px-6 bg-[#137fec] text-white rounded-lg text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>Terapkan
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 h-36 relative group">
          <div className="absolute right-0 top-0 p-4 opacity-5"><span className="material-symbols-outlined text-6xl text-[#137fec]">groups</span></div>
          <p className="text-slate-500 text-sm mb-1">Total Responden</p>
          <p className="text-slate-900 text-3xl font-black">{stats?.total_responses?.toLocaleString() || responses.length}</p>
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold mt-2">
            <span className="material-symbols-outlined text-sm">trending_up</span>Data Aktual
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 h-36 relative group">
          <div className="absolute right-0 top-0 p-4 opacity-5"><span className="material-symbols-outlined text-6xl text-[#137fec]">sentiment_satisfied</span></div>
          <p className="text-slate-500 text-sm mb-1">Indeks Kepuasan (IKM)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-slate-900 text-3xl font-black">{stats?.ikm_score?.toFixed(1) || '0'}</p>
            <span className="text-sm text-slate-500">/ 100</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold mt-2">
            <span className="material-symbols-outlined text-sm">trending_up</span>Dari 8 Unsur
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 h-36 relative group">
          <div className="absolute right-0 top-0 p-4 opacity-5"><span className="material-symbols-outlined text-6xl text-[#137fec]">campaign</span></div>
          <p className="text-slate-500 text-sm mb-1">Net Promoter Score</p>
          <p className="text-slate-900 text-3xl font-black">{stats?.nps_score !== undefined ? (stats.nps_score >= 0 ? '+' : '') + stats.nps_score : '0'}</p>
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold mt-2">
            <span className="material-symbols-outlined text-sm">arrow_upward</span>{(stats?.nps_score || 0) >= 0 ? 'Baik' : 'Perlu Perbaikan'}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 h-36 relative group">
          <div className="absolute right-0 top-0 p-4 opacity-5"><span className="material-symbols-outlined text-6xl text-[#137fec]">rate_review</span></div>
          <p className="text-slate-500 text-sm mb-1">Tingkat Respon</p>
          <p className="text-slate-900 text-3xl font-black">{stats?.response_rate || '100'}%</p>
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold mt-2">
            <span className="material-symbols-outlined text-sm">trending_up</span>Aktif
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Question Scores */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Skor Per Unsur Pelayanan</h3>
          <div className="flex flex-col gap-4">
            {surveyQuestions.map((q) => {
              const statsKey = `average_${q.key.replace('_score', '')}` as keyof SurveyStats;
              const score = stats?.[statsKey] as number || 0;
              const pct = (Number(score) / 5) * 100;
              return (
                <div key={q.code} className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 w-28">{q.code}: {q.title}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#137fec] rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 w-12 text-right">{Number(score).toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Distribusi Nilai Survey</h3>
          <div className="flex flex-col gap-4">
            {calculateDistribution().map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-sm text-slate-600 w-24">{item.label}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                </div>
                <span className="text-sm font-bold text-slate-900 w-10 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IKM Comparison by Unit - NEW FEATURE */}
      {unitIKM.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Komparasi IKM Per Unit Kerja
              </h3>
              {filters.unit !== 'all' && (
                <p className="text-xs text-slate-500 mt-1">
                  Unit: {units.find(u => u.id === filters.unit)?.name || 'Unit Terpilih'}
                </p>
              )}
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {unitIKM.length} Unit
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {unitIKM.map((unit, index) => {
              const maxIKM = Math.max(...unitIKM.map(u => u.ikm_score));
              const minIKM = Math.min(...unitIKM.map(u => u.ikm_score));
              const isHighest = unit.ikm_score === maxIKM && unitIKM.length > 1;
              const isLowest = unit.ikm_score === minIKM && unitIKM.length > 1;
              
              return (
                <div key={unit.unit_id} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-48">
                    <span className="text-xs font-bold text-slate-400 w-6">{index + 1}</span>
                    <span className="text-sm text-slate-700 truncate flex-1" title={unit.unit_name}>{unit.unit_name}</span>
                  </div>
                  <div className="flex-1 h-10 bg-slate-100 rounded-lg overflow-hidden relative">
                    <div 
                      className={`h-full rounded-lg transition-all duration-700 ${
                        isHighest ? 'bg-emerald-500' : isLowest ? 'bg-orange-500' : 'bg-[#137fec]'
                      }`}
                      style={{ width: `${unit.ikm_score}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="text-xs font-bold text-white drop-shadow">
                        {unit.ikm_score > 0 ? unit.ikm_score.toFixed(1) : '0'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-32">
                    <span className="text-sm font-bold text-slate-900">{unit.ikm_score.toFixed(1)}</span>
                    <span className="text-xs text-slate-500">({unit.total_responses} respon)</span>
                  </div>
                  {isHighest && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      <span className="material-symbols-outlined text-sm">trending_up</span>Tertinggi
                    </span>
                  )}
                  {isLowest && (
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      <span className="material-symbols-outlined text-sm">trending_down</span>Terendah
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <span>Tertinggi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#137fec] rounded"></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Terendah</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grafik Distribusi Alamat */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Distribusi Responden Berdasarkan Alamat</h3>
            <select 
              className="h-9 px-3 rounded-lg border border-slate-200 text-sm"
              value={addressGroupBy}
              onChange={(e) => setAddressGroupBy(e.target.value as 'kabupaten_kota' | 'kecamatan' | 'kelurahan')}
            >
              <option value="kabupaten_kota">Kabupaten/Kota</option>
              <option value="kecamatan">Kecamatan</option>
              <option value="kelurahan">Kelurahan/Desa</option>
            </select>
          </div>
        </div>
        <div className="p-6">
          {addressStats.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-30">location_off</span>
              <p>Belum ada data alamat</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addressStats.slice(0, 10).map((addr, idx) => {
                const maxCount = Math.max(...addressStats.map(a => a.count));
                const barWidth = (addr.count / maxCount) * 100;
                const colors = [
                  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 
                  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-yellow-500',
                  'bg-red-500', 'bg-cyan-500'
                ];
                const color = colors[idx % colors.length];
                
                return (
                  <div key={addr.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{addr.name}</span>
                      <span className="text-slate-500">{addr.count} responden ({addr.percentage}%)</span>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                      <div 
                        className={`h-full ${color} transition-all duration-500 flex items-center justify-end px-3`}
                        style={{ width: `${barWidth}%` }}
                      >
                        {barWidth > 15 && (
                          <span className="text-white text-xs font-bold">{addr.percentage}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {addressStats.length > 10 && (
            <div className="mt-4 text-center text-sm text-slate-500">
              Menampilkan 10 teratas dari {addressStats.length} {addressGroupBy === 'kabupaten_kota' ? 'kabupaten/kota' : addressGroupBy === 'kecamatan' ? 'kecamatan' : 'kelurahan'}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Data Survei ({filteredResponses.length} responden)</h3>
          <input 
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm" 
            placeholder="Cari..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-slate-500">Tanggal</th>
                <th className="px-4 py-3 text-slate-500">Responden</th>
                <th className="px-4 py-3 text-slate-500">Unit</th>
                <th className="px-4 py-3 text-slate-500">Rating</th>
                <th className="px-4 py-3 text-slate-500">Komentar</th>
                <th className="px-4 py-3 text-slate-500">Sentimen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data survei
                  </td>
                </tr>
              ) : (
                filteredResponses.slice(0, 20).map((response) => {
                  const sentiment = getSentiment(response.average_rating);
                  return (
                    <tr key={response.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="text-xs text-slate-500">{formatDate(response.date)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {response.is_anonymous ? 'Anonim' : (response.visitor_name || '-')}
                        </div>
                        <div className="text-xs text-slate-500">{response.visitor_phone}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {response.unit || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {renderStars(Math.round(response.average_rating))}
                        <div className="text-xs text-slate-500 mt-1">{response.average_rating.toFixed(1)}/5</div>
                      </td>
                      <td className="px-4 py-4 text-slate-700 max-w-xs truncate">
                        {response.comments || '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${sentiment.textColor}`}>
                          <span className={`w-2 h-2 rounded-full ${sentiment.bg}`}></span>
                          {sentiment.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 text-sm text-slate-500">
          Menampilkan {Math.min(20, filteredResponses.length)} dari {filteredResponses.length} data
        </div>
      </div>

      <AppFooter variant="minimal" className="pb-8 pt-4" />
    </div>
  );
};

export default SurveyReport;
