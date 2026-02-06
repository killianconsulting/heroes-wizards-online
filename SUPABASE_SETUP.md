# Supabase setup for Heroes & Wizards (online multiplayer)

Use this when you're ready to run the full online multiplayer with lobbies and game sync.

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

- **Without Supabase env vars**: lobby is local-only (create/join/leave only in this browser).
- **With Supabase env vars**: **full online multiplayer** is enabled.
  - Create lobby and join lobby are stored in Supabase
  - Players see each other in the same lobby in real time
  - **Game state is synced** via Supabase Realtime broadcast channels
  - Host-authoritative model: host validates actions and broadcasts state to all players
  - Reconnection support: players can reload and rejoin their game
  - Host migration: if host leaves, another player becomes the new host

**✅ Online play is fully functional!**

**How it works:**
1. One player creates a lobby (gets a shareable 4-letter code)
2. Other players join using the code  
3. Host clicks "Start Game" → all players see the same game
4. Players take turns; actions are validated by host and synced in real-time
5. Players can leave, reconnect, or take over as host if needed

---

## Troubleshooting

- **"Could not reach the server" / "Failed to fetch"**  
  Usually means the app can't reach Supabase. Check:
  1. **Project not paused** – Free-tier projects pause after inactivity. In the [Supabase dashboard](https://supabase.com/dashboard), open your project and click **Restore** if it says "Paused".
  2. **Env vars loaded** – Restart the dev server after changing `.env.local`. On Vercel, add the two env vars and redeploy.
  3. **Network** – No firewall/VPN blocking `*.supabase.co`.

---

## Tables summary

| Table          | Purpose |
|----------------|--------|
| `lobbies`      | One row per lobby: `id`, `code` (4-letter), `host_name`, `status` (`waiting` / `playing`). |
| `lobby_players`| One row per player in a lobby: `id`, `lobby_id`, `name`, `is_host`. Realtime is enabled so all clients see join/leave. |

**Game state**: Not stored in DB; synced in real-time via Supabase Realtime broadcast channels (lives only in memory while game is active).

---

## Lobby retention (short)

Lobby and lobby_players rows are kept only for a short time (2 hours). After that they are deleted by a cleanup job so abandoned lobbies don't pile up.

**To enable cleanup:**

1. **Service role key** (Dashboard → Project Settings → API → `service_role` secret):  
   Add to env as `SUPABASE_SERVICE_ROLE_KEY`. Do not expose this in the client; it's only for the server cron.

2. **Cron secret**:  
   Set `CRON_SECRET` to a long random string (e.g. `openssl rand -hex 24`). Used to protect the cleanup endpoint.

3. **Call the cleanup endpoint** on a schedule (e.g. every hour):
   - **GET** `https://your-app.vercel.app/api/cron/cleanup-lobbies`
   - Auth: either `Authorization: Bearer <CRON_SECRET>` or query `?secret=<CRON_SECRET>`
   - **Vercel:** If you use the `vercel.json` cron (hourly), add `CRON_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` to the project's **Environment Variables**. Vercel will send `CRON_SECRET` as the Bearer token for cron requests.
   - Or use [cron-job.org](https://cron-job.org) / similar: create a job that GETs the URL with `?secret=your-secret` every hour.

If `SUPABASE_SERVICE_ROLE_KEY` or `CRON_SECRET` is not set, the app still works; only the automatic cleanup is skipped. Old lobbies will stay until the last player leaves (or you run cleanup manually).

---

## Additional resources

- `PHASE4_GAME_SYNC.md` — Detailed documentation on how the multiplayer sync model works
- `BUILD_PLAN.md` — Full development plan showing Phase 4 implementation details
