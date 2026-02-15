'use client';

import { useEffect, useState } from 'react';

const COUNTDOWN_SECONDS = 3;

interface DrawDeclarationModalProps {
  playerName: string;
  onDismiss: () => void;
}

export default function DrawDeclarationModal({
  playerName,
  onDismiss,
}: DrawDeclarationModalProps) {
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
      className="draw-declaration"
      role="dialog"
      aria-modal="true"
      aria-label="Draw card declaration"
    >
      <div className="draw-declaration__backdrop" onClick={onDismiss} />
      <div className="draw-declaration__content" onClick={(e) => e.stopPropagation()}>
        <p className="draw-declaration__message">{playerName} drew a card.</p>
        <div className="draw-declaration__actions">
          {countdown > 0 && (
            <span className="draw-declaration__countdown" aria-live="polite">
              {countdown}
            </span>
          )}
          <button
            type="button"
            className="draw-declaration__ok"
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
