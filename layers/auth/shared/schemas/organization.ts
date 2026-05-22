import { z } from 'zod'

export const SwitchOrganizationSchema = z.object({ organization_id: z.string().min(1) })
export type SwitchOrganization = z.infer<typeof SwitchOrganizationSchema>
