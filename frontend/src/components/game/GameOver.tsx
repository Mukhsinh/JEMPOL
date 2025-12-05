import { useState, FormEvent } from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';
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
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-8 text-center border-2 border-blue-500/30">
        {/* Trophy Icon */}
        <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-full mb-6 border-4 border-yellow-400/50 shadow-2xl shadow-yellow-500/40 animate-pulse">
          <Trophy className="w-14 h-14 text-yellow-400" />
        </div>

        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 font-mono">GAME OVER!</h2>
        <p className="text-blue-300/70 mb-8 font-mono">Permainan selesai, berikut hasil Anda:</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-4 border-2 border-blue-400/30 shadow-lg shadow-blue-500/20">
            <p className="text-sm text-blue-300 mb-1 font-mono">SKOR AKHIR</p>
            <p className="text-4xl font-bold text-blue-400 font-mono">{score}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border-2 border-purple-400/30 shadow-lg shadow-purple-500/20">
            <p className="text-sm text-purple-300 mb-1 font-mono">LEVEL</p>
            <p className="text-4xl font-bold text-purple-400 font-mono">{level}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4 border-2 border-green-400/30 shadow-lg shadow-green-500/20">
            <p className="text-sm text-green-300 mb-1 font-mono">DURASI</p>
            <p className="text-4xl font-bold text-green-400 font-mono">{duration}s</p>
          </div>
        </div>

        {/* Submit Score Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="mb-6">
            <p className="text-sm text-blue-300 mb-4 font-mono">
              Masukkan nama Anda untuk menyimpan skor ke leaderboard:
            </p>
            <div className="flex space-x-3">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="NAMA ANDA"
                className="flex-1 px-4 py-3 bg-slate-800/50 border-2 border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:border-blue-400/60 focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={!playerName.trim() || isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold font-mono hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'SAVING...' : 'SIMPAN'}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-2 font-mono">{error}</p>
            )}
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-lg shadow-lg shadow-green-500/20">
            <p className="text-green-400 font-bold font-mono">SKOR BERHASIL DISIMPAN!</p>
            <p className="text-green-300/70 text-sm mt-1 font-mono">
              Lihat posisi Anda di leaderboard
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button 
            onClick={onBackToMenu}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-lg font-bold font-mono hover:from-slate-600 hover:to-slate-500 transition-all shadow-lg border-2 border-slate-500/50 inline-flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            MENU UTAMA
          </button>
          <button 
            onClick={onPlayAgain}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold font-mono hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/30 inline-flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            MAIN LAGI
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
