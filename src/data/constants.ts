/**
 * Game constants for Heroes & Wizards
 */

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;
export const HAND_SIZE_DEALT = 3;
export const MAX_HAND_SIZE = 5;
export const QUEST_SKILL_THRESHOLD = 6;
export const SPELLCASTER_QUEST_THRESHOLD = 5;
export const TOTAL_CARDS = 72;

export const HERO_TYPES = ['Knight', 'Archer', 'Barbarian', 'Thief'] as const;
export type HeroType = (typeof HERO_TYPES)[number];

export const WIZARD_TYPES = ['Healer', 'Spellcaster', 'Stargazer', 'Summoner'] as const;
export type WizardType = (typeof WIZARD_TYPES)[number];

export const SKILLS = ['Strong', 'Fast', 'Magic', 'Sturdy'] as const;
export type Skill = (typeof SKILLS)[number];

export const CARD_TYPES = ['hero', 'wizard', 'event', 'quest'] as const;
export type CardType = (typeof CARD_TYPES)[number];

/** Event card identifiers for resolution logic */
export const EVENT_IDS = [
  'archery_contest',
  'feast_east',
  'feast_west',
  'fortune_reading',
  'hunting_expedition',
  'royal_invitation',
  'spell_of_summoning',
  'tavern_brawl',
  'eagles',
  'unguarded_treasure',
  'wizard_tower_repairs',
] as const;
export type EventId = (typeof EVENT_IDS)[number];
