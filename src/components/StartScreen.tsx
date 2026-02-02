'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GameLogo from './GameLogo';
import { MIN_PLAYERS, MAX_PLAYERS } from '@/data/constants';
import { getRandomThemedName } from '@/utils/themedNames';
import PlayerAvatarIcon from './PlayerAvatarIcon';

interface StartScreenProps {
  onStart: (playerNames: string[]) => void;
}

type StartView = 'choice' | 'local';

export default function StartScreen({ onStart }: StartScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const view: StartView = mode === 'local' ? 'local' : 'choice';
  const [playerCount, setPlayerCount] = useState(MIN_PLAYERS);
  const [names, setNames] = useState<string[]>(
    Array.from({ length: MIN_PLAYERS }, (_, i) => `Player ${i + 1}`)
  );

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
    onStart(names.slice(0, playerCount));
  };

  if (view === 'choice') {
    return (
      <main className="start-screen">
        <h1 className="start-title">
          <GameLogo maxHeight={173} />
        </h1>
        <p className="start-subtitle">The Card Game of Strategy, Magic & Mischief!</p>
        <div className="start-choice">
          <div className="start-choice__buttons">
            <button
              type="button"
              onClick={() => router.replace('/?mode=local')}
              className="start-choice__btn start-choice__btn--local"
            >
              Local
            </button>
            <div className="start-choice__option">
              <button
                type="button"
                disabled
                className="start-choice__btn start-choice__btn--online"
                aria-disabled="true"
              >
                Online
              </button>
              <span className="start-choice__coming-soon">Coming Soon</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="start-screen">
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
      <form onSubmit={handleSubmit} className="start-form">
        <label className="start-label start-label--center">
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
