import { ActivityAction, activityTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { ensureMembership, ensureOrganization } from '#layers/auth/server/services/organization'
import { DEMO_ORG, DEMO_ORG_GRANTS, SYSTEM_GRANTS, SYSTEM_ORG } from '#layers/auth/server/services/seed'
import { persistSession } from '#layers/auth/server/services/session'
import { seedDemoNotifications } from '#layers/notifications/server/services/notification'

interface DemoAgent {
  email: string
  username: string
  name: string
}

const DEMO_AGENTS: Record<'admin' | 'user', DemoAgent> = {
  admin: { email: 'admin@demo.local', username: 'demo_admin', name: 'Admin Agent' },
  user: { email: 'user@demo.local', username: 'demo_user', name: 'User Agent' },
}

const DemoLoginSchema = z.object({
  agent: z.enum(['admin', 'user']),
})

export default defineEventHandler(async (event) => {
  if (!import.meta.dev && process.env.NUXT_DEMO_MODE !== 'true') {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const { agent } = await readValidatedBody(event, DemoLoginSchema.parse)
  const preset = DEMO_AGENTS[agent]
  const now = new Date()

  const existing = await db.select().from(userTable).where(eq(userTable.primary_email, preset.email)).limit(1)

  let user = existing[0]
  if (!user) {
    const [created] = await db.insert(userTable).values({
      primary_email: preset.email,
      username: preset.username,
      name: preset.name,
      verified: true,
      last_sign_in_at: now,
    }).returning()
    user = created!
    await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_UP })
  }
  else {
    const [updated] = await db.update(userTable)
      .set({
        username: preset.username,
        name: preset.name,
        verified: true,
        last_sign_in_at: now,
      })
      .where(eq(userTable.id, user.id))
      .returning()
    user = updated!
  }

  // Ensure org memberships exist; grants are preserved for returning users so
  // edits made through the UI survive a re-login (the demo backdoor is not a reset).
  const demoOrg = await ensureOrganization(DEMO_ORG.slug, DEMO_ORG.name)
  await ensureMembership(user.id, demoOrg.id, agent === 'admin' ? DEMO_ORG_GRANTS.admin : DEMO_ORG_GRANTS.member)
  if (agent === 'admin') {
    const systemOrg = await ensureOrganization(SYSTEM_ORG.slug, SYSTEM_ORG.name, { is_system: true })
    await ensureMembership(user.id, systemOrg.id, SYSTEM_GRANTS.admin)
  }

  await seedDemoNotifications(user.id, demoOrg.id)

  await persistSession(event, user, { provider: 'demo', activeOrganizationId: demoOrg.id })

  await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_IN })

  return { agent, user_id: user.id, primary_email: user.primary_email }
})
