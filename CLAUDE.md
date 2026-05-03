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

## Stack

- **Nuxt 4** with **layers** for feature isolation (`layers/auth/`,
  `layers/todo/`). Each layer is auto-discovered and contributes its own
  `app/`, `server/`, `shared/`. Cross-cutting infrastructure stays in the
  project root.
- Vue 3, TypeScript
- **Nuxt UI v4** for every UI primitive
- **Pinia** for client state (only when truly global — see auth layer)
- **Drizzle ORM** + Neon serverless Postgres (`server/db/pg/`)
- **Upstash Redis** for sessions / caching (`useStorage('redis')`)
- **Zod** for validation at every boundary
- **Vitest** (unit + nuxt projects) and **Playwright** (e2e) for tests
- **antfu** ESLint config (no Prettier; eslint owns formatting)
- **pnpm** as the package manager
- **Deploy**: GitHub Actions builds + ships; Vercel only hosts the artifacts

## Hard rules

1. **TDD.** For any non-trivial change, write or extend a Vitest test *before*
   writing the implementation. Run `pnpm test` and ensure it goes red → green.
   For UI changes, add or extend a Playwright e2e test that exercises the user
   flow.
2. **Automation is the source of truth.** Every PR runs `CI` (lint + typecheck
   + tests) and `Preview` (build + Neon-branch migrate + deploy) on GitHub
   Actions. **Do not merge a PR with red checks.** Don't disable, mock-over,
   or `continue-on-error` a failing check to make it pass — fix the root
   cause. Push every change through a PR; never push to `main` directly.
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
    `components: false` so `<TodoForm>`, `<UserMenu>`, etc. are NOT
    auto-registered. Import them explicitly in `<script setup>`:
    `import TodoForm from '#layers/todo/app/components/Todo/TodoForm.vue'`.
    Nuxt UI's `<U*>` and the framework's `<NuxtPage>`/`<NuxtLink>` are
    still auto-imported (they're registered by their respective modules).
    Composables (`app/composables/`, layer composables) and utils
    (`app/utils/`, `server/utils/`) keep Nuxt's default auto-import
    behaviour, plus `~/lib` is explicitly added to `imports.dirs`.
13. **Naming conventions.**
    - **Components**: PascalCase Vue files in namespaced folders. Each filename
      starts with the folder name so the import name is unambiguous and
      `grep`-friendly: `layers/todo/app/components/Todo/TodoList.vue` →
      `import TodoList from '...'`,
      `layers/auth/app/components/Auth/AuthLoginCard.vue` →
      `import AuthLoginCard from '...'`. Existing namespaces: `Auth/`,
      `Dashboard/`, `Impersonate/`, `Todo/`, `User/`. Add a new namespace for
      a new feature; don't drop flat files into `components/`.
    - **Functions / store actions**: verb + noun, no abbreviations.
      `fetchTodos`, `fetchTodo`, `createTodo`, `updateTodo`,
      `updateTodoStatus`, `deleteTodo`, `startImpersonation`,
      `stopImpersonation`. Pinia stores expose actions named this way (no
      `fetchAll` / `create` / `update` / `remove`).

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
  db/pg/              Drizzle schema + migrations (PostgreSQL)
  utils/              Cross-cutting helpers only (PG client, cache, base64,
                      cron/webhook/task auth wrappers, URL builder, Redis
                      key prefix). No business logic.
  plugins/            Nitro plugins (redis storage mount etc.)
shared/utils/         Cross-cutting pure utils (id, number, string, uuid)
layers/
  auth/               Sessions, OAuth, CASL, impersonation, seed users.
                      Self-contained app/ + server/ + shared/ + tests.
                      See layers/auth/CLAUDE.md.
  todo/               Reference vertical slice (CRUD via provide/inject).
                      See layers/todo/CLAUDE.md.
test/
  unit/               Cross-cutting unit tests (storage-base etc.)
.github/workflows/    GitHub Actions — see "Deployment pipeline" below
.claude/
  skills/             Symlinks to .agents/skills
  settings.json       Allowlist for safe Bash/MCP tools, hooks
scripts/              One-off node scripts (key generation)
patches/              `pnpm patch` outputs (registered in pnpm-workspace.yaml)
vercel.json           Project config; `git.deploymentEnabled: false` so only CI deploys
```

## Layers

Nuxt auto-discovers any directory under `<root>/layers/`. Each layer is a
mini Nuxt app with its own `nuxt.config.ts`, `app/`, `server/`, `shared/`,
`test/`, and `tests/`. Auto-imports merge across layers, so a layer's
component is callable from the root or another layer without an explicit
import. Explicit cross-layer imports use `#layers/<name>/...`.

| Layer | Owns | Top-level guide |
|-------|------|-----------------|
| `auth` | Sessions, OAuth, CASL authorization, impersonation, seed users | `layers/auth/CLAUDE.md` |
| `todo` | Reference CRUD slice (page-scoped state via `provide`/`inject`) | `layers/todo/CLAUDE.md` |

When you add a new feature:
1. Create `layers/<name>/` mirroring the existing two.
2. Drop `nuxt.config.ts` (with `$meta: { name: '<name>' }`) and a stub
   `package.json` in the layer root.
3. Mirror the existing `CLAUDE.md` trace inside the layer (top-level +
   `app/api/`, `app/components/`, plus `app/stores/` if you really need a
   global store).
4. Don't add it to `extends` in the root `nuxt.config.ts` — auto-discovery
   picks it up.

## API route conventions

- File: `<layer>/server/api/<resource>/<action>.{method}.ts` (e.g.
  `layers/todo/server/api/todos/index.get.ts`,
  `layers/todo/server/api/todos/[id].patch.ts`).
- Handler: use `defineEventHandler` (or `defineAuthenticatedHandler` for routes
  that require a session, or `defineAuthorizedHandler` for ability-gated routes).
- Validate body with a Zod schema imported from `<layer>/shared/schemas/`.
- Throw `createError({ statusCode, statusMessage })` on failure; don't return
  bare 500s.
- Rate-limited endpoints use `useStorage('redis')` (see
  `layers/auth/server/api/auth/phone.patch.ts`).

## Auth & authorization

All auth/authz code lives in `layers/auth/`. The high-level shape:

- **Sessions** live in `useStorage('redis')` keyed by `session:{sessionId}`,
  where `sessionId` is the `sessionid` cookie (or `x-session-id` header).
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
- **Impersonation**: `POST /api/auth/impersonate/{start,stop}` swap the Redis
  session in-place (admin's session is backed up at
  `impersonator:session:<sid>`, the live session becomes the target user).
  The admin's identity rides along on `session.impersonator` so the UI knows
  who's actually piloting.

For the full ownership map, conventions for adding new auth routes, and the
impersonation invariant, read `layers/auth/CLAUDE.md`.

## Drizzle conventions

- Schema lives in `server/db/pg/schema.ts` at the project root because the
  tables are referenced by multiple layers (auth seeds users; future layers
  may add their own tables alongside). Generate migrations with
  `pnpm db:generate` and commit them. Migrations apply automatically in CI
  (preview = per-PR Neon branch; production = main Neon DB).
- For local dev or manual runs: `pnpm db:migrate` (reads `NUXT_POSTGRES_URL`
  from `.env`).
- Inspect with `pnpm db:preview` (Drizzle Studio).
- Export `Inferred*` types from the schema file; consumers import the type, not
  the row type from `pg`.

## Storage & caching

- `useStorage('redis')` is mounted by `server/plugins/redis.ts` against
  Upstash via the `unstorage/drivers/upstash` driver.
- The same Upstash instance backs all environments. Keys are namespaced by
  `getRedisBase()` (`server/utils/storage.ts`):
  - production → `redis:prod`
  - preview branch slug → `redis:preview:<slug>`
  - local dev → `redis:local`
  - explicit override → `NUXT_REDIS_BASE=...`
- Don't reach for `unstorage/drivers/memory` outside of fallbacks; production
  data must hit Upstash.

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
for cross-cutting infra (`~~/server/db/pg/schema`, `~~/server/utils/pg`,
`~~/shared/utils/id`).

## Deployment pipeline

GitHub Actions does the work. Vercel only hosts the artifacts.

`vercel.json` sets `git.deploymentEnabled: false`, so Vercel never auto-builds
on push. Don't re-enable it; deploys must go through CI so they're traceable
and so per-PR Neon branches stay isolated.

### Workflows

| Workflow | File | Triggers | What it does |
| --- | --- | --- | --- |
| **CI** | `.github/workflows/ci.yml` | Every PR + push to `main` | `pnpm lint`, `pnpm typecheck`, `pnpm test`. Must be green to merge. |
| **Preview** | `.github/workflows/preview.yml` | PR `opened` / `reopened` / `synchronize` / `closed` | On open/sync: creates `preview/pr-<#>-<branch>` Neon branch (14-day expiry), `vercel pull --environment=preview`, overrides `NUXT_POSTGRES_URL` + `POSTGRES_URL_NON_POOLING` to the per-PR branch, `vercel build` + `vercel deploy --prebuilt`, then runs `pnpm db:migrate` against the Neon branch, then posts a sticky PR comment with the URL. On close: deletes the Neon branch. |
| **Production** | `.github/workflows/production.yml` | Push to `main` | `vercel pull --environment=production`, `vercel build --prod`, `vercel deploy --prebuilt --prod`, then runs `pnpm db:migrate` against `PROD_POSTGRES_URL`. |

> Migrations run **after** the Vercel deploy, not before — so a failed
> deploy never moves the schema forward. The tradeoff is a brief window
> where the deployed code is running against the previous schema; safe
> for additive migrations, follow expand-contract for renames or drops.

### Environment isolation

- Production sees production Postgres + `redis:prod` Upstash prefix.
- Each preview gets an ephemeral Neon branch + its own
  `redis:preview:<branch-slug>` Upstash prefix. No data bleed between PRs.
- Local dev defaults to `redis:local`; you can point at a real Postgres via
  `.env` (don't commit).

### Required GitHub configuration

Already set in repo settings; only add new ones if you introduce a new
secret-bound integration.

| Kind | Name | Provided by |
| --- | --- | --- |
| Secret | `NEON_API_KEY` | Neon-GitHub integration |
| Secret | `VERCEL_TOKEN` | manual (Vercel team token) |
| Secret | `PROD_POSTGRES_URL` | manual (Neon production conn string) |
| Variable | `NEON_PROJECT_ID` | Neon-GitHub integration |
| Variable | `VERCEL_PROJECT_ID` | manual |
| Variable | `VERCEL_TEAM_ID` | manual |

`NUXT_DEMO_MODE=true` on Vercel preview/production env strips
`nuxt-security` / `@nuxt/eslint` / `@nuxt/test-utils` from `modules` and
ungates `/api/auth/demo-login`. **Never set this on a non-demo
deployment** — it's a deliberate production backdoor.

## Workflow before declaring "done"

The pre-commit hook (`.husky/pre-commit`) already runs `lint-staged`
(eslint --fix on staged `*.{ts,mts,cts,vue,js,mjs,cjs}`) and
`pnpm typecheck` (with `NUXT_DEMO_MODE=` so `nuxt-security` /
`@nuxt/test-utils` stay loaded — the demo strip would otherwise
leave `nuxt.config.ts` + `app/lib/ofetch.ts` un-typed). Don't bypass
it with `--no-verify`.

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
| `pnpm db:generate` | Generate Drizzle migration from schema diff |
| `pnpm db:migrate` | Apply pending migrations (uses `NUXT_POSTGRES_URL`) |
| `pnpm db:preview` | Open Drizzle Studio |
| `pnpm auth:generate` | Generate auth signing keys |

## Reference vertical slice: `layers/todo`

The todo layer is the canonical CRUD example. When adding a new feature,
**copy that layer's structure** — namespaced components, verb-noun functions
in `app/api/use<Name>Api.ts`, schemas in `<layer>/shared/schemas/`,
page-level state via `provide`/`inject`, three test files. Promote to a Pinia
store **only** if the data is genuinely global (the auth layer is the
template for that case). Do not invent a new layout.
