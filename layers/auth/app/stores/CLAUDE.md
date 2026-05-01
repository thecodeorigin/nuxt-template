# layers/auth/app/stores

> Pinia is for **globally shared, long-lived data only**. The session is the
> textbook example — the sidebar, navbar, route guards, CASL plugin, and
> dashboard cards all read it.

## What lives here

| Store | Purpose |
|-------|---------|
| `useAuthStore` (`auth.ts`) | Current user, impersonator info, computed `isImpersonating`. Actions: `fetchCurrentUser`, `updateCurrentUser`, `startImpersonation`, `stopImpersonation`, `logout`, `fetchUserNotificationSettings`, `updateUserNotificationSettings`, `updatePhoneNumber` |

The store delegates HTTP to `~/api/useAuthApi.ts` and never calls `$http`
directly. Action names mirror the API composable verbs.

## Conventions

| Topic | Rule |
|-------|------|
| File naming | `use<Name>Store.ts` exporting `use<Name>Store()` |
| Definition style | Setup-style: `defineStore('name', () => { ... })` |
| Action names | Verb-noun (`fetchCurrentUser`, `startImpersonation`) |
| HTTP | Stores delegate to `app/api/use<Name>Api.ts` — never call `$http` directly |

## Belongs / does not belong

| Belongs here | Lives elsewhere |
|--------------|-----------------|
| Identity / session — read by sidebar, navbar, route guards, CASL plugin | CRUD resources → page-scoped state (see `layers/todo/app/composables/useTodos.ts` for the canonical pattern) |
| Cross-page UI state that genuinely must persist (theme, global filters) | Anything scoped to a single page → page-scoped state |
