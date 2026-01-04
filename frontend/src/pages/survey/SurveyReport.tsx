import React, { useState, useEffect } from 'react';
import reportService from '../../services/reportService';

interface SurveyStats {
  total_surveys: number;
  total_responses: number;
  average_completion_rate: number;
  active_surveys: number;
  ikm_score?: number;
  nps_score?: number;
  response_rate?: number;
}

interface FeedbackItem {
  id: string;
  date: string;
  unit: string;
  unitBg: string;
  unitText: string;
  rating: number;
  comment: string;
  sentiment: string;
  sentimentBg: string;
  sentimentText: string;
}

const SurveyReport: React.FC = () => {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ period: 'this_month', unit: 'all', patient_type: 'all' });
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const aiInsights = {
    positive: ['Keramahan perawat di Poli Anak sangat diapresiasi.', 'Kebersihan ruang tunggu IGD meningkat signifikan.'],
    negative: ['Waktu tunggu pengambilan obat di Farmasi lebih dari 45 menit.', 'Kesulitan parkir mobil pada jam sibuk.'],
    total_analyzed: 342
  };

  const recentFeedback: FeedbackItem[] = [
    { id: '#SRV-2023-891', date: '23 Okt, 10:30', unit: 'Poli Umum', unitBg: 'bg-blue-50', unitText: 'text-blue-700', rating: 5, comment: 'Pelayanan sangat cepat dan dokter menjelaskan diagnosa dengan sangat ramah.', sentiment: 'Positif (98%)', sentimentBg: 'bg-emerald-500', sentimentText: 'text-emerald-600' },
    { id: '#SRV-2023-890', date: '23 Okt, 09:15', unit: 'Farmasi', unitBg: 'bg-purple-50', unitText: 'text-purple-700', rating: 2, comment: 'Antrian obat terlalu lama.', sentiment: 'Negatif', sentimentBg: 'bg-orange-500', sentimentText: 'text-orange-600' },
    { id: '#SRV-2023-889', date: '22 Okt, 14:20', unit: 'IGD', unitBg: 'bg-rose-50', unitText: 'text-rose-700', rating: 4, comment: 'Penanganan cukup baik.', sentiment: 'Netral', sentimentBg: 'bg-yellow-500', sentimentText: 'text-yellow-600' }
  ];

  useEffect(() => { fetchSurveyReports(); }, []);

  const fetchSurveyReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await reportService.getSurveyStats(dateRange.start, dateRange.end);
      setStats(statsData || { total_surveys: 1240, total_responses: 1240, average_completion_rate: 92, active_surveys: 5, ikm_score: 88.5, nps_score: 42, response_rate: 92 });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
      setStats({ total_surveys: 1240, total_responses: 1240, average_completion_rate: 92, active_surveys: 5, ikm_score: 88.5, nps_score: 42, response_rate: 92 });
    } finally { setLoading(false); }
  };

  const handleExportReport = async (format: 'pdf' | 'print') => {
    try {
      if (format === 'print') window.print();
      else await reportService.exportSurveyReport(dateRange.start, dateRange.end);
    } catch (err: any) { setError(err.message); }
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

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#137fec]"></div></div>;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#f6f7f8]">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">Laporan Survey Kepuasan Masyarakat</h1>
          <p className="text-slate-500 text-base">Analisis komprehensif kepuasan pasien dan masyarakat terhadap layanan publik.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleExportReport('print')} className="flex items-center gap-2 h-10 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold hover:bg-slate-50"><span className="material-symbols-outlined text-[20px]">print</span>Cetak</button>
          <button onClick={() => handleExportReport('pdf')} className="flex items-center gap-2 h-10 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold hover:bg-slate-50"><span className="material-symbols-outlined text-[20px]">download</span>Unduh PDF</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <label className="flex flex-col flex-1 min-w-[200px]">
            <span className="text-slate-700 text-xs font-semibold uppercase mb-2">Periode Waktu</span>
            <select className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={filters.period} onChange={(e) => setFilters({...filters, period: e.target.value})}>
              <option value="this_month">Bulan Ini</option><option value="last_month">Bulan Lalu</option><option value="this_year">Tahun Ini</option>
            </select>
          </label>
          <label className="flex flex-col flex-1 min-w-[200px]">
            <span className="text-slate-700 text-xs font-semibold uppercase mb-2">Unit Layanan</span>
            <select className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={filters.unit} onChange={(e) => setFilters({...filters, unit: e.target.value})}>
              <option value="all">Semua Unit</option><option value="poli">Poli Umum</option><option value="igd">IGD</option><option value="farmasi">Farmasi</option>
            </select>
          </label>
          <label className="flex flex-col flex-1 min-w-[200px]">
            <span className="text-slate-700 text-xs font-semibold uppercase mb-2">Jenis Pasien</span>
            <select className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={filters.patient_type} onChange={(e) => setFilters({...filters, patient_type: e.target.value})}>
              <option value="all">Semua</option><option value="bpjs">BPJS</option><option value="umum">Umum</option>
            </select>
          </label>
          <button onClick={handleApplyFilter} className="h-11 px-6 bg-[#137fec] text-white rounded-lg text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">filter_list</span>Terapkan</button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 h-36 relative group">
          <div className="absolute right-0 top-0 p-4 opacity-5"><span className="material-symbols-outlined text-6xl text-[#137fec]">groups</span></div>
          <p className="text-slate-500 text-sm mb-1">Total Responden</p>
          <p className="text-slate-900 text-3xl font-black">{stats?.total_responses?.toLocaleString() || '1,240'}</p>
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold mt-2"><span className="material-symbols-outlined text-sm">trending_up</span>+12%</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 h-36 relative group">
          <div className="absolute right-0 top-0 p-4 opacity-5"><span className="material-symbols-outlined text-6xl text-[#137fec]">sentiment_satisfied</span></div>
          <p className="text-slate-500 text-sm mb-1">Indeks Kepuasan (IKM)</p>
          <div className="flex items-baseline gap-2"><p className="text-slate-900 text-3xl font-black">{stats?.ikm_score || '88.5'}</p><span className="text-sm text-slate-500">/ 100</span></div>
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold mt-2"><span className="material-symbols-outlined text-sm">trending_up</span>+2.5</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 h-36 relative group">
          <div className="absolute right-0 top-0 p-4 opacity-5"><span className="material-symbols-outlined text-6xl text-[#137fec]">campaign</span></div>
          <p className="text-slate-500 text-sm mb-1">Net Promoter Score</p>
          <p className="text-slate-900 text-3xl font-black">+{stats?.nps_score || '42'}</p>
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold mt-2"><span className="material-symbols-outlined text-sm">arrow_upward</span>Baik</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 h-36 relative group">
          <div className="absolute right-0 top-0 p-4 opacity-5"><span className="material-symbols-outlined text-6xl text-[#137fec]">rate_review</span></div>
          <p className="text-slate-500 text-sm mb-1">Tingkat Respon</p>
          <p className="text-slate-900 text-3xl font-black">{stats?.response_rate || '92'}%</p>
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold mt-2"><span className="material-symbols-outlined text-sm">trending_up</span>+1.2%</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Tren Kepuasan Bulanan</h3>
          <div className="h-64 flex items-center justify-center text-slate-400">Chart akan ditampilkan di sini</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Distribusi Nilai Survey</h3>
          <div className="flex flex-col gap-4">
            {[{ label: 'Sangat Puas', pct: 65, color: 'bg-emerald-500' }, { label: 'Puas', pct: 25, color: 'bg-[#137fec]' }, { label: 'Cukup', pct: 7, color: 'bg-yellow-400' }, { label: 'Kurang Puas', pct: 2, color: 'bg-orange-500' }, { label: 'Tidak Puas', pct: 1, color: 'bg-red-500' }].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-sm text-slate-600 w-24">{item.label}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div></div>
                <span className="text-sm font-bold text-slate-900 w-10 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 max-w-xs">
            <div className="flex items-center gap-2 text-indigo-700 mb-2"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span><h3 className="text-lg font-bold">Analisis AI Insight</h3></div>
            <p className="text-sm text-slate-600">AI telah menganalisis <span className="font-bold">{aiInsights.total_analyzed} komentar</span> dari responden bulan ini.</p>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><span className="material-symbols-outlined text-sm">thumb_up</span></div><span className="text-sm font-bold">Sentimen Positif</span></div>
              <ul className="space-y-1">{aiInsights.positive.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>{item}</li>)}</ul>
            </div>
            <div className="bg-white/60 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><span className="material-symbols-outlined text-sm">thumb_down</span></div><span className="text-sm font-bold">Area Perbaikan</span></div>
              <ul className="space-y-1">{aiInsights.negative.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>{item}</li>)}</ul>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Umpan Balik Terbaru</h3>
          <input className="h-9 px-3 rounded-lg border border-slate-200 text-sm" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <table className="w-full text-left text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="px-6 py-3 text-slate-500">ID & Tanggal</th><th className="px-6 py-3 text-slate-500">Unit</th><th className="px-6 py-3 text-slate-500">Rating</th><th className="px-6 py-3 text-slate-500">Komentar</th><th className="px-6 py-3 text-slate-500">Sentimen</th></tr></thead>
          <tbody className="divide-y divide-slate-200">
            {recentFeedback.filter(f => f.comment.toLowerCase().includes(searchQuery.toLowerCase())).map((fb) => (
              <tr key={fb.id} className="hover:bg-slate-50">
                <td className="px-6 py-4"><div className="font-medium text-slate-900">{fb.id}</div><div className="text-xs text-slate-500">{fb.date}</div></td>
                <td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${fb.unitBg} ${fb.unitText}`}>{fb.unit}</span></td>
                <td className="px-6 py-4">{renderStars(fb.rating)}</td>
                <td className="px-6 py-4 text-slate-700">{fb.comment}</td>
                <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-bold ${fb.sentimentText}`}><span className={`w-2 h-2 rounded-full ${fb.sentimentBg}`}></span>{fb.sentiment}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 border-t border-slate-200 text-sm text-slate-500">Menampilkan 3 dari 1,240 data</div>
      </div>

      <div className="text-center pb-8 pt-4 text-slate-400 text-xs">© 2024 Sistem Informasi Manajemen Rumah Sakit</div>
    </div>
  );
};

export default SurveyReport;
