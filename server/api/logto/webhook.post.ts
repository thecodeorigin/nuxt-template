import { createHmac } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { userTable } from '@base/server/db/schemas'

// Define Logto event types
type LogtoEventType =
  | 'PostRegister'
  | 'PostSignIn'
  | 'User.Created'
  | 'User.Deleted'
  | 'User.Data.Updated'
  | 'User.SuspensionStatus.Updated'

// Define Logto webhook payload interface
interface LogtoWebhookPayload {
  hookId: string
  event: LogtoEventType
  createdAt: string
  userAgent?: string
  ip?: string
  userId?: string
  user?: LogtoUserEntity
  data?: LogtoUserEntity | null
  params?: { id?: string, userId?: string }
  interactionEvent?: string
  sessionId?: string
  applicationId?: string
}

// Define Logto user entity interface
interface LogtoUserEntity {
  id: string
  username?: string
  primaryEmail?: string
  primaryPhone?: string
  name?: string
  avatar?: string
  customData?: Record<string, any>
  identities?: Record<string, LogtoIdentity>
  lastSignInAt?: string
  createdAt?: string
  applicationId?: string
  isSuspended?: boolean
}

// Define Logto identity interface
interface LogtoIdentity {
  userId: string
  details?: {
    id?: string
    email?: string
    name?: string
    avatar?: string
    phone?: string
  }
}

// Get signing key from environment variable or config
const LOGTO_SIGNING_KEY = process.env.LOGTO_WEBHOOK_SIGNING_KEY || ''

// Verify the Logto webhook signature
// eslint-disable-next-line node/prefer-global/buffer
function verifySignature(signingKey: string, rawBody: Buffer, signature: string): boolean {
  if (!signingKey)
    return false

  const hmac = createHmac('sha256', signingKey)
  hmac.update(rawBody)
  const computedSignature = hmac.digest('hex')

  return computedSignature === signature
}

// Map Logto user data to our user schema
function mapLogtoUserToUserInput(logtoUser: LogtoUserEntity) {
  return {
    logto_id: logtoUser.id,
    username: logtoUser.username,
    name: logtoUser.name,
    primary_email: logtoUser.primaryEmail,
    primary_phone: logtoUser.primaryPhone,
    avatar: logtoUser.avatar,
    custom_data: logtoUser.customData,
    last_sign_in_at: logtoUser.lastSignInAt ? new Date(logtoUser.lastSignInAt) : undefined,
    is_suspended: logtoUser.isSuspended,
  }
}

// Process identities from Logto user data
async function processIdentities(userId: string, identities?: Record<string, LogtoIdentity>) {
  if (!identities)
    return

  const { upsertIdentity } = useIdentity()

  // Process each identity provider
  for (const [provider, identity] of Object.entries(identities)) {
    const providerUserId = identity?.details?.id || ''
    if (!providerUserId)
      continue

    // If we've made it here, we know identity.details exists
    // Map the provider data from the identity details
    const providerData = {
      email: identity.details!.email,
      name: identity.details!.name,
      avatar: identity.details!.avatar,
      phone: identity.details!.phone,
    }

    // Create or update the identity entry
    await upsertIdentity(userId, provider, providerUserId, providerData)
  }
}

export default defineEventHandler(async (event) => {
  try {
    // Get the raw request body as buffer for signature verification
    // Use false parameter to get the raw buffer instead of parsed string
    const rawBody = await readRawBody(event, false)
    if (!rawBody) {
      return sendError(event, createError({
        statusCode: 400,
        statusMessage: 'Invalid request body',
      }))
    }

    // Get the signature from headers
    const signature = getRequestHeader(event, 'logto-signature-sha-256')
    if (!signature) {
      return sendError(event, createError({
        statusCode: 400,
        statusMessage: 'Missing signature header',
      }))
    }

    // Verify the signature with the raw body buffer
    if (!verifySignature(LOGTO_SIGNING_KEY, rawBody, signature)) {
      return sendError(event, createError({
        statusCode: 401,
        statusMessage: 'Invalid signature',
      }))
    }

    // Parse the request body JSON
    const body = JSON.parse(rawBody.toString()) as LogtoWebhookPayload
    const { event: eventType, user, data, userId, params } = body

    // Get user composables
    const { upsertUser, updateLastSignIn, updateSuspensionStatus, deleteUser } = useUser()
    const { deleteIdentitiesByUserId } = useIdentity()

    // Get reference composables
    const { createReference, deleteReferenceByUserId } = useReference()

    // Handle different event types
    switch (eventType) {
      case 'PostSignIn': {
        if (!user || !userId) {
          return sendError(event, createError({
            statusCode: 400,
            statusMessage: 'Missing user data for PostSignIn event',
          }))
        }

        // Create or update user data and update last sign-in time
        const updatedUser = await upsertUser(userId, mapLogtoUserToUserInput(user))

        // Process any identity information
        await processIdentities(updatedUser.id, user.identities)

        // Update last sign-in time
        await updateLastSignIn(updatedUser.id)
        break
      }

      case 'User.Created': {
        if (!data?.id) {
          return sendError(event, createError({
            statusCode: 400,
            statusMessage: 'Missing user data for User.Created event',
          }))
        }

        // Create or update user
        const createdUser = await upsertUser(data.id, mapLogtoUserToUserInput(data))
        await createReference({ userId: createdUser.id, percentage: 5, amount: 0, quantity: 1 });
        // Process any identity information
        await processIdentities(createdUser.id, data.identities)
        break
      }

      case 'User.Deleted': {
        const userId = params?.userId || data?.id

        if (!userId) {
          return sendError(event, createError({
            statusCode: 400,
            statusMessage: 'Missing userId for User.Deleted event',
          }))
        }

        // Find user by Logto ID
        const user = await db.query.userTable.findFirst({
          where: eq(userTable.logto_id, userId),
        })

        if (user) {
          // Delete identities first to maintain referential integrity
          await deleteIdentitiesByUserId(user.id)

          // Then delete the user
          await deleteUser(user.id)

          // Finally, delete any references associated with the user
          await deleteReferenceByUserId(user.id)
        }
        break
      }

      case 'User.Data.Updated': {
        const userId = params?.userId || data?.id

        if (!data || !userId) {
          return sendError(event, createError({
            statusCode: 400,
            statusMessage: 'Missing user data for User.Data.Updated event',
          }))
        }

        // Update user data
        const updatedUser = await upsertUser(userId, mapLogtoUserToUserInput(data))

        // Process any identity information
        await processIdentities(updatedUser.id, data.identities)
        break
      }

      case 'User.SuspensionStatus.Updated': {
        const userId = params?.userId || data?.id

        if (!data || !userId) {
          return sendError(event, createError({
            statusCode: 400,
            statusMessage: 'Missing user data for User.SuspensionStatus.Updated event',
          }))
        }

        // Find user by Logto ID to get internal UUID
        const user = await db.query.userTable.findFirst({
          where: eq(userTable.logto_id, userId),
        })

        if (user && data.isSuspended !== undefined) {
          await updateSuspensionStatus(user.id, data.isSuspended)
        }
        break
      }

      default: {
        // Ignore other event types
        console.log(`Unhandled Logto webhook event: ${eventType}`)
      }
    }

    // Return a success response
    return { success: true, event: eventType }
  }
  catch (error: any) {
    console.error('Error processing Logto webhook:', error)

    // If it's already a Nuxt error, just rethrow it
    if (error.statusCode) {
      throw error
    }

    // Otherwise create a generic error
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error',
    }))
  }
})
