import { z } from 'zod'

export const ImpersonateStartSchema = z.object({
  user_id: z.uuid(),
})

export type ImpersonateStartInput = z.infer<typeof ImpersonateStartSchema>
