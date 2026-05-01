# layers/todo/app/api

> Client-side wrappers for `/api/todos/*`. Pages and components never call
> `$http` directly — everything goes through `useTodoApi()`.

## Conventions

| Topic | Rule |
|-------|------|
| File naming | One file per resource: `use<Name>Api.ts` exporting `use<Name>Api()` |
| Function naming | Verb-noun (`fetchTodos`, `createTodo`, `updateTodo`, `deleteTodo`) |
| Route paths | Pass the **full path as a string literal** (`'/api/todos'`, `'/api/todos/:id'`). Path params are interpolated from `query` by `$http` |
| Return types | Don't annotate. Let inference flow from the route handler. Only add `$http<Foo>(...)` when Nitro can't infer it (e.g. `$http<Todo[]>('/api/todos')`) |

## Importing domain types

```ts
import type { NewTodo, Todo, UpdateTodo } from '#layers/todo/shared/schemas/todo'
```

`~~/...` resolves to the project root, not the layer — see
`layers/todo/CLAUDE.md` ▸ "Imports inside the layer" for details.
