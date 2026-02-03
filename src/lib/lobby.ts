import { supabase } from './supabase';
import type { LobbyPlayer } from '@/context/LobbyContext';

export interface CreateLobbyResult {
  lobbyId: string;
  lobbyCode: string;
  playerId: string;
  playerName: string;
  isHost: true;
  players: LobbyPlayer[];
}

export interface JoinLobbyResult {
  lobbyId: string;
  lobbyCode: string;
  playerId: string;
  playerName: string;
  isHost: false;
  players: LobbyPlayer[];
}

export type LobbyResult = CreateLobbyResult | JoinLobbyResult;

const LOBBY_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateCode(length: number = 4): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += LOBBY_CODE_CHARS[Math.floor(Math.random() * LOBBY_CODE_CHARS.length)];
  }
  return code;
}

function rowToPlayer(row: { id: string; name: string; is_host: boolean }): LobbyPlayer {
  return {
    id: row.id,
    name: row.name,
    isHost: row.is_host,
  };
}

function isNetworkError(e: unknown): boolean {
  if (e instanceof TypeError && e.message === 'Failed to fetch') return true;
  if (e instanceof Error && /fetch|network|load/i.test(e.message)) return true;
  return false;
}

/** Create a new lobby; host is the first player. */
export async function createLobby(hostName: string): Promise<CreateLobbyResult | { error: string }> {
  if (!supabase) return { error: 'Supabase not configured' };

  const code = generateCode(4);

  try {
    const { data: lobby, error: lobbyError } = await supabase
      .from('lobbies')
      .insert({ code, host_name: hostName, status: 'waiting' })
      .select('id, code')
      .single();

    if (lobbyError || !lobby) {
      return { error: lobbyError?.message ?? 'Failed to create lobby' };
    }

    const { data: player, error: playerError } = await supabase
      .from('lobby_players')
      .insert({ lobby_id: lobby.id, name: hostName, is_host: true })
      .select('id, name, is_host')
      .single();

    if (playerError || !player) {
      await supabase.from('lobbies').delete().eq('id', lobby.id);
      return { error: playerError?.message ?? 'Failed to add host' };
    }

    return {
      lobbyId: lobby.id,
      lobbyCode: lobby.code,
      playerId: player.id,
      playerName: hostName,
      isHost: true,
      players: [rowToPlayer(player)],
    };
  } catch (e) {
    if (isNetworkError(e)) {
      return {
        error:
          'Could not reach the server. Check your connection and that your Supabase project is active (Supabase dashboard → project not paused).',
      };
    }
    return { error: e instanceof Error ? e.message : 'Failed to create lobby' };
  }
}

/** Join an existing lobby by code. */
export async function joinLobby(
  code: string,
  playerName: string
): Promise<JoinLobbyResult | { error: string }> {
  if (!supabase) return { error: 'Supabase not configured' };

  const normalizedCode = code.trim().toUpperCase();
  if (normalizedCode.length !== 4) return { error: 'Lobby code must be 4 letters.' };

  try {
    const { data: lobby, error: lobbyError } = await supabase
      .from('lobbies')
      .select('id, code')
      .eq('code', normalizedCode)
      .eq('status', 'waiting')
      .single();

    if (lobbyError || !lobby) {
      return { error: 'Lobby not found or game already started.' };
    }

    const { data: existingPlayers } = await supabase
      .from('lobby_players')
      .select('id')
      .eq('lobby_id', lobby.id);

    const maxPlayers = 5;
    if (existingPlayers && existingPlayers.length >= maxPlayers) {
      return { error: 'Lobby is full.' };
    }

    const { data: player, error: playerError } = await supabase
      .from('lobby_players')
      .insert({ lobby_id: lobby.id, name: playerName, is_host: false })
      .select('id, name, is_host')
      .single();

    if (playerError || !player) {
      return { error: playerError?.message ?? 'Failed to join (name may already be in use).' };
    }

    const { data: allPlayers } = await supabase
      .from('lobby_players')
      .select('id, name, is_host')
      .eq('lobby_id', lobby.id)
      .order('created_at', { ascending: true });

    const players: LobbyPlayer[] = (allPlayers ?? []).map(rowToPlayer);

    return {
      lobbyId: lobby.id,
      lobbyCode: lobby.code,
      playerId: player.id,
      playerName,
      isHost: false,
      players,
    };
  } catch (e) {
    if (isNetworkError(e)) {
      return {
        error:
          'Could not reach the server. Check your connection and that your Supabase project is active (Supabase dashboard → project not paused).',
      };
    }
    return { error: e instanceof Error ? e.message : 'Failed to join lobby' };
  }
}

/** Remove this player from the lobby. */
export async function leaveLobby(
  lobbyId: string,
  playerId: string
): Promise<{ error?: string }> {
  if (!supabase) return {};

  const { error } = await supabase
    .from('lobby_players')
    .delete()
    .eq('id', playerId)
    .eq('lobby_id', lobbyId);

  if (error) return { error: error.message };

  const { data: remaining } = await supabase
    .from('lobby_players')
    .select('id')
    .eq('lobby_id', lobbyId);

  if (remaining && remaining.length === 0) {
    await supabase.from('lobbies').delete().eq('id', lobbyId);
  }

  return {};
}

/** Subscribe to lobby_players for a lobby; callback receives updated list. */
export function subscribeToLobbyPlayers(
  lobbyId: string,
  onPlayers: (players: LobbyPlayer[]) => void
): () => void {
  if (!supabase) return () => {};

  // Store in const so TypeScript knows it's not null in closures
  const client = supabase;

  const fetchPlayers = async () => {
    const { data } = await client
      .from('lobby_players')
      .select('id, name, is_host')
      .eq('lobby_id', lobbyId)
      .order('created_at', { ascending: true });
    onPlayers((data ?? []).map(rowToPlayer));
  };

  fetchPlayers();

  const channel = client
    .channel(`lobby:${lobbyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lobby_players',
        filter: `lobby_id=eq.${lobbyId}`,
      },
      () => {
        fetchPlayers();
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
