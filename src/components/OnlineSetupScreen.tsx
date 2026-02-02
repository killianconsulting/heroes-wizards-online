'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GameLogo from './GameLogo';
import { useLobby } from '@/context/LobbyContext';

const NAME_MAX_LENGTH = 20;
const LOBBY_CODE_LENGTH = 4;

export default function OnlineSetupScreen() {
  const router = useRouter();
  const { setLobby, generateLobbyCode } = useLobby();
  const [joinLobbyCode, setJoinLobbyCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [createName, setCreateName] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleCreateLobby = (e: React.FormEvent) => {
    e.preventDefault();
    const name = createName.trim() || 'Player';
    const code = generateLobbyCode();
    setLobby({
      lobbyCode: code,
      playerName: name,
      isHost: true,
      players: [{ id: 'host', name, isHost: true }],
    });
    router.replace(`/?mode=online&lobby=${code}`);
  };

  const handleJoinLobby = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    const code = joinLobbyCode.trim().toUpperCase();
    const name = joinName.trim() || 'Player';
    if (code.length !== LOBBY_CODE_LENGTH) {
      setJoinError('Lobby code must be 4 letters.');
      return;
    }
    setLobby({
      lobbyCode: code,
      playerName: name,
      isHost: false,
      players: [{ id: 'me', name }],
    });
    router.replace(`/?mode=online&lobby=${code}`);
  };

  return (
    <main className="start-screen online-setup">
      <h1 className="start-title">
        <GameLogo maxHeight={173} />
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
            <button type="submit" className="online-setup__btn online-setup__btn--join">
              Join
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
            <button type="submit" className="online-setup__btn online-setup__btn--create">
              Create Lobby
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
