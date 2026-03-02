# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Heroes & Wizards is a fan-made web app for playing the card game "Heroes & Wizards" in the browser. Built with Next.js 14 (App Router) and deployed on Vercel. Supports local hot-seat play (2-5 players, same device) and online multiplayer via Supabase Realtime.

## Commands

```bash
npm run dev        # Start dev server at localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npm test           # Jest (tests in tests/engine/) — currently has dependency issues
npm run test:watch # Jest watch mode
npx jest tests/engine/actions.test.ts  # Run a single test file
```

## Architecture

### Engine/UI Separation

The core pattern: **pure game logic in `src/engine/`** is completely decoupled from React. Engine functions are pure transformations: `(state) → newState`. Never mutate state — always return new objects via spread/map/filter.

- `src/engine/state.ts` — `GameState`, `Player`, `Party` types
- `src/engine/setup.ts` — `createGame()`, deck shuffling
- `src/engine/validation.ts` — `getLegalActions()`, `canPlayQuest()`
- `src/engine/actions.ts` — `drawCard`, `playCard`, `dumpCard`, `passTurn`
- `src/engine/events.ts` — event card resolution (steal, swap, feast, etc.)
- `src/engine/index.ts` — barrel export; import engine functions via `@/engine`

### Data Layer

`src/data/cards.ts` defines all 72 cards. `src/data/types.ts` has card type definitions with type guards (`isHeroCard`, `isWizardCard`, etc.). `src/data/constants.ts` has game constants.

### State Management

- **Local play:** `src/hooks/useGameState.ts` hook wraps engine calls in React state
- **Online play:** Three React contexts in `src/context/`:
  - `LobbyContext` — lobby creation/joining, player list sync
  - `OnlineGameContext` — host-authoritative game sync
  - `LeaveGameContext` — leave game confirmation

### Multiplayer (Supabase Realtime)

Host-authoritative model in `src/lib/gameSync.ts`:
- Host applies actions locally and broadcasts state
- Clients send action requests, wait for host broadcast
- Channel: `game:{lobbyId}` broadcast
- Features: host migration, disconnect detection (3-min grace), session reconnection, presence tracking

### Component Hierarchy

```
GameWrapper → StartScreen | LobbyScreen | GameScreen | WinScreen
GameScreen → Deck, EventPile, Party, Hand, ActionBar, [Modals]
```

Components are presentation-only — callbacks like `onDraw`, `onPlayCard` etc. delegate to engine logic.

## Conventions

- **Imports:** Use `@/*` path alias for all `src/` imports
- **Components:** PascalCase files. Props use explicit interfaces.
- **Utils/lib:** camelCase files
- **Strict TypeScript** — no `any` in engine code, type guards for card discrimination
- **Engine functions never throw** — return unchanged state on invalid input

### Deployment

Hosted on Vercel. `vercel.json` configures two cron jobs: daily lobby cleanup (`/api/cron/cleanup-lobbies`) and a heartbeat every 3 days (`/api/cron/heartbeat`). Both are API route handlers in `src/app/api/cron/`.

## Environment Variables

For online multiplayer, copy `.env.local.example` → `.env.local` and set Supabase keys. See `SUPABASE_SETUP.md` for table creation SQL.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # optional, for cron cleanup
CRON_SECRET                 # optional, for cron cleanup
```
