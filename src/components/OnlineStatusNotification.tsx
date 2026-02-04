'use client';

import { useOnlineGame } from '@/context/OnlineGameContext';

export default function OnlineStatusNotification() {
  const { statusMessage, dismissStatus } = useOnlineGame();
  if (!statusMessage) return null;
  return (
    <div
      className="online-status"
      role="status"
      aria-live="polite"
      aria-label="Game status"
    >
      <span className="online-status__message">{statusMessage}</span>
      <button
        type="button"
        onClick={dismissStatus}
        className="online-status__dismiss"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
