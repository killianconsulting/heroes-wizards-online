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

/** Ref to store the subscription channel so host/client can send on it without removeChannel. */
type GameChannelRef = { current: { send: (args: object) => Promise<unknown> } | null };

/** Subscribe to game channel; callbacks for game_start, game_state; host can pass onAction to apply incoming actions and broadcast new state. */
export function subscribeToGameChannel(
  lobbyId: string,
  callbacks: {
    onGameStart: (payload: GameStartPayload) => void;
    onGameState: (payload: GameStatePayload) => void;
    onAction?: (payload: ActionPayload) => void;
    /** When provided, store the subscription channel here so host/client can send on it without removeChannel. */
    channelRef?: GameChannelRef;
  }
): () => void {
  if (!supabase) return () => {};
  
  // Store in const so TypeScript knows it's not null in closures
  const client = supabase;
  const channel = client.channel(getChannelName(lobbyId), { config: { broadcast: { self: true } } });
  if (callbacks.channelRef) callbacks.channelRef.current = channel;

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
    if (callbacks.channelRef) callbacks.channelRef.current = null;
    client.removeChannel(channel);
  };
}

/** Broadcast game start (state + playerOrder). Pass existingChannel to send on subscription channel and avoid removing it. */
export async function broadcastGameStart(
  lobbyId: string,
  state: GameState,
  playerOrder: string[],
  existingChannel?: { send: (args: object) => Promise<unknown> } | null
): Promise<void> {
  if (!supabase && !existingChannel) return;
  if (existingChannel) {
    await existingChannel.send({
      type: 'broadcast',
      event: 'game_start',
      payload: { state, playerOrder },
    });
    return;
  }
  const client = supabase!;
  const channel = client.channel(getChannelName(lobbyId), { config: { broadcast: { self: true } } });
  await channel.send({
    type: 'broadcast',
    event: 'game_start',
    payload: { state, playerOrder },
  });
  client.removeChannel(channel);
}

/** Broadcast new game state. Pass existingChannel to send on subscription channel and avoid removing it. */
export async function broadcastGameState(
  lobbyId: string,
  state: GameState,
  existingChannel?: { send: (args: object) => Promise<unknown> } | null
): Promise<void> {
  if (!supabase && !existingChannel) return;
  if (existingChannel) {
    await existingChannel.send({
      type: 'broadcast',
      event: 'game_state',
      payload: { state },
    });
    return;
  }
  const client = supabase!;
  const channel = client.channel(getChannelName(lobbyId), { config: { broadcast: { self: true } } });
  await channel.send({
    type: 'broadcast',
    event: 'game_state',
    payload: { state },
  });
  client.removeChannel(channel);
}

/** Send an action (non-host calls). Pass existingChannel to send on subscription channel and avoid removing it. */
export async function sendAction(
  lobbyId: string,
  fromPlayerIndex: number,
  action: GameAction,
  existingChannel?: { send: (args: object) => Promise<unknown> } | null
): Promise<void> {
  if (!supabase && !existingChannel) return;
  const payload = { type: 'broadcast' as const, event: 'action' as const, payload: { action, fromPlayerIndex } };
  if (existingChannel) {
    await existingChannel.send(payload);
    return;
  }
  const client = supabase!;
  const channel = client.channel(getChannelName(lobbyId), { config: { broadcast: { self: true } } });
  await channel.send(payload);
  client.removeChannel(channel);
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
