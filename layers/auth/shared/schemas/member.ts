import { z } from 'zod'

export const AddMemberSchema = z.object({
  email: z.string().email(),
})

export const UpdateMemberAbilitiesSchema = z.object({
  abilities: z.array(z.string()),
})

export type AddMember = z.infer<typeof AddMemberSchema>
export type UpdateMemberAbilities = z.infer<typeof UpdateMemberAbilitiesSchema>
