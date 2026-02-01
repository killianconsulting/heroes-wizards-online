'use client';

import Card from './Card';

interface EventPileProps {
  cardIds: number[];
  /** Callback when user picks a card (e.g. Summoner) */
  onPickCard?: (cardId: number) => void;
  pickable?: boolean;
  /** Click the top card to zoom when not pickable. */
  onZoomCard?: (cardId: number) => void;
}

export default function EventPile({
  cardIds,
  onPickCard,
  pickable = false,
  onZoomCard,
}: EventPileProps) {
  if (cardIds.length === 0) {
    return (
      <div className="event-pile event-pile--empty">
        <span className="event-pile__label">Event Pile</span>
        <span className="event-pile__count">0</span>
      </div>
    );
  }

  const topCard = cardIds[cardIds.length - 1];

  return (
    <div className="event-pile">
      <span className="event-pile__label">Event Pile</span>
      <div className="event-pile__cards">
        {pickable && cardIds.length > 0 ? (
          cardIds.map((id) => (
            <Card
              key={id}
              cardId={id}
              onClick={onPickCard ? () => onPickCard(id) : undefined}
              className="event-pile__card"
            />
          ))
        ) : (
          <Card
            cardId={topCard}
            className="event-pile__top"
            onClick={onZoomCard ? () => onZoomCard(topCard) : undefined}
          />
        )}
      </div>
      <span className="event-pile__count">{cardIds.length}</span>
    </div>
  );
}
