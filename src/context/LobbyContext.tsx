'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';

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
}

interface LobbyContextValue {
  lobby: LobbyState | null;
  setLobby: (state: LobbyState) => void;
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

  const setLobby = useCallback((state: LobbyState) => {
    setLobbyState(state);
  }, []);

  const leaveLobby = useCallback(() => {
    setLobbyState(null);
  }, []);

  const generateLobbyCode = useCallback(() => generateCode(4), []);

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
