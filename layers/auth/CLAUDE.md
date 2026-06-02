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
| Seed fixtures + task runners | `server/tasks/seed/{permissions,users,organizations,all}.ts` |
| OAuth (Google, GitHub) | `server/api/auth/{google,github}{,/callback}.get.ts` |
| Demo/dev login backdoors | `server/api/auth/demo/{login,dev-login,dev-provision,dev-seed,cleanup,agent}.*` |
| Frontend session store + ability rules sync | `app/stores/auth.ts`, `app/plugins/casl.ts` |
| Route guards | `app/middleware/{auth,casl}.global.ts` |
| Login + 403 + impersonation UI | `app/pages/{auth/login,forbidden,sandbox/impersonate}.vue` |
| Auth/impersonation/user components | `app/components/{Auth,Impersonate,User}/*` |
| Organization membership (orgs, members, permissions, switching) | `server/services/organization.ts`, `server/api/{organization,organizations,permissions}/*`, `app/components/Organization/*`, `app/pages/organization{,/index,/members}.vue` |
| Invitations (token links, create/list/revoke, public join + accept) | `server/api/organization/invitations/*`, `server/api/invitations/[token]/*`, `app/pages/join/[token].vue`, `shared/schemas/invitation.ts` |
| `PageMeta` extensions (`public`, `unauthenticatedOnly`, `can`) | `app/types/router.d.ts` |
| Schemas (auth, member, organization, user, invitation) | `shared/schemas/*` |
| Ability catalog + role→permission source of truth (`DEFAULT_ROLE_ABILITIES`) | `shared/permissions.ts` — edit here, then run `roles:sync` |
| Role permission reconcile command + prod trigger | `server/tasks/roles/sync.ts` (logic + task), `server/api/auth/roles/sync.post.ts` (bearer route) |

## Conventions

The same hard rules as the root project apply here — TDD, Nuxt UI only,
semantic colors, schema validation at boundaries, no business logic in
`utils/`, verb-noun action names, namespaced `Pascal/Pascal*.vue` components.
See the root `CLAUDE.md` for the full list. Layer-specific notes follow.

### Cross-layer references

- This layer reads tables and enums from `@nuxthub/db/schema` (generated mirror
  of `server/db/schema.ts`). Import named exports directly:
  `import { ActivityAction, activityTable, identityTable, userTable } from '@nuxthub/db/schema'`
- The `db` Drizzle client is **auto-imported** server-side by NuxtHub — no
  import needed. If you prefer explicit, use `import { db } from '@nuxthub/db'`.
- Session KV storage uses `import { kv } from '@nuxthub/kv'` — backed by
  Cloudflare KV in production and emulated locally.
- Identifier helpers (`simplifyNanoId`) come from `~~/shared/utils/id`.

### Imports inside the layer

- `~~/...` and `~/...` resolve to the **project root** (and root's `app/`),
  not the layer. So a layer-internal reference like
  `import { defineAuthenticatedHandler } from '~~/server/services/auth'`
  would miss the file. Use the canonical layer alias instead:
  - `#layers/auth/server/services/auth`
  - `#layers/auth/app/composables/casl`
  - `#layers/auth/shared/schemas/impersonate`
- Use `@nuxthub/db/schema` for table/enum imports, `@nuxthub/kv` for KV,
  `@nuxthub/blob` for blob. Use `~~/shared/utils/...` for cross-cutting
  pure helpers (those resolve to the project root directly).
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

### Invitations

Members are added two ways from the **Members** tab
(`app/pages/organization/members.vue` → `OrganizationMemberList`):

- **Direct add** (`POST /api/organization/members`) — adds an *existing* user
  by email immediately, granting `DEFAULT_MEMBER_ABILITIES`.
- **Invite by link** (`POST /api/organization/invitations`) — issues a
  token-based link (7-day expiry, `organization_invitations` table) for people
  who may not have an account yet.

Invitation routes are **active-org scoped** — the org comes from
`session.activeOrganizationId`, never a path param (the same pattern as the
members routes). Create/list/revoke live under
`server/api/organization/invitations/*` (gated `user:manage` for write,
`user:read` for list). The recipient flow is two routes under
`server/api/invitations/[token]/`:

- `index.get.ts` — public (`defineEventHandler`), returns `{ email, role, org }`
  for the join page so an unauthenticated visitor can preview the invite.
- `accept.post.ts` — `defineAuthenticatedHandler`. Maps the invitation `role`
  to abilities (`member` → `DEFAULT_MEMBER_ABILITIES`, `admin` →
  `DEFAULT_PERSONAL_ORG_ABILITIES`), calls `ensureMembership`, deletes the
  invitation, then `refreshUserSessions(userId)` so the grant is live in the
  KV session immediately (rewritten in place, not on next sign-in).

The public landing page is `app/pages/join/[token].vue`
(`definePageMeta({ public: true })`); after a successful accept it routes to
`/dashboard`. The client wrappers (`createInvitation`, `fetchInvitations`,
`revokeInvitation`, `fetchInvitation`, `acceptInvitation`) and the
`OrgInvitation` type live in `app/api/useOrganizationApi.ts`; the page-scoped
`invitations` ref + actions are provided via `app/composables/useOrganizationMembers.ts`.

## Layout

```
layers/auth/
  nuxt.config.ts        Layer entry ($meta.name = 'auth'); /users → /organization/members redirect
  package.json
  app/
    api/                useAuthApi, useOrganizationApi (verb-noun ofetch wrappers)
    components/
      Auth/             AuthLoginCard
      Impersonate/      ImpersonateMenu, ImpersonateCandidateList,
                        ImpersonateStopButton
      Organization/     OrganizationMenu (switcher), OrganizationMemberList
                        (UTable + invite form + pending invitations),
                        OrganizationMemberPermissionsModal, OrganizationAddMemberModal
      User/             UserMenu (sidebar footer)
    composables/
      casl.ts                 Frontend ability parsing (rules + page-meta check)
      useOrganizationMembers.ts  Page-scoped members + invitations inject
    layouts/auth.vue    Centered card shell for /auth/login
    middleware/
      auth.global.ts    Redirect rules around session presence
      casl.global.ts    Reads `definePageMeta({ can })` and gates routes
    pages/
      auth/login.vue
      forbidden.vue
      join/[token].vue        Public invitation landing → accept
      organization.vue        Tabbed shell (General / Members)
      organization/index.vue  General tab (org name, slug, member count)
      organization/members.vue  Members tab (members + invitations, provides membersKey)
      settings.vue + settings/{index,notifications,security}.vue
      sandbox/impersonate.vue
    plugins/casl.ts     Syncs ability rules into @casl/vue
    stores/auth.ts      Pinia: useAuthStore (currentUser, impersonator)
    types/router.d.ts   PageMeta + RouteMeta augmentations
  server/
    api/
      auth/             OAuth, me, logout, phone, impersonate/*
        demo/           Backdoor routes: login, dev-login, dev-provision, dev-seed, cleanup, agent
        roles/sync.post.ts  Bearer-guarded prod trigger for roles:sync
      organization/     Active-org: members/*, invitations/*, index.{get,patch}
      organizations/    Multi-org: list, switch
      invitations/[token]/  Public index.get + authenticated accept.post
      permissions/      Ability catalog
    db/schema.ts        Auth + org + membership + permission + invitation tables
    services/
      auth.ts           AuthUser shape + defineAuthenticatedHandler
      casl.ts           defineAuthorizedHandler, defineSubject, ability eval
      impersonate.ts    Session swap helpers + IMPERSONATE_ABILITY constant
      organization.ts   Org/membership/invitation queries + helpers
      session.ts        buildSession + refreshUserSessions (live KV rewrite)
    tasks/
      seed/             permissions.ts, users.ts, organizations.ts, all.ts
      roles/sync.ts     planRolePermissionSync (pure) + syncDefaultRolePermissions + task
  shared/
    permissions.ts      Ability catalog + DEFAULT_{PERSONAL_ORG,MEMBER}_ABILITIES
    schemas/            impersonate, member, organization, user, invitation
  test/
    unit/               casl-{server,frontend}, impersonate-*, seed,
                        {invitation,organization,user}-schema
    nuxt/               auth-store-impersonate, impersonate-sandbox, user-menu
  tests/                impersonate.e2e.ts, organization.e2e.ts
```
