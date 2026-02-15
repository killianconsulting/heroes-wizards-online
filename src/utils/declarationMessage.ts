/**
 * Build the declaration message shown when a card is about to be played.
 * Used by PlayCardDeclarationModal.
 */

import { getCard } from '@/data/cards';
import { isHeroCard, isWizardCard, isEventCard, isQuestCard, type Card } from '@/data/types';
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

const STARGAZER_SUFFIX = ' (2nd play this turn — Stargazer Wizard)';

function withStargazerNote(message: string, state: GameState, idx: number): string {
  if (!state.stargazerSecondPlayUsed || state.currentPlayerIndex !== idx) return message;
  return message + STARGAZER_SUFFIX;
}

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

  let message: string;

  if (isHeroCard(card)) {
    const slotKey = HERO_SLOT_KEY[card.heroType];
    const slotLabel = SLOT_LABEL[slotKey] ?? card.heroType;
    const party = state.players[idx]?.party;
    const existing = party?.[slotKey];
    if (existing !== undefined && existing !== null) {
      message = `${playerName} is swapping their ${slotLabel} for ${card.name}.`;
    } else {
      message = `${playerName} is playing ${card.name} as their ${slotLabel}.`;
    }
    return withStargazerNote(message, state, idx);
  }

  if (isWizardCard(card)) {
    const party = state.players[idx]?.party;
    const existing = party?.wizard;
    if (existing !== undefined && existing !== null) {
      message = `${playerName} is swapping their Wizard for ${card.name}.`;
    } else {
      message = `${playerName} is playing ${card.name} as their Wizard.`;
    }
    return withStargazerNote(message, state, idx);
  }

  if (isQuestCard(card)) {
    message = `${playerName} is playing their Quest card!`;
    return withStargazerNote(message, state, idx);
  }

  if (isEventCard(card)) {
    const eventId: EventId = card.eventId;
    if (target?.playerIndex === -1) {
      message = `${playerName} played ${card.name} with no effect because there was no eligible target.`;
      return withStargazerNote(message, state, idx);
    }
    if (eventId === 'hunting_expedition' && target?.playerIndex !== undefined) {
      const targetName = state.players[target.playerIndex]?.name ?? 'a player';
      message = `${playerName} is stealing a card from ${targetName}.`;
      return withStargazerNote(message, state, idx);
    }
    if (eventId === 'wizard_tower_repairs' && target?.playerIndex !== undefined) {
      const targetName = state.players[target.playerIndex]?.name ?? 'a player';
      message = `${playerName} is sending ${targetName}'s Wizard to the Event Pile.`;
      return withStargazerNote(message, state, idx);
    }
    if (
      (eventId === 'archery_contest' ||
        eventId === 'royal_invitation' ||
        eventId === 'tavern_brawl' ||
        eventId === 'unguarded_treasure' ||
        eventId === 'spell_of_summoning') &&
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
                : 'Wizard';
      message = `${playerName} is targeting ${targetName} (${slot}).`;
      return withStargazerNote(message, state, idx);
    }
    message = `${playerName} is playing ${card.name}: ${card.effect}`;
    return withStargazerNote(message, state, idx);
  }

  message = `${playerName} is playing ${(card as Card).name}.`;
  return withStargazerNote(message, state, idx);
}
