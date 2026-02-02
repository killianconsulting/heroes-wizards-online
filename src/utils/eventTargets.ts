import { getCard } from '@/data/cards';
import { isEventCard, isWizardCard } from '@/data/types';
import type { EventId } from '@/data/constants';
import type { GameState } from '@/engine/state';

/** Events that need a target player (and possibly a card). */
export type EventTargetType = 'player' | 'player-and-hero' | 'player-and-wizard' | 'player-and-hand-card';

export type EventTargetSlot = 'knight' | 'archer' | 'barbarian' | 'thief' | 'wizard';

const SLOT_LABEL: Record<Exclude<EventTargetSlot, 'wizard'>, string> = {
  knight: 'Knight',
  archer: 'Archer',
  barbarian: 'Barbarian',
  thief: 'Thief',
};

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

/** Which hero type or wizard this event targets. Used for target-selector hints. */
export function getEventTargetSlot(eventId: EventId): EventTargetSlot | null {
  switch (eventId) {
    case 'archery_contest':
      return 'archer';
    case 'royal_invitation':
      return 'knight';
    case 'tavern_brawl':
      return 'barbarian';
    case 'unguarded_treasure':
      return 'thief';
    case 'spell_of_summoning':
    case 'wizard_tower_repairs':
      return 'wizard';
    default:
      return null;
  }
}

/** Whether this party has a Healer (blocks hero steals only). */
function hasHealer(party: GameState['players'][0]['party']): boolean {
  if (party.wizard === null) return false;
  const card = getCard(party.wizard);
  return isWizardCard(card) && card.wizardType === 'Healer';
}

/** Per-player target info: can they be selected, and hint text for the UI. */
export function getTargetPlayerInfo(
  state: GameState,
  playerIndex: number,
  eventId: EventId
): { canSelect: boolean; hint: string } {
  const slot = getEventTargetSlot(eventId);
  if (slot === null) return { canSelect: true, hint: '' };

  const party = state.players[playerIndex].party;

  if (slot === 'wizard') {
    const hasWizard = party.wizard !== null;
    return {
      canSelect: hasWizard,
      hint: hasWizard ? 'Has Wizard' : 'No wizard',
    };
  }

  const hasHero = party[slot] !== null;
  const protectedByHealer = hasHealer(party);
  const label = SLOT_LABEL[slot];
  if (!hasHero) {
    return { canSelect: false, hint: `No ${label}` };
  }
  if (protectedByHealer) {
    return { canSelect: false, hint: `Has ${label} (protected by Healer)` };
  }
  return { canSelect: true, hint: `Has ${label}` };
}

export function eventNeedsTarget(cardId: number): boolean {
  const card = getCard(cardId);
  if (!isEventCard(card)) return false;
  return getEventTargetType(card.eventId) !== null;
}
