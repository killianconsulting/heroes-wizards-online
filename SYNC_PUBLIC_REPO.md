# Syncing to a public repository

This repo can be mirrored to a **public** GitHub repo (without artwork or secrets) using the **Sync to public repo** GitHub Action. You only push to this private repo; the Action pushes a stripped copy to the public repo on every push to `main`.

## One-time setup

### 1. Create the public repo

- On GitHub, create a **new public** repository (e.g. `heroes-wizards-public`).
- Do **not** push any content that contains real images or secrets. Leave it empty; the Action will do the first push.

### 2. Add a token (secret)

- In **this (private) repo**: **Settings → Secrets and variables → Actions**.
- Click **New repository secret**.
- **Name:** `PUBLIC_REPO_TOKEN`
- **Value:** A Personal Access Token (PAT) that can push to the public repo.
  - **Fine-grained:** Create a PAT with access only to the **public** repo, with permission **Contents: Read and write**.
  - **Classic:** Use a classic PAT with `repo` scope (or limit to the single public repo if your GitHub plan allows).

### 3. Add the public repo identifier (variable)

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

- **"Set the Actions variable PUBLIC_REPO"** — Add the `PUBLIC_REPO` variable (e.g. `owner/heroes-wizards-public`) under Settings → Secrets and variables → Actions → Variables.
- **"Add the secret PUBLIC_REPO_TOKEN"** — Add a PAT with push access to the public repo under Settings → Secrets and variables → Actions → Secrets.
