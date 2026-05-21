import type { Todo } from '#layers/todo/shared/schemas/todo'
import { kv } from '@nuxthub/kv'
import { compact } from 'es-toolkit'

export default defineEventHandler(async () => {
  const keys = await kv.keys('todo:')
  const todos = await Promise.all(keys.map(k => kv.get<Todo>(k)))
  return compact(todos).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})
