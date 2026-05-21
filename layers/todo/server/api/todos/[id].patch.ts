import type { Todo } from '#layers/todo/shared/schemas/todo'
import { kv } from '@nuxthub/kv'
import { UpdateTodoSchema } from '#layers/todo/shared/schemas/todo'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const body = await readValidatedBody(event, UpdateTodoSchema.parse)
  const existing = await kv.get<Todo>(`todo:${id}`)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Todo not found' })
  }

  const updated: Todo = { ...existing, ...body }
  await kv.set(`todo:${id}`, updated)
  return updated
})
