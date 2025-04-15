// Define proper interfaces for the Logto webhook data
interface LogtoIdentityDetails {
  id: string
  name: string
  email?: string
  avatar?: string
  rawData?: Record<string, any>
}

interface LogtoIdentity {
  userId: string
  details: LogtoIdentityDetails
}

interface LogtoUser {
  id: string
  username: string | null
  primaryEmail: string | null
  primaryPhone: string | null
  name: string | null
  avatar: string | null
  customData: Record<string, any>
  identities: Record<string, LogtoIdentity>
  lastSignInAt: number
  createdAt: number
  updatedAt: number
  applicationId: string
  isSuspended: boolean
  hasPassword: boolean
}

// Logto webhook event types
enum LogtoEventType {
  USER_CREATED = 'User.Created',
  USER_DELETED = 'User.Deleted',
  USER_DATA_UPDATED = 'User.Data.Updated',
  USER_SUSPENSION_STATUS_UPDATED = 'User.SuspensionStatus.Updated',
  POST_REGISTER = 'PostRegister',
  POST_SIGN_IN = 'PostSignIn',
}

export default defineEventHandler(async (event) => {
  try {
    // Get the webhook payload
    const payload = await readBody(event)
    const { event: eventType, data: eventData } = payload

    logger.info(`[Logto Webhook] Received event: ${eventType}`)

    // Handle different event types
    switch (eventType) {
      case LogtoEventType.USER_CREATED:
      case LogtoEventType.POST_REGISTER:
        return handleUserCreated(eventData as LogtoUser)

      case LogtoEventType.USER_DATA_UPDATED:
        return handleUserUpdated(eventData as LogtoUser)

      case LogtoEventType.USER_SUSPENSION_STATUS_UPDATED:
        return handleUserSuspensionUpdated(eventData as LogtoUser)

      case LogtoEventType.USER_DELETED:
        return handleUserDeleted(eventData as Pick<LogtoUser, 'id'>)

      case LogtoEventType.POST_SIGN_IN:
        return handleUserSignIn(eventData as Pick<LogtoUser, 'id' | 'lastSignInAt'>)

      default:
        logger.warn(`[Logto Webhook] Unhandled event type: ${eventType}`)
        return { success: true, message: 'Event acknowledged but not processed' }
    }
  }
  catch (error: any) {
    logger.error('[Logto Webhook] Error processing webhook:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to process webhook',
    })
  }
})

async function handleUserCreated(userData: LogtoUser) {
  const { id: logtoId, name, username, primaryEmail, primaryPhone, avatar, customData, identities, lastSignInAt, hasPassword, isSuspended } = userData

  // Get user composable to handle user operations
  const { createUser } = useUser()
  const { upsertIdentity } = useIdentity()

  logger.info(`[Logto Webhook] Creating user: ${logtoId}, name: ${name}, email: ${primaryEmail}`)

  // Create user in our database using the composable with properly typed null values
  const user = await createUser(logtoId, {
    name,
    username,
    primary_email: primaryEmail,
    primary_phone: primaryPhone,
    avatar,
    credit: customData?.credit?.toString() || '0',
    custom_data: customData || {},
    last_sign_in_at: lastSignInAt ? new Date(lastSignInAt) : null,
    is_suspended: isSuspended,
    has_password: hasPassword,
  })

  // If user creation was successful, create the identity records
  if (user && identities && typeof identities === 'object') {
    logger.info(`[Logto Webhook] Creating ${Object.keys(identities).length} identities for user: ${user.id}`)

    const createIdentityPromises = Object.entries(identities).map(([provider, identity]) => {
      if (!identity)
        return Promise.resolve()

      return upsertIdentity(
        user.id,
        provider,
        identity.userId,
        identity.details || {},
      )
    })

    await Promise.all(createIdentityPromises.filter(Boolean))
  }

  return { success: true, userId: user.id }
}

async function handleUserUpdated(userData: LogtoUser) {
  const { id: logtoId, name, username, primaryEmail, primaryPhone, avatar, customData, identities, hasPassword, isSuspended } = userData

  const { getUserById, updateUser } = useUser()
  const { upsertIdentity } = useIdentity()

  logger.info(`[Logto Webhook] Updating user: ${logtoId}`)

  // Find existing user
  const existingUser = await getUserById(logtoId)

  if (!existingUser) {
    logger.info(`[Logto Webhook] User not found, creating new: ${logtoId}`)
    // User doesn't exist, create a new one
    return handleUserCreated(userData)
  }

  // Update user data using the composable with properly typed null values
  await updateUser(existingUser.id, {
    name,
    username,
    primary_email: primaryEmail,
    primary_phone: primaryPhone,
    avatar,
    custom_data: customData || {},
    has_password: hasPassword,
    is_suspended: isSuspended,
  })

  // If identities exist, update them
  if (identities && typeof identities === 'object') {
    logger.info(`[Logto Webhook] Updating ${Object.keys(identities).length} identities for user: ${existingUser.id}`)

    const updateIdentityPromises = Object.entries(identities).map(([provider, identity]) => {
      if (!identity)
        return Promise.resolve()

      return upsertIdentity(
        existingUser.id,
        provider,
        identity.userId,
        identity.details || {},
      )
    })

    await Promise.all(updateIdentityPromises.filter(Boolean))
  }

  return { success: true, userId: existingUser.id }
}

async function handleUserSuspensionUpdated(userData: LogtoUser) {
  const { id: logtoId, isSuspended } = userData

  const { getUserById, updateSuspensionStatus } = useUser()

  logger.info(`[Logto Webhook] Updating user suspension status: ${logtoId}, suspended: ${isSuspended}`)

  // Find the user
  const user = await getUserById(logtoId)
  if (!user) {
    logger.warn(`[Logto Webhook] User not found for suspension update: ${logtoId}`)
    return { success: false, message: 'User not found' }
  }

  // Update suspension status
  await updateSuspensionStatus(user.id, isSuspended || false)

  return { success: true }
}

async function handleUserDeleted(userData: Pick<LogtoUser, 'id'>) {
  const { id: logtoId } = userData

  const { getUserById, deleteUser } = useUser()
  const { deleteIdentitiesByUserId } = useIdentity()

  logger.info(`[Logto Webhook] Deleting user: ${logtoId}`)

  // Find the user
  const user = await getUserById(logtoId)
  if (!user) {
    logger.warn(`[Logto Webhook] User not found for deletion: ${logtoId}`)
    return { success: true, message: 'User already deleted or not found' }
  }

  // Delete identities first to maintain referential integrity
  await deleteIdentitiesByUserId(user.id)

  // Delete user
  await deleteUser(user.id)

  return { success: true }
}

async function handleUserSignIn(userData: Pick<LogtoUser, 'id' | 'lastSignInAt'>) {
  const { id: logtoId, lastSignInAt } = userData

  const { getUserById, updateLastSignIn } = useUser()

  logger.info(`[Logto Webhook] Updating user sign in time: ${logtoId}`)

  // Find the user
  const user = await getUserById(logtoId)
  if (!user) {
    logger.warn(`[Logto Webhook] User not found for sign-in update: ${logtoId}`)
    return { success: false, message: 'User not found' }
  }

  // Update last sign in time using the composable
  await updateLastSignIn(user.id, lastSignInAt)

  return { success: true }
}
