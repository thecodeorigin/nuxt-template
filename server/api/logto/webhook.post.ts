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
  identities?: Record<string, any>
  lastSignInAt?: string
  createdAt?: string
  applicationId?: string
  isSuspended?: boolean
}

// Get signing key from environment variable or config
// const LOGTO_SIGNING_KEY = process.env.LOGTO_WEBHOOK_SIGNING_KEY || ''

// // Verify the Logto webhook signature
// // eslint-disable-next-line node/prefer-global/buffer
// function verifySignature(signingKey: string, rawBody: Buffer, signature: string): boolean {
//   if (!signingKey)
//     return false

//   const hmac = createHmac('sha256', signingKey)
//   hmac.update(rawBody)
//   const computedSignature = hmac.digest('hex')

//   return computedSignature === signature
// }

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
    // Default credit value for new users if not present in customData
    credit: '0',
  }
}

export default defineEventHandler(async (event) => {
  try {
    // Get the raw request body for signature verification
    // const rawBody = await readRawBody(event)
    // if (!rawBody) {
    //   return { error: 'Invalid request body' }
    // }

    // // Get the signature from headers
    // const signature = getRequestHeader(event, 'logto-signature-sha-256')
    // if (!signature) {
    //   return { error: 'Missing signature header' }
    // }

    // // Verify the signature
    // if (!verifySignature(LOGTO_SIGNING_KEY, rawBody, signature)) {
    //   setResponseStatus(event, 401)
    //   return { error: 'Invalid signature' }
    // }

    // Parse the request body
    const body = await readBody<LogtoWebhookPayload>(event)
    const { event: eventType, user, data, userId } = body

    // Get user composables
    const { upsertUser, updateLastSignIn, updateSuspensionStatus, deleteUser } = useUser()

    // Handle different event types
    switch (eventType) {
      case 'PostRegister': {
        if (!user) {
          return { error: 'Missing user data for PostRegister event' }
        }

        // Create or update user
        await upsertUser(user.id, mapLogtoUserToUserInput(user))
        break
      }

      case 'PostSignIn': {
        if (!user || !userId) {
          return { error: 'Missing user data for PostSignIn event' }
        }

        // Create or update user data and update last sign-in time
        await upsertUser(userId, mapLogtoUserToUserInput(user))

        // Resolve to internal UUID if possible
        const resolvedUser = await db.query.userTable.findFirst({
          where: eq(userTable.logto_id, userId),
        })

        if (resolvedUser) {
          await updateLastSignIn(resolvedUser.id)
        }
        break
      }

      case 'User.Created': {
        if (!data) {
          return { error: 'Missing user data for User.Created event' }
        }

        // Create or update user
        await upsertUser(data.id, mapLogtoUserToUserInput(data))
        break
      }

      case 'User.Deleted': {
        if (!userId) {
          return { error: 'Missing userId for User.Deleted event' }
        }

        // Find user by Logto ID
        const user = await db.query.userTable.findFirst({
          where: eq(userTable.logto_id, userId),
        })

        if (user) {
          await deleteUser(user.id)
        }
        break
      }

      case 'User.Data.Updated': {
        if (!data || !userId) {
          return { error: 'Missing user data for User.Data.Updated event' }
        }

        // Update user data
        await upsertUser(userId, mapLogtoUserToUserInput(data))
        break
      }

      case 'User.SuspensionStatus.Updated': {
        if (!data || !userId) {
          return { error: 'Missing user data for User.SuspensionStatus.Updated event' }
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
    setResponseStatus(event, 500)
    return { error: error.message || 'Internal server error' }
  }
})
