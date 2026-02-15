import { useState, useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { InnovationItem } from '../../types';
import { getAllInnovations } from '../../services/innovationService';

const PhotoGallery = () => {
  const [photos, setPhotos] = useState<InnovationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<InnovationItem | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const response = await getAllInnovations('photo' as any);
      setPhotos(response.data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const API_BASE_URL = (import.meta as any).env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  const getFileUrl = (item: InnovationItem) => {
    const url = item.fileUrl || item.file_url || '';
    return `${API_BASE_URL}${url}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memuat foto...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Belum ada foto yang diupload</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id || photo._id}
            className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer shadow-md hover:shadow-xl transition-all"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={getFileUrl(photo)}
              alt={photo.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-semibold text-sm line-clamp-2">{photo.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={getFileUrl(selectedPhoto)}
              alt={selectedPhoto.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-bold mb-2">{selectedPhoto.title}</h3>
              <p className="text-gray-300 text-sm max-w-2xl mx-auto">{selectedPhoto.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;
