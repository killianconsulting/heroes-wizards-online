'use client';

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
    selectedCardId !== null && legal.canDump && !legal.playableCardIds.includes(selectedCardId);

  return (
    <div className="action-bar">
      {legal.canDraw && (
        <button type="button" onClick={onDraw} className="action-bar__btn action-bar__btn--draw">
          Draw card
        </button>
      )}

      {legal.canPassTurn && (
        <button type="button" onClick={onPassTurn} className="action-bar__btn action-bar__btn--pass">
          Pass turn
        </button>
      )}

      {legal.canSummonFromPile && (
        <p className="action-bar__hint">Use &quot;Summon from pile&quot; below to take from event pile.</p>
      )}

      {canPlaySelected && (
        <button
          type="button"
          onClick={() => selectedCardId !== null && onPlay(selectedCardId)}
          className="action-bar__btn action-bar__btn--play"
        >
          Play card
        </button>
      )}

      {canDumpSelected && (
        <button
          type="button"
          onClick={() => selectedCardId !== null && onDump(selectedCardId)}
          className="action-bar__btn action-bar__btn--dump"
        >
          Dump card
        </button>
      )}

      {!legal.canDraw && !canPlaySelected && !canDumpSelected && !legal.canSummonFromPile && (
        <p className="action-bar__hint">Select a card to play or dump, draw if hand &lt; 5, or pass turn.</p>
      )}
    </div>
  );
}
