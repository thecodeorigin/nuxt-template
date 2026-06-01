import { readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { listAccounts, verifyToken } from '#layers/selfhost/server/services/cloudflare'
import { CfAccountsBodySchema } from '#layers/selfhost/shared/schemas/deploy'

// Pre-flight: returns the list of CF accounts the pasted token can reach,
// so the UI can prompt the user to pick one when there are multiple.
export default defineAuthorizedHandler(['selfhost:manage'], async (event) => {
  const { token } = await readValidatedBody(event, CfAccountsBodySchema.parse)
  await verifyToken(token)
  const accounts = await listAccounts(token)
  return { accounts }
})
