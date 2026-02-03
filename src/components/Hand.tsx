'use client';

import Card from './Card';

interface HandProps {
  cardIds: number[];
  selectedCardId: number | null;
  playableCardIds: number[];
  onSelectCard: (cardId: number | null) => void;
  /** If true, show which cards can be played (highlight) */
  showPlayable?: boolean;
  /** Double-click a card to zoom (view larger) */
  onZoomCard?: (cardId: number) => void;
}

export default function Hand({
  cardIds,
  selectedCardId,
  playableCardIds,
  onSelectCard,
  showPlayable = true,
  onZoomCard,
}: HandProps) {
  return (
    <div className="hand">
      <div className="hand__cards">
        {cardIds.map((cardId) => (
          <Card
            key={cardId}
            cardId={cardId}
            highlight={
              showPlayable && playableCardIds.includes(cardId) && selectedCardId === cardId
            }
            onClick={() => onSelectCard(selectedCardId === cardId ? null : cardId)}
            onDoubleClick={onZoomCard ? () => onZoomCard(cardId) : undefined}
            className={selectedCardId === cardId ? 'hand__card--selected' : ''}
          />
        ))}
      </div>
    </div>
  );
}
