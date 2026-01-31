/**
 * Event resolution: apply event card effects to state.
 * Phase 1.6 — full resolvers for all event types.
 */

import { getCard } from '@/data/cards';
import { isEventCard, isHeroCard, isWizardCard } from '@/data/types';
import type { HeroType } from '@/data/constants';
import type { GameState, Party } from './state';
import type { CardId } from './state';

export interface EventTarget {
  playerIndex?: number;
  cardId?: CardId;
}

const HERO_PARTY_KEY: Record<HeroType, keyof Party> = {
  Knight: 'knight',
  Archer: 'archer',
  Barbarian: 'barbarian',
  Thief: 'thief',
};

/** Healer blocks stealing heroes (not wizards) from this party. */
function hasHealer(party: Party): boolean {
  if (party.wizard === null) return false;
  const card = getCard(party.wizard);
  return isWizardCard(card) && card.wizardType === 'Healer';
}

/** Stargazer: "You can play 2 cards in one turn" — allows second play before advancing. */
function hasStargazer(party: Party): boolean {
  if (party.wizard === null) return false;
  const card = getCard(party.wizard);
  return isWizardCard(card) && card.wizardType === 'Stargazer';
}

/**
 * Advance turn, unless current player has Stargazer and hasn't used their second play yet.
 * If so, set stargazerSecondPlayUsed and keep turn; otherwise advance to next player.
 */
export function maybeAdvanceTurn(state: GameState): GameState {
  const current = state.players[state.currentPlayerIndex];
  if (hasStargazer(current.party) && !state.stargazerSecondPlayUsed) {
    return { ...state, stargazerSecondPlayUsed: true };
  }
  return advanceTurn(state);
}

/**
 * Swap a hero slot between current player and target player.
 * If target has Healer, no effect (Healer blocks steal).
 */
function swapHeroSlot(
  state: GameState,
  slotKey: 'knight' | 'archer' | 'barbarian' | 'thief',
  targetPlayerIndex: number
): GameState {
  const currentIndex = state.currentPlayerIndex;
  if (targetPlayerIndex === currentIndex) return maybeAdvanceTurn(state);

  const targetParty = state.players[targetPlayerIndex].party;
  if (hasHealer(targetParty)) return maybeAdvanceTurn(state);

  const targetCard = targetParty[slotKey];
  if (targetCard === null) return maybeAdvanceTurn(state);

  const currentParty = state.players[currentIndex].party;
  const ourCard = currentParty[slotKey];

  const newPlayers = state.players.map((p, i) => {
    if (i === currentIndex) {
      return { ...p, party: { ...p.party, [slotKey]: targetCard } };
    }
    if (i === targetPlayerIndex) {
      return { ...p, party: { ...p.party, [slotKey]: ourCard } };
    }
    return p;
  });

  return maybeAdvanceTurn({ ...state, players: newPlayers });
}

/**
 * Swap wizard slot between current player and target player.
 * Healer does not block wizard steals.
 */
function swapWizardSlot(state: GameState, targetPlayerIndex: number): GameState {
  const currentIndex = state.currentPlayerIndex;
  if (targetPlayerIndex === currentIndex) return maybeAdvanceTurn(state);

  const targetCard = state.players[targetPlayerIndex].party.wizard;
  if (targetCard === null) return maybeAdvanceTurn(state);

  const ourCard = state.players[currentIndex].party.wizard;

  const newPlayers = state.players.map((p, i) => {
    if (i === currentIndex) {
      return { ...p, party: { ...p.party, wizard: targetCard } };
    }
    if (i === targetPlayerIndex) {
      return { ...p, party: { ...p.party, wizard: ourCard } };
    }
    return p;
  });

  return maybeAdvanceTurn({ ...state, players: newPlayers });
}

/**
 * Resolve an event card that was just played (card already removed from hand and added to event pile by playCard).
 * Returns new state after the event effect.
 */
export function resolveEvent(
  state: GameState,
  eventCardId: CardId,
  target?: EventTarget
): GameState {
  const card = getCard(eventCardId);
  if (!isEventCard(card)) return state;

  const currentIndex = state.currentPlayerIndex;
  const n = state.players.length;

  switch (card.eventId) {
    case 'eagles': {
      const winnerId = state.players[currentIndex].id;
      return { ...state, phase: 'gameOver', winnerPlayerId: winnerId };
    }

    case 'archery_contest': {
      const targetIndex = target?.playerIndex;
      if (targetIndex === undefined || targetIndex < 0 || targetIndex >= n)
        return maybeAdvanceTurn(state);
      return swapHeroSlot(state, 'archer', targetIndex);
    }

    case 'royal_invitation': {
      const targetIndex = target?.playerIndex;
      if (targetIndex === undefined || targetIndex < 0 || targetIndex >= n)
        return maybeAdvanceTurn(state);
      return swapHeroSlot(state, 'knight', targetIndex);
    }

    case 'tavern_brawl': {
      const targetIndex = target?.playerIndex;
      if (targetIndex === undefined || targetIndex < 0 || targetIndex >= n)
        return maybeAdvanceTurn(state);
      return swapHeroSlot(state, 'barbarian', targetIndex);
    }

    case 'unguarded_treasure': {
      const targetIndex = target?.playerIndex;
      if (targetIndex === undefined || targetIndex < 0 || targetIndex >= n)
        return maybeAdvanceTurn(state);
      return swapHeroSlot(state, 'thief', targetIndex);
    }

    case 'spell_of_summoning': {
      const targetIndex = target?.playerIndex;
      const wizardCardId = target?.cardId;
      if (targetIndex === undefined || targetIndex < 0 || targetIndex >= n)
        return maybeAdvanceTurn(state);
      if (wizardCardId === undefined) return maybeAdvanceTurn(state);
      const wizardCard = getCard(wizardCardId);
      if (!isWizardCard(wizardCard)) return maybeAdvanceTurn(state);
      const slotKey = WIZARD_PARTY_KEY[wizardCard.wizardType];
      return swapWizardSlot(state, slotKey, targetIndex);
    }

    case 'feast_east': {
      const hands = state.players.map((p) => p.hand);
      const newHands = hands.map((_, i) => hands[(i - 1 + n) % n]);
      const newPlayers = state.players.map((p, i) => ({
        ...p,
        hand: newHands[i],
      }));
      return maybeAdvanceTurn({ ...state, players: newPlayers });
    }

    case 'feast_west': {
      const hands = state.players.map((p) => p.hand);
      const newHands = hands.map((_, i) => hands[(i + 1) % n]);
      const newPlayers = state.players.map((p, i) => ({
        ...p,
        hand: newHands[i],
      }));
      return maybeAdvanceTurn({ ...state, players: newPlayers });
    }

    case 'fortune_reading':
      return maybeAdvanceTurn(state);

    case 'hunting_expedition': {
      const targetIndex = target?.playerIndex;
      const cardToSteal = target?.cardId;
      if (targetIndex === undefined || targetIndex < 0 || targetIndex >= n)
        return maybeAdvanceTurn(state);
      if (cardToSteal === undefined) return maybeAdvanceTurn(state);
      const targetHand = state.players[targetIndex].hand;
      if (!targetHand.includes(cardToSteal)) return maybeAdvanceTurn(state);

      const newHandTarget = targetHand.filter((id) => id !== cardToSteal);
      const newHandCurrent = [...state.players[currentIndex].hand, cardToSteal];

      const newPlayers = state.players.map((p, i) => {
        if (i === currentIndex) return { ...p, hand: newHandCurrent };
        if (i === targetIndex) return { ...p, hand: newHandTarget };
        return p;
      });
      return maybeAdvanceTurn({ ...state, players: newPlayers });
    }

    case 'wizard_tower_repairs': {
      const targetIndex = target?.playerIndex;
      if (targetIndex === undefined || targetIndex < 0 || targetIndex >= n)
        return maybeAdvanceTurn(state);
      const targetParty = state.players[targetIndex].party;
      const wizardInParty = targetParty.wizard;
      if (wizardInParty === null) return maybeAdvanceTurn(state);

      const newParty = { ...targetParty, wizard: null };
      const newEventPile = [...state.eventPile, wizardInParty];
      const newPlayers = state.players.map((p, i) =>
        i === targetIndex ? { ...p, party: newParty } : p
      );
      return maybeAdvanceTurn({
        ...state,
        players: newPlayers,
        eventPile: newEventPile,
      });
    }

    default:
      return maybeAdvanceTurn(state);
  }
}

/** Advance to next player (turn order: 0, 1, ..., n-1, 0, ...). */
export function advanceTurn(state: GameState): GameState {
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    stargazerSecondPlayUsed: undefined,
    drewThisTurn: undefined,
  };
}
