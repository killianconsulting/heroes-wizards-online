'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useLobby } from '@/context/LobbyContext';
import { subscribeToGameChannel, broadcastGameStart, broadcastGameState, sendAction as sendActionToChannel, applyAction } from '@/lib/gameSync';
import type { GameState } from '@/engine/state';
import type { GameAction } from '@/lib/gameSync';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface OnlineGameContextValue {
  /** Game state from host (game_start) or subsequent game_state broadcasts. */
  gameState: GameState | null;
  /** Order of lobby player ids; myPlayerIndex = playerOrder.indexOf(myLobbyPlayerId). */
  playerOrder: string[];
  /** This client's index in the game (0..n-1), or -1 if not in game. */
  myPlayerIndex: number;
  /** Whether this client is the game host (authoritative for state). */
  isHost: boolean;
  /** Host: start the online game with this state and player order. */
  startOnlineGameAsHost: (state: GameState, playerOrder: string[]) => void;
  /** Clear online game state (e.g. leave game). */
  leaveOnlineGame: () => void;
  /** Host: apply an action and broadcast new state. */
  applyActionAndBroadcast: (action: GameAction) => void;
  /** Non-host: send an action to the channel for the host to apply. */
  sendAction: (action: GameAction) => Promise<void>;
}

const OnlineGameContext = createContext<OnlineGameContextValue | null>(null);

export function useOnlineGame(): OnlineGameContextValue {
  const ctx = useContext(OnlineGameContext);
  if (!ctx) {
    return {
      gameState: null,
      playerOrder: [],
      myPlayerIndex: -1,
      isHost: false,
      startOnlineGameAsHost: () => {},
      leaveOnlineGame: () => {},
      applyActionAndBroadcast: () => {},
      sendAction: async () => {},
    };
  }
  return ctx;
}

export function OnlineGameProvider({ children }: { children: ReactNode }) {
  const { lobby } = useLobby();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerOrder, setPlayerOrder] = useState<string[]>([]);

  const lobbyId = lobby?.lobbyId;
  const playerId = lobby?.playerId;
  const isHost = lobby?.isHost ?? false;

  const myPlayerIndex = useMemo(() => {
    if (!playerId || playerOrder.length === 0) return -1;
    const idx = playerOrder.indexOf(playerId);
    return idx >= 0 ? idx : -1;
  }, [playerId, playerOrder]);

  const gameChannelRef = useRef<{ send: (args: object) => Promise<unknown> } | null>(null);

  const startOnlineGameAsHost = useCallback(
    (state: GameState, order: string[]) => {
      setGameState(state);
      setPlayerOrder(order);
      if (lobbyId) broadcastGameStart(lobbyId, state, order, gameChannelRef.current);
    },
    [lobbyId]
  );

  const leaveOnlineGame = useCallback(() => {
    setGameState(null);
    setPlayerOrder([]);
  }, []);

  const applyActionAndBroadcast = useCallback(
    async (action: GameAction) => {
      if (!gameState || !lobbyId || !isHost) return;
      const next = applyAction(gameState, action);
      setGameState(next);
      await broadcastGameState(lobbyId, next, gameChannelRef.current);
    },
    [gameState, lobbyId, isHost]
  );

  const sendAction = useCallback(
    async (action: GameAction) => {
      if (!lobbyId || myPlayerIndex < 0 || isHost) return;
      await sendActionToChannel(lobbyId, myPlayerIndex, action, gameChannelRef.current);
    },
    [lobbyId, myPlayerIndex, isHost]
  );

  const gameStateRef = useRef<GameState | null>(gameState);
  gameStateRef.current = gameState;

  // Subscribe to game channel when in a lobby (both host and clients)
  useEffect(() => {
    if (!isSupabaseConfigured() || !lobbyId || !playerId) return;

    const unsubscribe = subscribeToGameChannel(lobbyId, {
      onGameStart: (payload) => {
        setGameState(payload.state);
        setPlayerOrder(payload.playerOrder);
      },
      onGameState: (payload) => {
        setGameState(payload.state);
      },
      onAction: isHost
        ? (payload) => {
            const current = gameStateRef.current;
            if (!current || payload.fromPlayerIndex !== current.currentPlayerIndex) return;
            const next = applyAction(current, payload.action);
            setGameState(next);
            broadcastGameState(lobbyId, next, gameChannelRef.current);
          }
        : undefined,
      channelRef: gameChannelRef,
    });

    return unsubscribe;
  }, [lobbyId, playerId, isHost]);

  const value = useMemo<OnlineGameContextValue>(
    () => ({
      gameState,
      playerOrder,
      myPlayerIndex,
      isHost,
      startOnlineGameAsHost,
      leaveOnlineGame,
      applyActionAndBroadcast,
      sendAction,
    }),
    [
      gameState,
      playerOrder,
      myPlayerIndex,
      isHost,
      startOnlineGameAsHost,
      leaveOnlineGame,
      applyActionAndBroadcast,
      sendAction,
    ]
  );

  return (
    <OnlineGameContext.Provider value={value}>
      {children}
    </OnlineGameContext.Provider>
  );
}