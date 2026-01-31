/**
 * Game actions: drawCard, playCard, dumpCard.
 * Pure functions: state in → new state out. No mutation.
 */

import { getCard } from '@/data/cards';
import { isHeroCard, isWizardCard, isEventCard, isQuestCard } from '@/data/types';
import type { HeroType, WizardType } from '@/data/constants';
import type { GameState, Player, Party } from './state';
import type { CardId } from './state';
import { canPlayQuest } from './validation';
import { resolveEvent, advanceTurn, maybeAdvanceTurn, type EventTarget } from './events';

/** Party slot key for hero type (Knight -> knight, etc.) */
const HERO_PARTY_KEY: Record<HeroType, keyof Party> = {
  Knight: 'knight',
  Archer: 'archer',
  Barbarian: 'barbarian',
  Thief: 'thief',
};

/** Party slot key for wizard type */
const WIZARD_PARTY_KEY: Record<WizardType, keyof Party> = {
  Healer: 'healer',
  Spellcaster: 'spellcaster',
  Stargazer: 'stargazer',
  Summoner: 'summoner',
};

/**
 * Draw one card from the deck into the current player's hand, then advance turn.
 * Caller should ensure getLegalActions(state).canDraw is true.
 */
export function drawCard(state: GameState): GameState {
  if (state.phase !== 'chooseAction' || state.winnerPlayerId) return state;
  if (state.deck.length === 0) return state;

  const currentIndex = state.currentPlayerIndex;
  const [drawn, ...restDeck] = state.deck;
  const players = state.players.map((p, i) =>
    i === currentIndex
      ? { ...p, hand: [...p.hand, drawn] }
      : p
  );

  const nextState: GameState = {
    ...state,
    deck: restDeck,
    players,
  };

  return advanceTurn(nextState);
}

/**
 * Play a card from the current player's hand.
 * - Hero/Wizard: add to party (swap existing same type back to hand), advance turn.
 * - Quest: if canPlayQuest, set winner and end game; remove card from hand.
 * - Event: add to event pile, run resolveEvent (e.g. Eagles = win; others stub in 1.6), then advance or end.
 * Optional target for events that need a player/card choice (used in 1.6).
 */
export function playCard(
  state: GameState,
  cardId: CardId,
  target?: EventTarget
): GameState {
  if (state.phase !== 'chooseAction' || state.winnerPlayerId) return state;

  const currentIndex = state.currentPlayerIndex;
  const current = state.players[currentIndex];
  const handIndex = current.hand.indexOf(cardId);
  if (handIndex === -1) return state;

  const card = getCard(cardId);
  const newHand = current.hand.filter((_, i) => i !== handIndex);

  if (isHeroCard(card)) {
    const slotKey = HERO_PARTY_KEY[card.heroType];
    const existing = current.party[slotKey];
    const newParty: Party = { ...current.party, [slotKey]: cardId };
    const handAfterSwap = existing !== null ? [...newHand, existing] : newHand;

    const players = state.players.map((p, i) =>
      i === currentIndex
        ? { ...p, hand: handAfterSwap, party: newParty }
        : p
    );

    return maybeAdvanceTurn({ ...state, players });
  }

  if (isWizardCard(card)) {
    const slotKey = WIZARD_PARTY_KEY[card.wizardType];
    const existing = current.party[slotKey];
    const newParty: Party = { ...current.party, [slotKey]: cardId };
    const handAfterSwap = existing !== null ? [...newHand, existing] : newHand;

    const players = state.players.map((p, i) =>
      i === currentIndex
        ? { ...p, hand: handAfterSwap, party: newParty }
        : p
    );

    return maybeAdvanceTurn({ ...state, players });
  }

  if (isQuestCard(card)) {
    if (!canPlayQuest(state, currentIndex)) return state;

    const winnerId = current.id;
    const players = state.players.map((p, i) =>
      i === currentIndex ? { ...p, hand: newHand } : p
    );

    return {
      ...state,
      players,
      phase: 'gameOver',
      winnerPlayerId: winnerId,
    };
  }

  if (isEventCard(card)) {
    const eventPile = [...state.eventPile, cardId];
    const players = state.players.map((p, i) =>
      i === currentIndex ? { ...p, hand: newHand } : p
    );
    const stateAfterPlay: GameState = {
      ...state,
      players,
      eventPile,
    };
    return resolveEvent(stateAfterPlay, cardId, target);
  }

  return state;
}

/**
 * Dump a non-event card from hand to the event pile, then advance turn.
 * Caller should ensure card is not an event (getLegalActions enforces).
 */
export function dumpCard(state: GameState, cardId: CardId): GameState {
  if (state.phase !== 'chooseAction' || state.winnerPlayerId) return state;

  const currentIndex = state.currentPlayerIndex;
  const current = state.players[currentIndex];
  const handIndex = current.hand.indexOf(cardId);
  if (handIndex === -1) return state;

  const card = getCard(cardId);
  if (card.type === 'event') return state;

  const newHand = current.hand.filter((_, i) => i !== handIndex);
  const eventPile = [...state.eventPile, cardId];

  const players = state.players.map((p, i) =>
    i === currentIndex ? { ...p, hand: newHand } : p
  );

  return advanceTurn({
    ...state,
    players,
    eventPile,
  });
}

/**
 * Summoner: "As a turn, you can draw any one card from the event pile."
 * Takes the chosen card from the event pile into the current player's hand, then advances turn.
 * Caller should ensure getLegalActions(state).canSummonFromPile is true and cardId is in state.eventPile.
 */
export function summonFromEventPile(state: GameState, cardId: CardId): GameState {
  if (state.phase !== 'chooseAction' || state.winnerPlayerId) return state;

  const currentIndex = state.currentPlayerIndex;
  const current = state.players[currentIndex];
  if (current.party.summoner === null) return state;

  const pileIndex = state.eventPile.indexOf(cardId);
  if (pileIndex === -1) return state;

  const newEventPile = state.eventPile.filter((_, i) => i !== pileIndex);
  const newHand = [...current.hand, cardId];

  const players = state.players.map((p, i) =>
    i === currentIndex ? { ...p, hand: newHand } : p
  );

  return advanceTurn({
    ...state,
    players,
    eventPile: newEventPile,
  });
}
