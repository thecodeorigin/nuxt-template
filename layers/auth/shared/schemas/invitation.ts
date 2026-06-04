import { z } from 'zod'

export const CreateInvitationSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  role_id: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type CreateInvitation = z.infer<typeof CreateInvitationSchema>
