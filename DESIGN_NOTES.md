# Design Notes — Heroes & Wizards Web App

Reference: [Official game site](https://jofgames.com.au/heroes-and-wizards/) (JoFGames). Use these notes to align Phase 2 UI with the game’s brand and tone.

---

## Brand & Tone (from official site)

- **Tagline**: “The Card Game of Strategy, Magic & Mischief!”
- **Voice**: Strategic yet **party-ready**; fantasy with a **cheeky** edge (“trove of cheeky event cards”, “magic & mischief”).
- **Audience**: 2–5 players, ages 8+, ~20 minutes — family-friendly but not childish; light, playful, competitive.

**Takeaway for Phase 2**: UI should feel **clear and strategic** (readable cards, obvious actions) but **warm and playful** (colour, tone, microcopy), not grim or overly serious.

---

## Typography & Hierarchy

- **Headlines**: Strong, all-caps for key phrases — e.g. “THE KINGDOM’S IN DANGER”, “IT’S TIME TO RALLY THE HEROES!”, “CRAFT A QUESTING PARTY”.
- **Subheads**: Short, punchy — “WITH MAGIC, STRENGTH OR SPEED!”, “OUTWIT YOUR RIVALS WITH A TROVE OF CHEEKY EVENT CARDS!”
- **Body**: Simple, readable; short sentences and scannable bullets.

**Takeaway**: Use a clear hierarchy (e.g. one bold display font for headings, one readable sans for body/UI). Consider all-caps or small-caps for key labels (e.g. “YOUR PARTY”, “EVENT PILE”) to echo the box style.

---

## Imagery & Assets (official site)

- **Logo**: `https://jofgames.com.au/customstyles/images/hwlogo@2x.png` — use for header/branding if desired (respect trademark; link to official site in footer).
- **Hero / product imagery**: `hwimg1@2x.png`, `hwimg2@2x.png` — illustrate “questing party” and “event cards”; good reference for mood (fantasy, adventurers).
- **Cards**: We use our own assets in `public/cards/` (quest, wizards, events, heroes); keep card layout clear and consistent with rules (skills, types, abilities).

**Takeaway**: Header can use a “Heroes & Wizards” wordmark or small logo; in-game focus on **our** card art and a clean table layout.

---

## Colour & Mood

- **Theme**: Fantasy, magic, quest — often suggests **purples**, **blues**, **golds**, **forest greens**, plus **warm neutrals** (parchment/cream for card backs, beige for hero cards per rules).
- **Card types** (from rules): Quest = purple, Wizard = blue, Event = green, Hero = beige — we can use these as subtle borders or accents (e.g. card frame colour by type).
- **Contrast**: Ensure text and actions are readable on all backgrounds (e.g. dark table vs light cards).

**Takeaway**: Pick a small palette (e.g. dark table/slate background, coloured accents by card type, cream/white for cards and panels). Avoid clutter; keep focus on the table and hands.

---

## Layout & UX (for Phase 2)

- **Game table**: Centre the play area — deck, event pile, and each player’s party visible; current player and turn indicator obvious.
- **Hand**: Clear, tappable/clickable cards; show playable state (e.g. highlight or “Play” on valid cards).
- **Actions**: One primary action per turn (Draw / Play / Dump / Summoner); buttons or card-based choices should be **obvious** and **undo-safe** where possible (e.g. “Play this card?” before committing).
- **Events**: When an event needs a target (player or card), use a clear “Choose target” step (e.g. list of players, or cards in hand) so the flow matches the rules.

**Takeaway**: Design for **clarity first** (who’s turn, what’s legal, what was played), then add flavour (illustrations, colour, small animations) so it still feels “party-ready” and fun.

---

## External Links

- **Official site**: [Heroes & Wizards — JoFGames](https://jofgames.com.au/heroes-and-wizards/)
- **How to play video**: [YouTube embed](https://www.youtube.com/embed/-5_kDJb7lQg) (linked from official site)
- **Instructions PDF**: [heroes-wizards-instructions.pdf](https://jofgames.com.au/customstyles/heroes-wizards-instructions.pdf)

---

*Use this doc when building Phase 2: start screen, game screen, Card/Hand/Party components, and action bar. Adjust colours and typography in code (e.g. CSS variables or Tailwind) as we implement.*
