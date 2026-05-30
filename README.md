# Nuxt Template — agent-driven workspace

[![CI](https://github.com/thecodeorigin/nuxt-template/actions/workflows/ci.yml/badge.svg)](https://github.com/thecodeorigin/nuxt-template/actions/workflows/ci.yml)
[![Production](https://github.com/thecodeorigin/nuxt-template/actions/workflows/production.yml/badge.svg)](https://github.com/thecodeorigin/nuxt-template/actions/workflows/production.yml)
[![Preview](https://github.com/thecodeorigin/nuxt-template/actions/workflows/preview.yml/badge.svg)](https://github.com/thecodeorigin/nuxt-template/actions/workflows/preview.yml)
![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F6821F?logo=cloudflare&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white)

A Nuxt 4 + NuxtHub starter on a **full Cloudflare stack** (D1 SQLite · KV · R2
· Workers) with **GitHub Actions deploys** and a **Claude Code agent setup**
baked in. PR → Cloudflare Workers preview. Merge to `main` → production ships.
D1 migrations apply during each build.

Everything below is driven by the **`packages/cli` harness** — a non-interactive
CLI exposed as `pnpm cli` that handles env, secrets, local dev, and one-shot
Cloudflare/GitHub provisioning. No manual `wrangler` ceremony required.

> Deep version (conventions, layer ownership, hard rules):
> [`CLAUDE.md`](./CLAUDE.md). CLI reference: [`packages/cli/README.md`](./packages/cli/README.md).

---

## Quickstart (local, ~2 minutes)

```bash
pnpm install
pnpm cli dev setup       # creates .env from .env.example + generates auth secrets
pnpm cli dev up          # nuxt :3002 + maildev (smtp :1025, web :1080)
```

Open <http://localhost:3002/auth/login> and click **Sign in as Admin Agent**
or **Sign in as User Agent** — the demo-login route auto-creates the user
with the right ability preset. No seeding step required for the demo flow.

`pnpm cli dev setup` is **idempotent**: rerun it any time; it updates the
three auth secrets in place rather than appending duplicates.

NuxtHub emulates D1, KV, and R2 locally under `.data/` — no containers, no
connection strings. `pnpm dev` (alias for `pnpm cli dev up`) applies pending
D1 migrations on boot.

---

## Environment variables

`pnpm cli dev setup` writes the three required auth secrets. The rest live in
[`.env.example`](./.env.example) — copy what you need into `.env` and fill in
the values.

| Var | Set by | Purpose |
|---|---|---|
| `NUXT_AUTH_SECRET` | `cli dev setup` | Session / CSRF encryption |
| `NUXT_TASK_SECRET` | `cli dev setup` | Bearer token for Nitro tasks |
| `NUXT_WEBHOOK_SIGNING_SECRET` | `cli dev setup` | HMAC for inbound webhooks |
| `NUXT_PUBLIC_BASE_DOMAIN` | manual | Defaults to `localhost:3002` |
| `NUXT_DEMO_MODE` | manual | `true` enables the demo-login backdoor + relaxed CSP |
| `NUXT_PUBLIC_DEMO_MODE` | manual | `true` exposes the demo block on the login page |
| `NUXT_SMTP_*` | manual | Local dev defaults to MailDev (`localhost:1025`) |
| `NUXT_GOOGLE_CLIENT_ID` / `NUXT_GOOGLE_CLIENT_SECRET` | manual | Google OAuth (optional) |
| `NUXT_GITHUB_CLIENT_ID` / `NUXT_GITHUB_CLIENT_SECRET` | manual | GitHub OAuth (optional) |
| `NUXT_SEPAY_*` | manual | SePay bank-transfer payments (optional) |
| `CLOUDFLARE_API_TOKEN` | manual | Required for `cli deploy setup` |
| `CLOUDFLARE_ACCOUNT_ID` | manual | Required for `cli deploy setup` |

Check what you have at any time:

```bash
pnpm cli doctor          # human-readable table of every env/tool check
pnpm cli doctor --json   # machine-readable; exit 1 if any check fails
```

---

## Local dev workflow

```bash
pnpm cli dev up                                # nuxt + maildev together (Ctrl-C kills both)
pnpm cli dev up --port 3000 --smtp 2025 --web 8080   # override ports

pnpm cli dev seed                              # POST /api/auth/dev-seed (creates demo users)
pnpm cli dev provision --email you@example.com # create a user + session
pnpm cli dev login --email you@example.com     # issue a session for an existing user
pnpm cli dev cleanup --emails you@example.com  # delete users + sessions
```

The `seed`/`provision`/`login`/`cleanup` commands require the dev server to
be running — they POST to backdoor routes that are only mounted when
`NUXT_DEMO_MODE=true` (set automatically by `cli dev setup`).

### Database

```bash
pnpm cli db generate                                   # migration from schema diff
pnpm cli db migrate                                    # apply to local .data/
pnpm cli db migrate --remote                           # apply to remote D1
pnpm cli db sql "SELECT count(*) FROM users"
pnpm cli db reset                                      # wipe .data, re-migrate
```

### Verify before pushing

```bash
pnpm cli verify          # lint → typecheck → test; mirrors CI exactly
pnpm cli verify --json   # per-step pass/fail
```

---

## Deploy (one-time setup, ~5 minutes)

You need a **GitHub** account and a **Cloudflare** account.

### 1. Cloudflare API token + account id

Create a token at
<https://dash.cloudflare.com/profile/api-tokens> with **Workers Scripts +
D1 + Workers KV + R2 edit** (and `workers_observability` edit if you keep
logging on). Grab the account id from **Workers & Pages → account id**.

Add both to your shell (or `.env`):

```bash
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...
```

### 2. GitHub CLI authenticated

```bash
gh auth login        # only needed once
```

### 3. One-shot provisioning

```bash
pnpm cli deploy setup --env all --dry-run    # preview the plan, mutate nothing
pnpm cli deploy setup --env all              # do it
```

That single command:

1. Verifies your Cloudflare token and GitHub auth.
2. Resolves-or-creates the D1 database, KV namespaces, and R2 bucket (prod +
   preview).
3. Writes the resulting IDs to GitHub Actions **variables** (consumed at build).
4. Sets `CLOUDFLARE_API_TOKEN` and `PREVIEW_NUXT_AUTH_SECRET` as GitHub
   **secrets**.
5. Bulk-pushes every `NUXT_*` / `CRON_SECRET` from your `.env` to the
   production Worker as runtime secrets.

> Want to manage Worker secrets via the Cloudflare dashboard instead? Pass
> `--skip-worker-secrets`.

### 4. Open a PR

Push a branch, open a PR → the **Preview** workflow runs:

- Builds with `NITRO_PRESET=cloudflare-module` and `CLOUDFLARE_ENV=preview`
  (D1 migrations apply during the build).
- Deploys to Cloudflare Workers (`wrangler deploy --env preview`).
- Posts a sticky PR comment with the preview URL.

Merging to `main` → the **Production** workflow builds (migrating D1) and runs
`wrangler deploy`.

### Observe deploys

```bash
pnpm cli deploy status   # latest CI runs + Worker deployments
pnpm cli deploy logs     # tail the production Worker (streams until Ctrl-C)
```

---

## Agent-driven feature workflow

For non-trivial features, run:

```
/team <feature description>
```

That spawns parallel `fullstack-dev` + `qa-visual` + `ux-researcher`
teammates per the `.claude/agents/` setup. See
[`.claude/agents/README.md`](./.claude/agents/README.md) for the coordination
rules and the layer-ownership invariant that keeps parallel work untangled.

For solo work, the project-wide skills (`nuxt-ui`, `vue`, `pinia`, etc.)
under `.claude/skills/` load automatically when relevant.

Full conventions — TDD rules, component naming, layer structure, the auth
ability model, the deploy-pipeline tradeoffs — are in
[`CLAUDE.md`](./CLAUDE.md).

---

## Command reference (cheat sheet)

| Command | What it does |
|---|---|
| `pnpm cli doctor` | Diagnose tools / Cloudflare / GitHub / OAuth / auth secrets |
| `pnpm cli dev setup` | Create `.env` + generate three auth secrets (idempotent) |
| `pnpm cli dev up` | Run `nuxt dev` + `maildev` together (Ctrl-C kills both) |
| `pnpm cli dev seed` | Seed local DB via `/api/auth/dev-seed` |
| `pnpm cli dev provision --email …` | Create a user + session |
| `pnpm cli dev login --email …` | Issue a session for an existing user |
| `pnpm cli dev cleanup --emails …` | Delete users + sessions |
| `pnpm cli db generate` | Generate a D1/SQLite migration from schema diff |
| `pnpm cli db migrate [--remote]` | Apply migrations locally (or to remote D1) |
| `pnpm cli db sql "…"` | Ad-hoc SQL against the local D1 |
| `pnpm cli db reset` | Wipe `.data/` and re-migrate |
| `pnpm cli verify` | Local CI gate (lint → typecheck → test) |
| `pnpm cli deploy setup --env all` | Provision CF resources + sync GH config + push Worker secrets |
| `pnpm cli deploy status` | Latest CI runs + Worker deployments |
| `pnpm cli deploy logs` | Tail the production Worker |

Stack-level scripts:

| Script | What it does |
|---|---|
| `pnpm dev` | Alias for `pnpm cli dev up` |
| `pnpm test` | Vitest (unit + nuxt projects) |
| `pnpm test:e2e` | Playwright |
| `pnpm lint` | ESLint over the whole repo |
| `pnpm typecheck` | `vue-tsc` via `nuxt typecheck` |
