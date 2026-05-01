import type { Todo } from '#layers/todo/shared/schemas/todo'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const storage = useStorage<Todo>('todos')
  if (!(await storage.hasItem(id))) {
    throw createError({ statusCode: 404, statusMessage: 'Todo not found' })
  }

  await storage.removeItem(id)
  return { success: true }
})
