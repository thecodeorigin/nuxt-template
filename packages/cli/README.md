# harness CLI

Internal, non-interactive CLI for the `nuxt-template` project. Designed to be
agent-friendly: no prompts, structured `--json` output on diagnostic commands,
and deterministic exit codes.

## Installation

The CLI is a pnpm workspace package — no installation needed. It is available
as a root script the moment you clone the repo and run `pnpm install`.

## Usage

```bash
pnpm cli <command> [subcommand] [options]
# or the longer alias:
pnpm harness <command> [subcommand] [options]
```

## Commands

### `doctor`

Diagnose the local environment. Checks tools, Cloudflare token, GitHub auth,
OAuth presence, and auth secrets.

```bash
pnpm cli doctor            # human-readable table
pnpm cli doctor --json     # machine-readable; exit 1 if any check is 'fail'
```

| Check | Fail | Warn | Ok |
|---|---|---|---|
| `tool:node` / `tool:npx` | missing | — | present |
| `tool:pnpm` / `tool:gh` / `tool:gcloud` | — | missing | present |
| `cloudflare:token` | no token or inactive | legacy API key | active scoped token |
| `cloudflare:account` | — | unset | `CLOUDFLARE_ACCOUNT_ID` set |
| `github:auth` | — | not authed | `gh auth status` passes |
| `github:variables` / `github:secrets` | — | missing entries | all present |
| `oauth:github` / `oauth:google` | — | vars missing | present |
| `env:auth-secrets` | — | vars missing | all three secrets present |

---

### `dev`

Local development bootstrap and agent backdoor helpers.

```bash
pnpm cli dev setup                                  # create .env + generate auth secrets (idempotent)
pnpm cli dev seed                                   # POST /api/auth/dev-seed
pnpm cli dev provision --email you@example.com      # POST /api/auth/dev-provision
pnpm cli dev login    --email you@example.com       # POST /api/auth/dev-login
pnpm cli dev cleanup  --emails you@example.com      # POST /api/auth/dev-cleanup
```

`setup` is idempotent: a second run updates the three auth secrets in-place
rather than duplicating lines. All other subcommands require the dev server
(`pnpm dev`) to be running; a clear error is shown if it is not.

Override the dev server URL:

```bash
pnpm cli dev seed --url http://localhost:3000
# or: HARNESS_DEV_URL=http://localhost:3000 pnpm cli dev seed
```

---

### `deploy`

Provision Cloudflare resources, sync GitHub Actions config, and push Worker
runtime secrets. **No `wrangler deploy` here** — deploys go through CI per
project convention.

```bash
# Dry run — prints every action, mutates nothing
pnpm cli deploy setup --env production --dry-run

# Full run — idempotent; resolves existing resources instead of failing
pnpm cli deploy setup --env production
pnpm cli deploy setup --env preview
pnpm cli deploy setup --env all

# Skip pushing .env secrets to the Worker (e.g. if using Cloudflare dashboard)
pnpm cli deploy setup --env production --skip-worker-secrets

# Observe CI runs and Worker deployments
pnpm cli deploy status

# Tail the production Worker live (streams until Ctrl-C)
pnpm cli deploy logs
```

**What `deploy setup` does:**

1. Validates the CF token (`CLOUDFLARE_API_TOKEN`) and GH auth.
2. Resolves-or-creates D1 database, KV namespaces, and R2 bucket on Cloudflare.
3. Sets the resulting IDs as GitHub Actions **variables** (consumed at build time).
4. Sets `CLOUDFLARE_API_TOKEN` and `PREVIEW_NUXT_AUTH_SECRET` as GitHub **secrets**.
5. Bulk-pushes all `NUXT_*` / `CRON_SECRET` entries from `.env` to the production
   Worker as runtime secrets.

---

### `db`

Thin wrappers around `nuxt db` commands.

```bash
pnpm cli db generate               # generate migration from schema diff
pnpm cli db migrate                # apply migrations to local .data (default)
pnpm cli db migrate --remote       # apply to remote D1 (requires prior pnpm build)
pnpm cli db sql "SELECT count(*) FROM users"
pnpm cli db reset                  # wipe .data, re-migrate; run dev seed to repopulate
```

---

### `verify`

Run the local CI gate. Mirrors the checks CI runs on every PR.

```bash
pnpm cli verify             # lint → typecheck → test; stops at first failure
pnpm cli verify --json      # machine-readable per-step pass/fail
pnpm cli verify --no-fail-fast  # run all steps regardless of failures
```

Exit code is `0` only when all three steps pass.

## Environment variables

| Variable | Used by | Notes |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | `doctor`, `deploy setup` | Preferred; scoped to Workers+D1+KV+R2 |
| `CLOUDFLARE_TOKEN` | `doctor`, `deploy setup` | Fallback |
| `NUXT_HUB_CLOUDFLARE_API_TOKEN` | `doctor`, `deploy setup` | Fallback |
| `CLOUDFLARE_ACCOUNT_ID` | `deploy setup` | Required for resource provisioning |
| `HARNESS_DEV_URL` | `dev seed/provision/login/cleanup` | Override dev server base URL (default: `http://localhost:3002`) |
| `NUXT_AUTH_SECRET` | `dev setup` writes it | One of the three generated auth secrets |
| `NUXT_TASK_SECRET` | `dev setup` writes it | One of the three generated auth secrets |
| `NUXT_WEBHOOK_SIGNING_SECRET` | `dev setup` writes it | One of the three generated auth secrets |

## Design notes

- **No prompts.** Every argument is a flag or positional; there are no interactive
  wizards. Safe to call from CI scripts, agent loops, and shell pipelines.
- **All shell-outs use `spawn` with `shell: false`** and an args array. No string
  interpolation into shell commands — no injection surface.
- **Injectable `runner`.** Every Cloudflare and GitHub helper accepts an optional
  `runner` function defaulting to `run`. Unit tests stub it; no process is spawned.
- **No build step.** Everything runs via `tsx` at call time. The root
  `pnpm cli` / `pnpm harness` scripts invoke `tsx packages/cli/src/index.ts`.
