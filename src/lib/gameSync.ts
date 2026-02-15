import { supabase } from './supabase';
import type { GameState } from '@/engine/state';
import type { EventTarget } from '@/engine/events';
import { getCard } from '@/data/cards';
import { isEventCard } from '@/data/types';
import {
  drawCard,
  playCard,
  declarePlay,
  confirmDeclaration,
  dumpCard,
  summonFromEventPile,
  passTurn,
  dismissFortuneReading,
  dismissEventBlocked,
  dismissDrawDeclaration,
} from '@/engine/actions';

export type GameAction =
  | { type: 'draw' }
  | { type: 'passTurn' }
  | { type: 'playCard'; cardId: number; target?: EventTarget }
  | { type: 'declarePlay'; cardId: number; target?: EventTarget }
  | { type: 'confirmDeclaration'; fullTarget?: EventTarget }
  | { type: 'dumpCard'; cardId: number }
  | { type: 'summonFromPile'; cardId: number }
  | { type: 'dismissFortuneReading' }
  | { type: 'dismissEventBlocked' }
  | { type: 'dismissDrawDeclaration' };

export interface GameStartPayload {
  state: GameState;
  playerOrder: string[];
}

export interface GameStatePayload {
  state: GameState;
  /** Included so reconnecting clients get player order; host sends with every game_state. */
  playerOrder?: string[];
}

export interface ActionPayload {
  action: GameAction;
  fromPlayerIndex: number;
}

export interface PlayerLeftPayload {
  playerIndex: number;
  playerId: string;
  /** 'leave' = explicit abandon (no rejoin); 'disconnect' = dropped (can rejoin). */
  reason?: 'leave' | 'disconnect';
}

export interface PlayerReconnectedPayload {
  playerIndex: number;
}

export interface RequestStatePayload {
  playerId: string;
}

const CHANNEL_PREFIX = 'game:';

function getChannelName(lobbyId: string): string {
  return `${CHANNEL_PREFIX}${lobbyId}`;
}

/** Ref to store the subscription channel so host/client can send on it and track presence. */
type GameChannelRef = {
  current: {
    send: (args: object) => Promise<unknown>;
    track?: (payload: Record<string, unknown>) => void;
  } | null;
};

/** Subscribe to game channel; callbacks for game_start, game_state, player_left, player_reconnected, request_state. */
export function subscribeToGameChannel(
  lobbyId: string,
  callbacks: {
    onGameStart: (payload: GameStartPayload) => void;
    onGameState: (payload: GameStatePayload) => void;
    onAction?: (payload: ActionPayload) => void;
    /** Host: when a player leaves (abandon or disconnect), apply and broadcast. */
    onPlayerLeft?: (payload: PlayerLeftPayload) => void;
    /** Host: when a disconnected player rejoins presence, apply playerReconnected and broadcast. */
    onPlayerReconnected?: (payload: PlayerReconnectedPayload) => void;
    /** Host: when a client requests current state (e.g. reconnecting), broadcast game_state. */
    onRequestState?: (payload: RequestStatePayload) => void;
    /** When provided, store the subscription channel here so host/client can send on it and track presence. */
    channelRef?: GameChannelRef;
  }
): () => void {
  if (!supabase) return () => {};
  
  const client = supabase;
  const channel = client.channel(getChannelName(lobbyId), {
    config: { broadcast: { self: true }, presence: { key: '' } },
  });
  if (callbacks.channelRef) {
    callbacks.channelRef.current = channel as GameChannelRef['current'];
  }

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
    .on('broadcast', { event: 'player_left' }, ({ payload }) => {
      const p = payload as PlayerLeftPayload;
      callbacks.onPlayerLeft?.({ ...p, reason: p.reason ?? 'leave' });
    })
    .on('broadcast', { event: 'request_state' }, ({ payload }) => {
      callbacks.onRequestState?.(payload as RequestStatePayload);
    })
    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
      if (!callbacks.onPlayerLeft) return;
      leftPresences.forEach((presence: Record<string, unknown>) => {
        const playerIndex = presence.playerIndex as number | undefined;
        const playerId = presence.playerId as string | undefined;
        if (typeof playerIndex === 'number' && typeof playerId === 'string') {
          callbacks.onPlayerLeft!({ playerIndex, playerId, reason: 'disconnect' });
        }
      });
    })
    .on('presence', { event: 'join' }, ({ newPresences }) => {
      if (!callbacks.onPlayerReconnected) return;
      newPresences.forEach((presence: Record<string, unknown>) => {
        const playerIndex = presence.playerIndex as number | undefined;
        if (typeof playerIndex === 'number') {
          callbacks.onPlayerReconnected!({ playerIndex });
        }
      });
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

/** Broadcast new game state. Pass existingChannel to send on subscription channel. Include playerOrder so reconnecting clients get it. */
export async function broadcastGameState(
  lobbyId: string,
  state: GameState,
  existingChannel?: { send: (args: object) => Promise<unknown> } | null,
  playerOrder?: string[]
): Promise<void> {
  if (!supabase && !existingChannel) return;
  const payload = playerOrder != null ? { state, playerOrder } : { state };
  if (existingChannel) {
    await existingChannel.send({
      type: 'broadcast',
      event: 'game_state',
      payload,
    });
    return;
  }
  const client = supabase!;
  const channel = client.channel(getChannelName(lobbyId), { config: { broadcast: { self: true } } });
  await channel.send({
    type: 'broadcast',
    event: 'game_state',
    payload,
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

/** Broadcast that this player is leaving (abandon). Use existingChannel so subscription stays alive. Host applies playerLeft and broadcasts game_state. */
export async function broadcastPlayerLeft(
  lobbyId: string,
  playerIndex: number,
  playerId: string,
  existingChannel?: { send: (args: object) => Promise<unknown> } | null,
  reason: 'leave' | 'disconnect' = 'leave'
): Promise<void> {
  if (!supabase && !existingChannel) return;
  const payload = {
    type: 'broadcast' as const,
    event: 'player_left' as const,
    payload: { playerIndex, playerId, reason },
  };
  if (existingChannel) {
    await existingChannel.send(payload);
    return;
  }
  const client = supabase!;
  const channel = client.channel(getChannelName(lobbyId), { config: { broadcast: { self: true } } });
  await channel.send(payload);
  client.removeChannel(channel);
}

/** Request current game state (reconnecting client). Host responds by broadcasting game_state. */
export async function broadcastRequestState(
  lobbyId: string,
  playerId: string,
  existingChannel?: { send: (args: object) => Promise<unknown> } | null
): Promise<void> {
  if (!supabase && !existingChannel) return;
  const payload = {
    type: 'broadcast' as const,
    event: 'request_state' as const,
    payload: { playerId },
  };
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
    case 'declarePlay':
      return declarePlay(state, action.cardId, action.target);
    case 'confirmDeclaration':
      return confirmDeclaration(state, action.fullTarget);
    case 'dumpCard':
      return dumpCard(state, action.cardId);
    case 'summonFromPile':
      return summonFromEventPile(state, action.cardId);
    case 'dismissFortuneReading':
      return dismissFortuneReading(state);
    case 'dismissEventBlocked':
      return dismissEventBlocked(state);
    case 'dismissDrawDeclaration':
      return dismissDrawDeclaration(state);
    default:
      return state;
  }
}

/** True if this declaration is for hunting_expedition awaiting card choice (host should not auto-confirm after 3s). */
export function isDeclarationAwaitingCardChoice(state: GameState): boolean {
  const pending = state.pendingPlayDeclaration;
  if (!pending) return false;
  const card = getCard(pending.cardId);
  if (!isEventCard(card) || card.eventId !== 'hunting_expedition') return false;
  return pending.target?.cardId === undefined;
}
