# Heroes & Wizards — Build Plan

A phased plan to build the web app, starting with game logic and testing, then adding online play with lobbies (inspired by [Secret Hitler Online](https://secret-hitler.online/)).

---

## Progress (what we've done)

| Done | Item |
|------|------|
| ✅ | **Tech stack**: React + Next.js (App Router), TypeScript, Jest. Git + `.gitignore` set up. |
| ✅ | **1.1** Card data: `src/data/cards.ts` — all 72 cards with image paths; `constants.ts`, `types.ts`. |
| ✅ | **1.2** State types: `src/engine/state.ts` — `GameState`, `Player`, `Party`, `CardId`, `createEmptyParty()`. |
| ✅ | **1.3** Setup: `src/engine/setup.ts` — `createShuffledDeck()`, `createGame(playerNames)` (shuffle, deal 3, first player). |
| ✅ | **1.4** Validation: `src/engine/validation.ts` — `getLegalActions()`, `canPlayQuest()`, `canPlayEagles()` (Spellcaster = 5 skills). |
| ⚠️ | **1.8** (partial) Tests: `tests/engine/setup.test.ts`, `validation.test.ts`, `actions.test.ts`, `events.test.ts` for core engine. **Note**: Jest dependencies currently broken; tests need fixing and expansion. |
| ✅ | **Assets**: `public/` and `public/cards/` created; card images added to `public/cards/`. |
| ✅ | **App shell**: Next.js `src/app/layout.tsx`, `page.tsx`, `globals.css`; placeholder home page. |
| ✅ | **1.5** Actions: `src/engine/actions.ts` — `drawCard()`, `playCard()`, `dumpCard()`, `passTurn()`, `summonFromEventPile()`, `playerLeft()`, `playerReconnected()`. |
| ✅ | **1.6** Event resolvers: `src/engine/events.ts` — Archery, Royal, Tavern, Unguarded (swap + Healer block), Feast East/West, Fortune Reading, Hunting Expedition, Spell of Summoning, Wizard Tower Repairs, Eagles. |
| ✅ | **1.7** Wizard rules: Stargazer (maybeAdvanceTurn — second card play); Summoner (canSummonFromPile, summonFromEventPile). Healer/Spellcaster already in 1.4/1.6. |
| ✅ | **2.1–2.5** Phase 2 UI: StartScreen, GameScreen, WinScreen; Card, Hand, Party, Deck, EventPile, ActionBar, TargetSelector; useGameState; event target flow. |
| ✅ | **3.x Polish**: Table layout (active player bottom, rotation); leave-game confirmation (LeaveGameContext, logo + footer Start Screen link); TargetSelector stacked list, hints (hero/wizard/cards), Play with No Effect; card images (Morvin, Jaspar, Lola); Fortune Reading click-to-zoom; Spell of Summoning wizard-swap fix; confetti on victory; typography (Londrina Solid), style guide, background, footer. |
| ✅ | **4.1–4.4** Phase 4 multiplayer: Supabase integration (`lib/supabase.ts`), lobby system (`LobbyContext`, `LobbyScreen`), online game sync (`OnlineGameContext`, `lib/gameSync.ts`), host-authoritative model, real-time state broadcast, action sending, player leave/reconnect, host migration, session persistence. |
| ⬜ | **Next**: Fix Jest dependencies and expand test coverage; add missing edge-case tests; consider UI component tests. |

### Where we're at (current phase)

- **Phase 1 (engine)** — ✅ Complete. All cards, state, setup, validation, actions, event resolvers, and wizard rules (Healer blocks hero steals only; Spell of Summoning swaps wizards; Stargazer second play; Summoner from event pile; Draw disabled when deck empty; Dump disabled during Stargazer second play; Pass only after action or when hand+deck empty).
- **Phase 2 (local UI)** — ✅ Complete. Start → Game → Win flow; Card, Hand, Party (single Wizard slot), Deck, EventPile, ActionBar; Draw/Play/Dump/Pass Turn with correct hints; TargetSelector for all events with stacked player list, hints (Has/No hero or wizard, cards in hand, Healer protected), and "Play with No Effect" when no valid target; Hunting Expedition select → double-click zoom → OK confirm; card zoom in play area and Fortune Reading modal; Win screen with confetti.
- **Phase 3 (polish)** — ✅ Complete. Healer/Spellcaster/Stargazer/Summoner, Giant Eagles, dump rules, Feasts, Fortune Reading, Hunting Expedition, event-blocked notification, empty hand+deck Pass, table rotation, leave-game modal, target hints, Play with No Effect, card image paths, Spell of Summoning fix, victory styling.
- **Phase 4 (multiplayer)** — ✅ Complete. Supabase-backed lobby (create/join with shareable code, real-time player list), online game sync (host-authoritative, broadcast state, action sending), player management (leave/reconnect, host migration), session persistence (reconnect after refresh), status notifications. See **PHASE4_GAME_SYNC.md** for sync model details.

---

## 1. Tech stack (recommended)

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | React (or Next.js) | Component model fits cards, hands, parties, and turn-based UI. Next.js optional for SSR/SEO and API routes. |
| **State** | React state + context, or Zustand | Game state is central (deck, hands, parties, turn). Keep it simple at first; add a store if it grows. |
| **Multiplayer** | Supabase Realtime | Supabase gives auth + realtime channels. Easier than rolling your own WebSocket server. |
| **Backend** | Supabase | Tables for lobbies, Realtime for sync, Edge Functions for cron/cleanup. |
| **Styling** | CSS Modules or Tailwind | Card layout, responsive tables, lobby layout similar to the reference screenshot. |

**Chosen stack:** React + Next.js (App Router), TypeScript, Supabase Realtime, CSS.

---

## 2. Phases overview

| Phase | Focus | Outcome |
|-------|--------|--------|
| **1** | Data + rules engine | Deck, cards, players, game state; all rules in one place; testable. |
| **2** | Single-player / local UI | Play alone or hot-seat (same device); full game loop; win/lose. |
| **3** | Polish + edge cases | Wizards, "Giant Eagles", dump rules, steal/swap behavior. |
| **4** | Multiplayer + lobby | Create/join lobby, names, sync state over Supabase Realtime. |

**All phases complete!** Next: testing and polish.

---

## 3. Phase 1 — Data model and rules engine ✅ COMPLETE

### 3.1 Card data
- **Single source of truth**: one TS file that defines all 72 cards.
- Each card has:
  - `id`, `name`, `type` (`hero` | `wizard` | `event` | `quest`)
  - For heroes: `heroType` (Knight, Archer, Barbarian, Thief), `skills` (e.g. `['Strong','Strong','Magic']`), `image`
  - For wizards: `wizardType` (Healer, Spellcaster, Stargazer, Summoner), `ability` text, `image`
  - For events: `eventId` (e.g. `archery_contest`), `effect` description, `image`
  - For quests: `questId`, `image` (and any quest-specific data)

Map each card definition to the correct image in `/cards`.

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

Derive "can play Quest" and "6 matching skills" from `players[current].party` + card data.

### 3.3 Rules engine (pure functions)
Implement in a dedicated module (e.g. `gameLogic/` or `engine/`):

1. **Setup**
   - `createGame(playerNames: string[])` → initial state: shuffle deck, deal 3 per player, set first player.

2. **Actions**
   - `drawCard(state)` → new state (top card from deck to current player's hand; advance turn).
   - `playCard(state, cardId)` → new state (depending on card type: add to party, push to event pile + run effect, or quest/win).
   - `dumpCard(state, cardId)` → new state (card to event pile; advance turn).

3. **Validation**
   - `getLegalActions(state)` → { canDraw, canDump, playableCardIds }.
   - `canPlayQuest(state, playerIndex)` → boolean (6+ matching skills, considering Wizard Spellcaster "only need 5").
   - Enforce: max 5 cards in hand for draw; no dump for event cards; one action per turn.

4. **Event resolution**
   - For each event type, one function: e.g. `resolveArcheryContest(state, targetPlayerId)` → new state (swap Archer with target).
   - "Giant Eagles Arrive": only legal when deck is empty; playing it sets winner.

5. **Wizard abilities**
   - Applied when evaluating rules: e.g. Healer blocks steals from your party; Spellcaster changes quest threshold to 5; Stargazer grants extra play (implement as a "second card play" flag or similar).

Keep the engine **stateless**: state in → new state out. No DOM or I/O inside. This makes unit testing and later multiplayer sync straightforward.

### 3.4 Testing Phase 1
- Unit tests: `createGame`, `getLegalActions`, `canPlayQuest`, each event resolver, wizard modifiers.
- Scenario tests: e.g. "Player has 6 Magic, plays Quest → wins"; "Archery Contest swaps correct hero".
- You can run the whole game in Node or a minimal React shell that just calls the engine and logs state.

---

## 4. Phase 2 — Single-player / local UI ✅ COMPLETE

### 4.1 Screens
- **Game screen**: table area (deck, event pile), each player's party (face-up), your hand (face-up for single player), current turn indicator, action buttons (Draw / Play / Dump).
- **Simple start screen**: "New game", number of players (2–5), names (or "Player 1", "Player 2"…). Start → `createGame` and go to game screen.

### 4.2 Components (suggested)
- **Card**: renders one card (image + optional overlay for skills/type). Receives `cardId` and looks up from card data + image map.
- **Hand**: list of Cards for one player (click to select for play/dump).
- **Party**: 4 hero slots + 1 wizard slot; each slot shows one Card or empty.
- **Deck** and **Event pile**: visual representation (count, top card or back).
- **Action bar**: Draw (if legal), list of playable cards (or "Play selected"), Dump (if legal and card selected).
- **Turn / win banner**: "Player 2's turn" or "Player 1 wins!"

### 4.3 Flow
1. User picks "Play card" and selects a card from hand.
2. If Event: optionally choose target player/card (e.g. for Hunting Expedition, Archery Contest); then run `playCard(state, cardId, target?)` and update state.
3. If Hero/Wizard: `playCard` updates party (and hand if swap).
4. If Quest: check `canPlayQuest`; if true, `playCard` sets winner and show win screen.
5. After each action, recompute `getLegalActions` and re-render.

Use the same state shape as Phase 1 so the UI is a thin layer over the engine.

### 4.4 Hot-seat
For 2–5 local players, after each action you can either:
- Switch "active" player manually (e.g. "Next player" button), or
- Enforce turn order: after Draw/Play/Dump, advance `currentTurn` to next player and show "Player X's turn".

No network yet; state lives in React (or a single store).

---

## 5. Phase 3 — Polish and edge cases ✅ COMPLETE

- **Wizard Healer**: when resolving a "steal from party" event, if target party has Healer, skip that steal (or disallow target).
- **Wizard Spellcaster**: when computing "can play Quest", if party has Spellcaster, require 5 matching skills instead of 6.
- **Wizard Stargazer**: after playing one card, allow a second card play in the same turn (state flag + UI).
- **Wizard Summoner**: "draw any one card from the event pile" — add action "Summoner: take from event pile" and resolve in engine.
- **Giant Eagles Arrive**: only in `getLegalActions` when `deck.length === 0`; play = win.
- **Dump**: never allow dumping event cards; only to event pile; counts as full turn.
- **Feast East/West**: rotate all hands left/right; update state in one step.
- **Fortune Reading**: UI "peek" at other hands (no state change).
- **Hunting Expedition**: choose player, then choose one card from their hand → to your hand.

Add tests for each of these so regressions don't slip in when you add multiplayer.

---

## 6. Phase 4 — Multiplayer and lobby ✅ COMPLETE

### 6.1 Lobby flow (implemented)

✅ **Fully functional online multiplayer lobby:**

- **Join a game**: Input 4-letter lobby code and your name → join existing room via Supabase
- **Create a lobby**: Input your name → create room in Supabase, get shareable lobby code and invite link
- **Real-time updates**: All players see join/leave events via Supabase Realtime subscriptions on `lobby_players` table
- **Start game**: Host clicks "Start Game" → creates initial `GameState`, broadcasts `game_start` event to all clients

**Implementation:**
- `src/context/LobbyContext.tsx` — lobby state, create/join/leave, session persistence  
- `src/components/LobbyScreen.tsx` — UI for lobby (code, invite link, player list, start button)  
- `src/lib/lobby.ts` — Supabase functions for lobby operations  

### 6.2 Sync model (implemented)

✅ **Host-authoritative multiplayer with real-time sync:**

- **Authority**: Host client holds canonical state
- **Host** runs the Phase 1 engine, validates actions, broadcasts new state to channel
- **Non-host clients** send actions to channel; host receives, validates (correct turn, legal move), applies, and broadcasts new state
- **Reconnection**: Clients persist lobby info in sessionStorage; on reload, rejoin lobby and request current game state from host
- **Host migration**: If host leaves, first active player becomes new host and takes over state authority
- **Player leave/disconnect**: `playerLeft` action marks player as left or disconnected; left players' turns are skipped; disconnected players can rejoin

**Implementation:**
- `src/context/OnlineGameContext.tsx` — game state, player order, host flag, action handlers  
- `src/lib/gameSync.ts` — Supabase Realtime channel subscriptions, broadcast functions, action types  
- `src/engine/actions.ts` — `playerLeft()`, `playerReconnected()` engine functions  
- `src/engine/events.ts` — `getActivePlayerIndices()` to skip left/disconnected players  

### 6.3 Backend (Supabase — chosen and implemented)

✅ **Supabase backend fully configured:**

- **Tables**: `lobbies` (lobby code, host name, status), `lobby_players` (who's in each lobby)
- **Realtime**: `lobby_players` table has Realtime enabled for join/leave updates; game state synced via broadcast channel (no DB persistence)
- **RLS**: Row-level security policies allow anonymous read/insert/delete (no auth required)
- **Cleanup**: Cron job at `/api/cron/cleanup-lobbies` deletes lobbies older than 2 hours

**Setup instructions**: See `SUPABASE_SETUP.md`.

### 6.4 Security and fairness

✅ **Implemented with known limitations:**

- **Host validation**: Host checks `action.fromPlayerIndex === currentPlayerIndex` before applying
- **Hand privacy**: Each client only sees their own hand (from their player index); other players' hands are hidden in the UI
- **Known limitation**: Host is trusted—a cheating host could alter state. Acceptable for friendly games; future improvement: move validation to Supabase Edge Function for server-side authority

---

## 7. File structure

```
heroes_wizards/
├── BUILD_PLAN.md           # this file
├── PHASE4_GAME_SYNC.md     # ✅ multiplayer sync model details
├── STYLE_GUIDE.md          # ✅ color palette and typography reference
├── SUPABASE_SETUP.md       # ✅ Supabase setup instructions
├── DESIGN_NOTES.md         # ✅ brand & tone reference
├── Deck Library and Rules.md
├── cards/                  # source card images (copy into public/cards)
├── public/
│   ├── cards/              # ✅ card images (served at /cards/...)
│   └── images/             # ✅ site artwork (logo, divider, background)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/cron/cleanup-lobbies/
│   │   │   └── route.ts    # ✅ Lobby cleanup cron endpoint
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── how-to-play/page.tsx
│   │   ├── disclaimer/page.tsx
│   │   ├── GameWrapper.tsx # ✅ Mode selection (local vs online)
│   │   └── globals.css
│   ├── data/
│   │   ├── cards.ts        # ✅ all 72 cards + image paths
│   │   ├── constants.ts    # ✅
│   │   └── types.ts        # ✅
│   ├── engine/
│   │   ├── state.ts        # ✅ GameState, Player, Party
│   │   ├── setup.ts        # ✅ createGame, shuffle, deal
│   │   ├── validation.ts   # ✅ getLegalActions, canPlayQuest
│   │   ├── index.ts        # ✅
│   │   ├── actions.ts      # ✅ drawCard, playCard, dumpCard, passTurn, playerLeft, playerReconnected, summonFromEventPile
│   │   └── events.ts       # ✅ full event resolvers + getActivePlayerIndices
│   ├── lib/                # ✅ Multiplayer infrastructure
│   │   ├── supabase.ts     # ✅ Supabase client initialization
│   │   ├── lobby.ts        # ✅ Lobby operations (create, join, leave, subscribe)
│   │   └── gameSync.ts     # ✅ Game state sync via Realtime broadcast
│   ├── components/         # ✅ Card, Hand, Party, Deck, EventPile, ActionBar, TargetSelector, StartScreen, GameScreen, WinScreen, LobbyScreen, OnlineSetupScreen, OnlineStatusNotification, Confetti, FortuneReadingModal, CardZoomModal, GameLogo, Footer, PlayerAvatarIcon, EventBlockedNotification
│   ├── context/            # ✅ LeaveGameContext, LobbyContext, OnlineGameContext
│   ├── hooks/              # ✅ useGameState
│   └── utils/              # ✅ eventTargets, themedNames
├── tests/
│   └── engine/
│       ├── setup.test.ts   # ✅
│       ├── validation.test.ts  # ✅
│       ├── actions.test.ts # ✅
│       └── events.test.ts  # ✅
└── package.json
```

---

## 8. Order of implementation (checklist)

### Phase 1: Game Engine
- [x] **1.1** Card data: `cards.ts` (and image mapping) for all 72 cards.
- [x] **1.2** State types: `GameState`, `Player`, `Party`, etc.
- [x] **1.3** Setup: shuffle, deal 3, first player.
- [x] **1.4** Validation: `getLegalActions`, `canPlayQuest` (with Spellcaster).
- [x] **1.5** Actions: `drawCard`, `playCard`, `dumpCard`, `passTurn`, `summonFromEventPile`, `playerLeft`, `playerReconnected`.
- [x] **1.6** Event resolvers: one by one (Archery, Feast, Fortune, Hunting, Royal, Spell of Summoning, Tavern, Eagles, Unguarded, Wizard Tower).
- [x] **1.7** Wizard rules: Healer (1.6), Spellcaster (1.4), Stargazer (maybeAdvanceTurn), Summoner (summonFromEventPile).
- [x] **1.8** Tests for engine: setup ✅, validation ✅, actions ✅, events ✅. **⚠️ Jest dependencies broken; tests need fixing and expansion for edge cases.**

### Phase 2: Local UI
- [x] **2.1** Next.js app: layout, page; StartScreen, GameScreen, WinScreen.
- [x] **2.2** Card, Hand, Party, Deck, EventPile; card zoom (play area, Fortune Reading, Hunting Expedition double-click).
- [x] **2.3** Action bar and turn flow: Draw/Play/Dump/Pass Turn; hints; Pass disabled until action or no options.
- [x] **2.4** Event UI: TargetSelector (player; Hunting Expedition select + double-click zoom + OK confirm).
- [x] **2.5** Win screen with confetti; New game; Fortune Reading modal with zoom.

### Phase 3: Polish
- [x] **3.x** Polish: Healer (hero-only), Spellcaster, Stargazer, Summoner, Eagles, dump rules, Feasts, Fortune Reading, Hunting Expedition; event-blocked notification; empty hand+deck → Pass. Table layout (active bottom, rotation); leave-game modal (LeaveGameContext, logo + footer Start Screen link); target selector stacked list, hints, Play with No Effect; Stargazer no Dump; empty deck no Draw; card images (Morvin, Jaspar, Lola); Fortune Reading click-to-zoom; Spell of Summoning fix; confetti on victory; typography (Londrina Solid); style guide; background; footer.

### Phase 4: Multiplayer
- [x] **4.1** Lobby UI: `LobbyScreen`, `OnlineSetupScreen` — Create Lobby / Join Game with shareable code and invite link.
- [x] **4.2** Backend: Supabase tables (`lobbies`, `lobby_players`), lobby operations (`lib/lobby.ts`), Realtime subscriptions for player list.
- [x] **4.3** Sync: Game channel (`lib/gameSync.ts`), host-authoritative model, action sending from clients, state broadcast from host, `OnlineGameContext`.
- [x] **4.4** Player management: Hide other players' hands (each client sees only their own hand); player leave/disconnect/reconnect; host migration; session persistence.
- [x] **4.5** Polish: Status notifications (player left, new host), cleanup cron job, reconnection flow, GameWrapper mode selection.

### Next Steps
- [ ] **Testing**: Fix Jest dependencies, expand test coverage for edge cases, add multiplayer sync tests.
- [ ] **Documentation**: Update README with online play instructions, add troubleshooting guide.
- [ ] **Future enhancements**: Game statistics, spectator mode, chat, mobile responsive improvements, animations, sound effects.

---

## 9. Summary

- **Phase 1**: ✅ Data + rules engine in one place, testable, no UI.  
- **Phase 2**: ✅ Local/hot-seat UI driven entirely by that engine.  
- **Phase 3**: ✅ Wizard and edge-case polish.  
- **Phase 4**: ✅ Lobby (create/join) and multiplayer sync, reusing the same engine on the host client.

**All phases complete!** You can play locally (hot-seat) or online (create/join lobby via Supabase). The game engine is fully functional with all cards, events, and wizard abilities. The multiplayer system uses a host-authoritative model with real-time state sync via Supabase Realtime.

**Next priorities:**
1. **Fix Jest dependencies** (currently broken—`npm test` fails with module errors)
2. **Expand test coverage** for edge cases, wizard abilities, win conditions
3. **Update README** with online play setup instructions
4. **Consider future enhancements**: statistics, spectator mode, chat, better mobile support, animations, sound
