# Supabase setup for Heroes & Wizards (online lobby)

Use this when you’re ready to run the lobby and multiplayer flow against Supabase.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → choose org, name (e.g. `heroes-wizards`), database password, region.
3. Wait for the project to be ready.

---

## 2. Get your API keys

1. In the Supabase dashboard: **Project Settings** (gear) → **API**.
2. Copy:
   - **Project URL** → use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 3. Create tables and RLS

In the Supabase dashboard: **SQL Editor** → **New query**, paste the SQL below, then **Run**.

```sql
-- Lobbies: one row per lobby (code is the 4-letter shareable code)
create table if not exists public.lobbies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_name text not null,
  status text not null default 'waiting' check (status in ('waiting', 'playing')),
  created_at timestamptz not null default now()
);

-- Lobby players: who is in each lobby
create table if not exists public.lobby_players (
  id uuid primary key default gen_random_uuid(),
  lobby_id uuid not null references public.lobbies(id) on delete cascade,
  name text not null,
  is_host boolean not null default false,
  created_at timestamptz not null default now(),
  unique(lobby_id, name)
);

-- Index for lookups by code and for Realtime
create index if not exists idx_lobby_players_lobby_id on public.lobby_players(lobby_id);
create index if not exists idx_lobbies_code on public.lobbies(code);

-- Enable Realtime for lobby_players so clients get join/leave updates
alter publication supabase_realtime add table public.lobby_players;

-- RLS: allow anonymous read/insert/delete for lobby and lobby_players (no auth yet)
alter table public.lobbies enable row level security;
alter table public.lobby_players enable row level security;

create policy "Allow read lobbies"
  on public.lobbies for select using (true);

create policy "Allow insert lobby"
  on public.lobbies for insert with check (true);

create policy "Allow read lobby_players"
  on public.lobby_players for select using (true);

create policy "Allow insert lobby_player"
  on public.lobby_players for insert with check (true);

create policy "Allow delete own lobby_player"
  on public.lobby_players for delete using (true);
```

If `alter publication supabase_realtime add table` fails (e.g. table already in publication), you can ignore that line after the first run.

---

## 4. Env vars locally

1. In the project root, copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Edit `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key

---

## 5. Env vars on Vercel

1. Vercel project → **Settings** → **Environment Variables**.
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = same Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = same anon key
3. Redeploy so the new variables are used.

---

## 6. Run the app

- Without Supabase env vars: lobby is local-only (create/join/leave only in this browser).
- With Supabase env vars: create lobby and join lobby are stored in Supabase; players see each other in the same lobby in real time; leave removes you from the lobby in the DB.

**Note:** Only the **lobby** is synced (who’s in the room, join/leave). **Game state is not synced yet.** When the host clicks “Start Game,” a warning explains that the game will only start on the host’s device; other players stay in the lobby. Full online play (shared game state) is planned for a later update. To play together now, use **Local** mode on one device.

---

## Troubleshooting

- **"Could not reach the server" / "Failed to fetch"**  
  Usually means the app can’t reach Supabase. Check:
  1. **Project not paused** – Free-tier projects pause after inactivity. In the [Supabase dashboard](https://supabase.com/dashboard), open your project and click **Restore** if it says “Paused”.
  2. **Env vars loaded** – Restart the dev server after changing `.env.local`. On Vercel, add the two env vars and redeploy.
  3. **Network** – No firewall/VPN blocking `*.supabase.co`.

---

## Tables summary

| Table          | Purpose |
|----------------|--------|
| `lobbies`      | One row per lobby: `id`, `code` (4-letter), `host_name`, `status` (`waiting` / `playing`). |
| `lobby_players`| One row per player in a lobby: `id`, `lobby_id`, `name`, `is_host`. Realtime is enabled so all clients see join/leave. |
