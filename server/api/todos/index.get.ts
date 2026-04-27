import type { Todo } from '~~/shared/schemas/todo'

export default defineEventHandler(async () => {
  const storage = useStorage<Todo>('todos')
  const keys = await storage.getKeys()
  const todos = await Promise.all(keys.map(k => storage.getItem(k)))
  return todos
    .filter((t): t is Todo => t !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})
