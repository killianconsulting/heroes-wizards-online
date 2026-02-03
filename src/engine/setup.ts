/**
 * Game setup: create initial state, shuffle, deal.
 */

import { HAND_SIZE_DEALT, TOTAL_CARDS, MIN_PLAYERS, MAX_PLAYERS } from '@/data/constants';
import { CARDS } from '@/data/cards';
import type { GameState, Party } from './state';
import { createEmptyParty } from './state';

function shuffle<T>(array: T[]): T[] {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Create a full deck of card ids 0..71, shuffled.
 */
export function createShuffledDeck(): number[] {
  const indices = Array.from({ length: TOTAL_CARDS }, (_, i) => i);
  return shuffle(indices);
}

/**
 * Create initial game state for 2–5 players.
 * Shuffles deck, deals HAND_SIZE_DEALT cards to each player, first player is 0.
 */
export function createGame(playerNames: string[]): GameState {
  if (playerNames.length < MIN_PLAYERS || playerNames.length > MAX_PLAYERS) {
    throw new Error(`Players must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}`);
  }

  const deck = createShuffledDeck();
  const playerCount = playerNames.length;
  const cardsToDeal = playerCount * HAND_SIZE_DEALT;
  const handCards = deck.splice(0, cardsToDeal);

  const players = playerNames.map((name, index) => ({
    id: `player_${index}`,
    name,
    hand: handCards.slice(index * HAND_SIZE_DEALT, (index + 1) * HAND_SIZE_DEALT),
    party: createEmptyParty(),
  }));

  return {
    deck,
    eventPile: [],
    players,
    currentPlayerIndex: 0,
    firstPlayerIndex: 0,
    phase: 'chooseAction',
    winnerPlayerId: null,
    disconnectedPlayerIndices: [],
    leftPlayerIndices: [],
  };
}
