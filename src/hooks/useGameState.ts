'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createGame } from '@/engine/setup';
import { drawCard, playCard, declarePlay, confirmDeclaration, playCardWithDeclarationDisplay, playCardWithDeclarationDisplayForEvent, dismissPlayDeclarationDisplay, dumpCard, summonFromEventPile, passTurn, dismissFortuneReading, dismissEventBlocked, dismissDrawDeclaration } from '@/engine/actions';
import { getLegalActions } from '@/engine/validation';
import type { GameState } from '@/engine/state';
import type { EventTarget } from '@/engine/events';
import type { TurnWaitSeconds } from '@/components/StartScreen';

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);
  const [turnWaitSeconds, setTurnWaitSeconds] = useState<TurnWaitSeconds>(0);
  const [passTurnCountdown, setPassTurnCountdown] = useState<number | null>(null);
  const stateToPassAfterCountdown = useRef<GameState | null>(null);

  const startGame = useCallback((playerNames: string[], waitSeconds?: TurnWaitSeconds) => {
    setState(createGame(playerNames));
    setTurnWaitSeconds(waitSeconds ?? 0);
    setPassTurnCountdown(null);
  }, []);

  const reset = useCallback(() => {
    setState(null);
    setPassTurnCountdown(null);
    stateToPassAfterCountdown.current = null;
  }, []);

  const handleDraw = useCallback(() => {
    if (!state) return;
    setState(drawCard(state));
  }, [state]);

  const handlePassTurn = useCallback(() => {
    if (!state) return;
    if (turnWaitSeconds > 0) {
      stateToPassAfterCountdown.current = state;
      setPassTurnCountdown(turnWaitSeconds);
    } else {
      setState(passTurn(state));
    }
  }, [state, turnWaitSeconds]);

  const handlePlayCard = useCallback(
    (cardId: number, target?: EventTarget) => {
      if (!state) return;
      setState(playCard(state, cardId, target));
    },
    [state]
  );

  const handleDeclarePlay = useCallback(
    (cardId: number, target?: EventTarget) => {
      if (!state) return;
      setState(declarePlay(state, cardId, target));
    },
    [state]
  );

  const handleConfirmDeclaration = useCallback(
    (fullTarget?: EventTarget) => {
      if (!state) return;
      setState(confirmDeclaration(state, fullTarget));
    },
    [state]
  );

  const handlePlayCardWithDeclarationDisplay = useCallback(
    (cardId: number) => {
      if (!state) return;
      setState(playCardWithDeclarationDisplay(state, cardId));
    },
    [state]
  );

  const handlePlayCardWithDeclarationDisplayForEvent = useCallback(
    (cardId: number, target: EventTarget) => {
      if (!state) return;
      setState(playCardWithDeclarationDisplayForEvent(state, cardId, target));
    },
    [state]
  );

  const handleDismissPlayDeclarationDisplay = useCallback(() => {
    if (!state) return;
    setState(dismissPlayDeclarationDisplay(state));
  }, [state]);

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

  const handleDismissFortuneReading = useCallback(() => {
    if (!state) return;
    setState(dismissFortuneReading(state));
  }, [state]);

  const handleDismissEventBlocked = useCallback(() => {
    if (!state) return;
    setState(dismissEventBlocked(state));
  }, [state]);

  const handleDismissDrawDeclaration = useCallback(() => {
    if (!state) return;
    setState(dismissDrawDeclaration(state));
  }, [state]);

  // When pass-turn countdown is active, tick every second and advance turn at 0.
  useEffect(() => {
    if (passTurnCountdown === null || passTurnCountdown <= 0) return;
    if (passTurnCountdown === 1) {
      const next = stateToPassAfterCountdown.current;
      stateToPassAfterCountdown.current = null;
      setPassTurnCountdown(null);
      if (next) setState(passTurn(next));
      return;
    }
    const id = window.setTimeout(() => setPassTurnCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [passTurnCountdown]);

  const legalActions = state ? getLegalActions(state) : null;

  return {
    state,
    legalActions,
    passTurnCountdown,
    startGame,
    reset,
    handleDraw,
    handlePassTurn,
    handlePlayCard,
    handleDeclarePlay,
    handleConfirmDeclaration,
    handlePlayCardWithDeclarationDisplay,
    handlePlayCardWithDeclarationDisplayForEvent,
    handleDismissPlayDeclarationDisplay,
    handleDumpCard,
    handleSummonFromPile,
    handleDismissFortuneReading,
    handleDismissEventBlocked,
    handleDismissDrawDeclaration,
  };
}
