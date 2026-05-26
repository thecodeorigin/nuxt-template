import { z } from 'zod'

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'archived']).default('active'),
})

export const UpdateProjectSchema = CreateProjectSchema.partial()

export const AddProjectProductSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
})

export const AddProjectMemberSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['owner', 'member', 'viewer']).default('member'),
})

export type CreateProject = z.infer<typeof CreateProjectSchema>
export type UpdateProject = z.infer<typeof UpdateProjectSchema>
export type AddProjectProduct = z.infer<typeof AddProjectProductSchema>
export type AddProjectMember = z.infer<typeof AddProjectMemberSchema>
