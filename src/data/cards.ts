/**
 * All 72 card definitions for Heroes & Wizards.
 * Card id = index in this array (0..71). Deck is shuffled indices.
 */
import type { Card, HeroCard, WizardCard, EventCard, QuestCard } from './types';
import type { HeroType, Skill, WizardType, EventId } from './constants';

function hero(
  id: number,
  name: string,
  heroType: HeroType,
  skills: Skill[],
  image?: string
): HeroCard {
  return { id, name, type: 'hero', heroType, skills, image };
}
function wizard(
  id: number,
  name: string,
  wizardType: WizardType,
  ability: string,
  image?: string
): WizardCard {
  return { id, name, type: 'wizard', wizardType, ability, image };
}
function event(
  id: number,
  name: string,
  eventId: EventId,
  effect: string,
  image?: string
): EventCard {
  return { id, name, type: 'event', eventId, effect, image };
}
function quest(id: number, name: string, effect: string, image?: string): QuestCard {
  return { id, name, type: 'quest', effect, image };
}

/** All 72 cards in fixed order. Deck at setup = shuffle([0..71]). */
export const CARDS: Card[] = [
  // 4 Quest
  quest(0, 'Quest', 'Win the Game! Requires 6 matching skills', '/cards/quest_card.png'),
  quest(1, 'Quest', 'Win the Game! Requires 6 matching skills', '/cards/quest_card.png'),
  quest(2, 'Quest', 'Win the Game! Requires 6 matching skills', '/cards/quest_card.png'),
  quest(3, 'Quest', 'Win the Game! Requires 6 matching skills', '/cards/quest_card.png'),
  // 3 Healer, 3 Spellcaster, 3 Stargazer, 3 Summoner
  wizard(4, 'Wizard Healer', 'Healer', 'No player can steal a hero from your party'),
  wizard(5, 'Wizard Healer', 'Healer', 'No player can steal a hero from your party'),
  wizard(6, 'Wizard Healer', 'Healer', 'No player can steal a hero from your party'),
  wizard(7, 'Wizard Spellcaster', 'Spellcaster', 'You only need 5 matching skills to play a Quest Card'),
  wizard(8, 'Wizard Spellcaster', 'Spellcaster', 'You only need 5 matching skills to play a Quest Card'),
  wizard(9, 'Wizard Spellcaster', 'Spellcaster', 'You only need 5 matching skills to play a Quest Card'),
  wizard(10, 'Wizard Stargazer', 'Stargazer', 'You can play 2 cards in one turn'),
  wizard(11, 'Wizard Stargazer', 'Stargazer', 'You can play 2 cards in one turn'),
  wizard(12, 'Wizard Stargazer', 'Stargazer', 'You can play 2 cards in one turn'),
  wizard(13, 'Wizard Summoner', 'Summoner', 'As a turn, you can draw any one card from the event pile'),
  wizard(14, 'Wizard Summoner', 'Summoner', 'As a turn, you can draw any one card from the event pile'),
  wizard(15, 'Wizard Summoner', 'Summoner', 'As a turn, you can draw any one card from the event pile'),
  // 28 Events: 3 archery, 1 feast east, 1 feast west, 2 fortune, 5 hunting, 3 royal, 4 spell, 3 tavern, 1 eagles, 3 unguarded, 2 wizard tower
  event(16, 'Archery Contest', 'archery_contest', "Steal an Archer from any player's party (swap it with your own if you have one)", '/cards/event_archery_contest.png'),
  event(17, 'Archery Contest', 'archery_contest', "Steal an Archer from any player's party (swap it with your own if you have one)", '/cards/event_archery_contest.png'),
  event(18, 'Archery Contest', 'archery_contest', "Steal an Archer from any player's party (swap it with your own if you have one)", '/cards/event_archery_contest.png'),
  event(19, 'Feast in the East Hall', 'feast_east', "All players give their entire hand to the player on their right", '/cards/event_feast_east.png'),
  event(20, 'Feast in the West Hall', 'feast_west', "All players give their entire hand to the player on their left", '/cards/event_feast_west.png'),
  event(21, 'Fortune Reading', 'fortune_reading', "Have a private peek at all other players' hands", '/cards/event_fortune_reading.png'),
  event(22, 'Fortune Reading', 'fortune_reading', "Have a private peek at all other players' hands", '/cards/event_fortune_reading.png'),
  event(23, 'Hunting Expedition', 'hunting_expedition', "Look at a selected player's hand and choose one card to steal", '/cards/event_hunting_expedition.png'),
  event(24, 'Hunting Expedition', 'hunting_expedition', "Look at a selected player's hand and choose one card to steal", '/cards/event_hunting_expedition.png'),
  event(25, 'Hunting Expedition', 'hunting_expedition', "Look at a selected player's hand and choose one card to steal", '/cards/event_hunting_expedition.png'),
  event(26, 'Hunting Expedition', 'hunting_expedition', "Look at a selected player's hand and choose one card to steal", '/cards/event_hunting_expedition.png'),
  event(27, 'Hunting Expedition', 'hunting_expedition', "Look at a selected player's hand and choose one card to steal", '/cards/event_hunting_expedition.png'),
  event(28, 'Royal Invitation', 'royal_invitation', "Steal a Knight from any player's party (swap it with your own if you have one)", '/cards/event_royal_invitation.png'),
  event(29, 'Royal Invitation', 'royal_invitation', "Steal a Knight from any player's party (swap it with your own if you have one)", '/cards/event_royal_invitation.png'),
  event(30, 'Royal Invitation', 'royal_invitation', "Steal a Knight from any player's party (swap it with your own if you have one)", '/cards/event_royal_invitation.png'),
  event(31, 'Spell of Summoning', 'spell_of_summoning', "Steal a Wizard from any player's party (swap it with your own if you have one)", '/cards/event_spell_of_summing.png'),
  event(32, 'Spell of Summoning', 'spell_of_summoning', "Steal a Wizard from any player's party (swap it with your own if you have one)", '/cards/event_spell_of_summing.png'),
  event(33, 'Spell of Summoning', 'spell_of_summoning', "Steal a Wizard from any player's party (swap it with your own if you have one)", '/cards/event_spell_of_summing.png'),
  event(34, 'Spell of Summoning', 'spell_of_summoning', "Steal a Wizard from any player's party (swap it with your own if you have one)", '/cards/event_spell_of_summing.png'),
  event(35, 'Tavern Brawl', 'tavern_brawl', "Steal a Barbarian from any player's party (swap it with your own if you have one)", '/cards/event_tavern_brawl.png'),
  event(36, 'Tavern Brawl', 'tavern_brawl', "Steal a Barbarian from any player's party (swap it with your own if you have one)", '/cards/event_tavern_brawl.png'),
  event(37, 'Tavern Brawl', 'tavern_brawl', "Steal a Barbarian from any player's party (swap it with your own if you have one)", '/cards/event_tavern_brawl.png'),
  event(38, 'The Giant Eagles Arrive!', 'eagles', "Win the Game! You can only play this card if all cards in the deck are drawn", '/cards/event_eagles.png'),
  event(39, 'Unguarded Treasure', 'unguarded_treasure', "Steal a Thief from any player's party (swap it with your own if you have one)", '/cards/event_unguarded_treasure.png'),
  event(40, 'Unguarded Treasure', 'unguarded_treasure', "Steal a Thief from any player's party (swap it with your own if you have one)", '/cards/event_unguarded_treasure.png'),
  event(41, 'Unguarded Treasure', 'unguarded_treasure', "Steal a Thief from any player's party (swap it with your own if you have one)", '/cards/event_unguarded_treasure.png'),
  event(42, 'Wizard Tower Repairs', 'wizard_tower_repairs', 'Send a wizard from any one party to the event pile', '/cards/event_wizard_tower_repairs.png'),
  event(43, 'Wizard Tower Repairs', 'wizard_tower_repairs', 'Send a wizard from any one party to the event pile', '/cards/event_wizard_tower_repairs.png'),
  // 28 Heroes (id 44..71)
  hero(44, 'Lord Vlobnik', 'Barbarian', ['Strong', 'Strong', 'Magic'], '/cards/barbarian_lord_SSM.png'),
  hero(45, 'Jaspar the Jester', 'Thief', ['Fast', 'Magic']),
  hero(46, 'Wulfric Duskaxe', 'Barbarian', ['Fast', 'Magic', 'Magic'], '/cards/barbarian_wulfric_FMM.png'),
  hero(47, "Robbin' Rob", 'Archer', ['Strong', 'Fast', 'Fast'], '/cards/archer_rob_SFF.png'),
  hero(48, 'Furui Ninjin', 'Knight', ['Strong', 'Fast'], '/cards/knight_furui_SF.png'),
  hero(49, 'Cleoparcher', 'Archer', ['Fast', 'Magic'], '/cards/archer_cleo_FM.png'),
  hero(50, 'Stefan Swifthand', 'Thief', ['Fast', 'Fast']),
  hero(51, "Lady O'Faun", 'Thief', ['Strong', 'Magic', 'Magic']),
  hero(52, 'Kara Karslashian', 'Knight', ['Strong', 'Strong'], '/cards/knight_kara_SS.png'),
  hero(53, 'Morvin the Mugger', 'Thief', ['Strong', 'Strong', 'Fast']),
  hero(54, 'Prince Daphric II', 'Knight', ['Sturdy', 'Fast'], '/cards/knight_prince_UF.png'),
  hero(55, 'Sir Brutus Bigblade', 'Knight', ['Strong', 'Sturdy', 'Sturdy'], '/cards/knight_sir_SUU.png'),
  hero(56, 'Ugrog Moglog', 'Archer', ['Strong', 'Magic'], '/cards/archer_ugrog_SM.png'),
  hero(57, 'Skullsberg', 'Barbarian', ['Sturdy', 'Magic'], '/cards/barbarian_skullsberg_UM.png'),
  hero(58, 'Sir Leo of the Light', 'Knight', ['Sturdy', 'Magic'], '/cards/knight_sir_UM.png'),
  hero(59, 'Choppy von Chop', 'Barbarian', ['Strong', 'Sturdy'], '/cards/barbarian_choppy_SU.png'),
  hero(60, 'Silviel Gilderleaf', 'Archer', ['Sturdy', 'Sturdy', 'Magic'], '/cards/archer_silviel_UUM.png'),
  hero(61, 'Princess Pinecone', 'Knight', ['Fast', 'Fast', 'Magic'], '/cards/knight_princess_FFM.png'),
  hero(62, 'Raziz of Aza', 'Knight', ['Strong', 'Magic', 'Magic'], '/cards/knight_raziz_SMM.png'),
  hero(63, 'Orgnar Ironbeard', 'Barbarian', ['Sturdy', 'Sturdy'], '/cards/barbarian_orgnar_UU.png'),
  hero(64, 'Brobo Pockpickins', 'Thief', ['Sturdy', 'Sturdy', 'Fast']),
  hero(65, 'Siania Sand', 'Archer', ['Sturdy', 'Fast'], '/cards/archer_siania_UF.png'),
  hero(66, 'The Forest Shaman', 'Archer', ['Magic', 'Magic'], '/cards/archer_forest_MM.png'),
  hero(67, 'Dougie MacLobber', 'Archer', ['Strong', 'Strong', 'Sturdy'], '/cards/archer_dougie_SSU.png'),
  hero(68, 'Sneaky Sam', 'Thief', ['Strong', 'Sturdy']),
  hero(69, 'The Shadow Guard', 'Barbarian', ['Sturdy', 'Fast', 'Fast'], '/cards/barbarian_shadow_UFF.png'),
  hero(70, 'Lola Lullabard', 'Thief', ['Sturdy', 'Magic']),
  hero(71, 'Ragna the Reckless', 'Barbarian', ['Strong', 'Fast'], '/cards/barbarian_ragna_SF.png'),
];

/** Card id is 0..71. Look up definition. */
export function getCard(cardId: number): Card {
  if (cardId < 0 || cardId >= CARDS.length) {
    throw new Error(`Invalid card id: ${cardId}`);
  }
  return CARDS[cardId];
}

export type CardId = number;
