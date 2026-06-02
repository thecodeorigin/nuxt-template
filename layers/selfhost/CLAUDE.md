# layers/selfhost

> Self-contained Nuxt layer that owns the **self-hosting** feature — lets a
> user deploy this template into their own Cloudflare account by pasting a
> Cloudflare API token. Auto-discovered from `<root>/layers/selfhost/`.

## What this layer owns

| Concern | Where |
|--------|------|
| Drizzle tables (`selfhost_deployments`, `selfhost_audit`) | `server/db/schema.ts` |
| Cloudflare API wrapper (verify, write-probe, provision, migrations, upload, subdomain) | `server/services/cloudflare.ts` *(Phase 2)* |
| GitHub release bundle fetcher (public + private repo via `NUXT_GITHUB_TOKEN`) | `server/services/github.ts` *(Phase 2)* |
| Deploy orchestration route (rate-limit, owner-check, audit, concurrent guard) | `server/api/selfhost/deploy.post.ts` *(Phase 3)* |
| Status + version-compare route | `server/api/selfhost/status.get.ts` *(Phase 3)* |
| Disconnect (null the stored token) route | `server/api/selfhost/disconnect.post.ts` *(Phase 3)* |
| Audit log route | `server/api/selfhost/audit.get.ts` *(Phase 3)* |
| Settings page (paste token, Deploy/Update button, status panel, expiry warning) | `app/pages/settings/self-host.vue` *(Phase 4)* |
| Sidebar contribution (Settings → Self-hosting, priority 90) | `app/plugins/99.contribute.selfhost.client.ts` *(Phase 4)* |

## The deploy flow (Phase 3)

1. `POST /api/selfhost/deploy` (body: `{ token? }` — omit to redeploy with stored token)
   1. **Precheck**: owner-role check, rate limit (1/60s/org), concurrent-deploy guard.
   2. `verifyToken` → `discoverAccount` → `probeCapabilities` (write-probe via POST+DELETE — returns missing permission names → 400 if any).
   3. `provisionResources` — idempotently creates D1, KV namespace, R2 bucket.
   4. `getLatestBundle(repo)` — fetches `bundle.json` from latest GitHub release; verifies SHA-256.
   5. `applyMigrations` — runs migrations against the user's D1 via the Cloudflare REST API; idempotent via `d1_migrations` table.
   6. `uploadWorker` — multipart PUT to Workers API with bindings (D1, KV, R2, `DEPLOYED_VERSION`).
   7. `enableSubdomain` — enables `*.workers.dev` for the script.
   8. Persists CF token (AES-GCM encrypted via `authSecret`), `workers_dev_url`, `deployed_version`, `cf_token_expires_at`, `status='deployed'`.
   9. Writes an audit row to `selfhost_audit` (success or failure).

## Token encryption

The Cloudflare API token is account-takeover-grade. It is stored
**AES-GCM-encrypted** using `encryptSecret`/`decryptSecret` from
`~~/server/utils/crypto.ts` (key = SHA-256 of `runtimeConfig.authSecret`). Rules:
- Never log or include in error messages.
- `GET /api/selfhost/status` strips `cf_token_ciphertext`/`cf_token_iv` from the response.
- `POST /api/selfhost/disconnect` nulls the ciphertext so the token can't be reused.

## DB schema (Phase 1)

`selfhost_deployments` is keyed by `organization_id` (one deployment per org).

| Column | Purpose |
|--------|---------|
| `organization_id` (PK) | One row per org |
| `cf_account_id` | Discovered Cloudflare account |
| `cf_script_name` | Worker script name (`nuxt-template-<8-char-org-id>`) |
| `workers_dev_url` | `https://<script>.<subdomain>.workers.dev` |
| `deployed_version` | GitHub release tag |
| `deployed_at` | Last successful deploy timestamp |
| `cf_token_ciphertext` / `cf_token_iv` | Encrypted CF API token for redeploy |
| `cf_token_expires_at` | From `/user/tokens/verify` — surfaces "expires in N days" warning |
| `status` | `idle` \| `deploying` \| `deployed` \| `failed` |
| `last_error` | Last failure message (≤500 chars, token-stripped) |

`selfhost_audit` is append-only.

| Column | Purpose |
|--------|---------|
| `id` (PK) | UUID |
| `organization_id` | Org that triggered the action |
| `actor_user_id` | Member who clicked the button (nullable on user-delete) |
| `action` | `deploy` \| `redeploy` \| `disconnect` |
| `success` | boolean |
| `cf_account_id` | For forensics — which CF account was touched |
| `error_message` | Stripped/truncated failure reason (≤500 chars) |
| `started_at` / `finished_at` | Duration tracking |

## "Update available" detection (Phase 3)

`GET /api/selfhost/status` fetches the latest GitHub release tag (cached 1h via
`getCachedOrFetch`). Returns `update_available: true` when
`deployed_version !== latest_version`. The UI shows a `UAlert` + Update button
that re-runs deploy with the stored token.

## Release bundle (Phase 5)

`.github/workflows/release.yml` (triggers on `v*` tags):
1. `pnpm build` (NITRO_PRESET=cloudflare-module)
2. `node scripts/make-deploy-bundle.mjs` — walks `.output/server`, base64-encodes
   ES modules, inlines migration SQL, stamps the tag as `version`.
3. Uploads `bundle.json` (and optional `*-cloudflare.tar.gz`) as release assets.

`runtimeConfig.githubRepository` (env: `NUXT_GITHUB_REPOSITORY`) must be set
to `OWNER/REPO`. `runtimeConfig.githubToken` (env: `NUXT_GITHUB_TOKEN`) is
optional — only required if the release repo is private.

## Conventions

- **Ability gating**: `selfhost:manage` gates deploy/disconnect; `selfhost:read` gates status/audit. (Registered in `layers/auth/shared/permissions.ts` in Phase 3.)
- **Owner-only**: in addition to the ability check, deploy is restricted to org members with `role='owner'` (the CF token is account-level — non-owners shouldn't bind it).
- **Rate limit**: 1 deploy / 60s / org via KV counter at `selfhost:deploy-rl:{orgId}`.
- **Concurrent guard**: refuses if `status='deploying'` and started <5min ago.
- **Cross-layer imports**: use `#layers/selfhost/...` for layer-internal references; `#layers/auth/...` for org/user table FKs; `~~/server/utils/...` for crypto/cache helpers.

## Phase map (implementation status)

- [x] Phase 1 — Skeleton + DB schema + migration
- [ ] Phase 2 — Crypto + Cloudflare/GitHub services + unit tests
- [ ] Phase 3 — API routes + abilities + permission lifecycle
- [ ] Phase 4 — UI page + sidebar contribution + Playwright e2e
- [ ] Phase 5 — Release pipeline (`scripts/make-deploy-bundle.mjs` + `.github/workflows/release.yml`)
- [ ] Phase 6 — End-to-end smoke against a sandbox CF account

See `/tmp/plans/selfhost-layer-port.md` for the full plan.
