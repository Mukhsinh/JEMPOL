import { useState, FormEvent } from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { submitGameScore, getDeviceType } from '../../services/gameService';

interface GameOverProps {
  score: number;
  level: number;
  duration: number;
  mode: 'single' | 'multiplayer';
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const GameOver = ({ score, level, duration, mode, onPlayAgain, onBackToMenu }: GameOverProps) => {
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      setError('Nama pemain harus diisi');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitGameScore({
        playerName: playerName.trim(),
        score,
        mode,
        level,
        duration,
        deviceType: getDeviceType(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan skor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Trophy Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-6">
          <Trophy className="w-12 h-12 text-white" />
        </div>

        <h2 className="text-4xl font-bold text-gray-900 mb-2">Game Over!</h2>
        <p className="text-gray-600 mb-8">Permainan selesai, berikut hasil Anda:</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Skor Akhir</p>
            <p className="text-3xl font-bold text-primary-600">{score}</p>
          </div>
          <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Level</p>
            <p className="text-3xl font-bold text-secondary-600">{level}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Durasi</p>
            <p className="text-3xl font-bold text-gray-700">{duration}s</p>
          </div>
        </div>

        {/* Submit Score Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              Masukkan nama Anda untuk menyimpan skor ke leaderboard:
            </p>
            <div className="flex space-x-3">
              <Input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Nama Anda"
                error={error || undefined}
              />
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!playerName.trim()}
              >
                Simpan
              </Button>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">Skor berhasil disimpan!</p>
            <p className="text-green-700 text-sm mt-1">
              Lihat posisi Anda di leaderboard
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <Button variant="outline" size="lg" fullWidth onClick={onBackToMenu}>
            <Home className="w-5 h-5 mr-2" />
            Menu Utama
          </Button>
          <Button variant="primary" size="lg" fullWidth onClick={onPlayAgain}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Main Lagi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
