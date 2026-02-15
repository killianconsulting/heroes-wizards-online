/**
 * Build the declaration message shown when a card is about to be played.
 * Used by PlayCardDeclarationModal.
 */

import { getCard } from '@/data/cards';
import { isHeroCard, isWizardCard, isEventCard, isQuestCard } from '@/data/types';
import type { HeroType } from '@/data/constants';
import type { GameState } from '@/engine/state';
import type { EventTarget } from '@/engine/events';
import type { EventId } from '@/data/constants';

const HERO_SLOT_KEY: Record<HeroType, keyof GameState['players'][0]['party']> = {
  Knight: 'knight',
  Archer: 'archer',
  Barbarian: 'barbarian',
  Thief: 'thief',
};

const SLOT_LABEL: Record<string, string> = {
  knight: 'Knight',
  archer: 'Archer',
  barbarian: 'Barbarian',
  thief: 'Thief',
  wizard: 'Wizard',
};

export function getDeclarationMessage(
  state: GameState,
  cardId: number,
  target?: EventTarget,
  /** Player who played the card (from pendingPlayDeclaration.playerIndex). Defaults to currentPlayerIndex. */
  playerIndex?: number
): string {
  const card = getCard(cardId);
  const idx = playerIndex ?? state.currentPlayerIndex;
  const playerName = state.players[idx]?.name ?? 'A player';

  if (isHeroCard(card)) {
    const slotKey = HERO_SLOT_KEY[card.heroType];
    const slotLabel = SLOT_LABEL[slotKey] ?? card.heroType;
    const party = state.players[idx]?.party;
    const existing = party?.[slotKey];
    if (existing !== undefined && existing !== null) {
      return `${playerName} is swapping their ${slotLabel} for ${card.name}.`;
    }
    return `${playerName} is playing ${card.name} as their ${slotLabel}.`;
  }

  if (isWizardCard(card)) {
    const party = state.players[idx]?.party;
    const existing = party?.wizard;
    if (existing !== undefined && existing !== null) {
      const existingCard = getCard(existing);
      return `${playerName} is swapping their Wizard for ${card.name}.`;
    }
    return `${playerName} is playing ${card.name} as their Wizard.`;
  }

  if (isQuestCard(card)) {
    return `${playerName} is playing their Quest card!`;
  }

  if (isEventCard(card)) {
    const eventId: EventId = card.eventId;
    if (eventId === 'hunting_expedition' && target?.playerIndex !== undefined) {
      const targetName = state.players[target.playerIndex]?.name ?? 'a player';
      return `${playerName} is stealing a card from ${targetName}.`;
    }
    if (
      (eventId === 'archery_contest' ||
        eventId === 'royal_invitation' ||
        eventId === 'tavern_brawl' ||
        eventId === 'unguarded_treasure' ||
        eventId === 'spell_of_summoning' ||
        eventId === 'wizard_tower_repairs') &&
      target?.playerIndex !== undefined
    ) {
      const targetName = state.players[target.playerIndex]?.name ?? 'a player';
      const slot =
        eventId === 'archery_contest'
          ? 'Archer'
          : eventId === 'royal_invitation'
            ? 'Knight'
            : eventId === 'tavern_brawl'
              ? 'Barbarian'
              : eventId === 'unguarded_treasure'
                ? 'Thief'
                : eventId === 'spell_of_summoning'
                  ? 'Wizard'
                  : 'Wizard';
      return `${playerName} is targeting ${targetName} (${slot}).`;
    }
    return `${playerName} is playing ${card.name}: ${card.effect}`;
  }

  return `${playerName} is playing ${card.name}.`;
}
