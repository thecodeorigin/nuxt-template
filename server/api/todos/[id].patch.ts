import type { Todo } from '~~/shared/schemas/todo'
import { UpdateTodoSchema } from '~~/shared/schemas/todo'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const body = await readValidatedBody(event, UpdateTodoSchema.parse)
  const storage = useStorage<Todo>('todos')
  const existing = await storage.getItem(id)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Todo not found' })
  }

  const updated: Todo = { ...existing, ...body }
  await storage.setItem(id, updated)
  return updated
})
