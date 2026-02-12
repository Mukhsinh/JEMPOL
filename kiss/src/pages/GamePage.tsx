import { useState } from 'react';
import Layout from '../components/layout/Layout';
import Container from '../components/layout/Container';
import GameModeSelection from '../components/game/GameModeSelection';
import GameCanvas from '../components/game/GameCanvas';
import GameOver from '../components/game/GameOver';
import Leaderboard from '../components/game/Leaderboard';

type GameScreen = 'menu' | 'playing' | 'gameover';

function GamePage() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [mode, setMode] = useState<'single' | 'multiplayer'>('single');
  const [gameResult, setGameResult] = useState({ score: 0, duration: 0, level: 1 });
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleSelectMode = (selectedMode: 'single' | 'multiplayer') => {
    setMode(selectedMode);
    setScreen('playing');
  };

  const handleGameEnd = (score: number, duration: number, level: number) => {
    setGameResult({ score, duration, level });
    setScreen('gameover');
  };

  const handlePlayAgain = () => {
    setScreen('playing');
  };

  const handleBackToMenu = () => {
    setScreen('menu');
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 py-12">
        <Container>
          {screen === 'menu' && (
            <GameModeSelection
              onSelectMode={handleSelectMode}
              onViewLeaderboard={() => setShowLeaderboard(true)}
            />
          )}

          {screen === 'playing' && (
            <GameCanvas
              mode={mode}
              onGameEnd={handleGameEnd}
              onExit={handleBackToMenu}
            />
          )}

          {screen === 'gameover' && (
            <GameOver
              score={gameResult.score}
              level={gameResult.level}
              duration={gameResult.duration}
              mode={mode}
              onPlayAgain={handlePlayAgain}
              onBackToMenu={handleBackToMenu}
            />
          )}

          {/* Leaderboard Modal */}
          <Leaderboard
            isOpen={showLeaderboard}
            onClose={() => setShowLeaderboard(false)}
            currentUserScore={gameResult.score}
          />
        </Container>
      </div>
    </Layout>
  );
}

export default GamePage;
