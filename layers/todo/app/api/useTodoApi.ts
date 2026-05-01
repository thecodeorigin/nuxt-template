import type { NewTodo, Todo, UpdateTodo } from '#layers/todo/shared/schemas/todo'

export function useTodoApi() {
  function fetchTodos() {
    return $http<Todo[]>('/api/todos')
  }

  function createTodo(input: NewTodo) {
    return $http<Todo>('/api/todos', {
      method: 'POST',
      body: input,
    })
  }

  function updateTodo(id: string, input: UpdateTodo) {
    return $http<Todo>('/api/todos/:id', {
      method: 'PATCH',
      body: input,
      query: { id },
    })
  }

  function deleteTodo(id: string) {
    return $http('/api/todos/:id', {
      method: 'DELETE',
      query: { id },
    })
  }

  return {
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  }
}
