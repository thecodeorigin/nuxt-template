# layers/auth

> Self-contained Nuxt layer that owns identity, authorization, and impersonation.
> Auto-discovered from `<root>/layers/auth/`. The consuming app inherits
> components, stores, middleware, plugins, server routes, services, schemas,
> tasks, and types declared here without any explicit `extends`.

## What this layer owns

| Concern | Where |
|--------|------|
| Session shape (`AuthUser`, `ImpersonatorInfo`) | `server/services/auth.ts` |
| Authenticated handler wrapper | `server/services/auth.ts` (`defineAuthenticatedHandler`) |
| Authorization (`defineAuthorizedHandler`, `defineSubject`, ability parsing) | `server/services/casl.ts` |
| Impersonation (start/stop/list, session swap utilities) | `server/services/impersonate.ts`, `server/api/auth/impersonate/*` |
| Ability presets + seed fixtures (used by demo-login + e2e tests) | `server/services/seed.ts` |
| OAuth (Google, GitHub) | `server/api/auth/{google,github}{,/callback}.get.ts` |
| Demo/dev login backdoors | `server/api/auth/{demo-login,dev-login,dev-cleanup,dev-seed,agent}.*.ts` |
| Frontend session store + ability rules sync | `app/stores/auth.ts`, `app/plugins/casl.ts` |
| Route guards | `app/middleware/{auth,casl}.global.ts` |
| Login + 403 + impersonation UI | `app/pages/{auth/login,forbidden,sandbox/impersonate}.vue` |
| Auth/impersonation/user components | `app/components/{Auth,Impersonate,User}/*` |
| `PageMeta` extensions (`public`, `unauthenticatedOnly`, `can`) | `app/types/router.d.ts` |
| Auth schemas | `shared/schemas/impersonate.ts` |

## Conventions

The same hard rules as the root project apply here — TDD, Nuxt UI only,
semantic colors, schema validation at boundaries, no business logic in
`utils/`, verb-noun action names, namespaced `Pascal/Pascal*.vue` components.
See the root `CLAUDE.md` for the full list. Layer-specific notes follow.

### Cross-layer references

- This layer reads the database via `~~/server/db/pg/schema` and
  `~~/server/utils/pg` — both live in the project root because they're shared
  infrastructure. Don't duplicate them.
- This layer reads `~~/server/utils/storage` (Redis key-prefixing) for session
  storage. Same reason — infra, not auth.
- Identifier helpers (`simplifyNanoId`) come from `~~/shared/utils/id`.

### Imports inside the layer

- `~~/...` and `~/...` resolve to the **project root** (and root's `app/`),
  not the layer. So a layer-internal reference like
  `import { defineAuthenticatedHandler } from '~~/server/services/auth'`
  would miss the file. Use the canonical layer alias instead:
  - `#layers/auth/server/services/auth`
  - `#layers/auth/app/composables/casl`
  - `#layers/auth/shared/schemas/impersonate`
- Use `~~/server/utils/...`, `~~/server/db/pg/schema`, `~~/shared/utils/...`
  for cross-cutting infra that genuinely lives in the project root. Those
  resolve correctly because they exist at that path.
- Composables (`useAuthStore`, framework helpers), Pinia stores, and
  server utils auto-import across layers, so call sites like
  `useAuthStore()` work anywhere with no `import`. **Components do NOT**
  — `nuxt.config.ts` sets `components: false`. Import them explicitly:
  `import UserMenu from '#layers/auth/app/components/User/UserMenu.vue'`.
- Tests under `test/unit/`, `test/nuxt/`, and `tests/` use the same
  `#layers/auth/...` aliases. The root `vitest.config.ts` rewrites them to
  the layer path so node-env unit tests resolve correctly.

### Adding a new auth route

1. Schema first: extend or create a Zod schema in
   `shared/schemas/<resource>.ts`. Re-export the inferred type.
2. Endpoint at `server/api/auth/<resource>/<verb>.<method>.ts`. Use
   `defineAuthenticatedHandler` for session-only routes,
   `defineAuthorizedHandler([abilities])` for ability-gated ones.
3. Validate body/query/params with the schema (`readValidatedBody`, etc.).
4. Wire the call into `app/api/useAuthApi.ts` as a verb-noun function.
5. Promote to `app/stores/auth.ts` only if the data is genuinely global
   (session-shaped). CRUD-style auth data should stay page-scoped.
6. Add a unit test (`test/unit/`) for any pure logic; a Nuxt component test
   (`test/nuxt/`) for UI; an e2e (`tests/`) for end-to-end flows.

### Impersonation invariant

The Redis session at `session:<sid>` always holds the *target* user. The
admin's original session is backed up at `impersonator:session:<sid>` and
restored on stop. Every authorization check (server CASL + client `<Can>`)
therefore reads through the impersonated identity automatically — don't add
"is impersonating" branches in business logic. Use
`session.impersonator` only for audit/UI ("who's actually piloting").

## Layout

```
layers/auth/
  nuxt.config.ts        Layer entry ($meta.name = 'auth')
  package.json
  app/
    api/                useAuthApi (verb-noun ofetch wrappers)
    components/
      Auth/             AuthLoginCard
      Impersonate/      ImpersonateMenu, ImpersonateCandidateList,
                        ImpersonateStopButton
      User/             UserMenu (sidebar footer)
    layouts/auth.vue    Centered card shell for /auth/login
    middleware/
      auth.global.ts    Redirect rules around session presence
      casl.global.ts    Reads `definePageMeta({ can })` and gates routes
    pages/
      auth/login.vue
      forbidden.vue
      sandbox/impersonate.vue
    plugins/casl.ts     Syncs ability rules into @casl/vue
    composables/casl.ts Frontend ability parsing (rules + page-meta check)
    stores/auth.ts      Pinia: useAuthStore (currentUser, impersonator)
    types/router.d.ts   PageMeta + RouteMeta augmentations
  server/
    api/auth/           File-based auth routes (OAuth, me, logout, phone,
                        impersonate/*, demo/dev backdoors)
    services/
      auth.ts           AuthUser shape + defineAuthenticatedHandler
      casl.ts           defineAuthorizedHandler, defineSubject, ability eval
      impersonate.ts    Session swap helpers + IMPERSONATE_ABILITY constant
      seed.ts           ABILITY_PRESETS + SEED_USERS fixtures (e2e/dev only)
  shared/
    schemas/impersonate.ts
  test/
    unit/               casl-{server,frontend}, impersonate-*, seed
    nuxt/               auth-store-impersonate, impersonate-sandbox
  tests/                impersonate.e2e.ts
```
