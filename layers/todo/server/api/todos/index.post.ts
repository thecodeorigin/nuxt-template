import type { Todo } from '#layers/todo/shared/schemas/todo'
import { kv } from '@nuxthub/kv'
import { nanoid } from 'nanoid'
import { NewTodoSchema } from '#layers/todo/shared/schemas/todo'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, NewTodoSchema.parse)

  const todo: Todo = {
    id: nanoid(),
    title: body.title,
    completed: false,
    createdAt: new Date().toISOString(),
  }

  await kv.set(`todo:${todo.id}`, todo)
  return todo
})
