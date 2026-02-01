'use client';

import { getCard } from '@/data/cards';
import type { LegalActions } from '@/engine/validation';

interface ActionBarProps {
  legal: LegalActions;
  selectedCardId: number | null;
  onDraw: () => void;
  onPassTurn: () => void;
  onPlay: (cardId: number) => void;
  onDump: (cardId: number) => void;
  onSummon: (cardId: number) => void;
  /** When true, playing a card will require target selection (handled by parent) */
  isCurrentTurn: boolean;
  /** When true, only Pass turn is available (show "No more actions available.") */
  onlyPassAvailable?: boolean;
}

export default function ActionBar({
  legal,
  selectedCardId,
  onDraw,
  onPassTurn,
  onPlay,
  onDump,
  onSummon,
  isCurrentTurn,
  onlyPassAvailable = false,
}: ActionBarProps) {
  if (!isCurrentTurn) {
    return (
      <div className="action-bar">
        <p className="action-bar__wait">Waiting for your turn...</p>
      </div>
    );
  }

  const canPlaySelected =
    selectedCardId !== null && legal.playableCardIds.includes(selectedCardId);
  const canDumpSelected =
    selectedCardId !== null &&
    getCard(selectedCardId).type !== 'event' &&
    legal.canDump;

  const hintText = onlyPassAvailable
    ? 'No more actions available.'
    : legal.canDraw
      ? legal.canDump
        ? 'Available actions: Draw Card, Play Card, or Dump Card.'
        : 'Available actions: Draw Card or Play Card.'
      : legal.canPassTurn
        ? 'Available actions: Play Card or Pass Turn.'
        : legal.canDump
          ? 'Available actions: Play Card or Dump Card.'
          : 'Available actions: Play Card.';

  return (
    <div className="action-bar">
      <div className="action-bar__left">
        {legal.canDraw && (
          <button type="button" onClick={onDraw} className="action-bar__btn action-bar__btn--draw">
            Draw Card
          </button>
        )}

        {canPlaySelected && (
          <button
            type="button"
            onClick={() => selectedCardId !== null && onPlay(selectedCardId)}
            className="action-bar__btn action-bar__btn--play"
          >
            Play Card
          </button>
        )}

        {canDumpSelected && (
          <button
            type="button"
            onClick={() => selectedCardId !== null && onDump(selectedCardId)}
            className="action-bar__btn action-bar__btn--dump"
          >
            Dump Card
          </button>
        )}

        <p className="action-bar__hint">{hintText}</p>
      </div>

      <button
        type="button"
        onClick={onPassTurn}
        className="action-bar__btn action-bar__btn--pass"
        disabled={!legal.canPassTurn}
      >
        Pass Turn
      </button>
    </div>
  );
}
