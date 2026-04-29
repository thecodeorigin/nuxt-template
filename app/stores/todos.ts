import type { NewTodo, Todo, UpdateTodo } from '~~/shared/schemas/todo'

export const useTodosStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([])
  const isLoading = ref(false)

  async function fetchTodos() {
    isLoading.value = true
    try {
      todos.value = await $fetch<Todo[]>('/api/todos')
    }
    finally {
      isLoading.value = false
    }
  }

  async function createTodo(input: NewTodo) {
    const todo = await $fetch<Todo>('/api/todos', { method: 'POST', body: input })
    todos.value = [todo, ...todos.value]
  }

  async function updateTodo(id: string, input: UpdateTodo) {
    const updated = await $fetch<Todo>(`/api/todos/${id}`, { method: 'PATCH', body: input })
    todos.value = todos.value.map(t => (t.id === id ? updated : t))
  }

  async function updateTodoStatus(id: string, completed: boolean) {
    return updateTodo(id, { completed })
  }

  async function deleteTodo(id: string) {
    await $fetch(`/api/todos/${id}`, { method: 'DELETE' })
    todos.value = todos.value.filter(t => t.id !== id)
  }

  return {
    todos,
    isLoading,
    fetchTodos,
    createTodo,
    updateTodo,
    updateTodoStatus,
    deleteTodo,
  }
})
