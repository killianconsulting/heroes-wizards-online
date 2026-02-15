'use client';

import type { EventId } from '@/data/constants';
import type { GameState } from '@/engine/state';
import type { EventTarget } from '@/engine/events';
import TargetSelector from './TargetSelector';

interface TargetSelectorModalProps {
  state: GameState;
  eventCardId: number;
  eventId: EventId;
  onSelect: (target: EventTarget) => void;
  onCancel: () => void;
  onPlayerChosenForDeclaration?: (playerIndex: number) => void;
}

export default function TargetSelectorModal({
  state,
  eventCardId,
  eventId,
  onSelect,
  onCancel,
  onPlayerChosenForDeclaration,
}: TargetSelectorModalProps) {
  return (
    <div
      className="target-selector-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Choose target"
    >
      <div className="target-selector-modal__backdrop" onClick={onCancel} />
      <div className="target-selector-modal__content" onClick={(e) => e.stopPropagation()}>
        <TargetSelector
          state={state}
          eventCardId={eventCardId}
          eventId={eventId}
          onSelect={onSelect}
          onCancel={onCancel}
          onPlayerChosenForDeclaration={onPlayerChosenForDeclaration}
        />
      </div>
    </div>
  );
}
