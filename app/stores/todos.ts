import type { NewTodo, Todo, UpdateTodo } from '~~/shared/schemas/todo'

export const useTodosStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([])
  const isLoading = ref(false)

  async function fetchAll() {
    isLoading.value = true
    try {
      todos.value = await $fetch<Todo[]>('/api/todos')
    }
    finally {
      isLoading.value = false
    }
  }

  async function create(input: NewTodo) {
    const todo = await $fetch<Todo>('/api/todos', { method: 'POST', body: input })
    todos.value = [todo, ...todos.value]
  }

  async function update(id: string, input: UpdateTodo) {
    const updated = await $fetch<Todo>(`/api/todos/${id}`, { method: 'PATCH', body: input })
    todos.value = todos.value.map(t => t.id === id ? updated : t)
  }

  async function remove(id: string) {
    await $fetch(`/api/todos/${id}`, { method: 'DELETE' })
    todos.value = todos.value.filter(t => t.id !== id)
  }

  return { todos, isLoading, fetchAll, create, update, remove }
})
