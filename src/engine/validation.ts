/**
 * Validation: legal actions, quest eligibility, etc.
 */

import { getCard } from '@/data/cards';
import type { Card } from '@/data/types';
import { isHeroCard, isWizardCard, isEventCard, isQuestCard } from '@/data/types';
import { MAX_HAND_SIZE, QUEST_SKILL_THRESHOLD, SPELLCASTER_QUEST_THRESHOLD } from '@/data/constants';
import type { GameState, Party } from './state';
import type { Skill } from '@/data/constants';

export interface LegalActions {
  canDraw: boolean;
  canDump: boolean;
  playableCardIds: number[];
  canPlayEagles: boolean;
  /** Summoner: "As a turn, you can draw any one card from the event pile" */
  canSummonFromPile: boolean;
  /** End turn (e.g. after drawing and looking at hand) */
  canPassTurn: boolean;
}

/**
 * Count matching skills in a party (from hero cards only). Returns e.g. { Strong: 6, Magic: 2 }.
 */
function countSkillsInParty(state: GameState, playerIndex: number): Record<Skill, number> {
  const counts: Record<Skill, number> = {
    Strong: 0,
    Fast: 0,
    Magic: 0,
    Sturdy: 0,
  };
  const party = state.players[playerIndex].party;
  const slots = [
    party.knight,
    party.archer,
    party.barbarian,
    party.thief,
  ].filter((id): id is number => id !== null);

  for (const cardId of slots) {
    const card = getCard(cardId);
    if (isHeroCard(card)) {
      for (const s of card.skills) {
        counts[s]++;
      }
    }
  }
  return counts;
}

/**
 * Whether this player has Spellcaster in their party (quest threshold = 5).
 */
function hasSpellcaster(party: Party): boolean {
  if (party.wizard === null) return false;
  const card = getCard(party.wizard);
  return isWizardCard(card) && card.wizardType === 'Spellcaster';
}

/**
 * Quest threshold for this player: 5 if Spellcaster, else 6.
 */
function getQuestThreshold(state: GameState, playerIndex: number): number {
  const party = state.players[playerIndex].party;
  return hasSpellcaster(party) ? SPELLCASTER_QUEST_THRESHOLD : QUEST_SKILL_THRESHOLD;
}

/**
 * Can this player play a quest card and win? (Has at least threshold matching skills.)
 */
export function canPlayQuest(state: GameState, playerIndex: number): boolean {
  const counts = countSkillsInParty(state, playerIndex);
  const threshold = getQuestThreshold(state, playerIndex);
  return Object.values(counts).some((n) => n >= threshold);
}

/**
 * Can the "Giant Eagles Arrive" event be played? Only when deck is empty.
 */
export function canPlayEagles(state: GameState): boolean {
  return state.deck.length === 0;
}

/**
 * Get all legal actions for the current player.
 */
export function getLegalActions(state: GameState): LegalActions {
  const playableCardIds: number[] = [];
  let eaglesPlayable = false;

  if (state.phase !== 'chooseAction' || state.winnerPlayerId) {
    return {
      canDraw: false,
      canDump: false,
      playableCardIds: [],
      canPlayEagles: false,
      canSummonFromPile: false,
      canPassTurn: false,
    };
  }

  /** After playing/dumping/summoning, only Pass turn is allowed. */
  if (state.actedThisTurn) {
    return {
      canDraw: false,
      canDump: false,
      playableCardIds: [],
      canPlayEagles: false,
      canSummonFromPile: false,
      canPassTurn: true,
    };
  }

  const current = state.players[state.currentPlayerIndex];
  const handSize = current.hand.length;

  /** One draw per turn, and only before any play/dump/summon (draw is not the same as play). */
  const canDraw =
    handSize < MAX_HAND_SIZE &&
    !state.drewThisTurn &&
    !state.actedThisTurn &&
    !(state.stargazerSecondPlayUsed ?? false);

  for (const cardId of current.hand) {
    const card = getCard(cardId);

    if (isEventCard(card)) {
      if (card.eventId === 'eagles') {
        if (canPlayEagles(state)) {
          eaglesPlayable = true;
          playableCardIds.push(cardId);
        }
      } else {
        playableCardIds.push(cardId);
      }
    } else if (isQuestCard(card)) {
      if (canPlayQuest(state, state.currentPlayerIndex)) {
        playableCardIds.push(cardId);
      }
    } else if (isHeroCard(card) || isWizardCard(card)) {
      playableCardIds.push(cardId);
    }
  }

  const canDump = current.hand.some((cardId) => {
    const card = getCard(cardId);
    return card.type !== 'event';
  });

  const hasSummoner =
    current.party.wizard !== null &&
    isWizardCard(getCard(current.party.wizard)) &&
    getCard(current.party.wizard).wizardType === 'Summoner';
  const canSummonFromPile = hasSummoner && state.eventPile.length > 0;

  /** Pass is allowed after draw/play/dump/summon this turn, or when there is no other option (empty hand and empty deck). */
  const canPassTurn =
    state.drewThisTurn === true ||
    state.actedThisTurn === true ||
    (state.stargazerSecondPlayUsed ?? false) ||
    (current.hand.length === 0 && state.deck.length === 0);

  return {
    canDraw,
    canDump,
    playableCardIds,
    canPlayEagles: eaglesPlayable,
    canSummonFromPile,
    canPassTurn,
  };
}
