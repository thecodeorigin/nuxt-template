import { z } from 'zod'

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  completed: z.boolean(),
  createdAt: z.iso.datetime(),
})

export const NewTodoSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
})

export const UpdateTodoSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    completed: z.boolean().optional(),
  })
  .refine(d => Object.keys(d).length > 0, {
    message: 'At least one field must be provided',
  })

export type Todo = z.infer<typeof TodoSchema>
export type NewTodo = z.infer<typeof NewTodoSchema>
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>
