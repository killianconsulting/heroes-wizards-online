'use client';

import { useState, useCallback, useEffect } from 'react';
import { getCard } from '@/data/cards';
import { isEventCard } from '@/data/types';
import type { GameState } from '@/engine/state';
import type { EventTarget } from '@/engine/events';
import type { EventId } from '@/data/constants';
import { eventNeedsTarget } from '@/utils/eventTargets';
import { useLeaveGame } from '@/context/LeaveGameContext';
import Deck from './Deck';
import EventPile from './EventPile';
import PartyDisplay from './Party';
import Hand from './Hand';
import ActionBar from './ActionBar';
import TargetSelector from './TargetSelector';
import CardZoomModal from './CardZoomModal';
import FortuneReadingModal from './FortuneReadingModal';
import EventBlockedNotification from './EventBlockedNotification';
import GameLogo from './GameLogo';

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
  onLeaveGame: () => void;
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
  onDismissEventBlocked,
  onLeaveGame,
}: GameScreenProps) {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [pendingEvent, setPendingEvent] = useState<{ cardId: number; eventId: EventId } | null>(
    null
  );
  const [zoomedCard, setZoomedCard] = useState<{ cardId: number; faceDown?: boolean } | null>(
    null
  );
  /** When Summoner picks from event pile: card selected for confirmation (zoom + "Take this card"). */
  const [pendingSummonCardId, setPendingSummonCardId] = useState<number | null>(null);
  const { requestLeaveGame } = useLeaveGame();

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
          onClose={() => {
            setZoomedCard(null);
            setPendingSummonCardId(null);
          }}
          confirmLabel={
            pendingSummonCardId !== null && pendingSummonCardId === zoomedCard.cardId
              ? 'Take This Card'
              : undefined
          }
          onConfirm={
            pendingSummonCardId !== null && pendingSummonCardId === zoomedCard.cardId
              ? () => {
                  onSummonFromPile(pendingSummonCardId);
                  setPendingSummonCardId(null);
                  setZoomedCard(null);
                }
              : undefined
          }
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
        <button
          type="button"
          className="game-header__logo-btn"
          onClick={requestLeaveGame}
          aria-label="Leave game"
        >
          <div className="game-header__title">
            <GameLogo maxHeight={48} />
          </div>
        </button>
        <h2 className="game-turn">
          {currentPlayer.name}&apos;s Turn
          {state.stargazerSecondPlayUsed && ' (second play)'}
        </h2>
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
            {/* Table layout for local play: active player bottom, others around (clockwise). Online multiplayer will not rotate. */}
            <div className="game-table__table">
              {/* Top: players opposite current (4th in 4p, 4th & 5th in 5p; in 2p the other player) */}
              <div className="game-table__top">
                {(() => {
                  const N = state.players.length;
                  const topIndices =
                    N === 2
                      ? [(currentIndex + 1) % 2]
                      : N === 4
                        ? [(currentIndex + 2) % 4]
                        : N === 5
                          ? [(currentIndex + 2) % 5, (currentIndex + 3) % 5]
                          : [];
                  return topIndices.map((i) => (
                    <div key={state.players[i].id} className="game-table__party-wrap game-table__party-wrap--top">
                      <PartyDisplay
                        party={state.players[i].party}
                        playerName={state.players[i].name}
                        isCurrent={false}
                        onZoomCard={(id) => setZoomedCard({ cardId: id })}
                      />
                    </div>
                  ));
                })()}
              </div>

              {/* Middle: left party | deck + event pile | right party */}
              <div className="game-table__middle">
                <div className="game-table__left">
                  {state.players.length >= 3 && (() => {
                    const i = (currentIndex + 1) % state.players.length;
                    return (
                      <div className="game-table__party-wrap game-table__party-wrap--left">
                        <PartyDisplay
                          party={state.players[i].party}
                          playerName={state.players[i].name}
                          isCurrent={false}
                          onZoomCard={(id) => setZoomedCard({ cardId: id })}
                        />
                      </div>
                    );
                  })()}
                </div>
                <div className="game-table__center">
                  <div className="game-table__deck-event">
                    <Deck
                      count={state.deck.length}
                      canDraw={legalActions?.canDraw ?? false}
                      onDraw={onDraw}
                      onZoomCard={(id, faceDown) => setZoomedCard({ cardId: id, faceDown })}
                    />
                    <div className="game-table__event-area">
                      <EventPile
                        cardIds={state.eventPile}
                        onPickCard={
                          legalActions?.canSummonFromPile
                            ? (id) => {
                                setPendingSummonCardId(id);
                                setZoomedCard({ cardId: id });
                              }
                            : undefined
                        }
                        pickable={!!legalActions?.canSummonFromPile}
                        onZoomCard={(id) => setZoomedCard({ cardId: id })}
                      />
                    </div>
                  </div>
                </div>
                <div className="game-table__right">
                  {state.players.length >= 3 && (() => {
                    const i = (currentIndex + state.players.length - 1) % state.players.length;
                    return (
                      <div className="game-table__party-wrap game-table__party-wrap--right">
                        <PartyDisplay
                          party={state.players[i].party}
                          playerName={state.players[i].name}
                          isCurrent={false}
                          onZoomCard={(id) => setZoomedCard({ cardId: id })}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Bottom: active player (current turn) */}
              <div className="game-table__bottom">
                <div className="game-table__party-wrap game-table__party-wrap--bottom">
                  <PartyDisplay
                    key={state.players[currentIndex].id}
                    party={currentPlayer.party}
                    playerName={currentPlayer.name}
                    isCurrent={true}
                    onZoomCard={(id) => setZoomedCard({ cardId: id })}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="game-hand">
            <h2 className="game-hand__title">{currentPlayer.name}&apos;s Hand</h2>
            <Hand
              cardIds={currentPlayer.hand}
              selectedCardId={selectedCardId}
              playableCardIds={legalActions?.playableCardIds ?? []}
              onSelectCard={setSelectedCardId}
              onZoomCard={(id) => setZoomedCard({ cardId: id })}
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
