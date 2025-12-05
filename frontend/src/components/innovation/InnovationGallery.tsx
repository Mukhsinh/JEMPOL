import { useState, useEffect } from 'react';
import { Lightbulb, Filter } from 'lucide-react';
import InnovationCard from './InnovationCard';
import Button from '../ui/Button';
import { InnovationItem } from '../../types';
import { getAllInnovations } from '../../services/innovationService';

interface InnovationGalleryProps {
  onItemClick: (item: InnovationItem) => void;
}

const InnovationGallery = ({ onItemClick }: InnovationGalleryProps) => {
  const [items, setItems] = useState<InnovationItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InnovationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'powerpoint' | 'video'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInnovations();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.type === filter));
    }
  }, [filter, items]);

  const fetchInnovations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllInnovations();
      setItems(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data inovasi');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Memuat galeri inovasi...</p>
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
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <Lightbulb className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Belum Ada Konten Inovasi
        </h3>
        <p className="text-gray-600">
          Konten inovasi akan ditampilkan di sini setelah diupload oleh admin
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex items-center justify-center space-x-2 mb-8">
        <Filter className="w-5 h-5 text-gray-500" />
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Semua ({items.length})
        </Button>
        <Button
          variant={filter === 'powerpoint' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('powerpoint')}
        >
          PowerPoint ({items.filter(i => i.type === 'powerpoint').length})
        </Button>
        <Button
          variant={filter === 'video' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('video')}
        >
          Video ({items.filter(i => i.type === 'video').length})
        </Button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <InnovationCard
            key={item._id}
            item={item}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>

      {filteredItems.length === 0 && filter !== 'all' && (
        <div className="text-center py-12">
          <p className="text-gray-600">
            Tidak ada {filter === 'powerpoint' ? 'PowerPoint' : 'Video'} yang tersedia
          </p>
        </div>
      )}
    </div>
  );
};

export default InnovationGallery;
