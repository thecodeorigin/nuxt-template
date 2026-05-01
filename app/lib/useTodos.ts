import type { InjectionKey, Ref } from 'vue'
import type { NewTodo, Todo, UpdateTodo } from '~~/shared/schemas/todo'

export interface TodosContext {
  todos: Ref<Todo[]>
  createTodo: (input: NewTodo) => Promise<void>
  updateTodo: (id: string, input: UpdateTodo) => Promise<void>
  updateTodoStatus: (id: string, completed: boolean) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
}

export const todosKey: InjectionKey<TodosContext> = Symbol('todos')

export function useTodos() {
  const ctx = inject(todosKey)
  if (!ctx) {
    throw new Error('useTodos() must be called within the todos page')
  }
  return ctx
}
