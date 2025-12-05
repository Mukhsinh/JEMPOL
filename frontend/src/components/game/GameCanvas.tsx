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
      gameRef.current = new InnovationCatcherGame(canvasRef.current);
      gameRef.current.start();

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
        }
      };
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
      {/* Game Info */}
      <div className="bg-white rounded-t-2xl shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-sm text-gray-600">Score</span>
            <p className="text-2xl font-bold text-primary-600">{gameState.score}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Lives</span>
            <p className="text-2xl font-bold text-red-600">{gameState.lives}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Level</span>
            <p className="text-2xl font-bold text-secondary-600">{gameState.level}</p>
          </div>
          {mode === 'multiplayer' && (
            <div>
              <span className="text-sm text-gray-600">Mode</span>
              <p className="text-lg font-semibold text-gray-900">Multiplayer</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePause}
            disabled={gameState.gameOver}
          >
            {gameState.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExit}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-gray-100 rounded-b-2xl shadow-lg p-4">
        <canvas
          ref={canvasRef}
          className="w-full border-4 border-gray-300 rounded-lg bg-white"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Mobile Instructions */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Geser layar untuk menggerakkan basket</p>
      </div>
    </div>
  );
};

export default GameCanvas;
