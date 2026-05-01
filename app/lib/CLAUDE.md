# app/lib

> Auto-imported via `imports.dirs: ['~/lib']` in `nuxt.config.ts` — call
> exports directly without an `import` statement.
>
> **Cross-cutting infrastructure helpers ONLY.** Business logic goes in
> `app/services/`.

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

## Lives elsewhere

| Concept | Location |
|---------|----------|
| CASL ability helpers (`parseAbility`, `abilitiesToRules`, `pageMetaCanCheck`) | `app/services/casl.ts` — auth/authz is business logic |
