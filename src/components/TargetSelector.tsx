'use client';

import { useState } from 'react';
import type { EventId } from '@/data/constants';
import type { GameState } from '@/engine/state';
import type { EventTarget } from '@/engine/events';
import { getEventTargetType } from '@/utils/eventTargets';
import Card from './Card';

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

  const targetType = getEventTargetType(eventId);
  const currentIndex = state.currentPlayerIndex;
  const otherPlayerIndices = state.players
    .map((_, i) => i)
    .filter((i) => i !== currentIndex);

  if (targetType === 'player') {
    return (
      <div className="target-selector">
        <p className="target-selector__prompt">Choose a player to target:</p>
        <div className="target-selector__options">
          {otherPlayerIndices.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect({ playerIndex: i })}
              className="target-selector__btn"
            >
              {state.players[i].name}
            </button>
          ))}
        </div>
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
          <div className="target-selector__options">
            {otherPlayerIndices.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setChosenPlayerIndex(i)}
                className="target-selector__btn"
              >
                {state.players[i].name}
              </button>
            ))}
          </div>
          <button type="button" onClick={onCancel} className="target-selector__cancel">
            Cancel
          </button>
        </div>
      );
    }

    const chosen = chosenPlayerIndex;
    const player = state.players[chosen];

    return (
        <div className="target-selector">
          <p className="target-selector__prompt">Choose a card from {player.name}&apos;s hand:</p>
          <div className="target-selector__cards">
            {player.hand.map((id) => (
              <Card
                key={id}
                cardId={id}
                onClick={() => onSelect({ playerIndex: chosen, cardId: id })}
                className="target-selector__card"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setChosenPlayerIndex(null)}
            className="target-selector__cancel"
          >
            Back
          </button>
        </div>
      );
  }

  return null;
}
