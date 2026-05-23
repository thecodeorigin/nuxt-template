# layers/todo

> Reference vertical slice for any CRUD feature. Auto-discovered from
> `<root>/layers/todo/`. Use it as the template when adding a new resource —
> copy the structure, rename, then promote to a Pinia store **only** if the
> data is genuinely global (almost never).

## What this layer owns

| Concern | Where |
|--------|------|
| Todo schemas (`Todo`, `NewTodo`, `UpdateTodo`) | `shared/schemas/todo.ts` |
| CRUD endpoints (`useStorage('todos')`-backed) | `server/api/todos/{index.get,index.post,[id].patch,[id].delete}.ts` |
| Client API wrapper | `app/api/useTodoApi.ts` |
| Page + components | `app/pages/todos.vue`, `app/components/Todo/*` |
| Page-scoped `provide`/`inject` helper | `app/composables/useTodos.ts` |

## Conventions

The same hard rules as the root project apply — TDD, Nuxt UI only, semantic
colors, schema validation at boundaries, verb-noun action names, namespaced
`Pascal/Pascal*.vue` components. See the root `CLAUDE.md` for the full list.

### Imports inside the layer

- `~~/...` and `~/...` resolve to the **project root**, not this layer. For
  layer-internal references use the canonical alias:
  - `#layers/todo/shared/schemas/todo`
  - `#layers/todo/app/api/useTodoApi`
- Composables auto-import across layers, so `useTodos()` works anywhere
  with no `import`. **Components do NOT** (see root `nuxt.config.ts` —
  `components: false`). Import them explicitly:
  `import TodoForm from '#layers/todo/app/components/Todo/TodoForm.vue'`.

### Page-scoped state pattern

The page (`pages/todos.vue`) owns the data via `useAsyncData`, then
`provide()`s mutations down to descendants. A typed `inject` helper
(`composables/useTodos.ts`) gives children type-safe access. **No Pinia.**
The store survives every route change; a CRUD list parked there leaks the
longer the user stays in the app.

**Data-fetching rule**: Never top-level `await useAsyncData` or `await useFetch` in
`<script setup>`. Always use the non-blocking form with a `default` factory and
`whenError`. Top-level `await` forces Suspense and blocks navigation.

```ts
// pages/todos.vue
const { data: todos, error } = useAsyncData('todos', () => todoApi.fetchTodos(), {
  default: (): Todo[] => [],
})
whenError(error)
provide(todosKey, { todos /* mutations */ })

// components/Todo/TodoForm.vue
const { createTodo } = useTodos()
```

## Adding a new CRUD feature

Copy this layer's structure verbatim. Promote to Pinia only if the data is
genuinely global. Three test files (`unit/<feature>-schema.test.ts`,
`nuxt/<feature>-page.test.ts`, `tests/<feature>.e2e.ts`) are the bar.

## Layout

```
layers/todo/
  nuxt.config.ts        Layer entry ($meta.name = 'todo')
  package.json
  app/
    api/useTodoApi.ts   fetchTodos, createTodo, updateTodo, deleteTodo
    components/Todo/    TodoForm, TodoList, TodoItem
    composables/useTodos.ts   typed inject helper for page context
    pages/todos.vue     owns data via useAsyncData + provide
  server/
    api/todos/
      index.get.ts      list
      index.post.ts     create
      [id].patch.ts     update
      [id].delete.ts    delete
  shared/
    schemas/todo.ts     TodoSchema, NewTodoSchema, UpdateTodoSchema
  test/
    unit/todo-schema.test.ts
    nuxt/todos-page.test.ts
  tests/todos.e2e.ts
```
