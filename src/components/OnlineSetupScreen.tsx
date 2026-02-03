'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameLogo from './GameLogo';
import { useLobby } from '@/context/LobbyContext';
import { createLobby, joinLobby } from '@/lib/lobby';
import { isSupabaseConfigured } from '@/lib/supabase';

const NAME_MAX_LENGTH = 20;
const LOBBY_CODE_LENGTH = 4;

export default function OnlineSetupScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLobby, generateLobbyCode } = useLobby();
  const lobbyFromUrl = searchParams.get('lobby')?.trim().toUpperCase().slice(0, LOBBY_CODE_LENGTH) ?? '';
  const [joinLobbyCode, setJoinLobbyCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [createName, setCreateName] = useState('');
  const [joinError, setJoinError] = useState('');
  const [createError, setCreateError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill lobby code when user opens invite link (?mode=online&lobby=XXXX)
  useEffect(() => {
    if (lobbyFromUrl.length === LOBBY_CODE_LENGTH) {
      setJoinLobbyCode(lobbyFromUrl);
    }
  }, [lobbyFromUrl]);

  const handleCreateLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setLoading(true);
    const name = createName.trim() || 'Player';

    if (isSupabaseConfigured()) {
      const result = await createLobby(name);
      setLoading(false);
      if ('error' in result) {
        setCreateError(result.error);
        return;
      }
      setLobby({
        lobbyCode: result.lobbyCode,
        playerName: result.playerName,
        isHost: true,
        players: result.players,
        lobbyId: result.lobbyId,
        playerId: result.playerId,
      });
      router.replace(`/?mode=online&lobby=${result.lobbyCode}`);
      return;
    }

    const code = generateLobbyCode();
    setLobby({
      lobbyCode: code,
      playerName: name,
      isHost: true,
      players: [{ id: 'host', name, isHost: true }],
    });
    setLoading(false);
    router.replace(`/?mode=online&lobby=${code}`);
  };

  const handleJoinLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setLoading(true);
    const code = joinLobbyCode.trim().toUpperCase();
    const name = joinName.trim() || 'Player';

    if (code.length !== LOBBY_CODE_LENGTH) {
      setJoinError('Lobby code must be 4 letters.');
      setLoading(false);
      return;
    }

    if (isSupabaseConfigured()) {
      const result = await joinLobby(code, name);
      setLoading(false);
      if ('error' in result) {
        setJoinError(result.error);
        return;
      }
      setLobby({
        lobbyCode: result.lobbyCode,
        playerName: result.playerName,
        isHost: false,
        players: result.players,
        lobbyId: result.lobbyId,
        playerId: result.playerId,
      });
      router.replace(`/?mode=online&lobby=${result.lobbyCode}`);
      return;
    }

    setLobby({
      lobbyCode: code,
      playerName: name,
      isHost: false,
      players: [{ id: 'me', name }],
    });
    setLoading(false);
    router.replace(`/?mode=online&lobby=${code}`);
  };

  return (
    <main className="start-screen online-setup">
      <h1 className="start-title">
        <GameLogo maxHeight={173} onClick={() => router.replace('/')} />
      </h1>
      <p className="start-subtitle">The Card Game of Strategy, Magic & Mischief!</p>

      <button
        type="button"
        onClick={() => router.replace('/')}
        className="start-change-mode"
        aria-label="Change play mode (Local or Online)"
      >
        Change Mode
      </button>

      <div className="online-setup__sections">
        <section className="online-setup__section">
          <h2 className="online-setup__heading">Join a Game</h2>
          <form onSubmit={handleJoinLobby} className="online-setup__form">
            <label className="online-setup__label">
              Lobby
              <input
                type="text"
                value={joinLobbyCode}
                onChange={(e) => setJoinLobbyCode(e.target.value.toUpperCase().slice(0, LOBBY_CODE_LENGTH))}
                placeholder="e.g. HTNS"
                className="online-setup__input"
                maxLength={LOBBY_CODE_LENGTH}
                aria-describedby={joinError ? 'join-error' : undefined}
              />
            </label>
            <label className="online-setup__label">
              Your Name
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value.slice(0, NAME_MAX_LENGTH))}
                placeholder="Your name"
                className="online-setup__input"
                maxLength={NAME_MAX_LENGTH}
              />
            </label>
            {joinError && (
              <p id="join-error" className="online-setup__error" role="alert">
                {joinError}
              </p>
            )}
            <button
              type="submit"
              className="online-setup__btn online-setup__btn--join"
              disabled={loading}
            >
              {loading ? '…' : 'Join'}
            </button>
          </form>
        </section>

        <section className="online-setup__section">
          <h2 className="online-setup__heading">Create a Lobby</h2>
          <form onSubmit={handleCreateLobby} className="online-setup__form">
            <label className="online-setup__label">
              Your Name
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value.slice(0, NAME_MAX_LENGTH))}
                placeholder="Your name"
                className="online-setup__input"
                maxLength={NAME_MAX_LENGTH}
              />
            </label>
            {createError && (
              <p className="online-setup__error" role="alert">
                {createError}
              </p>
            )}
            <button
              type="submit"
              className="online-setup__btn online-setup__btn--create"
              disabled={loading}
            >
              {loading ? '…' : 'Create Lobby'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
