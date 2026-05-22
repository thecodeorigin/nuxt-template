import { z } from 'zod'
import { TENANT_ABILITY_KEYS } from '#layers/auth/shared/permissions'

export const UpdateMemberAbilitiesSchema = z.object({
  abilities: z.array(z.string()).refine(
    arr => arr.every(a => TENANT_ABILITY_KEYS.has(a)),
    { message: 'Only tenant abilities (user:*, todo:*) can be granted here' },
  ),
})

export type UpdateMemberAbilities = z.infer<typeof UpdateMemberAbilitiesSchema>
