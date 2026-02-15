'use client';

import { useEffect, useState } from 'react';
import Card from './Card';

const COUNTDOWN_SECONDS = 3;

interface PlayCardDeclarationModalProps {
  cardId: number;
  message: string;
  onDismiss: () => void;
  /** When true, countdown is not used and modal stays until OK (e.g. hunting expedition waiting for active player to pick card). */
  noAutoDismiss?: boolean;
}

export default function PlayCardDeclarationModal({
  cardId,
  message,
  onDismiss,
  noAutoDismiss = false,
}: PlayCardDeclarationModalProps) {
  const [countdown, setCountdown] = useState(noAutoDismiss ? 0 : COUNTDOWN_SECONDS);

  useEffect(() => {
    if (noAutoDismiss) return;
    if (countdown <= 0) {
      onDismiss();
      return;
    }
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown, noAutoDismiss, onDismiss]);

  return (
    <div
      className="play-declaration"
      role="dialog"
      aria-modal="true"
      aria-label="Card play declaration"
    >
      <div className="play-declaration__backdrop" onClick={noAutoDismiss ? undefined : onDismiss} />
      <div className="play-declaration__content" onClick={(e) => e.stopPropagation()}>
        <div className="play-declaration__card">
          <Card cardId={cardId} className="play-declaration__card-inner" />
        </div>
        <div className="play-declaration__body">
          <p className="play-declaration__message">{message}</p>
          <div className="play-declaration__actions">
            {!noAutoDismiss && countdown > 0 && (
              <span className="play-declaration__countdown" aria-live="polite">
                {countdown}
              </span>
            )}
            {!noAutoDismiss && (
              <button
                type="button"
                className="play-declaration__ok"
                onClick={onDismiss}
                aria-label="OK"
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
