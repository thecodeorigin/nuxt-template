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
- **Drizzle ORM** + PostgreSQL (`server/db/pg/`)
- **Zod** for validation at every boundary
- **Vitest** (unit + nuxt projects) and **Playwright** (e2e) for tests
- **antfu** ESLint config (no Prettier; eslint owns formatting)
- **pnpm** as the package manager

## Hard rules

1. **TDD.** For any non-trivial change, write or extend a Vitest test *before*
   writing the implementation. Run `pnpm test` and ensure it goes red → green.
   For UI changes, add or extend a Playwright e2e test that exercises the user
   flow.
2. **Nuxt UI only.** Never use raw `<button>`, `<input>`, `<select>`, `<dialog>`,
   `<table>`, `<a>` (for app navigation), or hand-rolled menus when a `U*`
   component exists. Consult the `nuxt-ui` skill for the catalog. The full
   component vocabulary is enumerated in
   `.claude/skills/nuxt-ui/references/components.md`.
3. **Semantic colors.** Use `text-default`, `bg-elevated`, `border-muted`, etc.
   Never raw palette colors like `text-gray-500`. See
   `.claude/skills/nuxt-ui/references/guidelines/design-system.md`.
4. **Wrap the app in `<UApp>`** (already done in `app/app.vue`). Keep it.
5. **Validate everything at boundaries.** Every server route must validate input
   with `readValidatedBody(event, schema.parse)` (or `getValidatedQuery`,
   `getValidatedRouterParams`). Schemas live in `shared/schemas/` and are
   imported by both client and server.
6. **Keep type safety.** Don't introduce `any` to silence the compiler. Don't
   disable eslint rules without explanation.
7. **No new abstractions for hypothetical needs.** Three similar lines beats a
   premature helper.
8. **No comments unless they explain a non-obvious WHY.** Don't narrate WHAT.

## Project layout

```
app/                Nuxt frontend (srcDir)
  app.vue           Root, wrapped in <UApp>
  app.config.ts     Nuxt UI theme tokens (primary/neutral palettes, defaults)
  assets/css/       main.css imports tailwindcss + @nuxt/ui + CSS-var overrides
  pages/            File-based routing
  components/       Auto-imported, prefer Nuxt UI primitives inside
  lib/              Auto-imported via nuxt.config (composables, helpers)
  stores/           Pinia stores
  middleware/       auth.global.ts etc.
  api/              Client-side API helpers (ofetch wrappers)
server/             Nitro backend
  api/              File-based routes, naming: <resource>/<verb>.{method}.ts
  db/pg/            Drizzle schema + migrations (PostgreSQL)
  utils/            Auth helpers, PG client, cache, cron
shared/             Code imported by both app and server
  schemas/          Zod schemas (single source of truth)
test/
  unit/             Pure unit tests (vitest, node env)
  nuxt/             Component / composable tests (vitest, nuxt env)
tests/              Playwright e2e specs
.claude/
  skills/           Symlinks to .claude/skill-sources/<repo>/skills/<name>
  skill-sources/    Gitignored; populated by `pnpm skills:sync`
  settings.json     Allowlist for safe Bash/MCP tools, hooks
scripts/            One-off node scripts (key generation, skills sync)
```

## API route conventions

- File: `server/api/<resource>/<action>.{method}.ts` (e.g. `todos/index.get.ts`,
  `todos/[id].patch.ts`).
- Handler: use `defineEventHandler` (or `defineAuthenticatedHandler` for routes
  that require a session).
- Validate body with a Zod schema imported from `shared/schemas/`.
- Throw `createError({ statusCode, statusMessage })` on failure; don't return
  bare 500s.
- Rate-limited endpoints use `useStorage('redis')` (see `server/api/auth/`).

## Drizzle conventions

- Schema lives in `server/db/pg/schema.ts`. Generate migrations with
  `pnpm db:generate` and commit them. Apply with `pnpm db:migrate`.
- Inspect with `pnpm db:preview` (Drizzle Studio).
- Export `Inferred*` types from the schema file; consumers import the type, not
  the row type from `pg`.

## Workflow before declaring "done"

Run all four:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e   # if UI/server behaviour changed
```

For UI changes you also need to manually verify in a browser via `pnpm dev`.
Type-checking and unit tests do not catch regressed visuals.

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
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:preview` | Open Drizzle Studio |
| `pnpm skills:sync` | Refresh `.claude/skill-sources/` (run after `git pull`) |
| `pnpm auth:generate` | Generate auth signing keys |

## Reference vertical slice: `todos`

A complete example feature lives across:

- `shared/schemas/todo.ts` — Zod schemas (Todo, NewTodo, UpdateTodo)
- `server/api/todos/index.get.ts`, `index.post.ts`, `[id].patch.ts`,
  `[id].delete.ts` — CRUD endpoints (uses `useStorage('todos')` for simplicity;
  for relational data follow the Drizzle pattern in `server/api/auth/*`)
- `app/pages/todos.vue` — page using Nuxt UI components
- `app/pages/index.vue` — landing page using Nuxt UI components
- `app/stores/todos.ts` — Pinia store
- `test/unit/todo-schema.test.ts` — schema unit test
- `test/nuxt/todos-page.test.ts` — component test
- `tests/todos.e2e.ts` — Playwright e2e

When adding a new feature, **copy this slice's structure**. Do not invent a new
layout.
