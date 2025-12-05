import { User, Users, Trophy } from 'lucide-react';

interface GameModeSelectionProps {
  onSelectMode: (mode: 'single' | 'multiplayer') => void;
  onViewLeaderboard: () => void;
}

const GameModeSelection = ({ onSelectMode, onViewLeaderboard }: GameModeSelectionProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 font-mono animate-pulse">
          INNOVATION CATCHER
        </h1>
        <p className="text-lg text-blue-300 font-mono">
          Tangkap item inovasi sebanyak mungkin dan raih skor tertinggi!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Single Player */}
        <div 
          onClick={() => onSelectMode('single')}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-center border-2 border-blue-500/30 hover:border-blue-400/60 transition-all cursor-pointer shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transform"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl mb-6 border-2 border-blue-400/50 shadow-lg shadow-blue-500/30">
            <User className="w-12 h-12 text-blue-300" />
          </div>
          <h3 className="text-2xl font-bold text-blue-400 mb-3 font-mono">SINGLE PLAYER</h3>
          <p className="text-blue-300/70 mb-6 font-mono text-sm">
            Bermain sendiri dan tantang diri Anda untuk mencapai skor tertinggi
          </p>
          <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold font-mono hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/30">
            MULAI BERMAIN
          </button>
        </div>

        {/* Multiplayer */}
        <div 
          onClick={() => onSelectMode('multiplayer')}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-center border-2 border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 transform"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl mb-6 border-2 border-purple-400/50 shadow-lg shadow-purple-500/30">
            <Users className="w-12 h-12 text-purple-300" />
          </div>
          <h3 className="text-2xl font-bold text-purple-400 mb-3 font-mono">MULTIPLAYER</h3>
          <p className="text-purple-300/70 mb-6 font-mono text-sm">
            Bermain bersama teman dan lihat siapa yang mendapat skor tertinggi
          </p>
          <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold font-mono hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30">
            BUAT/GABUNG ROOM
          </button>
        </div>
      </div>

      {/* Leaderboard Button */}
      <div className="text-center">
        <button 
          onClick={onViewLeaderboard}
          className="px-8 py-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 rounded-xl font-bold font-mono border-2 border-yellow-400/50 hover:border-yellow-400/80 transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 inline-flex items-center"
        >
          <Trophy className="w-6 h-6 mr-2" />
          LIHAT LEADERBOARD
        </button>
      </div>

      {/* Game Instructions */}
      <div className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border-2 border-blue-500/30 shadow-2xl">
        <h3 className="text-lg font-bold text-blue-400 mb-4 font-mono">CARA BERMAIN:</h3>
        <ul className="space-y-3 text-blue-300/80 font-mono text-sm">
          <li className="flex items-start">
            <span className="text-blue-400 font-bold mr-3 bg-blue-500/20 px-2 py-1 rounded">1</span>
            <span>Gerakkan basket dengan mouse (desktop) atau touch (mobile)</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-400 font-bold mr-3 bg-green-500/20 px-2 py-1 rounded">2</span>
            <span>Tangkap item hijau (inovasi) untuk mendapat poin (+10)</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-400 font-bold mr-3 bg-red-500/20 px-2 py-1 rounded">3</span>
            <span>Hindari item merah yang mengurangi poin (-5)</span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-400 font-bold mr-3 bg-yellow-500/20 px-2 py-1 rounded">4</span>
            <span>Tangkap item emas untuk bonus besar (+50)</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 font-bold mr-3 bg-purple-500/20 px-2 py-1 rounded">5</span>
            <span>Kecepatan meningkat seiring level naik</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GameModeSelection;
