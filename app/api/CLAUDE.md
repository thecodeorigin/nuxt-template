# app/api

> Client-side API helpers. Every call to a Nitro route goes through a
> composable here — pages, stores, and components never call `$http` directly.
> Keeps endpoints discoverable, types centralised, refactors mechanical.

## Conventions

| Topic | Rule |
|-------|------|
| File naming | One file per resource: `use<Name>Api.ts` exporting `use<Name>Api()` |
| Function naming | Verb-noun (`fetchTodos`, `createTodo`, `updateTodoStatus`, `deleteTodo`) — same vocabulary as the matching Pinia store action |
| Route paths | Pass the **full path as a string literal** (`'/api/todos'`). Nitro's typed routes are keyed by literal path; concatenated/templated strings lose inference |
| Return types | Don't annotate. Let inference flow from the route handler. Only add `$http<Foo>(...)` if Nitro can't infer it |

## Exposing response types

```ts
export type FooResponse = ExtractResponse<typeof useFooApi, 'getFoo'>
```

`ExtractResponse` lives in `app/types/utils.d.ts`.

## Importing domain types

For DB rows / server-side shapes, import from `server/` rather than redeclaring:

```ts
import type { Foo } from '~~/server/db/pg/schema'
```

Schema files export `Foo = InferSelect<typeof fooTable>` — that's the source
of truth.
