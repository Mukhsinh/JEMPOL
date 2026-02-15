import { useEffect, useRef, useState } from 'react';
import { Pause, Play, X } from 'lucide-react';
import Button from '../ui/Button';
import { InnovationCatcherGame, GameState } from '../../game/InnovationCatcher';

interface GameCanvasProps {
  mode: 'single' | 'multiplayer';
  onGameEnd: (score: number, duration: number, level: number) => void;
  onExit: () => void;
}

const GameCanvas = ({ mode, onGameEnd, onExit }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<InnovationCatcherGame | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    level: 1,
    isPlaying: false,
    isPaused: false,
    gameOver: false,
  });

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      try {
        // Small delay to ensure canvas is properly rendered
        setTimeout(() => {
          if (canvasRef.current) {
            gameRef.current = new InnovationCatcherGame(canvasRef.current);
            gameRef.current.start();
          }
        }, 100);

        // Update state periodically
        const interval = setInterval(() => {
          if (gameRef.current) {
            const state = gameRef.current.getState();
            setGameState(state);

            if (state.gameOver) {
              const duration = gameRef.current.getDuration();
              onGameEnd(state.score, duration, state.level);
              clearInterval(interval);
            }
          }
        }, 100);

        return () => {
          clearInterval(interval);
          if (gameRef.current) {
            gameRef.current.stop();
            gameRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error initializing game:', error);
      }
    }
  }, [onGameEnd]);

  const handlePause = () => {
    if (gameRef.current) {
      gameRef.current.pause();
    }
  };

  const handleExit = () => {
    if (gameRef.current) {
      gameRef.current.stop();
    }
    onExit();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Game Info - Futuristic HUD */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-t-2xl shadow-2xl p-4 md:p-6 border-2 border-blue-500/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-400/30 shadow-lg shadow-blue-500/20">
              <span className="text-xs text-blue-300 block font-mono">SCORE</span>
              <p className="text-2xl md:text-3xl font-bold text-white font-mono">{gameState.score}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-red-400/30 shadow-lg shadow-red-500/20">
              <span className="text-xs text-red-300 block font-mono">LIVES</span>
              <p className="text-2xl md:text-3xl font-bold text-white">{'❤️'.repeat(gameState.lives)}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-400/30 shadow-lg shadow-yellow-500/20">
              <span className="text-xs text-yellow-300 block font-mono">LEVEL</span>
              <p className="text-2xl md:text-3xl font-bold text-white font-mono">{gameState.level}</p>
            </div>
            {mode === 'multiplayer' && (
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-400/30 shadow-lg shadow-green-500/20">
                <span className="text-xs text-green-300 block font-mono">MODE</span>
                <p className="text-lg font-semibold text-white font-mono">MULTI</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
              disabled={gameState.gameOver}
              className="bg-blue-500/20 backdrop-blur-sm border-blue-400/50 text-white hover:bg-blue-500/30 shadow-lg shadow-blue-500/20 font-mono"
            >
              {gameState.isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">RESUME</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">PAUSE</span>
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleExit}
              className="bg-red-500/20 backdrop-blur-sm text-white hover:bg-red-500/30 border border-red-400/30 shadow-lg shadow-red-500/20 font-mono"
            >
              <X className="w-4 h-4 mr-1" />
              <span className="hidden md:inline">EXIT</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas - Futuristic Frame */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-b-2xl shadow-2xl p-4 md:p-6 border-2 border-blue-500/30 border-t-0">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full border-4 border-blue-500/50 rounded-xl shadow-2xl shadow-blue-500/20 max-h-[70vh]"
            style={{ 
              touchAction: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
          />
          {gameState.isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-blue-400 mb-2 font-mono animate-pulse">⏸️ PAUSED</p>
                <p className="text-blue-300/80 font-mono">Klik Resume untuk melanjutkan</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions - Futuristic Style */}
      <div className="mt-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl p-6 border-2 border-blue-500/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-lg flex items-center justify-center mb-3 border-2 border-green-400/50 shadow-lg shadow-green-500/30">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-sm font-bold text-green-400 font-mono">ITEM HIJAU</p>
            <p className="text-xs text-green-300/70 font-mono">+10 POIN</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-lg flex items-center justify-center mb-3 border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/30">
              <span className="text-3xl">★</span>
            </div>
            <p className="text-sm font-bold text-yellow-400 font-mono">ITEM EMAS</p>
            <p className="text-xs text-yellow-300/70 font-mono">+50 POIN</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-lg flex items-center justify-center mb-3 border-2 border-red-400/50 shadow-lg shadow-red-500/30">
              <span className="text-3xl">✗</span>
            </div>
            <p className="text-sm font-bold text-red-400 font-mono">ITEM MERAH</p>
            <p className="text-xs text-red-300/70 font-mono">-5 POIN & -1 NYAWA</p>
          </div>
        </div>
        <div className="mt-6 text-center border-t border-blue-500/30 pt-4">
          <p className="text-sm text-blue-300 font-mono">
            💡 <span className="font-bold text-blue-400">TIP:</span> Geser layar atau mouse untuk menggerakkan basket
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
