# Nuxt Template — agent-driven workspace

A Nuxt 4 + Drizzle + Neon + Upstash starter wired for **GitHub-Actions-driven
deploys to Vercel** with **per-PR isolated databases** and a **Claude Code
agent setup** baked in. Open a PR → get a preview URL with its own ephemeral
Postgres. Merge to `main` → production ships.

If you want the deep version (conventions, layer ownership, hard rules), read
[`CLAUDE.md`](./CLAUDE.md).

---

## What you get

| | |
|---|---|
| **Stack** | Nuxt 4 layers · Vue 3 · Nuxt UI v4 · Drizzle + Neon Postgres · Upstash Redis · Pinia · Vitest + Playwright · pnpm |
| **CI** | `pnpm lint` + `pnpm typecheck` + `pnpm test` on every PR |
| **Preview** | Per-PR Neon branch DB (14-day expiry) + Vercel preview URL + sticky PR comment |
| **Production** | Push to `main` → build → deploy → migrate the production Neon DB |
| **Agents** | `.claude/` ships with skills, agent definitions, and a `/team-feature` workflow that spins up `fullstack-dev` + `qa-visual` + `ux-researcher` teammates |

---

## Setup (one-time, per fork)

You need accounts on **GitHub**, **Vercel**, and **Neon**. The whole thing
takes ~10 minutes.

### 1. Vercel — create the project

1. Import this repo into Vercel (any team; you'll need to be an Owner or
   Admin to add tokens later).
2. After import, **disable Vercel's git integration**: `Settings → Git →
   Connected Git Repository → Disconnect`. (`vercel.json` already sets
   `git.deploymentEnabled: false`, but disconnecting in the UI is cleaner.)
   Deploys are driven by GitHub Actions only.
3. Note your project's **Project ID** and **Team ID** — `Settings → General`
   for project, account dropdown for team.

### 2. Neon — install the GitHub + Vercel integrations

1. In Neon, create a new project. Pick the region closest to your Vercel
   region.
2. Add the **Neon-Vercel integration** to your Vercel project. This wires
   `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `DATABASE_URL`, etc. into the
   Vercel project env automatically.
3. Add the **Neon-GitHub integration** to your repo. This provisions
   `NEON_API_KEY` (secret) and `NEON_PROJECT_ID` (variable) in GitHub Actions
   so the preview workflow can create per-PR branches.

### 3. GitHub — add the remaining secrets and variables

Go to `Settings → Secrets and variables → Actions`.

**Repository secrets:**

| Name | How to get it |
|---|---|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create. Scope to your team. Used by CI to build + deploy. |
| `NEON_API_KEY` | Provisioned by the Neon-GitHub integration. |

**Repository variables:**

| Name | Value |
|---|---|
| `VERCEL_PROJECT_ID` | From step 1. |
| `VERCEL_TEAM_ID` | From step 1. |
| `NEON_PROJECT_ID` | Provisioned by the Neon-GitHub integration. |

### 4. Vercel — set the auth secrets and other runtime credentials

Generate three random 64-char hex secrets and add them to your Vercel
project's **production** target (and **preview** if you want sessions to
survive across preview deploys of the same PR):

```bash
node -p "require('crypto').randomBytes(32).toString('hex')"
```

| Vercel env var | Value |
|---|---|
| `NUXT_AUTH_SECRET` | random hex (used to encrypt sessions / CSRF) |
| `NUXT_TASK_SECRET` | random hex (bearer token for Nitro tasks) |
| `NUXT_WEBHOOK_SIGNING_SECRET` | random hex (HMAC for inbound webhooks) |
| `NUXT_DEMO_MODE` | `true` if you want the demo-login backdoor + relaxed CSP |
| `NUXT_PUBLIC_DEMO_MODE` | `true` to expose the demo block on the login page |
| `NITRO_PRESET` | `vercel` |

Add OAuth / SMTP / SePay credentials too if you use those features —
[`.env.example`](./.env.example) lists every env var the app reads.

> **Why not auto-generate?** The workflow could mint these on every PR,
> but rotating session secrets per deploy invalidates every existing
> session and breaks anything signed by a previous deploy. One static
> set per environment is the right tradeoff.

### 5. Open a PR

Push a branch, open a PR → the **Preview** workflow runs:
- Creates a Neon branch off `main` (`preview/pr-<#>-<branch>`, 14-day expiry)
- Builds and deploys to Vercel (the per-PR branch URL is injected at build)
- Migrates the Neon branch
- Posts a sticky PR comment with the preview URL

Closing the PR deletes the Neon branch.

Merging to `main` → the **Production** workflow runs build → deploy → migrate
against the production Neon DB.

---

## Local development (optional)

```bash
pnpm install
cp .env.example .env
pnpm auth:generate           # writes NUXT_AUTH_SECRET et al. into .env
docker compose -f docker-compose.services.yml up -d
pnpm db:migrate
pnpm dev                     # nuxt dev --port 3002
```

Visit `http://localhost:3002/auth/login` and click **Sign in as Admin Agent**
or **Sign in as User Agent** — the demo-login route auto-creates the user
with the appropriate ability preset, no separate seeding required.

---

## Agent-driven feature workflow

For non-trivial features, run:

```
/team-feature <feature description>
```

That spawns parallel `fullstack-dev` + `qa-visual` + `ux-researcher`
teammates per the `.claude/agents/` setup. See
[`.claude/agents/README.md`](./.claude/agents/README.md) for the
coordination rules and the layer-ownership invariant that keeps parallel
work untangled.

For solo work, the project-wide skills (`nuxt-ui`, `vue`, `pinia`, etc.)
live under `.claude/skills/` and load automatically when relevant.

Full conventions — TDD rules, component naming, layer structure, the auth
ability model, the deploy-pipeline tradeoffs — are in
[`CLAUDE.md`](./CLAUDE.md).

---

## Useful scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Start the dev server on port 3002 |
| `pnpm test` | Vitest (unit + nuxt projects) |
| `pnpm test:e2e` | Playwright |
| `pnpm lint` | ESLint over the whole repo |
| `pnpm typecheck` | `vue-tsc` via `nuxt typecheck` |
| `pnpm db:generate` | Generate a Drizzle migration from schema diff |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:preview` | Drizzle Studio |
| `pnpm auth:generate` | Generate the three local auth secrets |
