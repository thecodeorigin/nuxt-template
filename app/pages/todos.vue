<script lang="ts" setup>
import type { Todo } from '~~/shared/schemas/todo'
import { useTodoApi } from '~/api/useTodoApi'

useHead({ title: 'Todos' })

const todoApi = useTodoApi()

const { data: todos, error } = useAsyncData(
  'todos',
  () => todoApi.fetchTodos(),
  { default: (): Todo[] => [] },
)
whenError(error)

provide(todosKey, {
  todos,
  async createTodo(input) {
    const todo = await todoApi.createTodo(input)
    todos.value = [todo, ...todos.value]
  },
  async updateTodo(id, input) {
    const updated = await todoApi.updateTodo(id, input)
    todos.value = todos.value.map(t => (t.id === id ? updated : t))
  },
  async updateTodoStatus(id, completed) {
    const updated = await todoApi.updateTodo(id, { completed })
    todos.value = todos.value.map(t => (t.id === id ? updated : t))
  },
  async deleteTodo(id) {
    await todoApi.deleteTodo(id)
    todos.value = todos.value.filter(t => t.id !== id)
  },
})
</script>

<template>
  <UDashboardPanel id="todos">
    <template #header>
      <UDashboardNavbar title="Todos">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6 max-w-2xl">
        <TodoForm />
        <TodoList />
      </div>
    </template>
  </UDashboardPanel>
</template>
