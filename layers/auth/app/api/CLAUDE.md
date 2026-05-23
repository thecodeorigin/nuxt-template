# layers/auth/app/api

> Client-side wrappers for this layer's server routes. Pages, stores, and
> components never call `$http` directly — they go through these composables.
>
> - **`useAuthApi()`** — `/api/auth/*` (session, OAuth, phone, impersonation).
> - **`useOrganizationApi()`** — orgs, members, permissions, and **invitations**
>   (`createInvitation`, `fetchInvitations`, `revokeInvitation`,
>   `fetchInvitation`, `acceptInvitation`). Also exposes the response types
>   `OrgMember`, `CatalogPermission`, `OrgInvitation`, `OrganizationSummary`.

## Conventions

| Topic | Rule |
|-------|------|
| File naming | One file per resource: `use<Name>Api.ts` exporting `use<Name>Api()` |
| Function naming | Verb-noun (`fetchCurrentUser`, `updateCurrentUser`, `startImpersonation`, `stopImpersonation`, `logout`) — same vocabulary as `useAuthStore` actions |
| Route paths | Pass the **full path as a string literal** (`'/api/auth/me'`). Nitro's typed routes are keyed by literal path; concatenated/templated strings lose inference |
| Return types | Don't annotate. Let inference flow from the route handler. Only add `$http<Foo>(...)` when Nitro can't infer it (e.g. `$http<AuthUser>('/api/auth/me')`) |

## Importing domain types

For DB rows / server-side shapes, import from the layer's `server/` via the
canonical layer alias:

```ts
import type { AuthUser } from '#layers/auth/server/services/auth'
```

`~~/...` resolves to the project root, not the layer — see
`layers/auth/CLAUDE.md` ▸ "Imports inside the layer" for details.

## Exposing response types

```ts
export type CurrentUser = ExtractResponse<typeof useAuthApi, 'fetchCurrentUser'>
```

`ExtractResponse` lives in `app/types/utils.d.ts` (project root — it's a
type-system helper, not auth-specific).
