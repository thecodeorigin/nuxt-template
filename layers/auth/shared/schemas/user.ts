import { z } from 'zod'

export const UpdateUserSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  username: z.string().trim().min(3).max(50).regex(/^\w+$/, 'Letters, numbers, underscore').optional(),
  bio: z.string().trim().max(500).optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field is required' })

export const NotificationPrefsSchema = z.object({
  email: z.boolean(),
  product_updates: z.boolean(),
  weekly_digest: z.boolean(),
  important_updates: z.boolean(),
})

export type UpdateUser = z.infer<typeof UpdateUserSchema>
export type NotificationPrefs = z.infer<typeof NotificationPrefsSchema>
