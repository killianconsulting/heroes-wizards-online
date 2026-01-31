import { createGame } from '@/engine/setup';
import { resolveEvent, advanceTurn } from '@/engine/events';
import { getCard, CARDS } from '@/data/cards';
import { isHeroCard, isWizardCard } from '@/data/types';

describe('events', () => {
  describe('advanceTurn', () => {
    it('advances to next player and wraps', () => {
      const state = createGame(['Alice', 'Bob']);
      expect(state.currentPlayerIndex).toBe(0);
      const next = advanceTurn(state);
      expect(next.currentPlayerIndex).toBe(1);
      const next2 = advanceTurn(next);
      expect(next2.currentPlayerIndex).toBe(0);
    });
  });

  describe('resolveEvent', () => {
    it('archery_contest swaps Archer between current and target', () => {
      const archerId = 49;
      const state = createGame(['Alice', 'Bob']);
      const deckWithoutArcher = state.deck.filter((id) => id !== archerId);
      const stateWithArcherOnBob = {
        ...state,
        deck: deckWithoutArcher.slice(2),
        players: state.players.map((p, i) =>
          i === 1 ? { ...p, party: { ...p.party, archer: archerId } } : p
        ),
      };

      const next = resolveEvent(stateWithArcherOnBob, 16, { playerIndex: 1 });

      expect(next.players[0].party.archer).toBe(archerId);
      expect(next.players[1].party.archer).toBe(null);
      expect(next.currentPlayerIndex).toBe(1);
    });

    it('archery_contest has no effect when target has Healer', () => {
      const archerId = 49;
      const healerId = 4;
      const state = createGame(['Alice', 'Bob']);
      const deckWithout = state.deck.filter((id) => id !== archerId && id !== healerId);
      const stateWithTarget = {
        ...state,
        deck: deckWithout.slice(2),
        players: state.players.map((p, i) =>
          i === 1
            ? { ...p, party: { ...p.party, archer: archerId, wizard: healerId } }
            : p
        ),
      };

      const next = resolveEvent(stateWithTarget, 16, { playerIndex: 1 });

      expect(next.players[0].party.archer).toBe(null);
      expect(next.players[1].party.archer).toBe(archerId);
      expect(next.currentPlayerIndex).toBe(1);
    });

    it('feast_east rotates hands to the right', () => {
      const state = createGame(['Alice', 'Bob']);
      const aliceHand = state.players[0].hand;
      const bobHand = state.players[1].hand;

      const next = resolveEvent(state, 19);

      expect(next.players[0].hand).toEqual(bobHand);
      expect(next.players[1].hand).toEqual(aliceHand);
      expect(next.currentPlayerIndex).toBe(1);
    });

    it('feast_west rotates hands to the left', () => {
      const state = createGame(['Alice', 'Bob']);
      const aliceHand = state.players[0].hand;
      const bobHand = state.players[1].hand;

      const next = resolveEvent(state, 20);

      expect(next.players[0].hand).toEqual(bobHand);
      expect(next.players[1].hand).toEqual(aliceHand);
      expect(next.currentPlayerIndex).toBe(1);
    });

    it('hunting_expedition moves chosen card from target hand to current hand', () => {
      const state = createGame(['Alice', 'Bob']);
      const cardToSteal = state.players[1].hand[0];
      const aliceHandLen = state.players[0].hand.length;
      const bobHandLen = state.players[1].hand.length;

      const next = resolveEvent(state, 23, {
        playerIndex: 1,
        cardId: cardToSteal,
      });

      expect(next.players[0].hand).toContain(cardToSteal);
      expect(next.players[0].hand).toHaveLength(aliceHandLen + 1);
      expect(next.players[1].hand).not.toContain(cardToSteal);
      expect(next.players[1].hand).toHaveLength(bobHandLen - 1);
      expect(next.currentPlayerIndex).toBe(1);
    });

    it('wizard_tower_repairs sends wizard from target party to event pile', () => {
      const wizardId = 4;
      const state = createGame(['Alice', 'Bob']);
      const pileLen = state.eventPile.length;
      const stateWithWizard = {
        ...state,
        players: state.players.map((p, i) =>
          i === 1 ? { ...p, party: { ...p.party, wizard: wizardId } } : p
        ),
      };

      const next = resolveEvent(stateWithWizard, 42, { playerIndex: 1 });

      expect(next.players[1].party.wizard).toBe(null);
      expect(next.eventPile).toContain(wizardId);
      expect(next.eventPile).toHaveLength(pileLen + 1);
      expect(next.currentPlayerIndex).toBe(1);
    });

    it('eagles sets winner and gameOver', () => {
      const state = createGame(['Alice', 'Bob']);
      const next = resolveEvent(state, 38);
      expect(next.phase).toBe('gameOver');
      expect(next.winnerPlayerId).toBe(state.players[0].id);
    });

    it('fortune_reading just advances turn', () => {
      const state = createGame(['Alice', 'Bob']);
      const next = resolveEvent(state, 21);
      expect(next.currentPlayerIndex).toBe(1);
      expect(next.players[0].hand).toEqual(state.players[0].hand);
    });
  });
});
