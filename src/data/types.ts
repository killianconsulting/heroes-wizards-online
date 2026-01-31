import type { CardType, HeroType, Skill, WizardType, EventId } from './constants';

/** Base card - all cards have id (index 0..71), name, type */
export interface BaseCard {
  id: number;
  name: string;
  type: CardType;
  image?: string;
}

export interface HeroCard extends BaseCard {
  type: 'hero';
  heroType: HeroType;
  skills: Skill[];
}

export interface WizardCard extends BaseCard {
  type: 'wizard';
  wizardType: WizardType;
  ability: string;
}

export interface EventCard extends BaseCard {
  type: 'event';
  eventId: EventId;
  effect: string;
}

export interface QuestCard extends BaseCard {
  type: 'quest';
  effect: string;
}

export type Card = HeroCard | WizardCard | EventCard | QuestCard;

export function isHeroCard(card: Card): card is HeroCard {
  return card.type === 'hero';
}
export function isWizardCard(card: Card): card is WizardCard {
  return card.type === 'wizard';
}
export function isEventCard(card: Card): card is EventCard {
  return card.type === 'event';
}
export function isQuestCard(card: Card): card is QuestCard {
  return card.type === 'quest';
}
