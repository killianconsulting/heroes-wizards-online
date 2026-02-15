'use client';

import { useEffect, useState } from 'react';

const COUNTDOWN_SECONDS = 3;

interface DumpDeclarationModalProps {
  playerName: string;
  onDismiss: () => void;
}

export default function DumpDeclarationModal({
  playerName,
  onDismiss,
}: DumpDeclarationModalProps) {
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
      className="dump-declaration"
      role="dialog"
      aria-modal="true"
      aria-label="Dump card declaration"
    >
      <div className="dump-declaration__backdrop" onClick={onDismiss} />
      <div className="dump-declaration__content" onClick={(e) => e.stopPropagation()}>
        <p className="dump-declaration__message">{playerName} dumped a card.</p>
        <div className="dump-declaration__actions">
          {countdown > 0 && (
            <span className="dump-declaration__countdown" aria-live="polite">
              {countdown}
            </span>
          )}
          <button
            type="button"
            className="dump-declaration__ok"
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
