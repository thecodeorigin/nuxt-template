import type { Todo } from '#layers/todo/shared/schemas/todo'
import { compact } from 'es-toolkit'

export default defineEventHandler(async () => {
  const storage = useStorage<Todo>('todos')
  const keys = await storage.getKeys()
  const todos = await Promise.all(keys.map(k => storage.getItem(k)))
  return compact(todos).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})
