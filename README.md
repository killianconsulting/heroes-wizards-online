# Heroes & Wizards

A web app to play the card game **Heroes & Wizards** online. Built with React and Next.js.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Card images**  
   Copy the contents of the `cards/` folder into `public/cards/` so the app can serve them at `/cards/...`. If `public/cards/` is empty, card images will be missing but the game engine will still run.

3. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Run tests**
   ```bash
   npm test
   ```

## Project structure

- `src/data/` — Card definitions (72 cards), types, constants
- `src/engine/` — Game state, setup, validation (Phase 1 rules engine)
- `src/app/` — Next.js App Router pages
- `tests/engine/` — Unit tests for the engine
- `BUILD_PLAN.md` — Phased build plan (Phase 1 → 4)
- `Deck Library and Rules.md` — Official card list and rules

## Git / GitHub

Initialize and connect to GitHub:

```bash
git init
git add .
git commit -m "Phase 1: Next.js app, card data, game state, setup, validation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/heroes_wizards.git
git push -u origin main
```

Replace `YOUR_USERNAME` and repo URL with your GitHub repository.

## License

Private / unlicensed. Use the card game rules and assets according to your rights.
