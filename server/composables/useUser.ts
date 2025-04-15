import { eq } from 'drizzle-orm'
import { userTable } from '../db/schemas'
import { resolveUserId } from '../utils/user-mapping'
import type { User, UserInput } from '../types/models'

export function useUser() {
  async function getUserById(userId: string): Promise<User | undefined> {
    // Support both Logto IDs and UUID format
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      // It's a UUID, use it directly
      return db.query.userTable.findFirst({
        where: eq(userTable.id, userId),
      })
    }
    else {
      // It's a Logto ID, look up by logto_id
      return db.query.userTable.findFirst({
        where: eq(userTable.logto_id, userId),
      })
    }
  }

  async function getUserCreditById(userId: string): Promise<number> {
    // Resolve to correct ID format
    const resolvedUserId = await resolveUserId(userId)
    if (!resolvedUserId) {
      // If no user found, try to fetch from Logto directly
      // This fallback helps during migration period
      try {
        const logtoUserData = await getLogtoUserCustomData(userId)
        return Number(logtoUserData.credit || 0)
      }
      catch {
        return 0
      }
    }

    const userProfile = await getUserById(resolvedUserId)
    return Number(userProfile?.credit || 0)
  }

  async function createUser(userId: string, payload: UserInput): Promise<User> {
    // Make sure we have a valid UUID
    // If already UUID, use it directly, otherwise treat as Logto ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)

    if (!userId) {
      throw new Error('User ID is required when creating a user')
    }

    // Remove null values to avoid type errors
    const cleanPayload: Record<string, any> = {}

    for (const [key, value] of Object.entries(payload)) {
      if (value !== null && value !== undefined) {
        cleanPayload[key] = value
      }
    }

    const insertData: Record<string, any> = {
      ...cleanPayload,
    }

    // Set the ID field properly
    if (isUuid) {
      insertData.id = userId
    }
    else {
      // If not UUID, logto_id is required
      insertData.logto_id = userId
    }

    // Type assertion to satisfy TypeScript
    return (
      await db.insert(userTable)
        .values(insertData as any)
        .returning()
    )[0]
  }

  async function updateUser(userId: string, payload: UserInput): Promise<User> {
    // Remove null values to avoid type errors
    const cleanPayload: Record<string, any> = {
      updated_at: new Date(),
    }

    for (const [key, value] of Object.entries(payload)) {
      if (value !== null && value !== undefined) {
        cleanPayload[key] = value
      }
    }

    return (
      await db.update(userTable)
        .set(cleanPayload)
        .where(eq(userTable.id, userId))
        .returning()
    )[0]
  }

  function upsertUser(userId: string, payload: UserInput): Promise<User> {
    return db.transaction(async () => {
      // Resolve to correct ID format
      const resolvedId = await resolveUserId(userId)

      if (!resolvedId) {
        // If we can't resolve to UUID, create new user with Logto ID reference
        return createUser(userId, payload)
      }

      // Update existing user
      return updateUser(resolvedId, payload)
    })
  }

  function deleteUser(userId: string) {
    return db.delete(userTable)
      .where(eq(userTable.id, userId))
  }

  function updateLastSignIn(userId: string, signInTime?: Date | number | string) {
    return db.update(userTable)
      .set({
        last_sign_in_at: signInTime ? new Date(signInTime) : new Date(),
        updated_at: new Date(),
      })
      .where(eq(userTable.id, userId))
  }

  function updateSuspensionStatus(userId: string, isSuspended: boolean) {
    return db.update(userTable)
      .set({
        is_suspended: isSuspended,
        updated_at: new Date(),
      })
      .where(eq(userTable.id, userId))
  }

  return {
    getUserById,
    getUserCreditById,
    createUser,
    updateUser,
    upsertUser,
    deleteUser,
    updateLastSignIn,
    updateSuspensionStatus,
  }
}
