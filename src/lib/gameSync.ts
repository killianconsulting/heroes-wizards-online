import { supabase } from './supabase';
import type { GameState } from '@/engine/state';
import type { EventTarget } from '@/engine/events';
import {
  drawCard,
  playCard,
  dumpCard,
  summonFromEventPile,
  passTurn,
  dismissFortuneReading,
  dismissEventBlocked,
} from '@/engine/actions';

export type GameAction =
  | { type: 'draw' }
  | { type: 'passTurn' }
  | { type: 'playCard'; cardId: number; target?: EventTarget }
  | { type: 'dumpCard'; cardId: number }
  | { type: 'summonFromPile'; cardId: number }
  | { type: 'dismissFortuneReading' }
  | { type: 'dismissEventBlocked' };

export interface GameStartPayload {
  state: GameState;
  playerOrder: string[];
}

export interface GameStatePayload {
  state: GameState;
}

export interface ActionPayload {
  action: GameAction;
  fromPlayerIndex: number;
}

const CHANNEL_PREFIX = 'game:';

function getChannelName(lobbyId: string): string {
  return `${CHANNEL_PREFIX}${lobbyId}`;
}

/** Subscribe to game channel; callbacks for game_start, game_state; host can pass onAction to apply incoming actions and broadcast new state. */
export function subscribeToGameChannel(
  lobbyId: string,
  callbacks: {
    onGameStart: (payload: GameStartPayload) => void;
    onGameState: (payload: GameStatePayload) => void;
    onAction?: (payload: ActionPayload) => void;
  }
): () => void {
  if (!supabase) return () => {};
  const channel = supabase.channel(getChannelName(lobbyId), { config: { broadcast: { self: true } } });

  channel
    .on('broadcast', { event: 'game_start' }, ({ payload }) => {
      callbacks.onGameStart(payload as GameStartPayload);
    })
    .on('broadcast', { event: 'game_state' }, ({ payload }) => {
      callbacks.onGameState(payload as GameStatePayload);
    })
    .on('broadcast', { event: 'action' }, ({ payload }) => {
      callbacks.onAction?.(payload as ActionPayload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Broadcast game start (state + playerOrder). Host calls after creating game. */
export async function broadcastGameStart(
  lobbyId: string,
  state: GameState,
  playerOrder: string[]
): Promise<void> {
  if (!supabase) return;
  const channel = supabase.channel(getChannelName(lobbyId), { config: { broadcast: { self: true } } });
  await channel.send({
    type: 'broadcast',
    event: 'game_start',
    payload: { state, playerOrder },
  });
  supabase.removeChannel(channel);
}

/** Broadcast new game state. Host calls after applying an action. */
export async function broadcastGameState(lobbyId: string, state: GameState): Promise<void> {
  if (!supabase) return;
  const channel = supabase.channel(getChannelName(lobbyId), { config: { broadcast: { self: true } } });
  await channel.send({
    type: 'broadcast',
    event: 'game_state',
    payload: { state },
  });
  supabase.removeChannel(channel);
}

/** Send an action (non-host calls). Host receives via onAction, applies, then broadcasts game_state. */
export async function sendAction(
  lobbyId: string,
  fromPlayerIndex: number,
  action: GameAction
): Promise<void> {
  if (!supabase) return;
  const channel = supabase.channel(getChannelName(lobbyId), { config: { broadcast: { self: true } } });
  await channel.send({
    type: 'broadcast',
    event: 'action',
    payload: { action, fromPlayerIndex },
  });
  supabase.removeChannel(channel);
}

/** Apply an action to state (host uses this when receiving action from channel). */
export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'draw':
      return drawCard(state);
    case 'passTurn':
      return passTurn(state);
    case 'playCard':
      return playCard(state, action.cardId, action.target);
    case 'dumpCard':
      return dumpCard(state, action.cardId);
    case 'summonFromPile':
      return summonFromEventPile(state, action.cardId);
    case 'dismissFortuneReading':
      return dismissFortuneReading(state);
    case 'dismissEventBlocked':
      return dismissEventBlocked(state);
    default:
      return state;
  }
}
