import { FileText, Video, Eye, Calendar } from 'lucide-react';
import Card from '../ui/Card';
import { InnovationItem } from '../../types';

interface InnovationCardProps {
  item: InnovationItem;
  onClick: () => void;
}

const InnovationCard = ({ item, onClick }: InnovationCardProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card hover onClick={onClick}>
      <div className="relative">
        {/* Thumbnail or Icon */}
        <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
          {item.type === 'powerpoint' ? (
            <FileText className="w-20 h-20 text-primary-600" />
          ) : (
            <Video className="w-20 h-20 text-secondary-600" />
          )}
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 right-3">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${item.type === 'powerpoint' 
              ? 'bg-primary-500 text-white' 
              : 'bg-secondary-500 text-white'
            }
          `}>
            {item.type === 'powerpoint' ? 'PowerPoint' : 'Video'}
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
