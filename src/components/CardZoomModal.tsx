'use client';

import { useEffect } from 'react';
import Card from './Card';

interface CardZoomModalProps {
  cardId: number;
  faceDown?: boolean;
  onClose: () => void;
}

export default function CardZoomModal({
  cardId,
  faceDown = false,
  onClose,
}: CardZoomModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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
      </div>
    </div>
  );
}
