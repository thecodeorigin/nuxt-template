import { eq } from 'drizzle-orm'
import { userTable } from '../db/schemas'
import type { User, UserInput } from '../types/models'

export function useUser() {
  async function getUserById(userId: string): Promise<User | undefined> {
    return db.query.userTable.findFirst({
      where: isUUID(userId)
        ? eq(userTable.id, userId)
        : eq(userTable.logto_id, userId),
    })
  }

  async function getUserCreditById(userId: string): Promise<number> {
    const userProfile = await getUserById(userId)
    return Number(userProfile?.credit || 0)
  }

  async function createUser(userId: string, payload: UserInput): Promise<User> {
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
    if (isUUID(userId)) {
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

  async function updateUser(userId: string, payload: Partial<UserInput>): Promise<User> {
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
        .where(
          isUUID(userId)
            ? eq(userTable.id, userId)
            : eq(userTable.logto_id, userId),
        )
        .returning()
    )[0]
  }

  function upsertUser(userId: string, payload: UserInput): Promise<User> {
    return db.transaction(async () => {
      // Resolve to correct ID format
      const resolvedUser = await getUserById(userId)

      if (!resolvedUser) {
        // If we can't resolve to UUID, create new user with Logto ID reference
        return createUser(userId, payload)
      }

      // Update existing user
      return updateUser(userId, payload)
    })
  }

  function deleteUser(userId: string) {
    return db.delete(userTable)
      .where(
        isUUID(userId)
          ? eq(userTable.id, userId)
          : eq(userTable.logto_id, userId),
      )
  }

  function updateLastSignIn(userId: string, signInTime?: Date | number | string) {
    return db.update(userTable)
      .set({
        last_sign_in_at: signInTime ? new Date(signInTime) : new Date(),
        updated_at: new Date(),
      })
      .where(
        isUUID(userId)
          ? eq(userTable.id, userId)
          : eq(userTable.logto_id, userId),
      )
  }

  function updateSuspensionStatus(userId: string, isSuspended: boolean) {
    return db.update(userTable)
      .set({
        is_suspended: isSuspended,
        updated_at: new Date(),
      })
      .where(
        isUUID(userId)
          ? eq(userTable.id, userId)
          : eq(userTable.logto_id, userId),
      )
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
