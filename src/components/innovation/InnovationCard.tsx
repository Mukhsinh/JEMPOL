import { FileText, Video, Eye, Calendar } from 'lucide-react';
import Card from '../ui/Card';
import { InnovationItem } from '../../types';

interface InnovationCardProps {
  item: InnovationItem;
  onClick: () => void;
}

const InnovationCard = ({ item, onClick }: InnovationCardProps) => {
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const API_BASE_URL = (import.meta as any).env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const fileUrl = `${API_BASE_URL}${item.fileUrl || item.file_url}`;

  return (
    <Card hover onClick={onClick}>
      <div className="relative">
        {/* Thumbnail or Icon */}
        <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center overflow-hidden relative">
          {item.type === 'video' ? (
            <div className="relative w-full h-full bg-black">
              <video 
                src={`${fileUrl}#t=0.1`}
                className="w-full h-full object-cover"
                preload="metadata"
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-4 shadow-2xl">
                  <Video className="w-12 h-12 text-secondary-600" />
                </div>
              </div>
            </div>
          ) : item.type === 'powerpoint' ? (
            <div className="relative w-full h-full bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 flex items-center justify-center">
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-3 gap-2 p-4 h-full">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-orange-400 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="relative text-center z-10">
                <div className="bg-white/95 rounded-2xl p-8 shadow-2xl inline-block backdrop-blur-sm">
                  <svg className="w-20 h-20 text-orange-600 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <path d="M14 2v6h6"/>
                    <path d="M9 13h6v2H9z"/>
                    <path d="M9 17h6v2H9z"/>
                  </svg>
                  <div className="text-sm font-bold text-gray-800">PowerPoint</div>
                  <div className="text-xs text-gray-600 mt-1">Presentasi</div>
                </div>
              </div>
            </div>
          ) : item.type === 'pdf' ? (
            <div className="relative w-full h-full bg-white flex items-center justify-center overflow-hidden">
              <iframe
                src={`${fileUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full pointer-events-none"
                style={{ transform: 'scale(1.2)', transformOrigin: 'top center' }}
                title={`${item.title} - Preview`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
            </div>
          ) : item.type === 'photo' ? (
            <img 
              src={fileUrl} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileText className="w-20 h-20 text-primary-600" />
          )}
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 right-3">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium shadow-lg
            ${item.type === 'powerpoint' 
              ? 'bg-orange-500 text-white' 
              : item.type === 'pdf'
              ? 'bg-green-600 text-white'
              : item.type === 'video'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
            }
          `}>
            {item.type === 'powerpoint' ? 'PowerPoint' : item.type === 'pdf' ? 'PDF' : item.type === 'video' ? 'Video' : 'Foto'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {item.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {item.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(item.uploadedAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{item.views}</span>
            </div>
          </div>
          <span className="text-gray-400">{formatFileSize(item.fileSize)}</span>
        </div>
      </div>
    </Card>
  );
};

export default InnovationCard;
