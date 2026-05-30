import { ActivityAction, activityTable, organizationMemberTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { DEMO_ORG, DEMO_ORG_GRANTS, SYSTEM_GRANTS, SYSTEM_ORG } from '#layers/auth/server/constants/defaults'
import { ensureMembership, ensureOrganization } from '#layers/auth/server/services/organization'
import { persistSession } from '#layers/auth/server/services/session'

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

  const existing = await db.query.userTable.findFirst({ where: eq(userTable.primary_email, preset.email) })

  let user = existing
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
    await (useNitroApp().hooks as { callHook: (event: string, ...args: unknown[]) => Promise<void> }).callHook('auth:user-created', { user, provider: 'demo', event })
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
    await db.insert(organizationMemberTable)
      .values({ user_id: user.id, organization_id: systemOrg.id, abilities: [...SYSTEM_GRANTS.admin] })
      .onConflictDoUpdate({
        target: [organizationMemberTable.user_id, organizationMemberTable.organization_id],
        set: { abilities: [...SYSTEM_GRANTS.admin] },
      })
  }

  await runTask('seed:demo-notifications', { payload: { user_id: user.id, organization_id: demoOrg.id } })
  if (agent === 'user') {
    await runTask('seed:demo-tickets', { payload: { user_id: user.id, organization_id: demoOrg.id } })
  }

  const { sessionId } = await persistSession(event, user, { provider: 'demo', activeOrganizationId: demoOrg.id })

  await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_IN })

  return { agent, user_id: user.id, primary_email: user.primary_email, session_id: sessionId }
})
