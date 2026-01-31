'use client';

import { useState, useCallback } from 'react';
import { createGame } from '@/engine/setup';
import { drawCard, playCard, dumpCard, summonFromEventPile, passTurn } from '@/engine/actions';
import { getLegalActions } from '@/engine/validation';
import type { GameState } from '@/engine/state';
import type { EventTarget } from '@/engine/events';

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);

  const startGame = useCallback((playerNames: string[]) => {
    setState(createGame(playerNames));
  }, []);

  const reset = useCallback(() => {
    setState(null);
  }, []);

  const handleDraw = useCallback(() => {
    if (!state) return;
    setState(drawCard(state));
  }, [state]);

  const handlePassTurn = useCallback(() => {
    if (!state) return;
    setState(passTurn(state));
  }, [state]);

  const handlePlayCard = useCallback(
    (cardId: number, target?: EventTarget) => {
      if (!state) return;
      setState(playCard(state, cardId, target));
    },
    [state]
  );

  const handleDumpCard = useCallback(
    (cardId: number) => {
      if (!state) return;
      setState(dumpCard(state, cardId));
    },
    [state]
  );

  const handleSummonFromPile = useCallback(
    (cardId: number) => {
      if (!state) return;
      setState(summonFromEventPile(state, cardId));
    },
    [state]
  );

  const legalActions = state ? getLegalActions(state) : null;

  return {
    state,
    legalActions,
    startGame,
    reset,
    handleDraw,
    handlePassTurn,
    handlePlayCard,
    handleDumpCard,
    handleSummonFromPile,
  };
}
