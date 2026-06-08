import { z } from 'zod'

export const LoginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(512),
})
export type LoginBody = z.infer<typeof LoginBodySchema>
