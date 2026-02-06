# Heroes & Wizards (digital fan version)

A **fan-made**, **non-commercial** web app to play the card game **Heroes & Wizards** in the browser. Built with React and Next.js. Supports **2–5 players** in local hot-seat play (same device) or **online multiplayer** (create/join lobbies with real-time sync via Supabase).

---

## ⚠️ Important: Fan project — no affiliation

- **This project is fan-made.** It is not an official product.
- **It is non-commercial.** No money is made from this project.
- **We are not affiliated with the original creators or publisher** of Heroes & Wizards. This project is not endorsed by, connected to, or sponsored by them.

**Official game and publisher:**

**[Heroes & Wizards — Jof Games](https://jofgames.com.au/heroes-and-wizards/)**

If you enjoy the game, please support the original: buy the physical card game from [Jof Games](https://jofgames.com.au/heroes-and-wizards/).

---

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Card images**  
   Copy the contents of the `cards/` folder (if you have it) into `public/cards/` so the app can serve them at `/cards/...`. If `public/cards/` is empty, card images will be missing but the game engine will still run.

3. **Supabase setup (for online multiplayer)**  
   - See `SUPABASE_SETUP.md` for detailed instructions
   - Create a Supabase project, set up tables, and add env vars to `.env.local`
   - Without Supabase: local/hot-seat mode only (one device, multiple players)
   - With Supabase: full online multiplayer (create/join lobbies, real-time sync)

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

5. **Run tests** (currently broken—Jest dependencies issue)
   ```bash
   npm test
   ```

## Project structure

- `src/data/` — Card definitions (72 cards), types, constants
- `src/engine/` — Game state, setup, validation, actions, event resolvers
- `src/lib/` — Multiplayer infrastructure (Supabase client, lobby operations, game sync)
- `src/app/` — Next.js App Router (layout, game wrapper, How to Play, Disclaimer, cron cleanup)
- `src/components/` — UI (Card, Hand, Party, Deck, EventPile, ActionBar, TargetSelector, StartScreen, GameScreen, WinScreen, LobbyScreen, etc.)
- `src/context/` — App-wide state (LeaveGameContext, LobbyContext, OnlineGameContext)
- `src/hooks/` — Custom React hooks (useGameState)
- `tests/engine/` — Unit tests for the engine (⚠️ currently broken—Jest dependency issues)
- `BUILD_PLAN.md` — Phased build plan (all phases complete)
- `SUPABASE_SETUP.md` — Online multiplayer setup instructions
- `PHASE4_GAME_SYNC.md` — Multiplayer sync model details
- `STYLE_GUIDE.md` — Color palette and typography reference
- `DESIGN_NOTES.md` — Brand & tone reference
- `Deck Library and Rules.md` — Card list and rules reference

## License

This project is for personal, educational, and non-commercial use. All rights to the game **Heroes & Wizards**, its name, and its content belong to the original publisher [Jof Games](https://jofgames.com.au/heroes-and-wizards/).
