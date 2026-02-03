'use client';

import { useEffect, Suspense } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useLeaveGame } from '@/context/LeaveGameContext';
import StartScreen from '@/components/StartScreen';
import GameScreen from '@/components/GameScreen';
import WinScreen from '@/components/WinScreen';

export default function GameWrapper() {
  const {
    state,
    legalActions,
    passTurnCountdown,
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
  const { registerLeaveGame } = useLeaveGame();

  const inGame = !!state && !state.winnerPlayerId;
  useEffect(() => {
    registerLeaveGame(inGame, reset);
    return () => registerLeaveGame(false, () => {});
  }, [inGame, reset, registerLeaveGame]);

  if (!state) {
    return (
      <Suspense fallback={<div className="start-screen">Loading...</div>}>
        <StartScreen onStart={startGame} />
      </Suspense>
    );
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
      passTurnCountdown={passTurnCountdown}
      onDraw={handleDraw}
      onPassTurn={handlePassTurn}
      onPlayCard={handlePlayCard}
      onDumpCard={handleDumpCard}
      onSummonFromPile={handleSummonFromPile}
      onDismissFortuneReading={handleDismissFortuneReading}
      onDismissEventBlocked={handleDismissEventBlocked}
      onLeaveGame={reset}
    />
  );
}
