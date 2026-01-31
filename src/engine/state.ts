/**
 * Game state types for Heroes & Wizards.
 * Card ids are 0..71 (indices into CARDS).
 */

import type { HeroType, WizardType } from '@/data/constants';

export type CardId = number;

/** Party: one slot per hero type, one per wizard type. Value = card id or null. */
export interface Party {
  knight: CardId | null;
  archer: CardId | null;
  barbarian: CardId | null;
  thief: CardId | null;
  healer: CardId | null;
  spellcaster: CardId | null;
  stargazer: CardId | null;
  summoner: CardId | null;
}

export function createEmptyParty(): Party {
  return {
    knight: null,
    archer: null,
    barbarian: null,
    thief: null,
    healer: null,
    spellcaster: null,
    stargazer: null,
    summoner: null,
  };
}

export interface Player {
  id: string;
  name: string;
  hand: CardId[];
  party: Party;
}

export type GamePhase = 'chooseAction' | 'resolvingEvent' | 'gameOver';

export interface GameState {
  deck: CardId[];
  eventPile: CardId[];
  players: Player[];
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  phase: GamePhase;
  winnerPlayerId: string | null;
  /** When phase is resolvingEvent, some events need a target (player index or card). */
  pendingEventTarget?: { playerIndex?: number; cardId?: CardId };
  /** Stargazer: after playing one card, allow a second play this turn. */
  stargazerSecondPlayUsed?: boolean;
}
