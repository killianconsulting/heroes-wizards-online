# Heroes & Wizards — Chat Notes (Jan 29, 2025)

Notes saved from planning session for building the web app.

---

## Context

- **Goal**: Build a web app to play the card game **Heroes & Wizards** online with friends.
- **Inspiration**: [Secret Hitler Online](https://secret-hitler.online/) — lobby/create-join flow (screenshot referenced).
- **Assets**: Card images in `cards/`, full deck breakdown and rules in `Deck Library and Rules.md`.
- **Approach**: Build game logic first and test; delay multiplayer/lobby until core game works.

---

## Plan Created

A phased build plan was written to **BUILD_PLAN.md**. Summary:

| Phase | Focus | Outcome |
|-------|--------|--------|
| **1** | Data + rules engine | Deck, cards, players, game state; all rules in one place; testable. |
| **2** | Single-player / local UI | Play alone or hot-seat; full game loop; win/lose. |
| **3** | Polish + edge cases | Wizards, Giant Eagles, dump rules, steal/swap behavior. |
| **4** | Multiplayer + lobby | Create/join lobby, names, sync state (e.g. WebSockets or Supabase). |

---

## Key Decisions

- **Lobby (create/join)** is **Phase 4** so we can validate and test the game in Phases 1–3 first.
- **Tech**: React (e.g. Vite), optional Next.js; multiplayer later via WebSockets (Socket.io) or Supabase.
- **Engine**: Pure functions (state in → new state out), no UI in engine — makes testing and later sync straightforward.
- **Next step** (when ready): Implement Phase 1.1–1.4 — card data, `GameState` types, `createGame`, and `getLegalActions` / `canPlayQuest` — then wire Phase 2 UI to the engine.

---

## Files to Use

- **BUILD_PLAN.md** — Full phased plan, tech stack, file structure, checklist.
- **Deck Library and Rules.md** — All 72 cards and how the game is played.
- **cards/** — Card images (heroes, events, wizards, quests, back).

---

*Saved for later reference.*
