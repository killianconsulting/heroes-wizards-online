/**
 * Game state types for Heroes & Wizards.
 * Card ids are 0..71 (indices into CARDS).
 */


export type CardId = number;

/** Party: one Wizard slot (any wizard type), one slot per hero type. Value = card id or null. */
export interface Party {
  wizard: CardId | null;
  knight: CardId | null;
  archer: CardId | null;
  barbarian: CardId | null;
  thief: CardId | null;
}

export function createEmptyParty(): Party {
  return {
    wizard: null,
    knight: null,
    archer: null,
    barbarian: null,
    thief: null,
  };
}

export interface Player {
  id: string;
  name: string;
  hand: CardId[];
  party: Party;
}

export type GamePhase = 'chooseAction' | 'resolvingEvent' | 'gameOver';

export interface GameState {
  deck: CardId[];
  eventPile: CardId[];
  players: Player[];
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  phase: GamePhase;
  winnerPlayerId: string | null;
  /** Player indices that disconnected (can rejoin). Their turn is skipped; they can still be targeted (e.g. stolen from). */
  disconnectedPlayerIndices?: number[];
  /** Player indices that left the game (explicit leave; no rejoin). Their turn is skipped. */
  leftPlayerIndices?: number[];
  /** When phase is resolvingEvent, some events need a target (player index or card). */
  pendingEventTarget?: { playerIndex?: number; cardId?: CardId };
  /** Stargazer: after playing one card, allow a second play this turn. */
  stargazerSecondPlayUsed?: boolean;
  /** After drawing a card, player can look at hand then pass turn (one draw per turn). */
  drewThisTurn?: boolean;
  /** After playing/dumping/summoning, only Pass turn is allowed until they pass. */
  actedThisTurn?: boolean;
  /** Fortune Reading: player is viewing other players' hands until they click OK. */
  pendingFortuneReading?: boolean;
  /** Event was played but effect blocked (e.g. Healer); show notification until dismissed. */
  eventBlocked?: { message: string; targetPlayerName?: string };
  /** Card play declared but not yet applied; declaration modal shown, then confirmDeclaration runs. */
  pendingPlayDeclaration?: {
    cardId: CardId;
    playerIndex: number;
    target?: { playerIndex?: number; cardId?: CardId };
  };
  /** Player index who just drew; show "X drew a card" to other players until dismissed. */
  pendingDrawDeclaration?: number;
  /** Play already applied (hero/wizard); show declaration to other players only until dismissed. */
  pendingPlayDeclarationDisplay?: {
    cardId: CardId;
    playerIndex: number;
    target?: { playerIndex?: number; cardId?: CardId };
    /** Message built before play so "swapping" vs "playing" is correct. */
    message: string;
  };
}
