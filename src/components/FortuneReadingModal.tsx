'use client';

import { useState } from 'react';
import type { GameState } from '@/engine/state';
import Card from './Card';
import CardZoomModal from './CardZoomModal';

interface FortuneReadingModalProps {
  state: GameState;
  onDismiss: () => void;
}

export default function FortuneReadingModal({ state, onDismiss }: FortuneReadingModalProps) {
  const [zoomedCardId, setZoomedCardId] = useState<number | null>(null);
  const currentIndex = state.currentPlayerIndex;
  const otherPlayers = state.players.filter((_, i) => i !== currentIndex);

  return (
    <div
      className="fortune-reading"
      role="dialog"
      aria-modal="true"
      aria-label="Fortune Reading - view other players' hands"
    >
      <div className="fortune-reading__backdrop" onClick={onDismiss} />
      <div className="fortune-reading__content">
        <h2 className="fortune-reading__title">Fortune Reading</h2>
        <p className="fortune-reading__subtitle">
          You peek at all other players&apos; hands. Click a card to zoom, then OK when done.
        </p>
        <div className="fortune-reading__hands">
          {otherPlayers.map((player) => (
            <div key={player.id} className="fortune-reading__hand">
              <h3 className="fortune-reading__hand-title">{player.name}&apos;s hand</h3>
              <div className="fortune-reading__cards">
                {player.hand.length === 0 ? (
                  <p className="fortune-reading__empty">(no cards)</p>
                ) : (
                  player.hand.map((cardId) => (
                    <Card
                      key={cardId}
                      cardId={cardId}
                      className="fortune-reading__card"
                      onClick={() => setZoomedCardId(cardId)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="fortune-reading__ok"
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
