'use client';

import { useCallback, useEffect, Suspense } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useLeaveGame } from '@/context/LeaveGameContext';
import { useOnlineGame } from '@/context/OnlineGameContext';
import { getLegalActions } from '@/engine/validation';
import StartScreen from '@/components/StartScreen';
import GameScreen from '@/components/GameScreen';
import WinScreen from '@/components/WinScreen';

export default function GameWrapper() {
  const local = useGameState();
  const online = useOnlineGame();
  const { registerLeaveGame } = useLeaveGame();

  const state = online.gameState ?? local.state;
  const inGame = !!state && !state.winnerPlayerId;

  const handleLeaveGame = useCallback(() => {
    if (online.gameState) {
      online.leaveOnlineGame();
    } else {
      local.reset();
    }
  }, [online.gameState, online.leaveOnlineGame, local.reset]);

  useEffect(() => {
    registerLeaveGame(inGame, handleLeaveGame);
    return () => registerLeaveGame(false, () => {});
  }, [inGame, handleLeaveGame, registerLeaveGame]);

  if (!state) {
    return (
      <Suspense fallback={<div className="start-screen">Loading...</div>}>
        <StartScreen onStart={local.startGame} />
      </Suspense>
    );
  }

  if (state.winnerPlayerId) {
    const winner = state.players.find((p) => p.id === state.winnerPlayerId);
    return (
      <WinScreen
        winnerName={winner?.name ?? 'Unknown'}
        onNewGame={handleLeaveGame}
      />
    );
  }

  const isOnline = !!online.gameState;
  const legalActions = getLegalActions(state);

  if (isOnline) {
    const onDraw = () => {
      if (online.isHost) online.applyActionAndBroadcast({ type: 'draw' });
      else online.sendAction({ type: 'draw' });
    };
    const onPassTurn = () => {
      if (online.isHost) online.applyActionAndBroadcast({ type: 'passTurn' });
      else online.sendAction({ type: 'passTurn' });
    };
    const onPlayCard = (cardId: number, target?: import('@/engine/events').EventTarget) => {
      if (online.isHost) online.applyActionAndBroadcast({ type: 'playCard', cardId, target });
      else online.sendAction({ type: 'playCard', cardId, target });
    };
    const onDumpCard = (cardId: number) => {
      if (online.isHost) online.applyActionAndBroadcast({ type: 'dumpCard', cardId });
      else online.sendAction({ type: 'dumpCard', cardId });
    };
    const onSummonFromPile = (cardId: number) => {
      if (online.isHost) online.applyActionAndBroadcast({ type: 'summonFromPile', cardId });
      else online.sendAction({ type: 'summonFromPile', cardId });
    };
    const onDismissFortuneReading = () => {
      if (online.isHost) online.applyActionAndBroadcast({ type: 'dismissFortuneReading' });
      else online.sendAction({ type: 'dismissFortuneReading' });
    };
    const onDismissEventBlocked = () => {
      if (online.isHost) online.applyActionAndBroadcast({ type: 'dismissEventBlocked' });
      else online.sendAction({ type: 'dismissEventBlocked' });
    };

    return (
      <GameScreen
        state={state}
        legalActions={legalActions}
        passTurnCountdown={null}
        onDraw={onDraw}
        onPassTurn={onPassTurn}
        onPlayCard={onPlayCard}
        onDumpCard={onDumpCard}
        onSummonFromPile={onSummonFromPile}
        onDismissFortuneReading={onDismissFortuneReading}
        onDismissEventBlocked={onDismissEventBlocked}
        onLeaveGame={handleLeaveGame}
        myPlayerIndex={online.myPlayerIndex}
      />
    );
  }

  return (
    <GameScreen
      state={state}
      legalActions={local.legalActions!}
      passTurnCountdown={local.passTurnCountdown}
      onDraw={local.handleDraw}
      onPassTurn={local.handlePassTurn}
      onPlayCard={local.handlePlayCard}
      onDumpCard={local.handleDumpCard}
      onSummonFromPile={local.handleSummonFromPile}
      onDismissFortuneReading={local.handleDismissFortuneReading}
      onDismissEventBlocked={local.handleDismissEventBlocked}
      onLeaveGame={handleLeaveGame}
    />
  );
}
