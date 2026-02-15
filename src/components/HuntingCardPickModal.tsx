'use client';

import { useState } from 'react';
import type { GameState } from '@/engine/state';
import Card from './Card';

interface HuntingCardPickModalProps {
  state: GameState;
  targetPlayerIndex: number;
  onConfirm: (cardId: number) => void;
}

export default function HuntingCardPickModal({
  state,
  targetPlayerIndex,
  onConfirm,
}: HuntingCardPickModalProps) {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const targetPlayer = state.players[targetPlayerIndex];
  if (!targetPlayer) return null;

  return (
    <div
      className="hunting-card-pick"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a card to steal"
    >
      <div className="hunting-card-pick__backdrop" />
      <div className="hunting-card-pick__content" onClick={(e) => e.stopPropagation()}>
        <h2 className="hunting-card-pick__title">
          Choose a card to steal from {targetPlayer.name}&apos;s hand:
        </h2>
        <div className="hunting-card-pick__cards">
          {targetPlayer.hand.map((id) => (
            <div key={id} className="hunting-card-pick__card-row">
              <Card
                cardId={id}
                onClick={() => setSelectedCardId(selectedCardId === id ? null : id)}
                className={
                  selectedCardId === id
                    ? 'hunting-card-pick__card hunting-card-pick__card--selected'
                    : 'hunting-card-pick__card'
                }
                highlight={selectedCardId === id}
              />
            </div>
          ))}
        </div>
        <div className="hunting-card-pick__actions">
          <button
            type="button"
            onClick={() => selectedCardId !== null && onConfirm(selectedCardId)}
            disabled={selectedCardId === null}
            className="hunting-card-pick__ok"
          >
            OK – Steal this card
          </button>
        </div>
      </div>
    </div>
  );
}
