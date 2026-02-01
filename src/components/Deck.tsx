'use client';

import Card from './Card';

interface DeckProps {
  count: number;
  /** When true, clicking the deck draws a card (same as Draw card button). */
  canDraw?: boolean;
  /** Click the deck to draw a card on your turn. */
  onDraw?: () => void;
  /** When draw not available, click to zoom (show card back larger). */
  onZoomCard?: (cardId: number, faceDown: boolean) => void;
}

export default function Deck({ count, canDraw = false, onDraw, onZoomCard }: DeckProps) {
  if (count === 0) {
    return (
      <div className="deck deck--empty" aria-label="Deck empty">
        <span className="deck__count">0</span>
      </div>
    );
  }

  const handleClick = () => {
    if (canDraw && onDraw) {
      onDraw();
    } else if (onZoomCard) {
      onZoomCard(0, true);
    }
  };

  const hasClickAction = (canDraw && onDraw) || onZoomCard;

  return (
    <div className="deck" aria-label={`Deck: ${count} cards`}>
      <Card
        cardId={0}
        faceDown
        className="deck__top"
        onClick={hasClickAction ? handleClick : undefined}
      />
      <span className="deck__count">{count}</span>
    </div>
  );
}
