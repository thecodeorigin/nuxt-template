import { z } from 'zod'

export const RolePermissionsSchema = z.array(z.string()).max(64)
export const CreateRoleSchema = z.object({
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().max(200).optional(),
  permissions: RolePermissionsSchema,
})
export const UpdateRoleSchema = CreateRoleSchema.partial().refine(d => Object.keys(d).length > 0, { message: 'No changes' })
export const AssignRolesSchema = z.object({ role_ids: z.array(z.string()) })
export type CreateRole = z.infer<typeof CreateRoleSchema>
export type UpdateRole = z.infer<typeof UpdateRoleSchema>
export type AssignRoles = z.infer<typeof AssignRolesSchema>
