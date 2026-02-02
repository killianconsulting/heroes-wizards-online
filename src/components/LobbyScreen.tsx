'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import GameLogo from './GameLogo';
import { useLobby } from '@/context/LobbyContext';
import PlayerAvatarIcon from './PlayerAvatarIcon';
import { MAX_PLAYERS } from '@/data/constants';

interface LobbyScreenProps {
  onStartGame?: (playerNames: string[]) => void;
}

export default function LobbyScreen({ onStartGame }: LobbyScreenProps) {
  const router = useRouter();
  const { lobby, leaveLobby } = useLobby();
  const [copied, setCopied] = useState(false);

  const handleLeaveLobby = useCallback(() => {
    leaveLobby();
    router.replace('/?mode=online');
  }, [leaveLobby, router]);

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?mode=online&lobby=${lobby?.lobbyCode ?? ''}`
      : '';

  const handleCopyLink = useCallback(async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the input
    }
  }, [inviteUrl]);

  const handleStartGame = useCallback(() => {
    if (!lobby || !onStartGame) return;
    const names = lobby.players.map((p) => p.name);
    if (names.length < 2) {
      // For now require at least 2; when backend exists host can start when ready
      return;
    }
    onStartGame(names);
  }, [lobby, onStartGame]);

  if (!lobby) return null;

  const canStart = lobby.isHost && lobby.players.length >= 2;

  return (
    <main className="start-screen lobby-screen">
      <h1 className="start-title">
        <GameLogo maxHeight={120} />
      </h1>

      <button
        type="button"
        onClick={() => router.replace('/')}
        className="start-change-mode"
        aria-label="Change play mode"
      >
        Change Mode
      </button>

      <div className="lobby-screen__code">
        <span className="lobby-screen__code-label">Lobby code:</span>
        <span className="lobby-screen__code-value" aria-label={`Lobby code ${lobby.lobbyCode}`}>
          {lobby.lobbyCode}
        </span>
      </div>

      <p className="lobby-screen__invite-text">Copy and share this link to invite other players.</p>
      <div className="lobby-screen__invite-row">
        <input
          type="text"
          readOnly
          value={inviteUrl}
          className="lobby-screen__invite-input"
          aria-label="Invitation link"
        />
        <button
          type="button"
          onClick={handleCopyLink}
          className="lobby-screen__copy-btn"
          aria-pressed={copied}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="lobby-screen__players-wrap">
        <h2 className="lobby-screen__players-heading">
          Players ({lobby.players.length}/{MAX_PLAYERS})
        </h2>
        <ul className="lobby-screen__players" role="list">
          {lobby.players.map((player) => (
            <li key={player.id} className="lobby-screen__player-card">
              <div className="lobby-screen__player-avatar">
                <PlayerAvatarIcon />
              </div>
              <span className="lobby-screen__player-name">
                {player.name}
                {player.isHost && ' [Host]'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="lobby-screen__actions">
        <button
          type="button"
          onClick={handleStartGame}
          disabled={!canStart}
          className="lobby-screen__btn lobby-screen__btn--start"
          title={!canStart ? 'Need at least 2 players to start' : 'Start game'}
        >
          Start Game
        </button>
        <button
          type="button"
          onClick={handleLeaveLobby}
          className="lobby-screen__btn lobby-screen__btn--leave"
        >
          Leave Lobby
        </button>
      </div>

      {lobby.isHost && lobby.players.length < 2 && (
        <p className="lobby-screen__hint">Waiting for players to join (need at least 2 to start).</p>
      )}
    </main>
  );
}
