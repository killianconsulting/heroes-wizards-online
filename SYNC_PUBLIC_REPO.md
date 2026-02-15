# Syncing to a public repository

This repo can be mirrored to a **public** GitHub repo (without artwork or secrets) using the **Sync to public repo** GitHub Action. You only push to this private repo; the Action pushes a stripped copy to the public repo on every push to `main`.

## One-time setup

### 1. Create the public repo

- On GitHub, create a **new public** repository (e.g. `heroes-wizards-public`).
- Do **not** push any content that contains real images or secrets. Leave it empty; the Action will do the first push.

### 2. Create a deploy key and add it to the public repo

- On your machine, generate an SSH key pair (no passphrase so Actions can use it):
  ```bash
  ssh-keygen -t ed25519 -C "sync-to-public" -f sync_deploy_key -N ""
  ```
- Open **public** repo → **Settings → Deploy keys** → **Add deploy key**.
  - **Title:** e.g. `Sync from private repo`
  - **Key:** Paste the contents of `sync_deploy_key.pub`
  - Check **Allow write access**
  - Click **Add key**.
- Keep the **private** key file `sync_deploy_key` (no `.pub`) for the next step; you can delete both files from your machine after the secret is set.

### 3. Add the private key to the private repo (secret)

- In **this (private) repo**: **Settings → Secrets and variables → Actions** → **Secrets**.
- Click **New repository secret**.
- **Name:** `PUBLIC_REPO_DEPLOY_KEY`
- **Value:** Paste the **entire** contents of the **private** key file (`sync_deploy_key`), including the `-----BEGIN ... KEY-----` and `-----END ... KEY-----` lines. No extra spaces or newlines at the start/end.

### 4. Add the public repo identifier (variable)

- In **this (private) repo**: **Settings → Secrets and variables → Actions** → **Variables** tab.
- Click **New repository variable**.
- **Name:** `PUBLIC_REPO`
- **Value:** `owner/repo-name`, e.g. `your-username/heroes-wizards-public`.

## What gets synced

- All source code, configs, and docs.
- `.env.local.example` only (no real env files; they are gitignored).
- `public/images/` and `public/cards/` with **READMEs only** — image files are removed before push so artwork is not distributed.

## Triggers

- **Automatic:** Every push to the `main` branch.
- **Manual:** **Actions** tab → **Sync to public repo** → **Run workflow**.

## Troubleshooting

- **"Set the Actions variable PUBLIC_REPO"** — Add the `PUBLIC_REPO` variable (e.g. `owner/heroes-wizards-online`) under Settings → Secrets and variables → Actions → Variables.
- **"Add the secret PUBLIC_REPO_DEPLOY_KEY"** — Add the **private** SSH key (full contents) as that secret. The matching **public** key must be added to the **public** repo as a deploy key with **Allow write access**.
- **Push failed / 403** — Ensure the deploy key on the public repo has write access, and that the secret contains the private key with no missing lines (begin/end markers included).
