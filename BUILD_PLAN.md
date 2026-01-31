# Heroes & Wizards — Build Plan

A phased plan to build the web app, starting with game logic and testing, then adding online play with lobbies (inspired by [Secret Hitler Online](https://secret-hitler.online/)).

---

## 1. Tech stack (recommended)

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | React (or Next.js) | Component model fits cards, hands, parties, and turn-based UI. Next.js optional for SSR/SEO and API routes. |
| **State** | React state + context, or Zustand | Game state is central (deck, hands, parties, turn). Keep it simple at first; add a store if it grows. |
| **Multiplayer (later)** | WebSockets (Socket.io) or Supabase Realtime | Secret Hitler Online uses WebSockets for sync. Supabase gives auth + realtime if you want a managed backend. |
| **Backend (later)** | Node + Express, or Next API routes + Supabase | Host game rooms, validate moves, persist if needed. |
| **Styling** | CSS Modules or Tailwind | Card layout, responsive tables, lobby layout similar to the reference screenshot. |

You can start with **React + Vite** (or Create React App), no backend, and add multiplayer in a later phase.

---

## 2. Phases overview

| Phase | Focus | Outcome |
|-------|--------|--------|
| **1** | Data + rules engine | Deck, cards, players, game state; all rules in one place; testable. |
| **2** | Single-player / local UI | Play alone or hot-seat (same device); full game loop; win/lose. |
| **3** | Polish + edge cases | Wizards, “Giant Eagles”, dump rules, steal/swap behavior. |
| **4** | Multiplayer + lobby | Create/join lobby, names, sync state over WebSockets (or similar). |

Lobby (create game, join with friends) is **Phase 4** so you can validate and test the game in Phase 1–3 first.

---

## 3. Phase 1 — Data model and rules engine

### 3.1 Card data

- **Single source of truth**: one JSON (or TS) file that defines all 72 cards.
- Each card has:
  - `id`, `name`, `type` (`hero` | `wizard` | `event` | `quest`)
  - For heroes: `heroType` (Knight, Archer, Barbarian, Thief), `skills` (e.g. `['Strong','Strong','Magic']`), `image`
  - For wizards: `wizardType` (Healer, Spellcaster, Stargazer, Summoner), `ability` text, `image`
  - For events: `eventId` (e.g. `archery_contest`), `effect` description, `image`
  - For quests: `questId`, `image` (and any quest-specific data)

Map each card definition to the correct image in `/cards` (including handling duplicates like `event_royal_invitation (2).png` by picking one canonical filename).

### 3.2 Game state (single object)

- **Deck**: array of card IDs (or refs) — shuffled at setup.
- **Event pile**: array of card IDs (face-up, order matters if needed).
- **Players**: array of:
  - `id`, `name`
  - `hand`: card IDs (private).
  - `party`: one slot per hero type + one per wizard type; each slot is a card ID or null.
- **Current turn**: `playerIndex`, `phase` (e.g. `chooseAction` | `resolvingEvent`).
- **First player index** (for turn order).
- **Winner**: `playerId` or null.
- **Options**: `canDraw`, `canDump`, list of playable card IDs (for current player).

Derive “can play Quest” and “6 matching skills” from `players[current].party` + card data.

### 3.3 Rules engine (pure functions)

Implement in a dedicated module (e.g. `gameLogic/` or `engine/`):

1. **Setup**
   - `createGame(playerNames: string[])` → initial state: shuffle deck, deal 3 per player, set first player.

2. **Actions**
   - `drawCard(state)` → new state (top card from deck to current player’s hand; advance turn).
   - `playCard(state, cardId)` → new state (depending on card type: add to party, push to event pile + run effect, or quest/win).
   - `dumpCard(state, cardId)` → new state (card to event pile; advance turn).

3. **Validation**
   - `getLegalActions(state)` → { canDraw, canDump, playableCardIds }.
   - `canPlayQuest(state, playerIndex)` → boolean (6+ matching skills, considering Wizard Spellcaster “only need 5”).
   - Enforce: max 5 cards in hand for draw; no dump for event cards; one action per turn.

4. **Event resolution**
   - For each event type, one function: e.g. `resolveArcheryContest(state, targetPlayerId)` → new state (swap Archer with target).
   - “Giant Eagles Arrive”: only legal when deck is empty; playing it sets winner.

5. **Wizard abilities**
   - Applied when evaluating rules: e.g. Healer blocks steals from your party; Spellcaster changes quest threshold to 5; Stargazer grants extra play (implement as a “second card play” flag or similar).

Keep the engine **stateless**: state in → new state out. No DOM or I/O inside. This makes unit testing and later multiplayer sync straightforward.

### 3.4 Testing Phase 1

- Unit tests: `createGame`, `getLegalActions`, `canPlayQuest`, each event resolver, wizard modifiers.
- Scenario tests: e.g. “Player has 6 Magic, plays Quest → wins”; “Archery Contest swaps correct hero”.
- You can run the whole game in Node or a minimal React shell that just calls the engine and logs state.

---

## 4. Phase 2 — Single-player / local UI

### 4.1 Screens

- **Game screen**: table area (deck, event pile), each player’s party (face-up), your hand (face-up for single player), current turn indicator, action buttons (Draw / Play / Dump).
- **Simple start screen**: “New game”, number of players (2–5), names (or “Player 1”, “Player 2”…). Start → `createGame` and go to game screen.

### 4.2 Components (suggested)

- **Card**: renders one card (image + optional overlay for skills/type). Receives `cardId` and looks up from card data + image map.
- **Hand**: list of Cards for one player (click to select for play/dump).
- **Party**: 4 hero slots + 4 wizard slots; each slot shows one Card or empty.
- **Deck** and **Event pile**: visual representation (count, top card or back).
- **Action bar**: Draw (if legal), list of playable cards (or “Play selected”), Dump (if legal and card selected).
- **Turn / win banner**: “Player 2’s turn” or “Player 1 wins!”

### 4.3 Flow

1. User picks “Play card” and selects a card from hand.
2. If Event: optionally choose target player/card (e.g. for Hunting Expedition, Archery Contest); then run `playCard(state, cardId, target?)` and update state.
3. If Hero/Wizard: `playCard` updates party (and hand if swap).
4. If Quest: check `canPlayQuest`; if true, `playCard` sets winner and show win screen.
5. After each action, recompute `getLegalActions` and re-render.

Use the same state shape as Phase 1 so the UI is a thin layer over the engine.

### 4.4 Hot-seat

For 2–5 local players, after each action you can either:
- Switch “active” player manually (e.g. “Next player” button), or
- Enforce turn order: after Draw/Play/Dump, advance `currentTurn` to next player and show “Player X’s turn”.

No network yet; state lives in React (or a single store).

---

## 5. Phase 3 — Polish and edge cases

- **Wizard Healer**: when resolving a “steal from party” event, if target party has Healer, skip that steal (or disallow target).
- **Wizard Spellcaster**: when computing “can play Quest”, if party has Spellcaster, require 5 matching skills instead of 6.
- **Wizard Stargazer**: after playing one card, allow a second card play in the same turn (state flag + UI).
- **Wizard Summoner**: “draw any one card from the event pile” — add action “Summoner: take from event pile” and resolve in engine.
- **Giant Eagles Arrive**: only in `getLegalActions` when `deck.length === 0`; play = win.
- **Dump**: never allow dumping event cards; only to event pile; counts as full turn.
- **Feast East/West**: rotate all hands left/right; update state in one step.
- **Fortune Reading**: UI “peek” at other hands (no state change).
- **Hunting Expedition**: choose player, then choose one card from their hand → to your hand.

Add tests for each of these so regressions don’t slip in when you add multiplayer.

---

## 6. Phase 4 — Multiplayer and lobby (Secret Hitler–style)

### 6.1 Lobby flow (like your screenshot)

- **Join a game**: input “Lobby” (room code or name), “Your name” → join existing room.
- **Create a lobby**: input “Your name” → create room, get shareable lobby name/code; wait for others to join.

So you need:

- **Lobby state**: roomId, host, list of players (name, id), “ready” or “start” when everyone is in.
- **Game start**: when host (or all) start, run `createGame(playerNames)` and broadcast initial state to all clients.

### 6.2 Sync model

- **Authority**: one server (or “host” client) holds canonical state. All moves (draw, play, dump, event targets) sent as **actions** (e.g. `{ type: 'playCard', cardId, target? }`).
- Server (or host) runs the same Phase 1 engine: `playCard(state, cardId, target)` etc., then broadcasts new state (or delta) to all clients.
- Clients render from state; only the current player can send actions (enforced by server).

### 6.3 Backend options

- **Option A — Node + Socket.io**: custom server; full control; you sync state and lobby logic yourself.
- **Option B — Supabase**: auth, “rooms” table, Realtime channels; clients send actions, one “game state” row or document updated by a trusted client or Edge Function.
- **Option C — Secret Hitler Open Source**: review their [GitHub](https://github.com/secret-hitler) (if available) for lobby and sync patterns, then reimplement for Heroes & Wizards.

### 6.4 Security and fairness

- Validate every action on the server (or host): legal move, correct turn, no cheating.
- Don’t trust client-held “private” state for other players’ hands; server sends each client only their own hand and public state (parties, deck count, event pile).

---

## 7. File structure (suggested)

```
heroes_wizards/
├── BUILD_PLAN.md           # this file
├── Deck Library and Rules.md
├── cards/                  # existing card images
├── public/
├── src/
│   ├── data/
│   │   ├── cards.ts        # all 72 cards + image paths
│   │   └── constants.ts
│   ├── engine/
│   │   ├── state.ts        # types for GameState, Player, etc.
│   │   ├── setup.ts        # createGame, shuffle, deal
│   │   ├── actions.ts      # draw, play, dump
│   │   ├── validation.ts   # getLegalActions, canPlayQuest
│   │   ├── events.ts       # resolve Archery Contest, Feast, etc.
│   │   └── wizards.ts      # apply Healer, Spellcaster, etc.
│   ├── components/
│   │   ├── Card.tsx
│   │   ├── Hand.tsx
│   │   ├── Party.tsx
│   │   ├── Deck.tsx
│   │   ├── EventPile.tsx
│   │   ├── ActionBar.tsx
│   │   └── ...
│   ├── screens/
│   │   ├── StartScreen.tsx
│   │   ├── GameScreen.tsx
│   │   └── LobbyScreen.tsx  # Phase 4
│   ├── hooks/
│   │   └── useGameState.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── engine/
│       ├── setup.test.ts
│       ├── actions.test.ts
│       └── events.test.ts
└── package.json
```

---

## 8. Order of implementation (checklist)

- [ ] **1.1** Card data: `cards.ts` (and image mapping) for all 72 cards.
- [ ] **1.2** State types: `GameState`, `Player`, `Party`, etc.
- [ ] **1.3** Setup: shuffle, deal 3, first player.
- [ ] **1.4** Validation: `getLegalActions`, `canPlayQuest` (with Spellcaster).
- [ ] **1.5** Actions: `drawCard`, `playCard`, `dumpCard` (skeleton; play delegates to event/hero/wizard/quest).
- [ ] **1.6** Event resolvers: one by one (Archery, Feast, Fortune, Hunting, Royal, Spell of Summoning, Tavern, Eagles, Unguarded, Wizard Tower).
- [ ] **1.7** Wizard rules: Healer, Spellcaster, Stargazer, Summoner in validation and resolution.
- [ ] **1.8** Tests for engine (setup, actions, events, wizards, win conditions).
- [ ] **2.1** React app shell: start screen → game screen.
- [ ] **2.2** Card, Hand, Party, Deck, EventPile components.
- [ ] **2.3** Action bar and turn flow; connect to engine.
- [ ] **2.4** Event UI: target selection (player/card) where needed.
- [ ] **2.5** Win screen and “New game”.
- [ ] **3.x** Polish: all wizard and edge cases; manual testing.
- [ ] **4.1** Lobby UI: Create Lobby / Join Game (like screenshot).
- [ ] **4.2** Backend: rooms, join/create, start game.
- [ ] **4.3** Sync: send actions, run on server, broadcast state.
- [ ] **4.4** Hide other players’ hands; show only own hand and public state.

---

## 9. Summary

- **Phase 1**: Data + rules engine in one place, testable, no UI.  
- **Phase 2**: Local/hot-seat UI driven entirely by that engine.  
- **Phase 3**: Wizard and edge-case polish.  
- **Phase 4**: Lobby (create/join) and multiplayer sync, reusing the same engine on the server (or host).

Starting with the engine and delaying the lobby is the right order: you can play and test the full game locally before touching networking. If you tell me your preferred stack (e.g. “React + Vite”, “Next.js”, “TypeScript only for now”), the next step is to sketch **Phase 1.1–1.4** (card data, state types, setup, validation) in code.
