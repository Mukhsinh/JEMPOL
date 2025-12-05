import { User, Users, Trophy } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface GameModeSelectionProps {
  onSelectMode: (mode: 'single' | 'multiplayer') => void;
  onViewLeaderboard: () => void;
}

const GameModeSelection = ({ onSelectMode, onViewLeaderboard }: GameModeSelectionProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Innovation Catcher
        </h1>
        <p className="text-lg text-gray-600">
          Tangkap item inovasi sebanyak mungkin dan raih skor tertinggi!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Single Player */}
        <Card hover onClick={() => onSelectMode('single')}>
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Single Player</h3>
            <p className="text-gray-600 mb-6">
              Bermain sendiri dan tantang diri Anda untuk mencapai skor tertinggi
            </p>
            <Button variant="primary" size="lg" fullWidth>
              Mulai Bermain
            </Button>
          </div>
        </Card>

        {/* Multiplayer */}
        <Card hover onClick={() => onSelectMode('multiplayer')}>
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Multiplayer</h3>
            <p className="text-gray-600 mb-6">
              Bermain bersama teman dan lihat siapa yang mendapat skor tertinggi
            </p>
            <Button variant="primary" size="lg" fullWidth>
              Buat/Gabung Room
            </Button>
          </div>
        </Card>
      </div>

      {/* Leaderboard Button */}
      <div className="text-center">
        <Button variant="outline" size="lg" onClick={onViewLeaderboard}>
          <Trophy className="w-5 h-5 mr-2" />
          Lihat Leaderboard
        </Button>
      </div>

      {/* Game Instructions */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Cara Bermain:</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-primary-600 font-bold mr-2">1.</span>
            <span>Gerakkan basket dengan mouse (desktop) atau touch (mobile)</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 font-bold mr-2">2.</span>
            <span>Tangkap item hijau (inovasi) untuk mendapat poin (+10)</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 font-bold mr-2">3.</span>
            <span>Hindari item merah yang mengurangi poin (-5)</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 font-bold mr-2">4.</span>
            <span>Tangkap item emas untuk bonus besar (+50)</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 font-bold mr-2">5.</span>
            <span>Kecepatan meningkat seiring level naik</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GameModeSelection;
