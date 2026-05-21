# Nuxt Template — agent-driven workspace

A Nuxt 4 + NuxtHub starter on a **full Cloudflare stack** (D1 SQLite · KV · R2 ·
Workers) wired for **GitHub-Actions-driven deploys** and a **Claude Code agent
setup** baked in. Open a PR → get a Cloudflare Workers preview. Merge to `main`
→ production ships. D1 migrations apply automatically during each build.

If you want the deep version (conventions, layer ownership, hard rules), read
[`CLAUDE.md`](./CLAUDE.md).

---

## What you get

| | |
|---|---|
| **Stack** | Nuxt 4 layers · Vue 3 · Nuxt UI v4 · NuxtHub (D1 SQLite + KV + R2 + cache) · Drizzle · Pinia · Vitest + Playwright · pnpm |
| **CI** | `pnpm lint` + `pnpm typecheck` + `pnpm test` on every PR |
| **Preview** | Cloudflare Workers preview deploy (`CLOUDFLARE_ENV=preview`) + sticky PR comment; D1 migrations applied at build |
| **Production** | Push to `main` → build (migrate D1) → `wrangler deploy` |
| **Agents** | `.claude/` ships with skills, agent definitions, and a `/team-feature` workflow that spins up `fullstack-dev` + `qa-visual` + `ux-researcher` teammates |

---

## Setup (one-time, per fork)

You need a **GitHub** account and a **Cloudflare** account. The whole thing
takes ~10 minutes.

### 1. Cloudflare — create the D1 / KV / R2 resources

```bash
npx wrangler login
npx wrangler d1 create nuxt-template-prod            # → database_id
npx wrangler kv namespace create KV                   # → kv namespace id
npx wrangler kv namespace create CACHE                # → cache namespace id
npx wrangler r2 bucket create nuxt-template-prod      # → bucket name
```

Paste the returned ids into the `$production.hub` block of
[`nuxt.config.ts`](./nuxt.config.ts), replacing the `<…>` placeholders. For a
separate preview environment, create a second set and wire them under the
preview env. NuxtHub generates the wrangler bindings from this block at build
time; `wrangler.jsonc` only carries the observability config.

### 2. GitHub — add the Cloudflare secrets and variables

Go to `Settings → Secrets and variables → Actions`.

**Repository secret:**

| Name | How to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | [Cloudflare dashboard → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens). Needs Workers Scripts + D1 + Workers KV + R2 edit (and `workers_observability` edit if you keep logging on). |

**Repository variable:**

| Name | Value |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → account id. |

### 3. Set the auth secrets (Cloudflare Worker env)

Generate three random 64-char hex secrets and add them to your Worker's
environment variables (`Workers & Pages → your worker → Settings → Variables`),
for both production and preview:

```bash
node -p "require('crypto').randomBytes(32).toString('hex')"
```

| Worker env var | Value |
|---|---|
| `NUXT_AUTH_SECRET` | random hex (used to encrypt sessions / CSRF) |
| `NUXT_TASK_SECRET` | random hex (bearer token for Nitro tasks) |
| `NUXT_WEBHOOK_SIGNING_SECRET` | random hex (HMAC for inbound webhooks) |
| `NUXT_DEMO_MODE` | `true` if you want the demo-login backdoor + relaxed CSP |
| `NUXT_PUBLIC_DEMO_MODE` | `true` to expose the demo block on the login page |

Add OAuth / SMTP / SePay credentials too if you use those features —
[`.env.example`](./.env.example) lists every env var the app reads.

> **Why not auto-generate?** The workflow could mint these on every PR,
> but rotating session secrets per deploy invalidates every existing
> session and breaks anything signed by a previous deploy. One static
> set per environment is the right tradeoff.

### 4. Open a PR

Push a branch, open a PR → the **Preview** workflow runs:
- Builds with `NITRO_PRESET=cloudflare-module` and `CLOUDFLARE_ENV=preview`
  (D1 migrations apply during the build)
- Deploys to Cloudflare Workers (`wrangler deploy --env preview`)
- Posts a sticky PR comment

Merging to `main` → the **Production** workflow builds (migrating D1) and runs
`wrangler deploy`.

---

## Local development (optional)

```bash
pnpm install
cp .env.example .env
pnpm auth:generate           # writes NUXT_AUTH_SECRET et al. into .env
pnpm dev                     # nuxt dev --port 3002
```

NuxtHub emulates D1, KV, and R2 locally under `.data` — no containers or
connection strings required, and `pnpm dev` applies pending D1 migrations on
boot. (Optional: run a local SMTP catch-all like Mailpit if you exercise email.)

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
| `pnpm db:generate` | Generate a D1/SQLite migration from schema diff (`nuxt db generate`) |
| `pnpm db:migrate` | Apply pending migrations to the local D1 DB (`nuxt db migrate`) |
| `pnpm auth:generate` | Generate the three local auth secrets |
