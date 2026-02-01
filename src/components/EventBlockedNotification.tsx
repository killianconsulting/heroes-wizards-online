'use client';

interface EventBlockedNotificationProps {
  message: string;
  onDismiss: () => void;
}

export default function EventBlockedNotification({
  message,
  onDismiss,
}: EventBlockedNotificationProps) {
  return (
    <div
      className="event-blocked"
      role="alert"
      aria-live="polite"
      aria-label="Event effect blocked"
    >
      <div className="event-blocked__backdrop" onClick={onDismiss} />
      <div className="event-blocked__content">
        <p className="event-blocked__icon" aria-hidden="true">
          🛡️
        </p>
        <h2 className="event-blocked__title">Effect blocked!</h2>
        <p className="event-blocked__message">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="event-blocked__ok"
        >
          OK
        </button>
      </div>
    </div>
  );
}
