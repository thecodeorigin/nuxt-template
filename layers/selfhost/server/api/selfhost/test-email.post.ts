import { db } from '@nuxthub/db'
import { selfhostDeploymentTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { readValidatedBody } from 'h3'
import { TestEmailBodySchema } from '#layers/selfhost/shared/schemas/secret'

// Smoke-test SMTP by asking the deployed Worker to send an email to itself.
// We assume the deployed worker exposes /api/auth/demo/cleanup or a similar endpoint that triggers
// an email — for a generic implementation we just GET /api/health to verify reachability and
// instruct the user to verify email by signing up on their deployed instance.
//
// True SMTP-from-here would require the deployed Worker to expose a dedicated test endpoint, which
// isn't part of the current upstream app. For now this endpoint validates that the Worker is alive
// and the workers.dev URL responds.
export default defineAdminHandler(['selfhost:manage'], async (event, { session }) => {
  await readValidatedBody(event, TestEmailBodySchema.parse)
  const orgId = session.activeOrg!

  const deployment = await db.query.selfhostDeploymentTable.findFirst({
    where: eq(selfhostDeploymentTable.organization_id, orgId),
  })
  if (!deployment?.workers_dev_url)
    throw createError({ statusCode: 400, statusMessage: 'No active deployment found' })

  const res = await fetch(deployment.workers_dev_url, { method: 'GET', redirect: 'manual' })
  return {
    reachable: res.ok || res.status === 302,
    status: res.status,
    workerUrl: deployment.workers_dev_url,
    note: 'To verify SMTP end-to-end, sign up on the deployed URL above and confirm the welcome/verification email arrives.',
  }
})
