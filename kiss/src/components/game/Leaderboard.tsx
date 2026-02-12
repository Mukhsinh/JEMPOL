import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Filter } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { LeaderboardEntry } from '../../types';
import { getLeaderboard } from '../../services/gameService';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserScore?: number;
}

const Leaderboard = ({ isOpen, onClose, currentUserScore }: LeaderboardProps) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'single' | 'multiplayer'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, filter]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const mode = filter === 'all' ? undefined : filter;
      const response = await getLeaderboard(mode, 50);
      setEntries(response.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="text-gray-600 font-semibold">{rank}</span>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leaderboard" size="lg">
      {/* Filter */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <Filter className="w-5 h-5 text-gray-500" />
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Semua
        </Button>
        <Button
          variant={filter === 'single' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('single')}
        >
          Single Player
        </Button>
        <Button
          variant={filter === 'multiplayer' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('multiplayer')}
        >
          Multiplayer
        </Button>
      </div>

      {/* Leaderboard List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Belum ada pemain di leaderboard</p>
          <p className="text-sm text-gray-500 mt-2">Jadilah yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {entries.map((entry, index) => (
            <div
              key={entry._id}
              className={`
                flex items-center justify-between p-4 rounded-lg transition-colors
                ${index < 3 ? 'bg-gradient-to-r from-primary-50 to-secondary-50' : 'bg-gray-50'}
                ${currentUserScore === entry.score ? 'ring-2 ring-primary-500' : ''}
              `}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 flex items-center justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{entry.playerName}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <span>{new Date(entry.playedAt).toLocaleDateString('id-ID')}</span>
                    <span>•</span>
                    <span>Level {entry.level}</span>
                    <span>•</span>
                    <span className="capitalize">{entry.mode}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">{entry.score}</p>
                <p className="text-xs text-gray-500">{entry.duration}s</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>Tutup</Button>
      </div>
    </Modal>
  );
};

export default Leaderboard;
