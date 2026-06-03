import { z } from 'zod'

export const ListQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
export type ListQuery = z.infer<typeof ListQuerySchema>

export interface Page<T> { items: T[], hasMore: boolean }
