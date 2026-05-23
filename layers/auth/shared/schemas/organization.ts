import { z } from 'zod'

export const SwitchOrganizationSchema = z.object({ organization_id: z.string().min(1) })
export type SwitchOrganization = z.infer<typeof SwitchOrganizationSchema>

export const UpdateOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(100),
})
export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>

export const CreateOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(100),
})
export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>
