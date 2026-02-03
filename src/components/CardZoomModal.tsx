'use client';

import { useEffect } from 'react';
import Card from './Card';

interface CardZoomModalProps {
  cardId: number;
  faceDown?: boolean;
  onClose: () => void;
  /** Optional confirm button (e.g. "Take this card" for Summoner) */
  confirmLabel?: string;
  onConfirm?: () => void;
}

export default function CardZoomModal({
  cardId,
  faceDown = false,
  onClose,
  confirmLabel,
  onConfirm,
}: CardZoomModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div
      className="card-zoom"
      role="dialog"
      aria-modal="true"
      aria-label="Card zoom"
      onClick={onClose}
    >
      <div
        className="card-zoom__card-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <Card
          cardId={cardId}
          faceDown={faceDown}
          className="card-zoom__card"
        />
        {confirmLabel && onConfirm && (
          <div className="card-zoom__actions">
            <button
              type="button"
              className="card-zoom__confirm"
              onClick={(e) => {
                e.stopPropagation();
                handleConfirm();
              }}
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              className="card-zoom__close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
