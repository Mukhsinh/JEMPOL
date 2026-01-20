import React from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrackTicketBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Search className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Lacak Tiket Pengaduan Anda
            </h3>
            <p className="text-blue-100">
              Pantau status dan progres pengaduan secara real-time
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/lacak-tiket')}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          Lacak Sekarang
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TrackTicketBanner;
