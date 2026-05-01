# app/lib

> Auto-imported via `imports.dirs: ['~/lib']` in `nuxt.config.ts` — call
> exports directly without an `import` statement.
>
> **Cross-cutting infrastructure helpers ONLY.** Anything domain-specific
> belongs in a layer's `app/composables/` (frontend) or `server/services/`
> (backend). The auth layer is the canonical example.

## Data fetching

| Rule | Detail |
|------|--------|
| Use `$http` for every API call | From `ofetch.ts`. Adds SSR cookie forwarding, CSRF header, loading indicator, 401 → `/auth/login`. Never raw `$fetch` |
| Wrap in `useAsyncData` / `useLazyAsyncData` | So SSR data hydrates and the response stays reactive |
| No top-level `await` in `<script lang="ts" setup>` | Blocks the render, breaks suspense |
| Path params | `$http('/api/x/:id', { query: { id } })` interpolates `:id` and drops it from the query string |
| Errors | Pass the `error` ref to `whenError(error, cb?)` (`app/utils/error.ts`). For toast/UI text, use `getErrorMessage(err)` |

## Helpers

- **`cn(...classes)`** (`utils.ts`) — `clsx` + `tailwind-merge`. Use for any
  conditional Tailwind class composition.
- **`valueUpdater`** (`utils.ts`) — `@tanstack/vue-table` updater bridge.

## Lives elsewhere

| Concept | Location |
|---------|----------|
| CASL ability helpers (`parseAbility`, `abilitiesToRules`, `pageMetaCanCheck`) | `layers/auth/app/composables/casl.ts` — frontend business logic lives in the auth layer's composables (auto-imported) |
| Page-scoped `provide`/`inject` helpers (`useTodos` etc.) | The owning layer's `app/composables/` (e.g. `layers/todo/app/composables/useTodos.ts`) |
| Pinia store (`useAuthStore`) | `layers/auth/app/stores/auth.ts` (auto-imported, no path needed) |
