import { eq } from 'drizzle-orm'
import { userTable } from '../db/schemas'
import { db } from './db'

/**
 * Gets a user by their Logto ID
 */
export async function getUserByLogtoId(logtoId: string) {
  return db.query.userTable.findFirst({
    where: eq(userTable.logto_id, logtoId),
  })
}

/**
 * Gets a user by their UUID
 */
export async function getUserById(userId: string) {
  return db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
  })
}

/**
 * Converts a Logto ID to our internal UUID
 * @param logtoId The Logto user ID (sub)
 * @returns The user's UUID in our system
 */
export async function getUuidFromLogtoId(logtoId: string): Promise<string | null> {
  const user = await getUserByLogtoId(logtoId)
  return user?.id || null
}

/**
 * Checks if a string appears to be a UUID
 */
export function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

/**
 * Resolves a user ID that might be either a Logto ID or our UUID
 * @param id Either a Logto ID or our UUID
 * @returns The user's UUID in our system, or null if not found
 */
export async function resolveUserId(id: string): Promise<string | null> {
  if (isUUID(id)) {
    const user = await getUserById(id)
    return user?.id || null
  }
  else {
    return getUuidFromLogtoId(id)
  }
}

/**
 * Makes sure operations that expect a UUID get a UUID
 * Wraps a function that uses a user ID, ensuring it gets a UUID
 * No matter if it's given a Logto ID or our UUID
 */
export function withResolvedUserId<T extends any[], R>(
  fn: (userId: string, ...args: T) => Promise<R>,
): (userId: string, ...args: T) => Promise<R> {
  return async (userId: string, ...args: T) => {
    const resolvedId = await resolveUserId(userId)
    if (!resolvedId) {
      throw new Error(`User with ID ${userId} not found`)
    }
    return fn(resolvedId, ...args)
  }
}
