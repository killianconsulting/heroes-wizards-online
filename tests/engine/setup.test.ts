import { createGame, createShuffledDeck } from '@/engine/setup';
import { CARDS } from '@/data/cards';
import { TOTAL_CARDS, HAND_SIZE_DEALT, MIN_PLAYERS, MAX_PLAYERS } from '@/data/constants';

describe('setup', () => {
  describe('createShuffledDeck', () => {
    it('returns 72 card ids', () => {
      const deck = createShuffledDeck();
      expect(deck).toHaveLength(TOTAL_CARDS);
    });

    it('returns each index 0..71 exactly once', () => {
      const deck = createShuffledDeck();
      const sorted = [...deck].sort((a, b) => a - b);
      expect(sorted).toEqual(Array.from({ length: TOTAL_CARDS }, (_, i) => i));
    });
  });

  describe('createGame', () => {
    it('throws for too few players', () => {
      expect(() => createGame(['Alice'])).toThrow();
    });

    it('throws for too many players', () => {
      expect(() => createGame(['A', 'B', 'C', 'D', 'E', 'F'])).toThrow();
    });

    it('creates valid state for 2 players', () => {
      const state = createGame(['Alice', 'Bob']);
      expect(state.players).toHaveLength(2);
      expect(state.deck).toHaveLength(TOTAL_CARDS - 2 * HAND_SIZE_DEALT);
      expect(state.eventPile).toHaveLength(0);
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.winnerPlayerId).toBeNull();
      expect(state.phase).toBe('chooseAction');

      state.players.forEach((p) => {
        expect(p.hand).toHaveLength(HAND_SIZE_DEALT);
        expect(p.party.knight).toBeNull();
        expect(p.party.archer).toBeNull();
      });
    });

    it('deals 3 cards each and removes them from deck', () => {
      const state = createGame(['A', 'B']);
      const dealt = state.players.flatMap((p) => p.hand);
      expect(dealt).toHaveLength(2 * HAND_SIZE_DEALT);
      const allIds = [...state.deck, ...dealt];
      expect(allIds).toHaveLength(TOTAL_CARDS);
      expect(new Set(allIds).size).toBe(TOTAL_CARDS);
    });
  });
});
