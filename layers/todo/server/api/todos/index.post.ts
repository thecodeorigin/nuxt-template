import type { Todo } from '#layers/todo/shared/schemas/todo'
import { NewTodoSchema } from '#layers/todo/shared/schemas/todo'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, NewTodoSchema.parse)
  const storage = useStorage<Todo>('todos')

  const todo: Todo = {
    id: nanoid(),
    title: body.title,
    completed: false,
    createdAt: new Date().toISOString(),
  }

  await storage.setItem(todo.id, todo)
  return todo
})
