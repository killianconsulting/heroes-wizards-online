'use client';

import { useGameState } from '@/hooks/useGameState';
import StartScreen from '@/components/StartScreen';
import GameScreen from '@/components/GameScreen';
import WinScreen from '@/components/WinScreen';

export default function GameWrapper() {
  const {
    state,
    legalActions,
    startGame,
    reset,
    handleDraw,
    handlePassTurn,
    handlePlayCard,
    handleDumpCard,
    handleSummonFromPile,
    handleDismissFortuneReading,
    handleDismissEventBlocked,
  } = useGameState();

  if (!state) {
    return <StartScreen onStart={startGame} />;
  }

  if (state.winnerPlayerId) {
    const winner = state.players.find((p) => p.id === state.winnerPlayerId);
    return (
      <WinScreen
        winnerName={winner?.name ?? 'Unknown'}
        onNewGame={reset}
      />
    );
  }

  return (
    <GameScreen
      state={state}
      legalActions={legalActions!}
      onDraw={handleDraw}
      onPassTurn={handlePassTurn}
      onPlayCard={handlePlayCard}
      onDumpCard={handleDumpCard}
      onSummonFromPile={handleSummonFromPile}
      onDismissFortuneReading={handleDismissFortuneReading}
      onDismissEventBlocked={handleDismissEventBlocked}
    />
  );
}
