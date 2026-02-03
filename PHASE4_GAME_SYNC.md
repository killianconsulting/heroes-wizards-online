# Phase 4b — Game state sync (online play)

After the lobby is set, the next stage is **syncing the game** so when the host starts, all players see the same game and take turns.

## Goal

- Host clicks **Start Game** (with sync enabled) → create initial state, broadcast to all clients in the lobby.
- All clients (host + others) receive the state and show the game screen with **their** hand (each client knows their player index).
- When the **current player** acts (draw / play / dump / pass):
  - **Host**: apply action locally, broadcast new state to the channel.
  - **Non-host**: send action to the channel; host receives, applies, broadcasts new state.
- All clients receive `game_state` and update local state; only the current player can submit actions (enforced by host when applying).

## Sync model (host as authority)

- **Channel**: Supabase Realtime channel `game:{lobby_id}` (broadcast).
- **Events**:
  - `game_start` — payload: `{ state, playerOrder }`. `playerOrder` = `[lobby_player_id_0, ...]` in same order as `state.players` so each client can compute `myPlayerIndex`.
  - `game_state` — payload: `{ state }`. New state after any action.
  - `action` — payload: `{ type, ...params, fromPlayerIndex }`. Non-host sends; host receives, validates, applies, broadcasts `game_state`.
- **No persistence**: Game state lives only in memory and on the channel for the session. Refresh = back to lobby (or we could add a `games` table later).

## Implementation steps

1. **gameSync.ts** — Subscribe to `game:{lobbyId}`, broadcast `game_start` / `game_state`, send `action`. Host subscribes and on `action` applies and broadcasts.
2. **OnlineGameContext** — Hold `lobbyId`, `myPlayerIndex`, `isHost`, and “set state from game_start/game_state”. GameWrapper subscribes when in online lobby and receives game_start.
3. **useGameState** — Add `setStateFromRemote(state)` so Realtime can push state. When in online mode, handlers: host = apply + broadcast; non-host = send action only.
4. **LobbyScreen** — When host starts (with sync): create state, broadcast `game_start`, then subscription receives it and we transition to game (set state + online info).
5. **GameWrapper / GameScreen** — When in online game, use `myPlayerIndex` so “your hand” and “current turn” are correct; only enable actions for the current player.

## Security note

- Host is trusted: they run the engine and broadcast state. A cheating host could alter state (we don’t have server-side validation yet). Acceptable for a friendly game; later an Edge Function could validate actions.
