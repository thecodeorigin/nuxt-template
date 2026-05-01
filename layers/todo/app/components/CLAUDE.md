# layers/todo/app/components

> Vue components for the todo domain, namespaced by feature folder. **Not
> auto-imported** — see the root `app/components/CLAUDE.md` for the
> rationale. Import them explicitly via `#layers/todo/app/components/...`.

## Naming rule

Each filename **starts with its parent folder's name**. Nested folders extend
the namespace by prefix.

| Path | Default-imported as |
|------|---------------------|
| `Todo/TodoForm.vue` | `TodoForm` |
| `Todo/TodoList.vue` | `TodoList` |
| `Todo/TodoItem.vue` | `TodoItem` |

```vue
<script setup lang="ts">
import TodoForm from '#layers/todo/app/components/Todo/TodoForm.vue'
import TodoList from '#layers/todo/app/components/Todo/TodoList.vue'
</script>
```

## Component contract

These components consume page state via `useTodos()` — the typed `inject`
helper at `#layers/todo/app/composables/useTodos.ts`, auto-imported via
Nuxt's default composables scan. They never fetch on their own; the owning
page (`#layers/todo/app/pages/todos.vue`) is the single source of data and
mutations. If you add a new Todo component, follow the same pattern: pull
state through `useTodos()`, surface UI errors via `useToast()`.
