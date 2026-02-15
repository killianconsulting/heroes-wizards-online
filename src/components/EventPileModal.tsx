'use client';

import { useState } from 'react';
import Card from './Card';
import CardZoomModal from './CardZoomModal';

interface EventPileModalProps {
  cardIds: number[];
  onDismiss: () => void;
}

export default function EventPileModal({ cardIds, onDismiss }: EventPileModalProps) {
  const [zoomedCardId, setZoomedCardId] = useState<number | null>(null);

  return (
    <div
      className="event-pile-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Event pile - view all cards"
    >
      <div className="event-pile-modal__backdrop" onClick={onDismiss} />
      <div className="event-pile-modal__content">
        <h2 className="event-pile-modal__title">Event Pile</h2>
        <p className="event-pile-modal__subtitle">
          Click a card to zoom, then OK when done.
        </p>
        <div className="event-pile-modal__cards">
          {cardIds.length === 0 ? (
            <p className="event-pile-modal__empty">(no cards)</p>
          ) : (
            cardIds.map((cardId) => (
              <Card
                key={cardId}
                cardId={cardId}
                className="event-pile-modal__card"
                onClick={() => setZoomedCardId(cardId)}
              />
            ))
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="event-pile-modal__ok"
        >
          OK
        </button>
      </div>
      {zoomedCardId !== null && (
        <CardZoomModal
          cardId={zoomedCardId}
          onClose={() => setZoomedCardId(null)}
        />
      )}
    </div>
  );
}
