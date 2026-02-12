import { useState, useEffect } from 'react';
import { Search, Download, Users } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { VisitorRecord } from '../../types';
import { getAllVisitors, exportVisitors } from '../../services/visitorService';

const VisitorManagement = () => {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<VisitorRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVisitors();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVisitors(visitors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = visitors.filter(
        (v) =>
          v.nama.toLowerCase().includes(query) ||
          v.instansi.toLowerCase().includes(query)
      );
      setFilteredVisitors(filtered);
    }
  }, [searchQuery, visitors]);

  const fetchVisitors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllVisitors();
      setVisitors(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data pengunjung');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportVisitors();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pengunjung-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal mengekspor data');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Memuat data pengunjung...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchVisitors}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Data Pengunjung</h2>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Cari berdasarkan nama atau instansi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
        />
      </div>

      {/* Stats */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">
            Total Pengunjung: <span className="text-primary-600 font-bold">{visitors.length}</span>
          </span>
          {searchQuery && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">
                Hasil pencarian: {filteredVisitors.length}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      {filteredVisitors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchQuery ? 'Tidak ada hasil yang ditemukan' : 'Belum ada pengunjung terdaftar'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nama</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Instansi</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jabatan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">No. HP</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map((visitor) => (
                <tr key={visitor._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{visitor.nama}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{visitor.instansi}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{visitor.jabatan}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{visitor.noHandphone}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(visitor.registeredAt).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VisitorManagement;
