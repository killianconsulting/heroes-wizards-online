'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GameLogo from './GameLogo';
import { MIN_PLAYERS, MAX_PLAYERS } from '@/data/constants';
import { getRandomThemedName } from '@/utils/themedNames';
import PlayerAvatarIcon from './PlayerAvatarIcon';
import OnlineSetupScreen from './OnlineSetupScreen';
import LobbyScreen from './LobbyScreen';
import { useLobby } from '@/context/LobbyContext';

export type TurnWaitSeconds = 0 | 3 | 5;

interface StartScreenProps {
  onStart: (playerNames: string[], turnWaitSeconds?: TurnWaitSeconds) => void;
}

type StartView = 'choice' | 'local' | 'online';

export default function StartScreen({ onStart }: StartScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lobby } = useLobby();
  const modeFromUrl = searchParams.get('mode');
  const lobbyCodeFromUrl = searchParams.get('lobby');

  // Local state so buttons update the view immediately (router.replace can be slow)
  const [viewOverride, setViewOverride] = useState<StartView | null>(null);
  useEffect(() => {
    if (!modeFromUrl) setViewOverride(null);
  }, [modeFromUrl]);

  const view: StartView =
    viewOverride ??
    (modeFromUrl === 'local' ? 'local' : modeFromUrl === 'online' ? 'online' : 'choice');

  const showLobbyScreen =
    view === 'online' &&
    lobbyCodeFromUrl &&
    lobby &&
    lobby.lobbyCode === lobbyCodeFromUrl;
  const [playerCount, setPlayerCount] = useState(MIN_PLAYERS);
  const [names, setNames] = useState<string[]>(
    Array.from({ length: MIN_PLAYERS }, (_, i) => `Player ${i + 1}`)
  );
  const [turnWaitSeconds, setTurnWaitSeconds] = useState<TurnWaitSeconds>(0);

  const updateCount = (n: number) => {
    const clamped = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, n));
    setPlayerCount(clamped);
    setNames((prev) => {
      const next = [...prev];
      while (next.length < clamped) next.push(`Player ${next.length + 1}`);
      return next.slice(0, clamped);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(names.slice(0, playerCount), turnWaitSeconds);
  };

  if (view === 'choice') {
    return (
      <main className="start-screen">
        <h1 className="start-title">
          <GameLogo maxHeight={173} onClick={() => router.replace('/')} />
        </h1>
        <p className="start-subtitle">The Card Game of Strategy, Magic & Mischief!</p>
        <div className="start-choice">
          <div className="start-choice__buttons">
            <button
              type="button"
              onClick={() => {
                setViewOverride('local');
                router.replace('/?mode=local');
              }}
              className="start-choice__btn start-choice__btn--local"
            >
              Local
            </button>
            <button
              type="button"
              onClick={() => {
                setViewOverride('online');
                router.replace('/?mode=online');
              }}
              className="start-choice__btn start-choice__btn--online-active"
            >
              Online
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (view === 'online') {
    if (showLobbyScreen) {
      return <LobbyScreen onStartGame={onStart} />;
    }
    return <OnlineSetupScreen />;
  }

  return (
    <main className="start-screen">
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
      <form onSubmit={handleSubmit} className="start-form">
        <label className="start-label start-label--center start-label--white">
          Number of Players (2–5)
          <div className="start-player-count">
            <button
              type="button"
              onClick={() => updateCount(playerCount - 1)}
              disabled={playerCount <= MIN_PLAYERS}
              className="start-player-count__btn"
              aria-label="Remove player"
            >
              −
            </button>
            <span className="start-player-count__value" aria-live="polite">
              {playerCount}
            </span>
            <button
              type="button"
              onClick={() => updateCount(playerCount + 1)}
              disabled={playerCount >= MAX_PLAYERS}
              className="start-player-count__btn"
              aria-label="Add player"
            >
              +
            </button>
          </div>
        </label>

        <label className="start-label start-label--center start-label--white">
          Set Wait Time For Pass Turn
          <div className="start-wait-time" role="group" aria-label="Set wait time for pass turn">
            {([0, 3, 5] as const).map((seconds) => (
              <button
                key={seconds}
                type="button"
                onClick={() => setTurnWaitSeconds(seconds)}
                className={`start-wait-time__option ${turnWaitSeconds === seconds ? 'start-wait-time__option--active' : ''}`}
                aria-pressed={turnWaitSeconds === seconds}
              >
                {seconds === 0 ? 'No wait' : `${seconds} seconds`}
              </button>
            ))}
          </div>
        </label>

        <div className="start-names">
          {names.slice(0, playerCount).map((name, i) => (
            <div key={i} className="start-name-entry">
              <div className="start-name-entry__avatar">
                <PlayerAvatarIcon />
              </div>
              <label className="start-label start-name-entry__label">
                Player {i + 1} Name
                <div className="start-name-row">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const next = [...names];
                      next[i] = e.target.value;
                      setNames(next);
                    }}
                    className="start-input start-name-row__input"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...names];
                      next[i] = getRandomThemedName();
                      setNames(next);
                    }}
                    className="start-name-row__random"
                    title="Pick a random themed name"
                    aria-label="Pick random name"
                  >
                    Random
                  </button>
                </div>
              </label>
            </div>
          ))}
        </div>

        <button type="submit" className="start-button">
          Start Game
        </button>
      </form>
    </main>
  );
}
