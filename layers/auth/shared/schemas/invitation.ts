import { z } from 'zod'

export const CreateInvitationSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  role: z.enum(['member', 'admin']).default('member'),
})

export type CreateInvitation = z.infer<typeof CreateInvitationSchema>
