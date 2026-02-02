'use client';

import { useState } from 'react';
import type { EventId } from '@/data/constants';
import type { GameState } from '@/engine/state';
import type { EventTarget } from '@/engine/events';
import { getEventTargetType, getTargetPlayerInfo } from '@/utils/eventTargets';
import Card from './Card';
import CardZoomModal from './CardZoomModal';

interface TargetSelectorProps {
  state: GameState;
  eventCardId: number;
  eventId: EventId;
  onSelect: (target: EventTarget) => void;
  onCancel: () => void;
}

export default function TargetSelector({
  state,
  eventId,
  onSelect,
  onCancel,
}: TargetSelectorProps) {
  const [chosenPlayerIndex, setChosenPlayerIndex] = useState<number | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [zoomedCardId, setZoomedCardId] = useState<number | null>(null);

  const targetType = getEventTargetType(eventId);
  const currentIndex = state.currentPlayerIndex;
  const otherPlayerIndices = state.players
    .map((_, i) => i)
    .filter((i) => i !== currentIndex);

  if (targetType === 'player') {
    const hasAnyValidTarget = otherPlayerIndices.some((i) =>
      getTargetPlayerInfo(state, i, eventId).canSelect
    );

    return (
      <div className="target-selector">
        <p className="target-selector__prompt">Choose a player to target:</p>
        <ul className="target-selector__player-list" aria-label="Target players">
          {!hasAnyValidTarget && (
            <li className="target-selector__player-row">
              <button
                type="button"
                onClick={() => onSelect({ playerIndex: -1 })}
                className="target-selector__btn target-selector__btn--player target-selector__btn--no-effect"
              >
                Play with No Effect
              </button>
              <span className="target-selector__hint" aria-hidden="true">
                No valid target — event is discarded
              </span>
            </li>
          )}
          {otherPlayerIndices.map((i) => {
            const { canSelect, hint } = getTargetPlayerInfo(state, i, eventId);
            return (
              <li key={i} className="target-selector__player-row">
                <button
                  type="button"
                  onClick={() => onSelect({ playerIndex: i })}
                  className={`target-selector__btn target-selector__btn--player ${!canSelect ? 'target-selector__btn--disabled' : ''}`}
                  disabled={!canSelect}
                  title={!canSelect ? hint : undefined}
                >
                  {state.players[i].name}
                </button>
                <span className="target-selector__hint" aria-hidden="true">
                  {hint}
                </span>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={onCancel} className="target-selector__cancel">
          Cancel
        </button>
      </div>
    );
  }

  if (targetType === 'player-and-hand-card') {
    if (chosenPlayerIndex === null) {
      return (
        <div className="target-selector">
          <p className="target-selector__prompt">Choose a player:</p>
          <ul className="target-selector__player-list" aria-label="Players to choose from">
            {otherPlayerIndices.map((i) => {
              const handCount = state.players[i].hand.length;
              const hint = handCount === 1 ? '1 card in hand' : `${handCount} cards in hand`;
              return (
                <li key={i} className="target-selector__player-row">
                  <button
                    type="button"
                    onClick={() => setChosenPlayerIndex(i)}
                    className="target-selector__btn target-selector__btn--player"
                  >
                    {state.players[i].name}
                  </button>
                  <span className="target-selector__hint" aria-hidden="true">
                    {hint}
                  </span>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={onCancel} className="target-selector__cancel">
            Cancel
          </button>
        </div>
      );
    }

    const chosen = chosenPlayerIndex;
    const player = state.players[chosen];

    const handleBack = () => {
      setChosenPlayerIndex(null);
      setSelectedCardId(null);
      setZoomedCardId(null);
    };

    const handleConfirm = () => {
      if (selectedCardId !== null) {
        onSelect({ playerIndex: chosen, cardId: selectedCardId });
      }
    };

    return (
      <>
        <div className="target-selector">
          <p className="target-selector__prompt">
            Choose a card from {player.name}&apos;s hand. Click to select, double-click to zoom, then OK to confirm.
          </p>
          <div className="target-selector__cards">
            {player.hand.map((id) => (
              <div
                key={id}
                className="target-selector__card-row"
                onDoubleClick={() => {
                  setZoomedCardId(id);
                  setSelectedCardId(id);
                }}
              >
                <Card
                  cardId={id}
                  onClick={() => setSelectedCardId(selectedCardId === id ? null : id)}
                  className={
                    selectedCardId === id
                      ? 'target-selector__card target-selector__card--selected'
                      : 'target-selector__card'
                  }
                  highlight={selectedCardId === id}
                />
              </div>
            ))}
          </div>
          <div className="target-selector__actions">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedCardId === null}
              className="target-selector__btn target-selector__btn--confirm"
            >
              OK – Steal this card
            </button>
            <button type="button" onClick={handleBack} className="target-selector__cancel">
              Back
            </button>
          </div>
        </div>
        {zoomedCardId !== null && (
          <CardZoomModal
            cardId={zoomedCardId}
            onClose={() => setZoomedCardId(null)}
          />
        )}
      </>
    );
  }

  return null;
}
