import { ActivityAction, activityTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { getRequestIP, readValidatedBody } from 'h3'
import { createSystemAdmin } from '#layers/auth/server/services/admin'
import { persistSession } from '#layers/auth/server/services/session'
import { assertLoginAllowed, clearLoginFailures, digest, recordLoginFailure, timingSafeEqual } from '#layers/auth/server/utils/login-throttle'
import { LoginBodySchema } from '#layers/auth/shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const { adminEmail, adminPassword } = useRuntimeConfig()

  // Disabled when no generated credential is configured (the hub, or an
  // OAuth-only deployment where the operator cleared the password).
  if (!adminEmail || !adminPassword)
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  await assertLoginAllowed(ip)

  const { email, password } = await readValidatedBody(event, LoginBodySchema.parse)

  // Constant-time compare of the email+password pair. Comparing the
  // concatenation (not email first, then password) removes the
  // "valid email / wrong password" early-exit signal.
  const submitted = await digest(`${email.toLowerCase()}\0${password}`)
  const expected = await digest(`${adminEmail.toLowerCase()}\0${adminPassword}`)

  if (!timingSafeEqual(submitted, expected)) {
    await recordLoginFailure(ip)
    // Best-effort failed-attempt audit (no user row needed; metadata only).
    const existing = await db.query.userTable.findFirst({ where: eq(userTable.primary_email, adminEmail) })
    if (existing)
      await db.insert(activityTable).values({ user_id: existing.id, action: ActivityAction.SIGN_IN_FAILED, metadata: { ip } })
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // Valid — lazily provision the system admin (idempotent + race-safe).
  const { user } = await createSystemAdmin({ email: adminEmail })

  const { sessionId } = await persistSession(event, user, { provider: 'credential' })
  await db.update(userTable).set({ last_sign_in_at: new Date() }).where(eq(userTable.id, user.id))
  await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_IN })
  await clearLoginFailures(ip)

  return { session_id: sessionId, user_id: user.id }
})
