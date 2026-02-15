import { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import InnovationCard from './InnovationCard';
import Button from '../ui/Button';
import { InnovationItem } from '../../types';
import { getAllInnovations } from '../../services/innovationService';

interface InnovationGalleryProps {
  type?: 'powerpoint' | 'pdf' | 'video' | 'photo';
  onItemClick: (item: InnovationItem) => void;
}

const InnovationGallery = ({ type, onItemClick }: InnovationGalleryProps) => {
  const [items, setItems] = useState<InnovationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInnovations();
  }, [type]);

  const fetchInnovations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching innovations for type:', type);
      const response = await getAllInnovations(type as any);
      console.log('Innovations response:', response);
      setItems(response.data || []);
    } catch (err) {
      console.error('Error fetching innovations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data inovasi';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Memuat galeri...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchInnovations}>Coba Lagi</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <Lightbulb className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Belum Ada Konten
        </h3>
        <p className="text-gray-600">
          Konten akan ditampilkan di sini setelah diupload oleh admin
        </p>
      </div>
    );
  }

  // For photos, use grid layout
  if (type === 'photo') {
    const API_BASE_URL = (import.meta as any).env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const fileUrl = `${API_BASE_URL}${item.fileUrl || item.file_url}`;
          return (
            <div
              key={item._id || item.id}
              className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer shadow-md hover:shadow-xl transition-all"
              onClick={() => onItemClick(item)}
            >
              <img
                src={fileUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm line-clamp-2">{item.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // For powerpoint, pdf, and video, use card layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <InnovationCard
          key={item._id || item.id}
          item={item}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
};

export default InnovationGallery;
