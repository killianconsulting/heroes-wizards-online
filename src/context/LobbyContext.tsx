'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { subscribeToLobbyPlayers } from '@/lib/lobby';
import { isSupabaseConfigured } from '@/lib/supabase';

export interface LobbyPlayer {
  id: string;
  name: string;
  isHost?: boolean;
}

export interface LobbyState {
  lobbyCode: string;
  playerName: string;
  isHost: boolean;
  players: LobbyPlayer[];
  /** Set when using Supabase; used for Realtime and leave. */
  lobbyId?: string;
  /** This client's row id in lobby_players; used for leave. */
  playerId?: string;
}

type SetLobbyArg = LobbyState | ((prev: LobbyState | null) => LobbyState | null);

interface LobbyContextValue {
  lobby: LobbyState | null;
  setLobby: (arg: SetLobbyArg) => void;
  leaveLobby: () => void;
  generateLobbyCode: () => string;
}

const LobbyContext = createContext<LobbyContextValue | null>(null);

const LOBBY_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I, O for clarity

function generateCode(length: number = 4): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += LOBBY_CODE_CHARS[Math.floor(Math.random() * LOBBY_CODE_CHARS.length)];
  }
  return code;
}

export function useLobby() {
  const ctx = useContext(LobbyContext);
  if (!ctx) {
    return {
      lobby: null,
      setLobby: () => {},
      leaveLobby: () => {},
      generateLobbyCode: () => '',
    };
  }
  return ctx;
}

export function LobbyProvider({ children }: { children: ReactNode }) {
  const [lobby, setLobbyState] = useState<LobbyState | null>(null);

  const setLobby = useCallback((arg: SetLobbyArg) => {
    setLobbyState((prev) =>
      typeof arg === 'function' ? arg(prev) : arg
    );
  }, []);

  const leaveLobby = useCallback(() => {
    setLobbyState(null);
  }, []);

  const generateLobbyCode = useCallback(() => generateCode(4), []);

  // Subscribe to Supabase Realtime when we have a lobby with lobbyId
  useEffect(() => {
    if (!isSupabaseConfigured() || !lobby?.lobbyId) return;
    const unsubscribe = subscribeToLobbyPlayers(lobby.lobbyId, (players) => {
      setLobbyState((prev) => (prev ? { ...prev, players } : null));
    });
    return unsubscribe;
  }, [lobby?.lobbyId]);

  const value = useMemo(
    () => ({ lobby, setLobby, leaveLobby, generateLobbyCode }),
    [lobby, setLobby, leaveLobby, generateLobbyCode]
  );

  return (
    <LobbyContext.Provider value={value}>
      {children}
    </LobbyContext.Provider>
  );
}
