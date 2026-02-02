# Heroes & Wizards — Build Plan

A phased plan to build the web app, starting with game logic and testing, then adding online play with lobbies (inspired by [Secret Hitler Online](https://secret-hitler.online/)).

---

## Progress (what we’ve done)

| Done | Item |
|------|------|
| ✅ | **Tech stack**: React + Next.js (App Router), TypeScript, Jest. Git + `.gitignore` set up. |
| ✅ | **1.1** Card data: `src/data/cards.ts` — all 72 cards with image paths; `constants.ts`, `types.ts`. |
| ✅ | **1.2** State types: `src/engine/state.ts` — `GameState`, `Player`, `Party`, `CardId`, `createEmptyParty()`. |
| ✅ | **1.3** Setup: `src/engine/setup.ts` — `createShuffledDeck()`, `createGame(playerNames)` (shuffle, deal 3, first player). |
| ✅ | **1.4** Validation: `src/engine/validation.ts` — `getLegalActions()`, `canPlayQuest()`, `canPlayEagles()` (Spellcaster = 5 skills). |
| ✅ | **1.8** (partial) Tests: `tests/engine/setup.test.ts`, `validation.test.ts` for setup and validation. |
| ✅ | **Assets**: `public/` and `public/cards/` created; card images added to `public/cards/`. |
| ✅ | **App shell**: Next.js `src/app/layout.tsx`, `page.tsx`, `globals.css`; placeholder home page. |
| ✅ | **1.5** Actions: `src/engine/actions.ts` — `drawCard()`, `playCard()`, `dumpCard()`; `events.ts` stub (Eagles wins; others advance turn). |
| ✅ | **1.6** Event resolvers: `src/engine/events.ts` — Archery, Royal, Tavern, Unguarded (swap + Healer block), Feast East/West, Fortune Reading, Hunting Expedition, Spell of Summoning, Wizard Tower Repairs, Eagles. |
| ✅ | **1.7** Wizard rules: Stargazer (maybeAdvanceTurn — second card play); Summoner (canSummonFromPile, summonFromEventPile). Healer/Spellcaster already in 1.4/1.6. |
| ✅ | **2.1–2.5** Phase 2 UI: StartScreen, GameScreen, WinScreen; Card, Hand, Party, Deck, EventPile, ActionBar, TargetSelector; useGameState; event target flow. |
| ✅ | **3.x Polish**: Table layout (active player bottom, rotation); leave-game confirmation (LeaveGameContext, logo + footer Start Screen link); TargetSelector stacked list, hints (hero/wizard/cards), Play with No Effect; card images (Morvin, Jaspar, Lola); Fortune Reading click-to-zoom; Spell of Summoning wizard-swap fix; confetti on victory; typography (Londrina Solid), style guide, background, footer. |
| ⬜ | **Next**: More engine tests (1.8); Phase 4 (lobby + multiplayer) when ready. |

### Where we're at (current testing phase)

- **Phase 1 (engine)** — Complete. All cards, state, setup, validation, actions, event resolvers, and wizard rules (Healer blocks hero steals only; Spell of Summoning swaps wizards; Stargazer second play; Summoner from event pile; Draw disabled when deck empty; Dump disabled during Stargazer second play; Pass only after action or when hand+deck empty).
- **Phase 2 (local UI)** — Complete. Start → Game → Win flow; Card, Hand, Party (single Wizard slot), Deck, EventPile, ActionBar; Draw/Play/Dump/Pass Turn with correct hints; TargetSelector for all events with stacked player list, hints (Has/No hero or wizard, cards in hand, Healer protected), and "Play with No Effect" when no valid target; Hunting Expedition select → double-click zoom → OK confirm; card zoom in play area and Fortune Reading modal; Win screen with confetti.
- **Phase 3 (polish)** — Complete. Healer/Spellcaster/Stargazer/Summoner, Giant Eagles, dump rules, Feasts, Fortune Reading, Hunting Expedition, event-blocked notification, empty hand+deck Pass, table rotation, leave-game modal, target hints, Play with No Effect, card image paths, Spell of Summoning fix, victory styling. Manual testing in progress.
- **Phase 4 (multiplayer)** — Not started.

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
- **UI note (table rotation):** For local/hot-seat play, the table layout rotates so the active player is always at the bottom (with "left" and "right" players on physical left/right). For **online multiplayer**, rotation is not necessary—each player is on their own screen, so their party can stay in the active-player position even when it isn't their turn. When building Phase 4, use a non-rotating layout for remote players (e.g. show all parties in a fixed order per client).

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
├── STYLE_GUIDE.md          # ✅ color palette and typography reference
├── Deck Library and Rules.md
├── cards/                  # source card images (copy into public/cards)
├── public/
│   ├── cards/              # ✅ card images (served at /cards/...)
│   └── images/             # ✅ site artwork (logo, divider, background — see public/images/README.md)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
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
│   │   ├── actions.ts      # ✅ drawCard, playCard, dumpCard
│   │   ├── events.ts       # ✅ full event resolvers (1.6)
│   │   └── wizards.ts      # TODO (optional) wizard helpers
│   ├── components/         # ✅ Card, Hand, Party, Deck, EventPile, ActionBar, TargetSelector, StartScreen, GameScreen, WinScreen, Confetti, FortuneReadingModal, GameLogo, Footer
│   ├── context/            # ✅ LeaveGameContext (leave-game confirmation)
│   └── hooks/               # ✅ useGameState (and other hooks as needed)
├── tests/
│   └── engine/
│       ├── setup.test.ts   # ✅
│       └── validation.test.ts  # ✅
└── package.json
```

---

## 8. Order of implementation (checklist)

- [x] **1.1** Card data: `cards.ts` (and image mapping) for all 72 cards.
- [x] **1.2** State types: `GameState`, `Player`, `Party`, etc.
- [x] **1.3** Setup: shuffle, deal 3, first player.
- [x] **1.4** Validation: `getLegalActions`, `canPlayQuest` (with Spellcaster).
- [x] **1.5** Actions: `drawCard`, `playCard`, `dumpCard` (skeleton; play delegates to event/hero/wizard/quest).
- [x] **1.6** Event resolvers: one by one (Archery, Feast, Fortune, Hunting, Royal, Spell of Summoning, Tavern, Eagles, Unguarded, Wizard Tower).
- [x] **1.7** Wizard rules: Healer (1.6), Spellcaster (1.4), Stargazer (maybeAdvanceTurn), Summoner (summonFromEventPile).
- [ ] **1.8** Tests for engine (setup ✅, validation ✅; remaining: actions, events, wizards, win conditions).
- [x] **2.1** Next.js app: layout, page; StartScreen, GameScreen, WinScreen.
- [x] **2.2** Card, Hand, Party, Deck, EventPile; card zoom (play area, Fortune Reading, Hunting Expedition double-click).
- [x] **2.3** Action bar and turn flow: Draw/Play/Dump/Pass Turn; hints; Pass disabled until action or no options.
- [x] **2.4** Event UI: TargetSelector (player; Hunting Expedition select + double-click zoom + OK confirm).
- [x] **2.5** Win screen with confetti; New game; Fortune Reading modal with zoom.
- [x] **3.x** Polish: Healer (hero-only), Spellcaster, Stargazer, Summoner, Eagles, dump rules, Feasts, Fortune Reading, Hunting Expedition; event-blocked notification; empty hand+deck → Pass. Table layout (active bottom, rotation); leave-game modal (LeaveGameContext, logo + footer Start Screen link); target selector stacked list, hints, Play with No Effect; Stargazer no Dump; empty deck no Draw; card images (Morvin, Jaspar, Lola); Fortune Reading click-to-zoom; Spell of Summoning fix; confetti on victory; typography (Londrina Solid); style guide; background; footer.
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

Starting with the engine and delaying the lobby is the right order: you can play and test the full game locally before touching networking. **Phase 1–3 are complete** (engine, local UI, polish). Next: **more engine tests (1.8)** and **Phase 4** (lobby + multiplayer) when ready.
