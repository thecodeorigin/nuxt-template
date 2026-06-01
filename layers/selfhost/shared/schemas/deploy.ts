import { z } from 'zod'

export const DeployBodySchema = z.object({
  token: z.string().min(20).max(200).optional(),
  account_id: z.string().min(8).max(64).optional(),
})
export type DeployBody = z.infer<typeof DeployBodySchema>

export const CfAccountsBodySchema = z.object({
  token: z.string().min(20).max(200),
})
export type CfAccountsBody = z.infer<typeof CfAccountsBodySchema>
