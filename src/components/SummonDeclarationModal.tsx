'use client';

import { useEffect, useState } from 'react';

const COUNTDOWN_SECONDS = 3;

interface SummonDeclarationModalProps {
  playerName: string;
  onDismiss: () => void;
}

export default function SummonDeclarationModal({
  playerName,
  onDismiss,
}: SummonDeclarationModalProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (countdown <= 0) {
      onDismiss();
      return;
    }
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown, onDismiss]);

  return (
    <div
      className="summon-declaration"
      role="dialog"
      aria-modal="true"
      aria-label="Summoner declaration"
    >
      <div className="summon-declaration__backdrop" onClick={onDismiss} />
      <div className="summon-declaration__content" onClick={(e) => e.stopPropagation()}>
        <p className="summon-declaration__message">
          {playerName} used the Summoner to take a card from the Event Pile.
        </p>
        <div className="summon-declaration__actions">
          {countdown > 0 && (
            <span className="summon-declaration__countdown" aria-live="polite">
              {countdown}
            </span>
          )}
          <button
            type="button"
            className="summon-declaration__ok"
            onClick={onDismiss}
            aria-label="OK"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
