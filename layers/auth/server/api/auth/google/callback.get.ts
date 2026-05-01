import { and, eq } from 'drizzle-orm'
import { OAuth2Client } from 'google-auth-library'
import { ActivityAction, activityTable, identityTable, userTable } from '~~/server/db/pg/schema'
import { getPgClient } from '~~/server/utils/pg'
import { simplifyNanoId } from '~~/shared/utils/id'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string
  const storedState = getCookie(event, 'google_oauth_state')

  if (!code || !state || state !== storedState) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid state or code',
    })
  }

  // Clear state cookie
  deleteCookie(event, 'google_oauth_state')

  const client = new OAuth2Client(
    runtimeConfig.googleClientId as string,
    runtimeConfig.googleClientSecret as string,
    `${getBaseUrl()}/api/auth/google/callback`,
  )

  const { tokens } = await client.getToken(code)
  client.setCredentials(tokens)

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: runtimeConfig.googleClientId as string,
  })
  const payload = ticket.getPayload()

  if (!payload) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid token',
    })
  }

  const db = getPgClient()
  const now = new Date()

  // 1. Check if user exists by email
  const existingUsers = await db.select().from(userTable).where(eq(userTable.primary_email, payload.email!)).limit(1)
  let user = existingUsers[0]

  if (!user) {
    // Create new user
    const [newUser] = await db.insert(userTable).values({
      primary_email: payload.email!,
      name: payload.name,
      avatar: payload.picture,
      username: payload.email!.split('@')[0],
      last_sign_in_at: now,
    }).returning()
    user = newUser!

    await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_UP })
  }
  else {
    // Update existing user
    const [updatedUser] = await db.update(userTable)
      .set({
        name: payload.name || user.name,
        avatar: payload.picture || user.avatar,
        last_sign_in_at: now,
        updated_at: now,
      })
      .where(eq(userTable.id, user.id))
      .returning()
    user = updatedUser!
  }

  // 2. Handle Identity
  const providerUserId = payload.sub
  const existingIdentity = await db.select()
    .from(identityTable)
    .where(and(
      eq(identityTable.provider, 'google'),
      eq(identityTable.provider_user_id, providerUserId),
    ))
    .limit(1)

  if (existingIdentity.length === 0) {
    await db.insert(identityTable).values({
      user_id: user.id,
      provider: 'google',
      provider_user_id: providerUserId,
      provider_data: payload,
    })
  }
  else {
    await db.update(identityTable)
      .set({
        provider_data: payload,
        updated_at: now,
      })
      .where(eq(identityTable.id, existingIdentity[0]!.id))
  }

  // Create session
  const sessionId = simplifyNanoId()
  const storage = useStorage('redis')

  await storage.setItem(`session:${sessionId}`, {
    id: user.id,
    primary_email: user.primary_email,
    primary_phone: user.primary_phone,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    verified: user.verified,
    provider: 'google',
  })

  setCookie(event, 'sessionid', sessionId, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_IN })

  return sendRedirect(event, '/dashboard')
})
