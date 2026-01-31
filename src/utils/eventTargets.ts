import { getCard } from '@/data/cards';
import { isEventCard } from '@/data/types';
import type { EventId } from '@/data/constants';
import type { GameState } from '@/engine/state';

/** Events that need a target player (and possibly a card). */
export type EventTargetType = 'player' | 'player-and-hero' | 'player-and-wizard' | 'player-and-hand-card';

export function getEventTargetType(eventId: EventId): EventTargetType | null {
  switch (eventId) {
    case 'archery_contest':
    case 'royal_invitation':
    case 'tavern_brawl':
    case 'unguarded_treasure':
      return 'player';
    case 'spell_of_summoning':
    case 'wizard_tower_repairs':
      return 'player';
    case 'hunting_expedition':
      return 'player-and-hand-card';
    default:
      return null;
  }
}

export function eventNeedsTarget(cardId: number): boolean {
  const card = getCard(cardId);
  if (!isEventCard(card)) return false;
  return getEventTargetType(card.eventId) !== null;
}
