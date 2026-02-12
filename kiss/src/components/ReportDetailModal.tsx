import { DetailedReport } from '../services/reportService';

interface ReportDetailModalProps {
  report: DetailedReport | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReportDetailModal = ({ report, isOpen, onClose }: ReportDetailModalProps) => {
  if (!isOpen || !report) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      case 'escalated': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Baru';
      case 'in_progress': return 'Sedang Proses';
      case 'resolved': return 'Selesai';
      case 'closed': return 'Ditutup';
      case 'escalated': return 'Eskalasi';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Detail Laporan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-500">ID Tiket</label>
              <p className="text-base font-medium text-gray-900 mt-1">{report.ticketNumber}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-500">Tanggal</label>
              <p className="text-base text-gray-900 mt-1">{report.date}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-500">Judul</label>
            <p className="text-base text-gray-900 mt-1">{report.title}</p>
          </div>

          {report.description && (
            <div>
              <label className="text-sm font-semibold text-gray-500">Deskripsi</label>
              <p className="text-base text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{report.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-500">Unit Kerja</label>
              <p className="text-base text-gray-900 mt-1">{report.unitName}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-500">Kategori</label>
              <p className="text-base text-gray-900 mt-1">{report.categoryName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-500">Jenis Pasien</label>
              <p className="text-base text-gray-900 mt-1">{report.patientTypeName}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-500">Status</label>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(report.status)}`}>
                  {getStatusLabel(report.status)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-500">Waktu Respon</label>
            <p className={`text-base font-medium mt-1 ${report.responseTime && report.responseTime > 60 ? 'text-red-600' : 'text-green-600'}`}>
              {report.responseTime !== null ? `${report.responseTime} Menit ${report.responseTime > 60 ? '(Lambat)' : '(Cepat)'}` : '-'}
            </p>
          </div>

          {/* Detail Pelapor/Pasien */}
          {(report.reporterName || report.reporterEmail || report.reporterPhone || report.reporterAddress) && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">person</span>
                Informasi Pelapor
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {report.reporterName && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Nama</label>
                    <p className="text-base text-gray-900 mt-1">{report.reporterName}</p>
                  </div>
                )}
                {report.reporterIdentityType && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Tipe Identitas</label>
                    <p className="text-base text-gray-900 mt-1">{report.reporterIdentityType}</p>
                  </div>
                )}
                {report.reporterEmail && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Email</label>
                    <p className="text-base text-gray-900 mt-1">{report.reporterEmail}</p>
                  </div>
                )}
                {report.reporterPhone && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Telepon</label>
                    <p className="text-base text-gray-900 mt-1">{report.reporterPhone}</p>
                  </div>
                )}
                {report.ageRange && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Rentang Usia</label>
                    <p className="text-base text-gray-900 mt-1">{report.ageRange}</p>
                  </div>
                )}
                {report.source && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Sumber</label>
                    <p className="text-base text-gray-900 mt-1 capitalize">{report.source}</p>
                  </div>
                )}
                {report.reporterAddress && (
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-gray-500">Alamat</label>
                    <p className="text-base text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{report.reporterAddress}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;
