import { createGame } from '@/engine/setup';
import { drawCard, playCard, dumpCard, summonFromEventPile } from '@/engine/actions';
import { getLegalActions } from '@/engine/validation';
import { getCard, CARDS } from '@/data/cards';
import { isHeroCard, isQuestCard } from '@/data/types';

describe('actions', () => {
  describe('drawCard', () => {
    it('takes top card from deck into current player hand and advances turn', () => {
      const state = createGame(['Alice', 'Bob']);
      const deckLen = state.deck.length;
      const aliceHandLen = state.players[0].hand.length;
      const topCard = state.deck[0];

      const next = drawCard(state);

      expect(next.deck).toHaveLength(deckLen - 1);
      expect(next.deck[0]).not.toBe(topCard);
      expect(next.players[0].hand).toHaveLength(aliceHandLen + 1);
      expect(next.players[0].hand).toContain(topCard);
      expect(next.currentPlayerIndex).toBe(1);
    });

    it('does not mutate original state', () => {
      const state = createGame(['Alice', 'Bob']);
      const deckSnapshot = [...state.deck];
      const handSnapshot = [...state.players[0].hand];

      drawCard(state);

      expect(state.deck).toEqual(deckSnapshot);
      expect(state.players[0].hand).toEqual(handSnapshot);
    });
  });

  describe('playCard', () => {
    it('plays a hero into party and advances turn', () => {
      const heroCardId = 48;
      const state = createGame(['Alice', 'Bob']);
      const deckWithoutHero = state.deck.filter((id) => id !== heroCardId);
      const twoFromDeck = deckWithoutHero.slice(0, 2);
      const stateWithHeroInHand = {
        ...state,
        deck: deckWithoutHero.slice(2),
        players: state.players.map((p, i) =>
          i === 0 ? { ...p, hand: [heroCardId, ...twoFromDeck] } : p
        ),
      };
      const card = getCard(heroCardId);
      if (!isHeroCard(card)) throw new Error('not hero');
      const slot =
        card.heroType === 'Knight'
          ? 'knight'
          : card.heroType === 'Archer'
            ? 'archer'
            : card.heroType === 'Barbarian'
              ? 'barbarian'
              : 'thief';

      const next = playCard(stateWithHeroInHand, heroCardId);

      expect(next.players[0].hand).not.toContain(heroCardId);
      expect(next.players[0].party[slot]).toBe(heroCardId);
      expect(next.currentPlayerIndex).toBe(1);
    });

    it('playing quest with 6+ matching skills sets winner and ends game', () => {
      const questId = 0;
      const forestShaman = CARDS.find((c) => isHeroCard(c) && c.name === 'The Forest Shaman');
      const raziz = CARDS.find((c) => isHeroCard(c) && c.name === 'Raziz of Aza');
      const lady = CARDS.find((c) => isHeroCard(c) && c.name === "Lady O'Faun");
      const ugrog = CARDS.find((c) => isHeroCard(c) && c.name === 'Ugrog Moglog');
      const state = createGame(['Alice', 'Bob']);
      const deckWithoutQuest = state.deck.filter((id) => id !== questId);
      const twoFromDeck = deckWithoutQuest.slice(0, 2);
      const stateWithQuestAndParty = {
        ...state,
        deck: deckWithoutQuest.slice(2),
        players: state.players.map((p, i) =>
          i === 0
            ? {
                ...p,
                hand: [questId, ...twoFromDeck],
                party: {
                  ...p.party,
                  archer: forestShaman?.id ?? null,
                  knight: raziz?.id ?? null,
                  thief: lady?.id ?? null,
                  barbarian: ugrog?.id ?? null,
                },
              }
            : p
        ),
      };

      const next = playCard(stateWithQuestAndParty, questId);

      expect(next.phase).toBe('gameOver');
      expect(next.winnerPlayerId).toBe(state.players[0].id);
      expect(next.players[0].hand).not.toContain(questId);
    });

    it('Stargazer: after playing one card, turn does not advance (second play allowed)', () => {
      const heroCardId = 48;
      const stargazerId = 10;
      const state = createGame(['Alice', 'Bob']);
      const deckWithout = state.deck.filter((id) => id !== heroCardId && id !== stargazerId);
      const stateWithStargazerAndHero = {
        ...state,
        deck: deckWithout.slice(2),
        players: state.players.map((p, i) =>
          i === 0
            ? {
                ...p,
                hand: [heroCardId, ...deckWithout.slice(0, 2)],
                party: { ...p.party, stargazer: stargazerId },
              }
            : p
        ),
      };

      const next = playCard(stateWithStargazerAndHero, heroCardId);

      expect(next.currentPlayerIndex).toBe(0);
      expect(next.stargazerSecondPlayUsed).toBe(true);
    });
  });

  describe('summonFromEventPile', () => {
    it('takes chosen card from event pile into hand and advances turn', () => {
      const cardId = 16;
      const summonerId = 13;
      const state = createGame(['Alice', 'Bob']);
      const stateWithSummonerAndPile = {
        ...state,
        eventPile: [cardId],
        players: state.players.map((p, i) =>
          i === 0 ? { ...p, party: { ...p.party, summoner: summonerId } } : p
        ),
      };

      const next = summonFromEventPile(stateWithSummonerAndPile, cardId);

      expect(next.players[0].hand).toContain(cardId);
      expect(next.eventPile).not.toContain(cardId);
      expect(next.eventPile).toHaveLength(0);
      expect(next.currentPlayerIndex).toBe(1);
    });
  });

  describe('dumpCard', () => {
    it('moves non-event card from hand to event pile and advances turn', () => {
      const dumpableId = 48;
      const state = createGame(['Alice', 'Bob']);
      const deckWithoutCard = state.deck.filter((id) => id !== dumpableId);
      const twoFromDeck = deckWithoutCard.slice(0, 2);
      const stateWithDumpable = {
        ...state,
        deck: deckWithoutCard.slice(2),
        players: state.players.map((p, i) =>
          i === 0 ? { ...p, hand: [dumpableId, ...twoFromDeck] } : p
        ),
      };
      const handLen = stateWithDumpable.players[0].hand.length;
      const pileLen = stateWithDumpable.eventPile.length;

      const next = dumpCard(stateWithDumpable, dumpableId);

      expect(next.players[0].hand).not.toContain(dumpableId);
      expect(next.players[0].hand).toHaveLength(handLen - 1);
      expect(next.eventPile).toContain(dumpableId);
      expect(next.eventPile).toHaveLength(pileLen + 1);
      expect(next.currentPlayerIndex).toBe(1);
    });

    it('does nothing if card is event', () => {
      const eventId = 16;
      const state = createGame(['Alice', 'Bob']);
      const deckWithoutEvent = state.deck.filter((id) => id !== eventId);
      const twoFromDeck = deckWithoutEvent.slice(0, 2);
      const stateWithEvent = {
        ...state,
        deck: deckWithoutEvent.slice(2),
        players: state.players.map((p, i) =>
          i === 0 ? { ...p, hand: [eventId, ...twoFromDeck] } : p
        ),
      };

      const next = dumpCard(stateWithEvent, eventId);

      expect(next).toBe(stateWithEvent);
    });
  });
});
