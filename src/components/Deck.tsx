'use client';

import Card from './Card';

interface DeckProps {
  count: number;
}

export default function Deck({ count }: DeckProps) {
  if (count === 0) {
    return (
      <div className="deck deck--empty" aria-label="Deck empty">
        <span className="deck__count">0</span>
      </div>
    );
  }

  return (
    <div className="deck" aria-label={`Deck: ${count} cards`}>
      <Card cardId={0} faceDown className="deck__top" />
      <span className="deck__count">{count}</span>
    </div>
  );
}
