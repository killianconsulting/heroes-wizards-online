'use client';

import { useState, useCallback, useEffect } from 'react';
import { getCard } from '@/data/cards';
import { isEventCard } from '@/data/types';
import type { GameState } from '@/engine/state';
import type { EventTarget } from '@/engine/events';
import type { EventId } from '@/data/constants';
import { eventNeedsTarget } from '@/utils/eventTargets';
import { getDeclarationMessage } from '@/utils/declarationMessage';
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
import PlayCardDeclarationModal from './PlayCardDeclarationModal';
import GameLogo from './GameLogo';
import Card from './Card';

interface GameScreenProps {
  state: GameState;
  legalActions: ReturnType<typeof import('@/engine/validation').getLegalActions>;
  /** When set, show pass-the-device countdown overlay (seconds left) instead of hand. */
  passTurnCountdown: number | null;
  onDraw: () => void;
  onPassTurn: () => void;
  onPlayCard: (cardId: number, target?: EventTarget) => void;
  onDumpCard: (cardId: number) => void;
  onSummonFromPile: (cardId: number) => void;
  onDismissFortuneReading: () => void;
  onDismissEventBlocked: () => void;
  onLeaveGame: () => void;
  /** Online mode: this client's player index; only show this hand and enable actions when it's this player's turn. */
  myPlayerIndex?: number;
  /** When provided, card plays go through declaration modal first (declarePlay → modal → confirmDeclaration). */
  onDeclarePlay?: (cardId: number, target?: EventTarget) => void;
  onConfirmDeclaration?: (fullTarget?: EventTarget) => void;
}


const EMPTY_LEGAL: ReturnType<typeof import('@/engine/validation').getLegalActions> = {
  canDraw: false,
  canDump: false,
  playableCardIds: [],
  canPlayEagles: false,
  canSummonFromPile: false,
  canPassTurn: false,
};

/** Step 2 of Hunting Expedition: pick a card from the target player's hand (after declaration). */
function HuntingCardPickStep({
  state,
  targetPlayerIndex,
  onConfirm,
}: {
  state: GameState;
  targetPlayerIndex: number;
  onConfirm: (cardId: number) => void;
}) {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const targetPlayer = state.players[targetPlayerIndex];
  if (!targetPlayer) return null;
  return (
    <div className="target-selector">
      <p className="target-selector__prompt">
        Choose a card to steal from {targetPlayer.name}&apos;s hand:
      </p>
      <div className="target-selector__cards">
        {targetPlayer.hand.map((id) => (
          <div key={id} className="target-selector__card-row">
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
          onClick={() => selectedCardId !== null && onConfirm(selectedCardId)}
          disabled={selectedCardId === null}
          className="target-selector__btn target-selector__btn--confirm"
        >
          OK – Steal this card
        </button>
      </div>
    </div>
  );
}

export default function GameScreen({
  state,
  legalActions,
  passTurnCountdown,
  onDraw,
  onPassTurn,
  onPlayCard,
  onDumpCard,
  onSummonFromPile,
  onDismissFortuneReading,
  onDismissEventBlocked,
  onLeaveGame,
  myPlayerIndex,
  onDeclarePlay,
  onConfirmDeclaration,
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
  /** Online: show my hand and enable actions only on my turn. Local: show current player's hand, always enable. */
  const displayIndex = myPlayerIndex !== undefined ? myPlayerIndex : currentIndex;
  const isMyTurn = myPlayerIndex === undefined ? true : currentIndex === myPlayerIndex;
  const displayPlayer = state.players[displayIndex];
  const effectiveLegal = isMyTurn ? legalActions : EMPTY_LEGAL;

  const useDeclarationFlow = Boolean(onDeclarePlay && onConfirmDeclaration);
  const pendingDecl = state.pendingPlayDeclaration;
  const declarationCard = pendingDecl ? getCard(pendingDecl.cardId) : null;
  const isHuntingDeclaration =
    pendingDecl &&
    declarationCard &&
    isEventCard(declarationCard) &&
    declarationCard.eventId === 'hunting_expedition';
  /** Show declaration modal to waiting players (local: everyone; online: not the current player). */
  const showDeclarationModalToWaiting =
    pendingDecl && (myPlayerIndex === undefined || currentIndex !== myPlayerIndex);
  /** For hunting, current player sees card picker; modal for others has no auto-dismiss until play resolves. */
  const showHuntingCardPicker =
    useDeclarationFlow &&
    !!pendingDecl &&
    isHuntingDeclaration &&
    isMyTurn &&
    pendingDecl.target?.playerIndex !== undefined;

  /** Clear selection when the selected card is no longer in the displayed player's hand (e.g. after turn/hand change). */
  useEffect(() => {
    if (
      selectedCardId !== null &&
      !displayPlayer.hand.includes(selectedCardId)
    ) {
      setSelectedCardId(null);
    }
  }, [displayIndex, displayPlayer.hand, selectedCardId]);

  const handlePlayClick = useCallback(() => {
    if (selectedCardId === null || !legalActions.playableCardIds.includes(selectedCardId)) return;
    const card = getCard(selectedCardId);
    if (isEventCard(card) && eventNeedsTarget(selectedCardId)) {
      setPendingEvent({ cardId: selectedCardId, eventId: card.eventId });
      return;
    }
    if (useDeclarationFlow && onDeclarePlay) {
      onDeclarePlay(selectedCardId);
      setSelectedCardId(null);
    } else {
      onPlayCard(selectedCardId);
      setSelectedCardId(null);
    }
  }, [selectedCardId, effectiveLegal.playableCardIds, useDeclarationFlow, onDeclarePlay, onPlayCard]);

  const handleTargetSelected = useCallback(
    (target: EventTarget) => {
      if (!pendingEvent) return;
      if (useDeclarationFlow && onDeclarePlay) {
        onDeclarePlay(pendingEvent.cardId, target);
        setPendingEvent(null);
        setSelectedCardId(null);
      } else {
        onPlayCard(pendingEvent.cardId, target);
        setPendingEvent(null);
        setSelectedCardId(null);
      }
    },
    [pendingEvent, useDeclarationFlow, onDeclarePlay, onPlayCard]
  );

  const handleHuntingPlayerChosen = useCallback(
    (playerIndex: number) => {
      if (!pendingEvent || !onDeclarePlay) return;
      onDeclarePlay(pendingEvent.cardId, { playerIndex });
      setPendingEvent(null);
      setSelectedCardId(null);
    },
    [pendingEvent, onDeclarePlay]
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
      {useDeclarationFlow && showDeclarationModalToWaiting && pendingDecl && (
        <PlayCardDeclarationModal
          cardId={pendingDecl.cardId}
          message={getDeclarationMessage(
            state,
            pendingDecl.cardId,
            pendingDecl.target,
            pendingDecl.playerIndex
          )}
          onDismiss={() => onConfirmDeclaration?.()}
          noAutoDismiss={!!isHuntingDeclaration}
        />
      )}
      {showHuntingCardPicker && pendingDecl && pendingDecl.target?.playerIndex !== undefined && (
        <section className="game-target">
          <HuntingCardPickStep
            state={state}
            targetPlayerIndex={pendingDecl.target.playerIndex}
            onConfirm={(cardId) =>
              onConfirmDeclaration?.({ playerIndex: pendingDecl.target!.playerIndex, cardId })
            }
          />
        </section>
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
            onPlayerChosenForDeclaration={
              pendingEvent.eventId === 'hunting_expedition' && useDeclarationFlow
                ? handleHuntingPlayerChosen
                : undefined
            }
          />
        </section>
      ) : passTurnCountdown !== null ? (
        <div className="game-pass-turn-overlay" role="status" aria-live="polite">
          <p className="game-pass-turn-overlay__text">Pass the device to the next player</p>
          <p className="game-pass-turn-overlay__countdown" aria-label={`${passTurnCountdown} seconds remaining`}>
            {passTurnCountdown}
          </p>
        </div>
      ) : (
        <>
          <section className="game-table">
            {/* Local: current player at bottom. Online: my seat (displayIndex) at bottom. */}
            <div className="game-table__table">
              {/* Top: players opposite the bottom seat */}
              <div className="game-table__top">
                {(() => {
                  const N = state.players.length;
                  const topIndices =
                    N === 2
                      ? [(displayIndex + 1) % 2]
                      : N === 4
                        ? [(displayIndex + 2) % 4]
                        : N === 5
                          ? [(displayIndex + 2) % 5, (displayIndex + 3) % 5]
                          : [];
                  return topIndices.map((i) => (
                    <div key={state.players[i].id} className="game-table__party-wrap game-table__party-wrap--top">
                      <PartyDisplay
                        party={state.players[i].party}
                        playerName={state.players[i].name}
                        isCurrent={i === currentIndex}
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
                    const i = (displayIndex + 1) % state.players.length;
                    return (
                      <div className="game-table__party-wrap game-table__party-wrap--left">
                        <PartyDisplay
                          party={state.players[i].party}
                          playerName={state.players[i].name}
                          isCurrent={i === currentIndex}
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
                      canDraw={effectiveLegal?.canDraw ?? false}
                      onDraw={onDraw}
                      onZoomCard={(id, faceDown) => setZoomedCard({ cardId: id, faceDown })}
                    />
                    <div className="game-table__event-area">
                      <EventPile
                        cardIds={state.eventPile}
                        onPickCard={
                          effectiveLegal?.canSummonFromPile
                            ? (id) => {
                                setPendingSummonCardId(id);
                                setZoomedCard({ cardId: id });
                              }
                            : undefined
                        }
                        pickable={!!effectiveLegal?.canSummonFromPile}
                        onZoomCard={(id) => setZoomedCard({ cardId: id })}
                      />
                    </div>
                  </div>
                </div>
                <div className="game-table__right">
                  {state.players.length >= 3 && (() => {
                    const i = (displayIndex + state.players.length - 1) % state.players.length;
                    return (
                      <div className="game-table__party-wrap game-table__party-wrap--right">
                        <PartyDisplay
                          party={state.players[i].party}
                          playerName={state.players[i].name}
                          isCurrent={i === currentIndex}
                          onZoomCard={(id) => setZoomedCard({ cardId: id })}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Bottom: my seat (local = current player, online = me) */}
              <div className="game-table__bottom">
                <div className="game-table__party-wrap game-table__party-wrap--bottom">
                  <PartyDisplay
                    key={state.players[displayIndex].id}
                    party={displayPlayer.party}
                    playerName={displayPlayer.name}
                    isCurrent={displayIndex === currentIndex}
                    onZoomCard={(id) => setZoomedCard({ cardId: id })}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="game-hand">
            <h2 className="game-hand__title">{displayPlayer.name}&apos;s Hand</h2>
            <Hand
              cardIds={displayPlayer.hand}
              selectedCardId={selectedCardId}
              playableCardIds={effectiveLegal?.playableCardIds ?? []}
              onSelectCard={setSelectedCardId}
              onZoomCard={(id) => setZoomedCard({ cardId: id })}
            />
          </section>

          <section className="game-actions">
            <ActionBar
              legal={effectiveLegal}
              selectedCardId={selectedCardId}
              onDraw={onDraw}
              onPassTurn={onPassTurn}
              onPlay={handlePlayClick}
              onDump={onDumpCard}
              onSummon={onSummonFromPile}
              isCurrentTurn={isMyTurn}
              onlyPassAvailable={state.actedThisTurn}
            />
          </section>
        </>
      )}
    </main>
  );
}
