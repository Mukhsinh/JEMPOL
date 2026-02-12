import React from 'react';
import { CheckCircle, Search, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TicketSubmittedBannerProps {
  ticketNumber: string;
}

const TicketSubmittedBanner: React.FC<TicketSubmittedBannerProps> = ({ ticketNumber }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const copyTicketNumber = () => {
    navigator.clipboard.writeText(ticketNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-emerald-100 p-3 rounded-full">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Tiket Berhasil Dibuat!
          </h3>
          <p className="text-gray-600 mb-4">
            Pengaduan Anda telah terdaftar dalam sistem. Simpan nomor tiket di bawah ini untuk melacak progres pengaduan.
          </p>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700 mb-2 font-medium">Nomor Tiket Anda:</p>
            <div className="flex items-center gap-3">
              <code className="text-2xl font-bold text-blue-900 flex-1">
                {ticketNumber}
              </code>
              <button
                onClick={copyTicketNumber}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <Search className="w-6 h-6" />
            <div>
              <p className="font-semibold">Lacak Status Tiket Anda</p>
              <p className="text-sm text-blue-100">
                Pantau progres pengaduan secara real-time
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/lacak-tiket?ticket=${ticketNumber}`)}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Lacak Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketSubmittedBanner;
