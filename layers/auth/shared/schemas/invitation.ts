import { z } from 'zod'

export const CreateInvitationSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  role_id: z.string().optional(),
  project_ids: z.array(z.string().uuid()).optional(),
})

export type CreateInvitation = z.infer<typeof CreateInvitationSchema>
