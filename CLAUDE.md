# Project conventions for AI agents

This file is loaded automatically by Claude Code. Read it before doing any work.
For UI work, also load the **`nuxt-ui` skill** (already symlinked at
`.claude/skills/nuxt-ui/`). For Nuxt UI component APIs, prefer the official MCP
server (`claude mcp add --transport http nuxt-ui https://ui.nuxt.com/mcp`) over
guessing.

For non-trivial features, prefer the **agent team workflow** over a solo
session. Run `/team-feature <description>` to spawn parallel `fullstack-dev`
+ `qa-visual` + `ux-researcher` teammates. See [`.claude/agents/README.md`](./.claude/agents/README.md)
for roles, coordination rules, and the layer-ownership invariant that keeps
parallel work untangled.

## Template adoption (first-time users)

This codebase is a **generic template**. If you see references to "Nuxt
Template" still in the repo, the user has not yet adapted it to their
actual product. Two slash commands handle the full adoption flow,
designed for non-technical users ("vibe coders") who treat the codebase
as a black box:

- **`/onboard`** — pure business interview (name, tagline, brand color,
  product/billing model, THECODEORIGIN credentials) that rewrites brand
  strings, `app.config.ts` colors, `.env`, and user-facing labels.
  Re-runnable for rebrands.
- **`/go-live`** — walks the user through Cloudflare + GitHub
  credentials in plain English, then runs the existing `pnpm cli deploy
  setup` to provision D1/KV/R2/cache and wire up GitHub Actions deploys.

If the user is starting fresh and the brand is still "Nuxt Template",
suggest `/onboard` before any feature work.

## Stack

- **Nuxt 4** with **layers** for feature isolation (`layers/auth/`,
  `layers/product/`, `layers/project/`, etc.). Each layer is auto-discovered and contributes its own
  `app/`, `server/`, `shared/`. Cross-cutting infrastructure stays in the
  project root.
- Vue 3, TypeScript
- **Nuxt UI v4** for every UI primitive
- **Pinia** for client state (only when truly global — see auth layer)
- **NuxtHub** (`@nuxthub/core`) for the full Cloudflare stack: database, KV,
  blob, cache. Server-side `db`, `schema`, `kv`, `blob` are provided by the
  `@nuxthub/{db,kv,blob}` packages (auto-imported; also importable explicitly).
- **Drizzle ORM** + Cloudflare **D1** (SQLite) via NuxtHub. Schema in
  `server/db/schema.ts`; client is `db` from `@nuxthub/db`.
- **Cloudflare KV** for sessions / caching / rate-limit counters — `kv` from
  `@nuxthub/kv` (local dev is emulated).
- **Cloudflare R2** for blobs — `blob` from `@nuxthub/blob`.
- **Zod** for validation at every boundary
- **Vitest** (unit + nuxt projects) and **Playwright** (e2e) for tests
- **antfu** ESLint config (no Prettier; eslint owns formatting)
- **pnpm** as the package manager
- **Deploy**: GitHub Actions builds + ships to **Cloudflare Workers**
  (`wrangler deploy`). NuxtHub applies D1 migrations during the build.

## Hard rules

1. **TDD.** For any non-trivial change, write or extend a Vitest test *before*
   writing the implementation. Run `pnpm test` and ensure it goes red → green.
   For UI changes, add or extend a Playwright e2e test that exercises the user
   flow.
2. **Automation is the source of truth.** Every PR runs `CI` (lint + typecheck
   + tests) and `Preview` (build + deploy to a Cloudflare Workers preview, D1
   migrations applied during build) on GitHub Actions. **Do not merge a PR with
   red checks.** Don't disable, mock-over, or `continue-on-error` a failing
   check to make it pass — fix the root cause. Push every change through a PR;
   never push to `main` directly.
3. **Nuxt UI only.** Never use raw `<button>`, `<input>`, `<select>`, `<dialog>`,
   `<table>`, `<a>` (for app navigation), or hand-rolled menus when a `U*`
   component exists. Consult the `nuxt-ui` skill for the catalog. The full
   component vocabulary is enumerated in
   `.claude/skills/nuxt-ui/references/components.md`.
4. **Semantic colors.** Use `text-default`, `bg-elevated`, `border-muted`, etc.
   Never raw palette colors like `text-gray-500`. See
   `.claude/skills/nuxt-ui/references/guidelines/design-system.md`.
5. **Wrap the app in `<UApp>`** (already done in `app/app.vue`). Keep it.
6. **Validate everything at boundaries.** Every server route must validate input
   with `readValidatedBody(event, schema.parse)` (or `getValidatedQuery`,
   `getValidatedRouterParams`). Schemas live in
   `<layer>/shared/schemas/` (or root `shared/schemas/` for cross-cutting
   ones) and are imported by both client and server.
7. **Keep type safety.** Don't introduce `any` to silence the compiler. Don't
   disable eslint rules without explanation.
8. **No new abstractions for hypothetical needs.** Three similar lines beats a
   premature helper.
9. **No comments unless they explain a non-obvious WHY.** Don't narrate WHAT.
10. **No business logic in `utils/` folders.** Domain-specific code goes in
    a layer: backend logic in `server/services/` (seed definitions, billing
    rules, email composition, etc.), frontend logic in `app/composables/`
    (ability parsing, page-meta gating, formatters). `server/utils/`,
    `app/lib/`, and `shared/utils/` are reserved for cross-cutting
    infrastructure helpers (PG client, cache, base64, URL builders). When
    in doubt: would a different feature plausibly reuse this verbatim? If
    no → it belongs in the matching layer.
11. **Layer ownership.** A new feature gets its own layer under `layers/<name>/`
    with the same internal shape as the existing two. Don't drop feature code
    into the project root unless it is genuinely cross-cutting (the dashboard
    shell, the loading indicator, the `cn` helper, etc.).
12. **No auto-imports for user components.** `nuxt.config.ts` sets
    `components: false` so `<ProductForm>`, `<UserMenu>`, etc. are NOT
    auto-registered. Import them explicitly in `<script setup>`:
    `import ProductForm from '#layers/product/app/components/Product/ProductForm.vue'`.
    Nuxt UI's `<U*>` and the framework's `<NuxtPage>`/`<NuxtLink>` are
    still auto-imported (they're registered by their respective modules).
    Composables (`app/composables/`, layer composables) and utils
    (`app/utils/`, `server/utils/`) keep Nuxt's default auto-import
    behaviour, plus `~/lib` is explicitly added to `imports.dirs`.
13. **Never top-level `await useAsyncData`/`useFetch` in `<script setup>`.** Use the non-blocking form: `const { data, error } = useAsyncData(key, fn, { default: () => defaultVal })` + `whenError(error)`. If you need blocking behavior, use `<Suspense>` explicitly or `useLazyFetch`/`useLazyAsyncData`. Top-level `await` of these composables forces Suspense, blocks navigation, and is an anti-pattern in this project.
14. **Naming conventions.**
    - **Components**: PascalCase Vue files in namespaced folders. Each filename
      starts with the folder name so the import name is unambiguous and
      `grep`-friendly: `layers/product/app/components/Product/ProductList.vue` →
      `import ProductList from '...'`,
      `layers/auth/app/components/Auth/AuthLoginCard.vue` →
      `import AuthLoginCard from '...'`. Existing namespaces: `Auth/`,
      `Dashboard/`, `Impersonate/`, `Product/`, `Project/`, `User/`. Add a
      new namespace for a new feature; don't drop flat files into `components/`.
    - **Functions / store actions**: verb + noun, no abbreviations.
      `fetchProducts`, `fetchProduct`, `createProduct`, `updateProduct`,
      `deleteProduct`, `startImpersonation`, `stopImpersonation`. Pinia stores
      expose actions named this way (no `fetchAll` / `create` / `update` / `remove`).
15. **Every DB write goes through a Nitro task** at
    `<layer>/server/tasks/{seed,create,update,refactor}/<noun>.ts`. No
    raw `nuxt db sql "INSERT|UPDATE|DELETE …"`, no uncommitted
    `tsx scripts/fix.ts`, no ad-hoc Drizzle invocations from outside a
    task or service. Re-run safety (idempotency) is required —
    `onConflictDoUpdate`, `onConflictDoNothing`, or read-then-write.
    Server routes that accept Zod-validated user input are the only
    other sanctioned write path. Sub-rules:
    - **General data primitives** (`createUser`, `updateOrganizationRole`,
      `grantAbility`) live in `<layer>/server/services/<noun>.ts` and
      are called by tasks AND other code (dev endpoints, plugins,
      other tasks).
    - **Seed orchestration** (which emails get the admin tier, which
      fixtures land in the demo inbox) lives **inline in the seed
      task**. No separate `services/seed*.ts` files — they collect
      ceremony for no reuse benefit since seed tasks have one caller.
    - **Default values / fixtures** (`SYSTEM_GRANTS`, `DEMO_USERS`,
      `DEMO_NOTIFICATIONS`, `REFERRAL_REWARD`) live in
      `<layer>/server/constants/<category>.ts`. Never mixed into a
      service file; never in `shared/` unless the client also
      consumes them.

    **Load the `data` skill** for the full convention; see
    `layers/auth/server/tasks/` for the canonical examples
    (`seed:permissions`, `seed:users`, `create:admin`,
    `update:grant-ability`).
16. **Permission awareness on every feature.** Any change that adds or
    modifies a route, sidebar item, admin action, or gated component
    triggers a permission review across three files:
    - `layers/auth/shared/permissions.ts` — catalog (`SYSTEM_ABILITY_KEYS`,
      `TENANT_ABILITY_KEYS`, `DEFAULT_PERSONAL_ORG_ABILITIES`,
      `DEFAULT_MEMBER_ABILITIES`)
    - `layers/auth/server/constants/defaults.ts` — `SYSTEM_GRANTS`
      (production system admin); `layers/auth/shared/permissions.ts` —
      `DEFAULT_ROLE_ABILITIES` (demo/new-tenant tiers, source of truth)
    - Live users in deployed envs — need a permission-lifecycle task
      to backfill the new ability so it reaches existing rows.
      Sessions auto-refresh; no re-login needed.

    These three must stay synchronised. A new key with no grant = no
    one has the permission; a new grant referencing an undeclared key
    = silently dropped.

    **The lifecycle tasks** (all in `layers/auth/server/tasks/`):

    | Need | Task |
    |---|---|
    | New admin power | edit `SYSTEM_GRANTS.admin` → `seed:permissions` → `update:admin` |
    | New paid-feature ability for a role's members | `update:grant-ability` with `target.kind="role"` |
    | Grant an ability to specific customers | `update:grant-ability` with `target.kind="members"` |
    | Create a customer account | `create:user` / `create:users` (idempotent) |
    | Patch a user (suspend, verify, rename) | `update:user` |
    | Create / modify a named role | `create:role` / `update:role` (`update:role` auto-refreshes sessions of every member with the role) |

    See `.agents/skills/data/references/permission-aware-data.md` for
    the full checklist and end-to-end recipes.

## Project layout

```
app/                  Cross-cutting Nuxt frontend (project srcDir)
  app.vue             Root, wrapped in <UApp>
  app.config.ts       Nuxt UI theme tokens (primary/neutral palettes, defaults)
  assets/css/         main.css imports tailwindcss + @nuxt/ui + CSS-var overrides
  layouts/default.vue UDashboardGroup + sidebar shell (consumes layer
                      components: <ImpersonateMenu>, <UserMenu>)
  pages/              Cross-cutting pages: index.vue, dashboard.vue
  components/
    Dashboard/        DashboardSessionCard, DashboardGettingStarted
  lib/                Auto-imported via nuxt.config — cross-cutting helpers
                      ONLY (cn, $http). No business logic.
  types/utils.d.ts    Generic TS helpers (ExtractResponse)
  utils/error.ts      whenError, getErrorMessage
server/               Cross-cutting Nitro backend (project)
  db/                 Drizzle schema (schema.ts, SQLite/D1) + generated
                      migrations (migrations/sqlite/). NuxtHub owns the
                      drizzle config + the db/kv/blob bindings.
  routes/             Nitro routes (e.g. images/[...pathname] → blob.serve)
  utils/              Cross-cutting helpers only (KV cache wrapper, base64,
                      cron/webhook/task auth wrappers, URL builder). No
                      business logic. (db/kv/blob come from @nuxthub/*.)
shared/utils/         Cross-cutting pure utils (id, number, string, uuid)
layers/
  auth/               Sessions, OIDC sign-in via @thecodeorigin/auth,
                      CASL, impersonation, seed users.
                      Self-contained app/ + server/ + shared/ + tests.
                      See layers/auth/CLAUDE.md.
  product/            Staff-managed product catalog (system abilities).
  project/            User-managed projects with membership + product links.
test/
  unit/               Cross-cutting unit tests
.github/workflows/    GitHub Actions — see "Deployment pipeline" below
.claude/
  agents/             Agent definitions (fullstack-dev, qa-visual, etc.)
  commands/           Slash commands (/team-feature, /team)
  skills/             Skill packs (cook, prep, nuxt-ui, nuxt, etc.)
  settings.json       Allowlist for safe Bash/MCP tools, hooks
scripts/              One-off node scripts (key generation)
patches/              `pnpm patch` outputs (registered in pnpm-workspace.yaml)
wrangler.jsonc        Cloudflare Workers config (observability only; NuxtHub
                      generates the D1/KV/R2 bindings from nuxt.config hub block)
```

## Layers

Nuxt auto-discovers any directory under `<root>/layers/`. Each layer is a
mini Nuxt app with its own `nuxt.config.ts`, `app/`, `server/`, `shared/`,
`test/`, and `tests/`. Auto-imports merge across layers, so a layer's
component is callable from the root or another layer without an explicit
import. Explicit cross-layer imports use `#layers/<name>/...`.

| Layer | Owns | Top-level guide |
|-------|------|-----------------|
| `auth` | Sessions, OIDC sign-in (`@thecodeorigin/auth`), CASL authorization, impersonation, seed users | `layers/auth/CLAUDE.md` |
| `product` | **Abstract**: the smallest indivisible billable unit (plan, addon, credit pack, item — whatever the adapted business calls it). System-managed catalog; staff abilities (`product:*`) | `layers/product/CLAUDE.md` |
| `project` | **Abstract**: a user's container that bundles one or more products together with members + roles (workspace, subscription, account, tenant). Tenant abilities (`project:*`) | `layers/project/CLAUDE.md` |

`product` and `project` are **abstract patterns**, not concrete domain
nouns. The file/type/function/table names always stay `product` and
`project` (per the layer ownership invariant), but the **user-facing
labels** are adapted to whatever the actual business calls them. The
`/onboard` command performs this mapping based on the user's answers.
Read both layer CLAUDE.md files before extending either.

When you add a new feature:
1. Create `layers/<name>/` mirroring the existing two.
2. Drop `nuxt.config.ts` (with `$meta: { name: '<name>' }`) and a stub
   `package.json` in the layer root.
3. Mirror the existing `CLAUDE.md` trace inside the layer (top-level +
   `app/api/`, `app/components/`, plus `app/stores/` if you really need a
   global store).
4. Don't add it to `extends` in the root `nuxt.config.ts` — auto-discovery
   picks it up.
5. If the layer needs sidebar links, a navbar slot, or overlays, add a
   `layers/<name>/app/plugins/99.contribute.<name>.client.ts` (see below).

## Dynamic layout / layer registry

`app/layouts/default.vue` never hard-codes layer-specific navigation.
Instead, each layer **contributes** its UI slots at plugin time through
`useLayerRegistry()` from `app/composables/useLayerRegistry.ts`.

```ts
// layers/<name>/app/plugins/99.contribute.<name>.client.ts
export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      {
        id: 'my-page',
        label: 'My Page',
        icon: 'i-lucide-star',
        to: '/my-page',
        section: 'main',
        priority: 15,
      },
    ],
  })
})
```

Three contribution slots:

| Slot | Purpose |
|------|---------|
| `navItems` | Sidebar links. `section` places them in `main`, `settings`, or `sub`; `priority` (ascending) controls order within the section. |
| `navbarItems` | Icon components rendered in the dashboard navbar (e.g. notifications bell). Sorted by `priority`. |
| `overlays` | Vue components mounted once at layout level (modals, slidevers). No priority. |

The `99.` plugin prefix ensures contributions run after stores and auth are
ready. Full field reference and the current priority table are in
`app/layouts/CLAUDE.md`.

## API route conventions

- File: `<layer>/server/api/<resource>/<action>.{method}.ts` (e.g.
  `layers/product/server/api/products/index.get.ts`,
  `layers/product/server/api/products/[id].patch.ts`).
- Handler: use `defineEventHandler` (or `defineAuthenticatedHandler` for routes
  that require a session, or `defineAuthorizedHandler` for ability-gated routes).
- Validate body with a Zod schema imported from `<layer>/shared/schemas/`.
- Throw `createError({ statusCode, statusMessage })` on failure; don't return
  bare 500s.
- Rate-limited endpoints use `kv` from `@nuxthub/kv` (see
  `layers/auth/server/api/auth/phone.patch.ts`).

## Auth & authorization

All auth/authz code lives in `layers/auth/`. The high-level shape:

- **Sign-in** is handled end-to-end by the **`@thecodeorigin/auth`** Nuxt
  module (OIDC, PKCE). The module auto-imports a `useAuth()` composable
  everywhere:
  - `signIn(redirect?)` — navigates to `/auth/login`, which kicks off the
    OIDC flow against `id.thecodeorigin.com` and returns to `/auth/callback`.
  - `signOut()` — navigates to `/auth/logout`.
  - `session`, `user`, `loggedIn`, `abilities`, `impersonator` — reactive
    refs populated from `/api/_auth/session`.
  - There is **no Google or GitHub sign-in**; THECODEORIGIN is the sole
    external provider. Credentials: `NUXT_THECODEORIGIN_CLIENT_ID` and
    `NUXT_THECODEORIGIN_CLIENT_SECRET` in `.env`.
- **Sessions** are stored in Cloudflare KV via the module
  (`sessionStorageBase: 'hub:kv'`). The `sessionid` cookie (or
  `x-session-id` header) is the key.
- **`AuthUser`** (`layers/auth/server/services/auth.ts`) carries
  `abilities: string[]` and an optional
  `impersonator: ImpersonatorInfo | null` for the impersonation flow.
- **`defineAuthenticatedHandler((event, session) => ...)`** — import from
  `#layers/auth/server/services/auth`. Throws 401 if no valid session. Not
  auto-imported — services are explicit by design. Inside the auth layer use
  the same alias; `~~/...` resolves to the project root, not the layer.
- **`defineAuthorizedHandler(checks, (event, { session, ...extras }) => ...)`** —
  import from `#layers/auth/server/services/casl`. Wraps the authenticated
  handler, throws 403 if no check passes (OR semantics). Checks: ability strings (`'blog:read'`,
  `'blog:read:self'`) or async functions returning `{ allowed, ...extras }`.
  Register fetchers for `:self` via `defineSubject('blog', { fetch })`. See
  `layers/auth/test/unit/casl-server.test.ts`.
- **Frontend** uses `@casl/vue`. `layers/auth/app/plugins/casl.ts` syncs ability
  rules to `useAuthStore().currentUser.abilities`. Page-level gating via
  `definePageMeta({ can: ['blog:write'] })` (redirects to `/forbidden`).
  Component-level via standard `<Can I="read" a="blog">…</Can>` or
  `useAbility()`. See `layers/auth/test/unit/casl-frontend.test.ts`.
- **Page meta** flags (`public`, `unauthenticatedOnly`, `can`) are typed in
  `layers/auth/app/types/router.d.ts`. Default = requires auth.
- **Impersonation**: `POST /api/_auth/impersonate` / `POST /api/_auth/stop-impersonating`
  (provided by `@thecodeorigin/auth`) swap the KV session in-place. The
  admin's identity rides along on `session.impersonator` so the UI knows
  who's actually piloting. Use `useAuth().impersonate(userId)` /
  `useAuth().stopImpersonating()` on the client.

For the full ownership map, conventions for adding new auth routes, and the
impersonation invariant, read `layers/auth/CLAUDE.md`.

## NuxtHub import convention

Use the **`@nuxthub/*`** packages, not the legacy `hub:*` virtual modules.
Per the NuxtHub docs, `@nuxthub/*` is the recommended form (it resolves across
Nuxt and external bundlers); `hub:*` only works inside Nuxt and is kept for
backwards compatibility. `db`, `schema`, `kv`, `blob` are also auto-imported
server-side, but prefer the explicit import for grep-ability:

- DB client: `import { db } from '@nuxthub/db'`
- Schema (tables, enums, types): `import { userTable, ActivityAction, type User } from '@nuxthub/db/schema'`
- KV: `import { kv } from '@nuxthub/kv'`
- Blob: `import { blob, ensureBlob } from '@nuxthub/blob'`

`@nuxthub/db/schema` is generated from `server/db/schema.ts`, so it re-exports
everything that file exports.

## Drizzle conventions

- Schema lives in `server/db/schema.ts` at the project root (SQLite via
  `drizzle-orm/sqlite-core`) because the tables are referenced by multiple
  layers (auth seeds users; future layers may add their own tables alongside).
  Generate migrations with `pnpm db:generate` (= `nuxt db generate`); they land
  in `server/db/migrations/sqlite/` — commit them. NuxtHub applies migrations
  automatically: on `pnpm dev`/`pnpm build` locally, and during the Cloudflare
  build in CI (`applyMigrationsDuringBuild`).
- For a manual local apply: `pnpm db:migrate` (= `nuxt db migrate`). Local dev
  uses a file-based SQLite DB under `.data` — no connection string needed.
- Inspect ad-hoc with `nuxt db sql "SELECT …"`.
- D1/SQLite caveats vs Postgres: ids are `text` (uuid via
  `crypto.randomUUID()`), timestamps are `integer({ mode: 'timestamp' })`,
  booleans are `integer({ mode: 'boolean' })`, JSON/arrays are
  `text({ mode: 'json' })`, and there are no native enums (use
  `text({ enum: [...] })`).
- Export `Inferred*` types from the schema file; consumers import the type from
  `@nuxthub/db/schema`.
- **Reads use `db.query.<table>.findFirst` / `findMany`** (the Drizzle
  relational query API), not `db.select().from(<table>)`. The relational
  form returns plain typed objects (no array unwrap, `findFirst` returns
  `T | undefined`), projects fields with `columns: { ... }`, and joins
  related tables with `with: { ... }` in one round-trip when
  `relations()` is defined. Drop to `db.select().from(...)` **only** for
  aggregates (`count`, `sum`), set operations (`UNION`/`INTERSECT`), or
  joins that can't be expressed via `with:`. If you use `db.select`, be
  ready to justify it. See
  `.agents/skills/cook/references/database-workflow.md` ("Reads: prefer
  `db.query.<table>`...") for the full rule and examples.

## Storage & caching

- KV is Cloudflare KV via NuxtHub — `import { kv } from '@nuxthub/kv'`
  (`kv.get/set/has/del/keys/clear`; `set` takes `{ ttl }` in seconds). Used for
  sessions, the per-user rate-limit counters, and `getCachedOrFetch`
  (`server/utils/cache.ts`).
- Blob is Cloudflare R2 — `import { blob } from '@nuxthub/blob'`
  (`server/routes/images/[...pathname].get.ts` serves via `blob.serve`).
- Local dev emulates KV/R2/D1 under `.data`; production resolves to the
  Cloudflare bindings declared in the `$production.hub` block of
  `nuxt.config.ts`. There is no per-environment key prefixing — each
  environment gets its own Cloudflare namespace/bucket.
- The `nuxt-security` rate limiter uses an in-process `lru-cache` driver
  (per Worker isolate). For cross-isolate limiting, back it with a KV- or
  Durable-Object-based unstorage driver.

## Tests

`vitest.config.ts` discovers tests in both `test/` (project root,
cross-cutting) and `layers/*/test/` (per-layer). Same for `playwright.config.ts`
which collects e2e specs from `tests/` and `layers/*/tests/`.

| Suite | Location | Env |
|-------|----------|-----|
| Cross-cutting unit | `test/unit/*.test.ts` | node |
| Layer unit | `layers/*/test/unit/*.test.ts` | node |
| Layer Nuxt-env | `layers/*/test/nuxt/*.test.ts` | nuxt (happy-dom) |
| Layer e2e | `layers/*/tests/*.e2e.ts` | Playwright |

Inside a layer, layer-internal imports use `#layers/<name>/...` aliases
(generated by `nuxt prepare`) for both source and test files. `~~/...` and
`~/...` always resolve to the project root, so use them only when reaching
for cross-cutting infra (`@nuxthub/db`, `@nuxthub/db/schema`,
`~~/shared/utils/id`).

## Deployment pipeline

GitHub Actions does the work, deploying to **Cloudflare Workers** with
`wrangler`. There is no Vercel and no Neon — D1, KV, R2, and the Worker all
live on Cloudflare.

Deploys go through CI so they're traceable. `wrangler.jsonc` carries only the
observability block; the D1/KV/R2 bindings are generated by NuxtHub from the
`$production.hub` block in `nuxt.config.ts` at build time.

### Workflows

| Workflow | File | Triggers | What it does |
| --- | --- | --- | --- |
| **CI** | `.github/workflows/ci.yml` | Every PR + push to `main` | `pnpm lint`, `pnpm typecheck`, `pnpm test`. Must be green to merge. |
| **Preview** | `.github/workflows/preview.yml` | PR `opened` / `reopened` / `synchronize` / `closed` | On open/sync: `pnpm build` with `NITRO_PRESET=cloudflare-module` + `CLOUDFLARE_ENV=preview`, `wrangler deploy --env preview`, then posts a sticky PR comment. D1 migrations apply during the build. No per-PR infra to tear down on close. |
| **Production** | `.github/workflows/production.yml` | Push to `main` | `pnpm build` with `NITRO_PRESET=cloudflare-module`, then `wrangler deploy`. D1 migrations apply during the build. |

> Migrations apply **during the build**, before the Worker goes live, so the
> deployed code always matches the current schema. For renames/drops, still
> follow expand-contract.

### Environment isolation

- Production and each preview use **separate Cloudflare bindings** (distinct
  D1 database, KV namespaces, R2 bucket) selected by `CLOUDFLARE_ENV`. No data
  bleed between environments.
- Local dev emulates D1/KV/R2 under `.data` — nothing to provision, nothing to
  commit.

### Required GitHub configuration

Replace the old Vercel/Neon secrets with the Cloudflare ones.

| Kind | Name | Provided by |
| --- | --- | --- |
| Secret | `CLOUDFLARE_API_TOKEN` | Cloudflare token with Workers + D1 + KV + R2 (and `workers_observability` if logging) edit perms |
| Variable | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account id |

Before the first deploy, create the resources (`wrangler d1 create`,
`wrangler kv namespace create`, `wrangler r2 bucket create`) and paste the
real ids into the `$production.hub` block of `nuxt.config.ts` (replacing the
`<…>` placeholders).

`nuxt-security` is loaded uniformly across **development, preview, and
production** with the same production-grade configuration (CSP, HSTS,
CSRF, rate limiter, request-size limiter, XSS validator, full headers
suite). The rate-limiter driver is an in-process `lru-cache` (per Worker
isolate). Don't add a `$development.security` or `$test.security` block —
the goal is for dev/preview to behave just like production.

`NUXT_PUBLIC_DEMO_MODE=true` on the Cloudflare preview/production env ungates
`/api/auth/demo/login` so the deployed app accepts the
"Sign in as Admin/User Agent" buttons. **Don't set it on a non-demo
deployment** — it's a deliberate backdoor for the demo project.

## Workflow before declaring "done"

The pre-commit hook (`.husky/pre-commit`) already runs `lint-staged`
(eslint --fix on staged `*.{ts,mts,cts,vue,js,mjs,cjs}`) and
`pnpm typecheck`. Don't bypass it with `--no-verify`.

Before pushing, also run:

```bash
pnpm test
pnpm test:e2e   # if UI/server behaviour changed
```

Then push. The PR cannot be merged unless **CI** is green and **Preview**
deployed cleanly. The preview URL in the sticky comment is the canonical
manual-verification target — for UI work, click through it instead of relying
solely on `pnpm dev`. Don't merge if the preview is broken.

If a check fails:
- **Don't** add `continue-on-error`, mock the failing input, or comment out
  the assertion.
- **Do** reproduce locally with the same env, fix the root cause, push again.

## Useful scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Nuxt dev server with HMR |
| `pnpm typecheck` | `nuxt typecheck` (vue-tsc) |
| `pnpm lint` | ESLint over the whole repo |
| `pnpm test` | Vitest unit + nuxt projects (root + layers) |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:e2e` | Playwright headless (root + layers) |
| `pnpm test:e2e:ui` | Playwright UI mode for debugging |
| `pnpm db:generate` | Generate D1/SQLite migration from schema diff (`nuxt db generate`) |
| `pnpm db:migrate` | Apply pending migrations to the local D1 DB (`nuxt db migrate`) |
| `pnpm auth:generate` | Generate auth signing keys |

## Reference vertical slice: `layers/product`

The product layer is the canonical CRUD example for staff-managed resources.
When adding a new feature, **copy its structure** — namespaced components,
verb-noun functions in `app/api/use<Name>Api.ts`, schemas in
`<layer>/shared/schemas/`, page-level state via `provide`/`inject`, three test
files. Promote to a Pinia store **only** if the data is genuinely global (the
auth layer is the template for that case). Do not invent a new layout.
