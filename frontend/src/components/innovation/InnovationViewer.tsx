import { useEffect } from 'react';
import { Download, Eye } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { InnovationItem } from '../../types';
import { incrementView } from '../../services/innovationService';

interface InnovationViewerProps {
  item: InnovationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const InnovationViewer = ({ item, isOpen, onClose }: InnovationViewerProps) => {
  useEffect(() => {
    if (item && isOpen) {
      // Increment view count
      incrementView(item._id).catch(console.error);
    }
  }, [item, isOpen]);

  if (!item) return null;

  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const fileUrl = `${API_BASE_URL}${item.fileUrl}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = item.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.title}
      size="xl"
    >
      <div className="space-y-4">
        {/* Description */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700">{item.description}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{item.views} views</span>
          </div>
          <span>•</span>
          <span>
            {new Date(item.uploadedAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Media Content */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          {item.type === 'video' ? (
            <video
              controls
              className="w-full max-h-[60vh] object-contain"
              src={fileUrl}
            >
              Browser Anda tidak mendukung video player.
            </video>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="text-center">
                <p className="text-gray-700 mb-2">
                  File PowerPoint tidak dapat ditampilkan di browser
                </p>
                <p className="text-sm text-gray-500">
                  Silakan download file untuk melihat konten
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InnovationViewer;
