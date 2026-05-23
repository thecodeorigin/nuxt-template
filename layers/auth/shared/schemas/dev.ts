import { z } from 'zod'

export const DevProvisionSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
})
