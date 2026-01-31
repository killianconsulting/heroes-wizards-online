import { createGame } from '@/engine/setup';
import { getLegalActions, canPlayQuest } from '@/engine/validation';
import { getCard, CARDS } from '@/data/cards';
import { isHeroCard } from '@/data/types';

describe('validation', () => {
  describe('getLegalActions', () => {
    it('allows draw when hand has fewer than 5 cards', () => {
      const state = createGame(['Alice', 'Bob']);
      const legal = getLegalActions(state);
      expect(legal.canDraw).toBe(true);
      expect(state.players[0].hand).toHaveLength(3);
    });

    it('includes playable hero/wizard/event cards in playableCardIds', () => {
      const state = createGame(['Alice', 'Bob']);
      const legal = getLegalActions(state);
      expect(legal.playableCardIds.length).toBeGreaterThanOrEqual(0);
      legal.playableCardIds.forEach((id) => {
        const card = getCard(id);
        expect(['hero', 'wizard', 'event', 'quest']).toContain(card.type);
      });
    });

    it('allows dump when hand has non-event cards', () => {
      const state = createGame(['Alice', 'Bob']);
      const legal = getLegalActions(state);
      expect(legal.canDump).toBe(true);
    });

    it('canSummonFromPile is true when current player has Summoner and event pile is non-empty', () => {
      const state = createGame(['Alice', 'Bob']);
      const stateWithSummonerAndPile = {
        ...state,
        eventPile: [16],
        players: state.players.map((p, i) =>
          i === 0 ? { ...p, party: { ...p.party, wizard: 13 } } : p
        ),
      };
      const legal = getLegalActions(stateWithSummonerAndPile);
      expect(legal.canSummonFromPile).toBe(true);
    });

    it('canSummonFromPile is false when event pile is empty', () => {
      const state = createGame(['Alice', 'Bob']);
      const stateWithSummoner = {
        ...state,
        eventPile: [],
        players: state.players.map((p, i) =>
          i === 0 ? { ...p, party: { ...p.party, wizard: 13 } } : p
        ),
      };
      const legal = getLegalActions(stateWithSummoner);
      expect(legal.canSummonFromPile).toBe(false);
    });
  });

  describe('canPlayQuest', () => {
    it('returns false when party has no heroes', () => {
      const state = createGame(['Alice', 'Bob']);
      expect(canPlayQuest(state, 0)).toBe(false);
    });

    it('returns true when party has 6+ matching skills (e.g. 6 Magic)', () => {
      const state = createGame(['Alice', 'Bob']);
      const forestShaman = CARDS.find((c) => isHeroCard(c) && c.name === 'The Forest Shaman');
      const raziz = CARDS.find((c) => isHeroCard(c) && c.name === 'Raziz of Aza');
      const lady = CARDS.find((c) => isHeroCard(c) && c.name === "Lady O'Faun");
      const ugrog = CARDS.find((c) => isHeroCard(c) && c.name === 'Ugrog Moglog');
      state.players[0].party.archer = forestShaman?.id ?? null;
      state.players[0].party.knight = raziz?.id ?? null;
      state.players[0].party.thief = lady?.id ?? null;
      state.players[0].party.barbarian = ugrog?.id ?? null;
      expect(canPlayQuest(state, 0)).toBe(true);
    });
  });
});
