'use client';

import { useState, useCallback, useEffect } from 'react';
import { getCard } from '@/data/cards';
import { isEventCard } from '@/data/types';
import type { GameState } from '@/engine/state';
import type { EventTarget } from '@/engine/events';
import type { EventId } from '@/data/constants';
import { eventNeedsTarget } from '@/utils/eventTargets';
import Deck from './Deck';
import EventPile from './EventPile';
import PartyDisplay from './Party';
import Hand from './Hand';
import ActionBar from './ActionBar';
import TargetSelector from './TargetSelector';
import CardZoomModal from './CardZoomModal';
import FortuneReadingModal from './FortuneReadingModal';
import EventBlockedNotification from './EventBlockedNotification';

interface GameScreenProps {
  state: GameState;
  legalActions: ReturnType<typeof import('@/engine/validation').getLegalActions>;
  onDraw: () => void;
  onPassTurn: () => void;
  onPlayCard: (cardId: number, target?: EventTarget) => void;
  onDumpCard: (cardId: number) => void;
  onSummonFromPile: (cardId: number) => void;
  onDismissFortuneReading: () => void;
  onDismissEventBlocked: () => void;
}

export default function GameScreen({
  state,
  legalActions,
  onDraw,
  onPassTurn,
  onPlayCard,
  onDumpCard,
  onSummonFromPile,
  onDismissFortuneReading,
}: GameScreenProps) {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [pendingEvent, setPendingEvent] = useState<{ cardId: number; eventId: EventId } | null>(
    null
  );
  const [zoomedCard, setZoomedCard] = useState<{ cardId: number; faceDown?: boolean } | null>(
    null
  );

  const currentIndex = state.currentPlayerIndex;
  const currentPlayer = state.players[currentIndex];

  /** Clear selection when the selected card is no longer in the current player's hand (e.g. after turn/hand change). */
  useEffect(() => {
    if (
      selectedCardId !== null &&
      !currentPlayer.hand.includes(selectedCardId)
    ) {
      setSelectedCardId(null);
    }
  }, [state.currentPlayerIndex, currentPlayer.hand, selectedCardId]);

  const handlePlayClick = useCallback(() => {
    if (selectedCardId === null || !legalActions.playableCardIds.includes(selectedCardId)) return;
    const card = getCard(selectedCardId);
    if (isEventCard(card) && eventNeedsTarget(selectedCardId)) {
      setPendingEvent({ cardId: selectedCardId, eventId: card.eventId });
      return;
    }
    onPlayCard(selectedCardId);
    setSelectedCardId(null);
  }, [selectedCardId, legalActions.playableCardIds, onPlayCard]);

  const handleTargetSelected = useCallback(
    (target: EventTarget) => {
      if (!pendingEvent) return;
      onPlayCard(pendingEvent.cardId, target);
      setPendingEvent(null);
      setSelectedCardId(null);
    },
    [pendingEvent, onPlayCard]
  );

  const handleTargetCancel = useCallback(() => {
    setPendingEvent(null);
  }, []);

  return (
    <main className="game-screen">
      {zoomedCard && (
        <CardZoomModal
          cardId={zoomedCard.cardId}
          faceDown={zoomedCard.faceDown}
          onClose={() => setZoomedCard(null)}
        />
      )}
      {state.pendingFortuneReading && (
        <FortuneReadingModal
          state={state}
          onDismiss={onDismissFortuneReading}
        />
      )}
      {state.eventBlocked && (
        <EventBlockedNotification
          message={state.eventBlocked.message}
          onDismiss={onDismissEventBlocked}
        />
      )}
      <header className="game-header">
        <h1 className="game-title">Heroes & Wizards</h1>
        <p className="game-turn">
          {currentPlayer.name}&apos;s Turn
          {state.stargazerSecondPlayUsed && ' (second play)'}
        </p>
      </header>

      {pendingEvent ? (
        <section className="game-target">
          <TargetSelector
            state={state}
            eventCardId={pendingEvent.cardId}
            eventId={pendingEvent.eventId}
            onSelect={handleTargetSelected}
            onCancel={handleTargetCancel}
          />
        </section>
      ) : (
        <>
          <section className="game-table">
            <div className="game-table__center">
              <Deck
                count={state.deck.length}
                canDraw={legalActions?.canDraw ?? false}
                onDraw={onDraw}
                onZoomCard={(id, faceDown) => setZoomedCard({ cardId: id, faceDown })}
              />
              <div className="game-table__event-area">
                {legalActions?.canSummonFromPile && (
                  <p className="event-pile-hint">
                    Use Summoner to draw a card from the Event Pile.
                  </p>
                )}
                <EventPile
                  cardIds={state.eventPile}
                  onPickCard={legalActions?.canSummonFromPile ? onSummonFromPile : undefined}
                  pickable={!!legalActions?.canSummonFromPile}
                  onZoomCard={(id) => setZoomedCard({ cardId: id })}
                />
              </div>
            </div>

            <div className="game-table__parties">
              {state.players.map((p, i) => (
                <PartyDisplay
                  key={p.id}
                  party={p.party}
                  playerName={p.name}
                  isCurrent={i === currentIndex}
                  onZoomCard={(id) => setZoomedCard({ cardId: id })}
                />
              ))}
            </div>
          </section>

          <section className="game-hand">
            <h2 className="game-hand__title">{currentPlayer.name}&apos;s Hand</h2>
            <Hand
              cardIds={currentPlayer.hand}
              selectedCardId={selectedCardId}
              playableCardIds={legalActions?.playableCardIds ?? []}
              onSelectCard={setSelectedCardId}
            />
          </section>

          <section className="game-actions">
            <ActionBar
              legal={legalActions!}
              selectedCardId={selectedCardId}
              onDraw={onDraw}
              onPassTurn={onPassTurn}
              onPlay={handlePlayClick}
              onDump={onDumpCard}
              onSummon={onSummonFromPile}
              isCurrentTurn={true}
              onlyPassAvailable={state.actedThisTurn}
            />
          </section>
        </>
      )}
    </main>
  );
}
