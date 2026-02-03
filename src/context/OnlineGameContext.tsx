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
import { subscribeToGameChannel, broadcastGameStart, broadcastGameState, broadcastPlayerLeft, broadcastRequestState, sendAction as sendActionToChannel, applyAction } from '@/lib/gameSync';
import type { GameState } from '@/engine/state';
import { playerLeft, playerReconnected } from '@/engine/actions';
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
  /** Notify others that this player is leaving (broadcast player_left), then clear local state. Call before leaveOnlineGame when abandoning. */
  notifyPlayerLeftAndLeave: () => Promise<void>;
  /** Host: apply an action and broadcast new state. */
  applyActionAndBroadcast: (action: GameAction) => void;
  /** Non-host: send an action to the channel for the host to apply. */
  sendAction: (action: GameAction) => Promise<void>;
  /** Request current game state from host (reconnecting client). Host will broadcast game_state. */
  requestGameState: () => Promise<void>;
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
      notifyPlayerLeftAndLeave: async () => {},
      applyActionAndBroadcast: () => {},
      sendAction: async () => {},
      requestGameState: async () => {},
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

  const gameChannelRef = useRef<{ send: (args: object) => Promise<unknown>; track?: (payload: Record<string, unknown>) => void } | null>(null);

  const startOnlineGameAsHost = useCallback(
    (state: GameState, order: string[]) => {
      setGameState(state);
      setPlayerOrder(order);
      if (lobbyId) broadcastGameStart(lobbyId, state, order, gameChannelRef.current);
      if (playerId && gameChannelRef.current?.track) {
        const idx = order.indexOf(playerId);
        if (idx >= 0) gameChannelRef.current.track({ playerIndex: idx, playerId });
      }
    },
    [lobbyId, playerId]
  );

  const leaveOnlineGame = useCallback(() => {
    setGameState(null);
    setPlayerOrder([]);
  }, []);

  const notifyPlayerLeftAndLeave = useCallback(async () => {
    if (lobbyId && myPlayerIndex >= 0 && playerId) {
      await broadcastPlayerLeft(lobbyId, myPlayerIndex, playerId, gameChannelRef.current, 'leave');
    }
    leaveOnlineGame();
  }, [lobbyId, myPlayerIndex, playerId, leaveOnlineGame]);

  const requestGameState = useCallback(async () => {
    if (lobbyId && playerId) {
      await broadcastRequestState(lobbyId, playerId, gameChannelRef.current);
    }
  }, [lobbyId, playerId]);

  const applyActionAndBroadcast = useCallback(
    async (action: GameAction) => {
      if (!gameState || !lobbyId || !isHost) return;
      const next = applyAction(gameState, action);
      setGameState(next);
      await broadcastGameState(lobbyId, next, gameChannelRef.current, playerOrder);
    },
    [gameState, lobbyId, isHost, playerOrder]
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
  const playerOrderRef = useRef<string[]>(playerOrder);
  playerOrderRef.current = playerOrder;

  // Subscribe to game channel when in a lobby (both host and clients)
  useEffect(() => {
    if (!isSupabaseConfigured() || !lobbyId || !playerId) return;

    const unsubscribe = subscribeToGameChannel(lobbyId, {
      onGameStart: (payload) => {
        setGameState(payload.state);
        setPlayerOrder(payload.playerOrder);
        const idx = payload.playerOrder.indexOf(playerId);
        if (idx >= 0 && gameChannelRef.current?.track) {
          gameChannelRef.current.track({ playerIndex: idx, playerId });
        }
      },
      onGameState: (payload) => {
        setGameState(payload.state);
        if (payload.playerOrder) setPlayerOrder(payload.playerOrder);
      },
      onAction: isHost
        ? (payload) => {
            const current = gameStateRef.current;
            if (!current || payload.fromPlayerIndex !== current.currentPlayerIndex) return;
            const next = applyAction(current, payload.action);
            setGameState(next);
            broadcastGameState(lobbyId, next, gameChannelRef.current, playerOrderRef.current);
          }
        : undefined,
      onPlayerLeft: isHost
        ? (payload) => {
            const current = gameStateRef.current;
            if (!current || current.phase === 'gameOver') return;
            const next = playerLeft(current, payload.playerIndex, payload.reason ?? 'leave');
            setGameState(next);
            broadcastGameState(lobbyId, next, gameChannelRef.current, playerOrderRef.current);
          }
        : undefined,
      onPlayerReconnected: isHost
        ? (payload) => {
            const current = gameStateRef.current;
            if (!current || current.phase === 'gameOver') return;
            const disconnected = current.disconnectedPlayerIndices ?? [];
            if (!disconnected.includes(payload.playerIndex)) return;
            const next = playerReconnected(current, payload.playerIndex);
            setGameState(next);
            broadcastGameState(lobbyId, next, gameChannelRef.current, playerOrderRef.current);
          }
        : undefined,
      onRequestState: isHost
        ? () => {
            const current = gameStateRef.current;
            if (current) broadcastGameState(lobbyId, current, gameChannelRef.current, playerOrderRef.current);
          }
        : undefined,
      channelRef: gameChannelRef,
    });

    return unsubscribe;
  }, [lobbyId, playerId, isHost]);

  // Reconnecting client: request current game state from host (once) when we have lobby but no state
  const hasRequestedStateRef = useRef(false);
  useEffect(() => {
    if (!lobbyId || !playerId || gameState != null) return;
    if (hasRequestedStateRef.current) return;
    hasRequestedStateRef.current = true;
    const t = setTimeout(() => {
      requestGameState();
    }, 800);
    return () => clearTimeout(t);
  }, [lobbyId, playerId, gameState, requestGameState]);

  const value = useMemo<OnlineGameContextValue>(
    () => ({
      gameState,
      playerOrder,
      myPlayerIndex,
      isHost,
      startOnlineGameAsHost,
      leaveOnlineGame,
      notifyPlayerLeftAndLeave,
      applyActionAndBroadcast,
      sendAction,
      requestGameState,
    }),
    [
      gameState,
      playerOrder,
      myPlayerIndex,
      isHost,
      startOnlineGameAsHost,
      leaveOnlineGame,
      notifyPlayerLeftAndLeave,
      applyActionAndBroadcast,
      sendAction,
      requestGameState,
    ]
  );

  return (
    <OnlineGameContext.Provider value={value}>
      {children}
    </OnlineGameContext.Provider>
  );
}