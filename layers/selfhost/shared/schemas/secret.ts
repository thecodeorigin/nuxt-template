import { z } from 'zod'

export const PatchSecretsBodySchema = z.object({
  updates: z.array(z.object({
    key: z.string().min(1).max(128),
    value: z.string().min(1).max(2000),
  })).min(1).max(50),
})
export type PatchSecretsBody = z.infer<typeof PatchSecretsBodySchema>

export const TestEmailBodySchema = z.object({
  to: z.string().email(),
})
export type TestEmailBody = z.infer<typeof TestEmailBodySchema>

export const RevealSecretParamsSchema = z.object({
  key: z.string().min(1).max(128),
})
export type RevealSecretParams = z.infer<typeof RevealSecretParamsSchema>
