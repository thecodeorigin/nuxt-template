# Project conventions for AI agents

This file is loaded automatically by Claude Code. Read it before doing any work.
For UI work, also load the **`nuxt-ui` skill** (already symlinked at
`.claude/skills/nuxt-ui/`). For Nuxt UI component APIs, prefer the official MCP
server (`claude mcp add --transport http nuxt-ui https://ui.nuxt.com/mcp`) over
guessing.

## Stack

- **Nuxt 4** (`app/` srcDir), Vue 3, TypeScript
- **Nuxt UI v4** for every UI primitive
- **Pinia** for client state
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
   `getValidatedRouterParams`). Schemas live in `shared/schemas/` and are
   imported by both client and server.
7. **Keep type safety.** Don't introduce `any` to silence the compiler. Don't
   disable eslint rules without explanation.
8. **No new abstractions for hypothetical needs.** Three similar lines beats a
   premature helper.
9. **No comments unless they explain a non-obvious WHY.** Don't narrate WHAT.
10. **Naming conventions.**
    - **Components**: PascalCase Vue files in namespaced folders. Each filename
      starts with the folder name so Nuxt's auto-import dedupes correctly:
      `app/components/Todo/TodoList.vue` → `<TodoList>`,
      `app/components/Auth/AuthLoginCard.vue` → `<AuthLoginCard>`.
      Existing namespaces: `Auth/`, `Dashboard/`, `Impersonate/`, `Layout/`,
      `Todo/`, `User/`. Add a new namespace for a new feature; don't drop
      flat files into `components/`.
    - **Functions / store actions**: verb + noun, no abbreviations.
      `fetchTodos`, `fetchTodo`, `createTodo`, `updateTodo`,
      `updateTodoStatus`, `deleteTodo`, `startImpersonation`,
      `stopImpersonation`. Pinia stores expose actions named this way (no
      `fetchAll` / `create` / `update` / `remove`).

## Project layout

```
app/                  Nuxt frontend (srcDir)
  app.vue             Root, wrapped in <UApp>
  app.config.ts       Nuxt UI theme tokens (primary/neutral palettes, defaults)
  assets/css/         main.css imports tailwindcss + @nuxt/ui + CSS-var overrides
  layouts/
    default.vue       UDashboardGroup + sidebar shell (used by all auth pages)
    auth.vue          Centered card shell for /auth/login
  pages/              File-based routing
  components/         Auto-imported, PascalCase + namespaced folders:
    Auth/             AuthLoginCard.vue …
    Dashboard/        DashboardSessionCard.vue, DashboardGettingStarted.vue
    Impersonate/      ImpersonateMenu.vue (sidebar header), ImpersonateCandidateList.vue,
                      ImpersonateStopButton.vue
    Layout/           Sidebar pieces if/when added
    Todo/             TodoForm.vue, TodoList.vue, TodoItem.vue
    User/             UserMenu.vue (sidebar footer)
  lib/                Auto-imported via nuxt.config (composables, helpers)
  stores/             Pinia stores
  middleware/         auth.global.ts, casl.global.ts
  api/                Client-side API helpers (ofetch wrappers)
server/               Nitro backend
  api/                File-based routes, naming: <resource>/<verb>.{method}.ts
  db/pg/              Drizzle schema + migrations (PostgreSQL)
  utils/              Auth helpers, PG client, cache, getRedisBase()
  plugins/            Nitro plugins (redis storage mount etc.)
shared/               Code imported by both app and server
  schemas/            Zod schemas (single source of truth)
  seed/               Seed user definitions + ability presets
test/
  unit/               Pure unit tests (vitest, node env)
  nuxt/               Component / composable tests (vitest, nuxt env)
tests/                Playwright e2e specs
.github/workflows/    GitHub Actions — see "Deployment pipeline" below
.claude/
  skills/             Symlinks to .claude/skill-sources/<repo>/skills/<name>
  skill-sources/      Gitignored; populated by `pnpm skills:sync`
  settings.json       Allowlist for safe Bash/MCP tools, hooks
scripts/              One-off node scripts (key generation, skills sync, seed)
patches/              `pnpm patch` outputs (registered in pnpm-workspace.yaml)
vercel.json           Project config; `git.deploymentEnabled: false` so only CI deploys
```

## API route conventions

- File: `server/api/<resource>/<action>.{method}.ts` (e.g. `todos/index.get.ts`,
  `todos/[id].patch.ts`).
- Handler: use `defineEventHandler` (or `defineAuthenticatedHandler` for routes
  that require a session, or `defineAuthorizedHandler` for ability-gated routes).
- Validate body with a Zod schema imported from `shared/schemas/`.
- Throw `createError({ statusCode, statusMessage })` on failure; don't return
  bare 500s.
- Rate-limited endpoints use `useStorage('redis')` (see `server/api/auth/`).

## Auth & authorization

- **Sessions** live in `useStorage('redis')` keyed by `session:{sessionId}`,
  where `sessionId` is the `sessionid` cookie (or `x-session-id` header).
- **`AuthUser`** (`server/utils/auth.ts`) carries `abilities: string[]` and an
  optional `impersonator: ImpersonatorInfo | null` for the impersonation flow.
- **`defineAuthenticatedHandler((event, session) => ...)`** — auto-imported,
  throws 401 if no valid session.
- **`defineAuthorizedHandler(checks, (event, { session, ...extras }) => ...)`** —
  wraps the authenticated handler, throws 403 if no check passes (OR semantics).
  Checks: ability strings (`'blog:read'`, `'blog:read:self'`) or async functions
  returning `{ allowed, ...extras }`. The matching check's extras are merged
  into the handler context. Register fetchers for `:self` via
  `defineSubject('blog', { fetch })`. See `test/unit/casl-server.test.ts` for
  every supported syntax.
- **Frontend** uses `@casl/vue`. `app/plugins/casl.ts` syncs ability rules to
  `useAuthStore().currentUser.abilities`. Page-level gating via
  `definePageMeta({ can: ['blog:write'] })` (redirects to `/forbidden`).
  Component-level via standard `<Can I="read" a="blog">…</Can>` or
  `useAbility()`. See `test/unit/casl-frontend.test.ts`.
- **Page meta** flags (`public`, `unauthenticatedOnly`, `can`) are typed in
  `app/types/router.d.ts`. Default = requires auth.
- **Impersonation**: `POST /api/auth/impersonate/{start,stop}` swap the Redis
  session in-place (admin's session is backed up at
  `impersonator:session:<sid>`, the live session becomes the target user).
  The admin's identity rides along on `session.impersonator` so the UI knows
  who's actually piloting.

## Drizzle conventions

- Schema lives in `server/db/pg/schema.ts`. Generate migrations with
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
  `getRedisBase()` (`server/utils/storage-base.ts`):
  - production → `redis:prod`
  - preview branch slug → `redis:preview:<slug>`
  - local dev → `redis:local`
  - explicit override → `NUXT_REDIS_BASE=...`
- Don't reach for `unstorage/drivers/memory` outside of fallbacks; production
  data must hit Upstash.

## Deployment pipeline

GitHub Actions does the work. Vercel only hosts the artifacts.

`vercel.json` sets `git.deploymentEnabled: false`, so Vercel never auto-builds
on push. Don't re-enable it; deploys must go through CI so they're traceable
and so per-PR Neon branches stay isolated.

### Workflows

| Workflow | File | Triggers | What it does |
| --- | --- | --- | --- |
| **CI** | `.github/workflows/ci.yml` | Every PR + push to `main` | `pnpm lint`, `pnpm typecheck`, `pnpm test`. Must be green to merge. |
| **Preview** | `.github/workflows/preview.yml` | PR `opened` / `reopened` / `synchronize` / `closed` | On open/sync: creates `preview/pr-<#>-<branch>` Neon branch (14-day expiry), runs `pnpm db:migrate` against it, `vercel pull --environment=preview`, overrides `NUXT_POSTGRES_URL` + `POSTGRES_URL_NON_POOLING` to the per-PR branch, `vercel build` + `vercel deploy --prebuilt`, posts a sticky PR comment with the URL. On close: deletes the Neon branch. |
| **Production** | `.github/workflows/production.yml` | Push to `main` | `pnpm db:migrate` against `PROD_POSTGRES_URL`, `vercel pull --environment=production`, `vercel build --prod`, `vercel deploy --prebuilt --prod`. |

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

Local, in this order:

```bash
pnpm lint
pnpm typecheck
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
| `pnpm test` | Vitest unit + nuxt projects |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:e2e` | Playwright headless |
| `pnpm test:e2e:ui` | Playwright UI mode for debugging |
| `pnpm db:generate` | Generate Drizzle migration from schema diff |
| `pnpm db:migrate` | Apply pending migrations (uses `NUXT_POSTGRES_URL`) |
| `pnpm db:preview` | Open Drizzle Studio |
| `pnpm db:seed` | Upsert the `admin@seed.local` / `alice@seed.local` / `bob@seed.local` users with their preset abilities |
| `pnpm db:seed:down` | Remove the seed users |
| `pnpm skills:sync` | Refresh `.claude/skill-sources/` (run after `git pull`) |
| `pnpm auth:generate` | Generate auth signing keys |

## Reference vertical slice: `todos`

A complete example feature lives across:

- `shared/schemas/todo.ts` — Zod schemas (Todo, NewTodo, UpdateTodo)
- `server/api/todos/index.get.ts`, `index.post.ts`, `[id].patch.ts`,
  `[id].delete.ts` — CRUD endpoints (uses `useStorage('todos')` for simplicity;
  for relational data follow the Drizzle pattern in `server/api/auth/*`)
- `app/pages/todos.vue` — page using `<UDashboardPanel>`
- `app/components/Todo/TodoForm.vue`, `Todo/TodoList.vue`, `Todo/TodoItem.vue`
  — namespaced presentational components
- `app/stores/todos.ts` — Pinia store (`fetchTodos`, `createTodo`,
  `updateTodo`, `updateTodoStatus`, `deleteTodo`)
- `test/unit/todo-schema.test.ts` — schema unit test
- `test/nuxt/todos-page.test.ts` — component test
- `tests/todos.e2e.ts` — Playwright e2e

When adding a new feature, **copy this slice's structure**:
namespaced components, verb-noun store actions, schemas in `shared/`, three
test files. Do not invent a new layout.
